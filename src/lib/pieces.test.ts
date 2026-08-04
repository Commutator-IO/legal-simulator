import { describe, expect, it } from 'vitest'
import {
  completudeSousTraitance,
  completudeViolation,
  mentionsSousTraitance,
  mentionsViolation,
  retardNotification,
  sousTraitanceVide,
  traitementVide,
  violationVide,
} from './registre'
import type { Sous_traitance, Violation } from './registre'
import { MENTIONS_28, contratVide, verdictContrat } from './contrats'
import {
  EXIGENCES_ANNEXE_I,
  completudeDeclaration,
  declarationVide,
  evaluationCraVide,
  mentionsDeclaration,
  rendreDeclaration,
  verdictEvaluationCra,
} from './annexes'
import type { EvaluationCra } from './annexes'
import { auditVide, verdictAudit } from './accessibilite'
import type { Audit, NiveauConformite } from './accessibilite'
import { accordVide, etatRegistre, mentionsAccord } from './dora'
import type { Accord } from './dora'
import { PUBLICS, publicsNonCouverts, sessionVide } from './formation'
import { etatCatalogue, etatInventaire, produitVide, systemeVide } from './inventaire'
import { etatSuivi, perimee } from './suivi'
import { part } from './collection'

// ---------------------------------------------------------------------------

describe('traçabilité', () => {
  it('signale l’absence de responsable avant l’absence de revue', () => {
    // L'ordre compte : une pièce que personne ne porte ne sera pas revue non
    // plus, et l'afficher « à revoir » laisserait croire qu'il suffit de
    // cocher une date.
    expect(etatSuivi({ responsable: '', validateur: '', derniereRevue: '' }, 12, '2026-08-04')).toBe(
      'orphelin',
    )
    expect(
      etatSuivi({ responsable: 'A. Martin', validateur: '', derniereRevue: '' }, 12, '2026-08-04'),
    ).toBe('jamais-revu')
    expect(
      etatSuivi(
        { responsable: 'A. Martin', validateur: '', derniereRevue: '2026-07-01' },
        12,
        '2026-08-04',
      ),
    ).toBe('a-jour')
  })

  it('ne déclare jamais périmée une revue jamais faite', () => {
    // Sinon toute pièce neuve naîtrait « périmée », ce qui rend l'indicateur
    // inutilisable dès le premier jour.
    expect(perimee('', 6, '2026-08-04')).toBe(false)
  })
})

describe('complétude partagée', () => {
  it('vaut 1 sur une liste vide plutôt que NaN', () => {
    expect(part([])).toBe(1)
  })

  it('ignore les valeurs faites d’espaces', () => {
    expect(part([{ valeur: '   ' }, { valeur: 'x' }])).toBe(0.5)
  })
})

// ---------------------------------------------------------------------------

describe('registre du sous-traitant — article 30 §2', () => {
  const base = (p: Partial<Sous_traitance> = {}): Sous_traitance => ({
    ...sousTraitanceVide('essai'),
    ...p,
  })

  it('n’exige jamais les finalités, que le sous-traitant ne détermine pas', () => {
    // Le point de fond : recopier le modèle du §1 produirait un registre faux.
    const champs = mentionsSousTraitance(base()).map((m) => m.champ.toLowerCase())
    expect(champs.some((c) => c.includes('finalité'))).toBe(false)
    expect(champs.some((c) => c.includes('délai'))).toBe(false)
    // Et il est bien organisé par client.
    expect(champs.some((c) => c.includes('client'))).toBe(true)
  })

  it('n’exige l’autorisation qu’en présence de sous-traitants ultérieurs', () => {
    expect(mentionsSousTraitance(base())).toHaveLength(7)
    expect(mentionsSousTraitance(base({ sousTraitantsUlterieurs: 'Hébergeur' }))).toHaveLength(8)
  })

  it('atteint 1 une fois toutes les mentions dues renseignées', () => {
    const complet = base({
      client: 'Client SA',
      contactClient: 'dpo@client.fr',
      categoriesTraitements: 'Hébergement et sauvegarde',
      mesuresSecurite: 'Chiffrement, cloisonnement',
      contrat: 'DPA v3',
      suivi: { responsable: 'A. Martin', validateur: '', derniereRevue: '2026-07-01' },
    })
    expect(completudeSousTraitance(complet)).toBe(1)
  })
})

