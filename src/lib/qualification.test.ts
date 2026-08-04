import { describe, expect, it } from 'vitest'
import {
  REPONSES_CRA_VIDES,
  REPONSES_IA_VIDES,
  qualifierCra,
  qualifierIa,
} from './qualification'
import type { ReponsesCra, ReponsesIa } from './qualification'

const ia = (p: Partial<ReponsesIa>): ReponsesIa => ({ ...REPONSES_IA_VIDES, ...p })
const cra = (p: Partial<ReponsesCra>): ReponsesCra => ({ ...REPONSES_CRA_VIDES, ...p })

describe('champ d’application du règlement IA', () => {
  it('écarte ce qui n’est pas un système d’IA', () => {
    expect(qualifierIa(ia({ estSystemeIa: false })).niveau).toBe('hors-champ')
  })

  it('écarte ce qui n’a aucun lien avec l’Union', () => {
    expect(qualifierIa(ia({ estSystemeIa: true, lienUnion: false })).niveau).toBe(
      'hors-champ',
    )
  })

  it('retient un fournisseur de modèle même sans système d’IA déployé', () => {
    // Un fournisseur de modèle à usage général est visé par le chapitre V
    // indépendamment de tout système : l'arbre ne doit pas le rejeter au
    // premier test.
    const r = qualifierIa(ia({ estSystemeIa: false, modeleUsageGeneral: true }))
    expect(r.modele.length).toBeGreaterThan(0)
    expect(r.modele.some((o) => o.article.includes('53'))).toBe(true)
  })
})

describe('pratiques interdites', () => {
  it('prime sur toute autre qualification', () => {
    // Un système à la fois interdit et à haut risque doit sortir « interdit » :
    // afficher une liste d'obligations de conformité laisserait croire qu'on
    // peut le mettre en conformité.
    const r = qualifierIa(
      ia({
        estSystemeIa: true,
        pratiquesInterdites: ['notation-sociale'],
        usagesAnnexeIII: ['emploi'],
      }),
    )
    expect(r.niveau).toBe('interdit')
    expect(r.echeance).toBe('2025-02-02')
  })
})

describe('haut risque', () => {
  it('retient l’annexe I et son échéance reportée à 2028', () => {
    const r = qualifierIa(ia({ estSystemeIa: true, annexeI: true }))
    expect(r.niveau).toBe('haut-risque')
    expect(r.echeance).toBe('2028-08-02')
  })

  it('retient l’annexe III et son échéance reportée à décembre 2027', () => {
    const r = qualifierIa(ia({ estSystemeIa: true, usagesAnnexeIII: ['emploi'] }))
    expect(r.niveau).toBe('haut-risque')
    expect(r.echeance).toBe('2027-12-02')
  })

  it('laisse la dérogation de l’article 6 §3 écarter le haut risque', () => {
    const r = qualifierIa(
      ia({
        estSystemeIa: true,
        usagesAnnexeIII: ['emploi'],
        derogationArticle6: true,
      }),
    )
    expect(r.niveau).not.toBe('haut-risque')
  })

  it('ferme la dérogation dès qu’il y a profilage', () => {
    // Alinéa 2 de l'article 6 §3 : c'est le point qui fait basculer les outils
    // de tri de candidatures, et l'ordre des tests dans le code en dépend.
    const r = qualifierIa(
      ia({
        estSystemeIa: true,
        usagesAnnexeIII: ['emploi'],
        derogationArticle6: true,
        profilage: true,
      }),
    )
    expect(r.niveau).toBe('haut-risque')
    expect(r.motifs.some((m) => m.includes('6 §3'))).toBe(true)
  })

  it('donne au fournisseur une charge plus lourde qu’au déployeur', () => {
    const base = { estSystemeIa: true, usagesAnnexeIII: ['emploi'] }
    const f = qualifierIa(ia({ ...base, role: 'fournisseur' }))
    const d = qualifierIa(ia({ ...base, role: 'deployeur' }))
    expect(f.obligations.length).toBeGreaterThan(d.obligations.length)
    expect(f.obligations.some((o) => o.article.includes('43'))).toBe(true)
    expect(d.obligations.some((o) => o.article.includes('26'))).toBe(true)
  })
})

