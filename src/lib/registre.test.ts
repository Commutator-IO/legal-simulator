import { describe, expect, it } from 'vitest'
import { aipd, champsManquants, completude, mentions, traitementVide } from './registre'
import type { Traitement } from './registre'

const t = (p: Partial<Traitement> = {}): Traitement => ({
  ...traitementVide('essai'),
  ...p,
})

/** Un traitement dont toutes les mentions inconditionnelles sont remplies. */
const complet = (p: Partial<Traitement> = {}): Traitement =>
  t({
    // La traçabilité fait partie des mentions comptées : c'est le premier
    // élément qu'un contrôleur regarde, et l'exclure du dénominateur
    // reviendrait à la traiter comme facultative.
    suivi: { responsable: 'A. Martin', validateur: 'DPO', derniereRevue: '2026-07-01' },
    nom: 'Gestion de la paie',
    finalites: 'Établir les bulletins et déclarer les cotisations',
    baseLegale: 'obligation-legale',
    categoriesPersonnes: 'Salariés',
    categoriesDonnees: 'Identité, RIB',
    destinataires: 'Service RH, URSSAF',
    conservation: '5 ans après le départ',
    mesuresSecurite: 'Habilitations nominatives, chiffrement au repos',
    ...p,
  })

describe('mentions dues', () => {
  it('exige les huit mentions de l’article 30 plus la traçabilité', () => {
    const m = mentions(t())
    expect(m).toHaveLength(10)
    expect(m.filter((x) => x.article === 'art. 5 §2')).toHaveLength(2)
  })

  it('ajoute la mise en balance quand la base est l’intérêt légitime', () => {
    const m = mentions(t({ baseLegale: 'interet-legitime' }))
    expect(m).toHaveLength(11)
    expect(m.some((x) => x.article === 'art. 6 §1 f')).toBe(true)
  })

  it('ajoute la condition de l’article 9 pour les données sensibles', () => {
    expect(mentions(t({ donneesSensibles: true }))).toHaveLength(11)
  })

  it('ajoute pays et garantie en cas de transfert hors EEE', () => {
    const m = mentions(t({ transfert: { horsEee: true, pays: '', garantie: '' } }))
    expect(m).toHaveLength(12)
    expect(m.some((x) => x.article === 'art. 46')).toBe(true)
  })
})

describe('complétude', () => {
  it('vaut 0 sur un traitement vide et 1 sur un traitement complet', () => {
    expect(completude(t())).toBe(0)
    expect(completude(complet())).toBe(1)
  })

  it('atteint 1 même avec des mentions conditionnelles, une fois remplies', () => {
    // Le point du calcul : un registre portant un transfert hors EEE doit
    // pouvoir atteindre 100 %, sinon l'indicateur cesse d'être regardé.
    expect(
      completude(
        complet({
          transfert: {
            horsEee: true,
            pays: 'États-Unis',
            garantie: 'Clauses contractuelles types + analyse du transfert',
          },
        }),
      ),
    ).toBe(1)
  })

  it('retombe sous 1 dès qu’une mention conditionnelle s’ouvre', () => {
    const avant = completude(complet())
    const apres = completude(complet({ donneesSensibles: true }))
    expect(avant).toBe(1)
    expect(apres).toBeLessThan(1)
  })

  it('ignore les champs remplis d’espaces', () => {
    expect(completude(complet({ finalites: '   ' }))).toBeLessThan(1)
  })
})

describe('champs manquants', () => {
  it('nomme le champ et l’article qui l’impose', () => {
    const m = champsManquants(t({ nom: 'Paie' }))
    expect(m.some((x) => x.champ === 'Finalités' && x.article === 'art. 30 §1 b')).toBe(
      true,
    )
    expect(m.some((x) => x.champ === 'Nom du traitement')).toBe(false)
  })
})

describe('criblage d’analyse d’impact — article 35', () => {
  it('la rend certaine sur la liste de l’autorité', () => {
    const a = aipd(t({ listeAutorite: true }))
    expect(a.requise).toBe(true)
    expect(a.certitude).toBe('certaine')
  })

  it('applique le §3 a — évaluation et décision automatisée', () => {
    const a = aipd(t({ criteresRisque: ['evaluation', 'decision-automatisee'] }))
    expect(a.certitude).toBe('certaine')
    expect(a.motif).toContain('35 §3 a')
  })

  it('applique le §3 b — données sensibles à grande échelle', () => {
    const a = aipd(t({ donneesSensibles: true, criteresRisque: ['grande-echelle'] }))
    expect(a.certitude).toBe('certaine')
    expect(a.motif).toContain('35 §3 b')
  })

  it('applique le §3 c — surveillance à grande échelle', () => {
    const a = aipd(t({ criteresRisque: ['surveillance', 'grande-echelle'] }))
    expect(a.certitude).toBe('certaine')
    expect(a.motif).toContain('35 §3 c')
  })

  it('rend l’analyse probable au seuil de deux critères du CEPD', () => {
    const a = aipd(t({ criteresRisque: ['innovation', 'vulnerables'] }))
    expect(a.requise).toBe(true)
    expect(a.certitude).toBe('probable')
  })

  it('ne la requiert pas sous le seuil, mais demande de tracer le raisonnement', () => {
    const a = aipd(t({ criteresRisque: ['innovation'] }))
    expect(a.requise).toBe(false)
    expect(a.motif).toContain('consignez')
  })

  it('ne requiert rien sans aucun critère', () => {
    expect(aipd(t()).requise).toBe(false)
  })

  it('préfère toujours le motif le plus fort', () => {
    // Cinq critères dont deux formant un cas du §3 : c'est le §3 qu'il faut
    // citer, parce qu'il est opposable là où le faisceau ne fait que présumer.
    const a = aipd(
      t({
        criteresRisque: [
          'evaluation',
          'decision-automatisee',
          'innovation',
          'vulnerables',
          'grande-echelle',
        ],
      }),
    )
    expect(a.certitude).toBe('certaine')
    expect(a.motif).toContain('35 §3 a')
  })
})