describe('registre des violations — article 33 §5', () => {
  const base = (p: Partial<Violation> = {}): Violation => ({ ...violationVide('essai'), ...p })

  it('exige le motif dès qu’on décide de ne pas notifier', () => {
    // La ligne qui distingue un choix documenté d'un oubli — et ce que
    // l'autorité vient précisément chercher.
    const champs = mentionsViolation(base({ notifieeAutorite: 'non' })).map((m) => m.champ)
    expect(champs).toContain('Motif de non-notification')
    expect(mentionsViolation(base()).map((m) => m.champ)).not.toContain(
      'Motif de non-notification',
    )
  })

  it('exige la date d’envoi dès qu’on déclare avoir notifié', () => {
    expect(mentionsViolation(base({ notifieeAutorite: 'oui' })).map((m) => m.champ)).toContain(
      "Date d'envoi à l'autorité",
    )
  })

  it('ne baisse pas la complétude d’une violation notifiée dans les règles', () => {
    const v = base({
      reference: 'VIO-2026-003',
      connaissance: '2026-08-01T09:00',
      nature: 'Envoi au mauvais destinataire',
      categoriesPersonnes: 'Salariés',
      nombrePersonnes: '140',
      consequences: 'Risque d’hameçonnage',
      mesures: 'Rappel du message',
      notifieeAutorite: 'oui',
      dateNotification: '2026-08-02T10:00',
      suivi: { responsable: 'A. Martin', validateur: '', derniereRevue: '' },
    })
    expect(completudeViolation(v)).toBe(1)
  })
})

describe('retard de notification', () => {
  const base = (p: Partial<Violation>): Violation => ({ ...violationVide('essai'), ...p })

  it('ne conclut rien tant que la décision n’est pas prise', () => {
    // Afficher « à l'heure » pour une notification qui n'est pas partie serait
    // le pire des affichages.
    expect(retardNotification(base({ connaissance: '2026-08-01T09:00' }))).toBeUndefined()
  })

  it('mesure le dépassement des 72 heures', () => {
    const dansLesDelais = base({
      connaissance: '2026-08-01T09:00',
      notifieeAutorite: 'oui',
      dateNotification: '2026-08-03T09:00',
    })
    expect(retardNotification(dansLesDelais)).toBeLessThan(0)

    const enRetard = base({
      connaissance: '2026-08-01T09:00',
      notifieeAutorite: 'oui',
      dateNotification: '2026-08-04T13:00',
    })
    // 76 heures écoulées : 4 heures de dépassement.
    expect(retardNotification(enRetard)).toBe(4 * 3_600_000)
  })
})

// ---------------------------------------------------------------------------