describe('transparence et risque minimal', () => {
  it('classe en transparence un agent conversationnel ordinaire', () => {
    const r = qualifierIa(
      ia({ estSystemeIa: true, transparenceArticle50: ['interaction'] }),
    )
    expect(r.niveau).toBe('transparence')
    expect(r.echeance).toBe('2026-08-02')
  })

  it('n’oublie jamais la maîtrise de l’IA, même au risque minimal', () => {
    // L'article 4 s'applique à tous depuis février 2025 : c'est l'obligation
    // la plus souvent manquée parce qu'elle ne produit aucun livrable.
    const r = qualifierIa(ia({ estSystemeIa: true }))
    expect(r.niveau).toBe('minimal')
    expect(r.obligations.some((o) => o.article === 'art. 4')).toBe(true)
  })
})

describe('modèles à usage général', () => {
  it('alourdit les obligations au-delà du seuil de risque systémique', () => {
    const simple = qualifierIa(ia({ estSystemeIa: true, modeleUsageGeneral: true }))
    const systemique = qualifierIa(
      ia({ estSystemeIa: true, modeleUsageGeneral: true, seuilRisqueSystemique: true }),
    )
    expect(systemique.modele.length).toBeGreaterThan(simple.modele.length)
    expect(systemique.modele.some((o) => o.article.includes('52'))).toBe(true)
  })

  it('cumule les obligations de modèle avec le niveau du système', () => {
    const r = qualifierIa(
      ia({ estSystemeIa: true, usagesAnnexeIII: ['emploi'], modeleUsageGeneral: true }),
    )
    expect(r.niveau).toBe('haut-risque')
    expect(r.modele.length).toBeGreaterThan(0)
  })
})

describe('règlement cyberrésilience', () => {
  it('écarte ce qui n’est pas mis sur le marché de l’Union', () => {
    expect(qualifierCra(cra({ produitNumerique: true, marcheUnion: false })).dansLeChamp).toBe(
      false,
    )
  })

  it('écarte le logiciel libre non commercial', () => {
    const r = qualifierCra(
      cra({ produitNumerique: true, exclusion: 'libre-non-commercial' }),
    )
    expect(r.dansLeChamp).toBe(false)
    // Une exclusion ne doit jamais se lire comme une absence d'obligation :
    // le motif rendu doit renvoyer au régime qui prend le relais.
    expect(r.motifs.join(' ')).toContain('plus exigeant')
  })

  it('rend les deux échéances dans l’ordre, signalement d’abord', () => {
    const r = qualifierCra(cra({ produitNumerique: true }))
    expect(r.dansLeChamp).toBe(true)
    expect(r.echeances.map((e) => e.date)).toEqual(['2026-09-11', '2027-12-11'])
  })

  it('alerte sous le plancher de cinq ans de l’article 13 §8', () => {
    expect(
      qualifierCra(cra({ produitNumerique: true, periodeSupportAnnee: 3 })).alerteSupport,
    ).toBeDefined()
    expect(
      qualifierCra(cra({ produitNumerique: true, periodeSupportAnnee: 5 })).alerteSupport,
    ).toBeUndefined()
  })

  it('exige un organisme notifié en classe II', () => {
    const r = qualifierCra(cra({ produitNumerique: true, categorie: 'important-ii' }))
    expect(r.verdict).toContain('Organisme notifié obligatoire')
  })

  it('impose la nomenclature logicielle dans tous les cas', () => {
    // La SBOM n'est pas réservée aux catégories importantes : elle relève des
    // exigences essentielles, dues par tout produit dans le champ.
    for (const categorie of ['defaut', 'important-i', 'important-ii', 'critique'] as const) {
      const r = qualifierCra(cra({ produitNumerique: true, categorie }))
      expect(r.obligations.some((o) => o.texte.includes('SBOM'))).toBe(true)
    }
  })
})