describe('contrat de sous-traitance — article 28 §3', () => {
  it('est binaire : sept mentions sur huit ne valent pas 87 %', () => {
    const presque = { ...contratVide('essai'), mentionsPresentes: MENTIONS_28.slice(0, 7).map((m) => m.id) }
    const v = verdictContrat(presque)
    expect(v.conforme).toBe(false)
    expect(v.manquantes).toHaveLength(1)
    expect(v.motif).toContain('cumulatives')
  })

  it('rend conforme lorsque les huit sont présentes', () => {
    const complet = { ...contratVide('essai'), mentionsPresentes: MENTIONS_28.map((m) => m.id) }
    expect(verdictContrat(complet).conforme).toBe(true)
  })

  it('nomme les mentions manquantes par leur lettre', () => {
    const v = verdictContrat(contratVide('essai'))
    expect(v.manquantes.map((m) => m.lettre)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
  })
})

// ---------------------------------------------------------------------------

describe('évaluation des risques CRA — article 13 §2', () => {
  const base = (p: Partial<EvaluationCra> = {}): EvaluationCra => ({
    ...evaluationCraVide('essai'),
    ...p,
  })

  it('relève les exigences écartées sans motif écrit', () => {
    // La faille classique du dossier : écarter n'est pas justifier.
    const e = base()
    e.exigences[EXIGENCES_ANNEXE_I[0].id] = { applicable: 'ecartee', justification: '' }
    const v = verdictEvaluationCra(e)
    expect(v.ecarteesSansMotif).toHaveLength(1)
    expect(v.motif).toContain('non-conformité')
  })

  it('accepte une exigence écartée si elle est motivée', () => {
    const e = base()
    e.exigences[EXIGENCES_ANNEXE_I[0].id] = {
      applicable: 'ecartee',
      justification: 'Produit sans interface réseau',
    }
    expect(verdictEvaluationCra(e).ecarteesSansMotif).toHaveLength(0)
  })

  it('relève aussi les exigences applicables sans mesure décrite', () => {
    const e = base()
    e.exigences[EXIGENCES_ANNEXE_I[1].id] = { applicable: 'applicable', justification: '' }
    expect(verdictEvaluationCra(e).applicablesSansMesure).toHaveLength(1)
  })

  it('ne se déclare complète qu’une fois les quatorze exigences tranchées', () => {
    const e = base()
    for (const x of EXIGENCES_ANNEXE_I) {
      e.exigences[x.id] = { applicable: 'applicable', justification: 'Mesure décrite' }
    }
    const v = verdictEvaluationCra(e)
    expect(v.tranchees).toBe(EXIGENCES_ANNEXE_I.length)
    expect(v.motif).toContain('période de support')
  })
})

describe('déclaration UE de conformité — annexe V', () => {
  it('n’exige l’organisme notifié que lorsque la catégorie le ferme', () => {
    expect(mentionsDeclaration(declarationVide('essai'), false)).toHaveLength(10)
    expect(mentionsDeclaration(declarationVide('essai'), true)).toHaveLength(14)
  })

  it('atteint 1 sans organisme lorsque les dix mentions sont remplies', () => {
    const d = {
      ...declarationVide('essai'),
      produit: 'Passerelle X',
      typeLot: 'SN 1000-2000',
      fabricant: 'Commutator SAS',
      adresse: '1 rue de la Paix, Paris',
      objet: 'Passerelle X v4.2.0',
      normes: 'EN 18031-1:2024',
      lieu: 'Paris',
      date: '2027-11-02',
      signataire: 'A. Martin',
      fonction: 'Directrice technique',
    }
    expect(completudeDeclaration(d, false)).toBe(1)
    // Mais pas si un organisme notifié est requis.
    expect(completudeDeclaration(d, true)).toBeLessThan(1)
  })

  it('porte la mention de responsabilité exclusive du fabricant', () => {
    const texte = rendreDeclaration(declarationVide('essai'), false)
    expect(texte).toContain('sous la seule responsabilité du fabricant')
    expect(texte).toContain('2024/2847')
  })

  it('conserve ses sauts de ligne', () => {
    // Un filtre trop large sur les lignes conditionnelles écraserait les
    // séparations et sortirait la déclaration en un seul bloc.
    const texte = rendreDeclaration(declarationVide('essai'), false)
    expect(texte.split('\n\n').length).toBeGreaterThan(4)
  })

  it('bascule le point 7 selon la procédure applicable', () => {
    expect(rendreDeclaration(declarationVide('essai'), false)).toContain('module A')
    expect(rendreDeclaration(declarationVide('essai'), true)).toContain('organisme notifié')
  })
})

// ---------------------------------------------------------------------------

describe('accessibilité', () => {
  const avec = (n: Record<string, NiveauConformite>): Audit => ({
    ...auditVide('essai'),
    principes: { ...auditVide('essai').principes, ...n },
  })
  const tous = (n: NiveauConformite) =>
    avec({ perceptible: n, utilisable: n, comprehensible: n, robuste: n })

  it('retient le maillon le plus faible, jamais une moyenne', () => {
    // Trois principes sur quatre ne rendent aucun service à qui ne peut pas
    // utiliser le clavier : une moyenne afficherait 75 %.
    const v = verdictAudit(
      avec({
        perceptible: 'conforme',
        utilisable: 'non-conforme',
        comprehensible: 'conforme',
        robuste: 'conforme',
      }),
    )
    expect(v.niveau).toBe('non-conforme')
    expect(v.motif).toContain('maillon le plus faible')
  })

  it('refuse de conclure sur une évaluation partielle', () => {
    expect(verdictAudit(auditVide('essai')).niveau).toBe('non-evalue')
    expect(
      verdictAudit(avec({ perceptible: 'conforme' })).niveau,
    ).toBe('non-evalue')
  })

  it('distingue partiellement conforme et conforme', () => {
    expect(verdictAudit(tous('partiel')).niveau).toBe('partiel')
    expect(verdictAudit(tous('conforme')).niveau).toBe('conforme')
  })
})

// ---------------------------------------------------------------------------

describe('registre d’information DORA', () => {
  const base = (p: Partial<Accord> = {}): Accord => ({ ...accordVide('essai'), ...p })

  it('n’exige les mentions renforcées que pour une fonction critique', () => {
    expect(mentionsAccord(base())).toHaveLength(7)
    expect(mentionsAccord(base({ fonctionCritique: true }))).toHaveLength(12)
  })

  it('compte les fonctions critiques sans stratégie de sortie', () => {
    const e = etatRegistre([
      base({ fonctionCritique: true }),
      base({ fonctionCritique: true, strategieSortie: 'Migration testée en 2026' }),
      base({ fonctionCritique: false }),
    ])
    expect(e.critiques).toBe(2)
    expect(e.sansStrategieSortie).toBe(1)
  })

  it('isole le risque de concentration', () => {
    const e = etatRegistre([
      base({ fonctionCritique: true, substituabilite: 'impossible' }),
      base({ fonctionCritique: true, substituabilite: 'aisee' }),
      base({ fonctionCritique: true }),
    ])
    expect(e.nonSubstituables).toBe(1)
    expect(e.nonEvalues).toBe(1)
  })
})

// ---------------------------------------------------------------------------

describe('journal de maîtrise de l’IA', () => {
  it('mesure la couverture des publics, pas le nombre de sessions', () => {
    // Trois sessions pour les développeurs et aucune pour les superviseurs ne
    // satisfont pas l'article 4.
    const sessions = [1, 2, 3].map((n) => ({
      ...sessionVide(`s${n}`),
      publics: ['concepteurs'],
    }))
    expect(publicsNonCouverts(sessions)).toHaveLength(PUBLICS.length - 1)
  })

  it('ne laisse aucun public découvert quand les quatre sont visés', () => {
    const s = { ...sessionVide('s1'), publics: PUBLICS.map((p) => p.id) }
    expect(publicsNonCouverts([s])).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------

describe('inventaire des systèmes d’IA', () => {
  it('compte séparément les systèmes jamais qualifiés', () => {
    // « Hors champ » sans qu'aucune case n'ait été cochée n'est pas une
    // qualification : c'est une absence de qualification, et un inventaire
    // vide ne doit pas s'afficher comme sain.
    const e = etatInventaire([systemeVide('a'), systemeVide('b')])
    expect(e.nonQualifies).toBe(2)
    expect(e.hautRisque).toBe(0)
  })

  it('exclut les systèmes retirés du décompte', () => {
    const retire = { ...systemeVide('a'), statut: 'retire' as const }
    expect(etatInventaire([retire]).total).toBe(0)
  })

  it('remonte les pratiques interdites et le haut risque', () => {
    const interdit = systemeVide('a')
    interdit.reponses = {
      ...interdit.reponses,
      estSystemeIa: true,
      pratiquesInterdites: ['notation-sociale'],
    }
    const hautRisque = systemeVide('b')
    hautRisque.reponses = {
      ...hautRisque.reponses,
      estSystemeIa: true,
      usagesAnnexeIII: ['emploi'],
    }
    const e = etatInventaire([interdit, hautRisque])
    expect(e.interdits).toBe(1)
    expect(e.hautRisque).toBe(1)
    expect(e.orphelins).toBe(2)
  })
})

describe('catalogue des produits', () => {
  it('isole les produits exigeant un organisme notifié', () => {
    const classeII = produitVide('a')
    classeII.reponses = {
      ...classeII.reponses,
      produitNumerique: true,
      categorie: 'important-ii',
    }
    const defaut = produitVide('b')
    defaut.reponses = { ...defaut.reponses, produitNumerique: true }
    const e = etatCatalogue([classeII, defaut])
    expect(e.dansLeChamp).toBe(2)
    expect(e.organismeNotifie).toBe(1)
  })

  it('remonte une période de support sous le plancher', () => {
    const p = produitVide('a')
    p.reponses = { ...p.reponses, produitNumerique: true, periodeSupportAnnee: 2 }
    expect(etatCatalogue([p]).supportInsuffisant).toBe(1)
  })

  it('ne compte pas dans le champ un produit exclu', () => {
    const p = produitVide('a')
    p.reponses = {
      ...p.reponses,
      produitNumerique: true,
      exclusion: 'libre-non-commercial',
    }
    expect(etatCatalogue([p]).dansLeChamp).toBe(0)
  })
})

// ---------------------------------------------------------------------------

describe('registre du responsable — traçabilité ajoutée', () => {
  it('compte le responsable et la date de revue dans les mentions dues', () => {
    const champs = traitementVide('essai')
    expect(champs.suivi.responsable).toBe('')
    // La traçabilité n'est pas exigée par l'article 30, mais c'est le premier
    // élément qu'un contrôleur regarde : l'exclure la traiterait comme
    // facultative.
    expect(completudeSousTraitance(sousTraitanceVide('x'))).toBe(0)
  })
})
