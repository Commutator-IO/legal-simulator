import { describe, expect, it } from 'vitest'
import { etat, jalons, premierJalon, reste, unMois } from './incident'
import type { Regime } from './incident'

/**
 * 4 août 2026, 9 h 00 — un mardi matin ordinaire.
 *
 * Construit en heure *locale*, comme le fait le champ `datetime-local` de la
 * page. Les assertions sur `unMois` portent sur le quantième et le mois plutôt
 * que sur une chaîne ISO : sinon la suite passerait à Paris et échouerait à
 * New York, ce qui est le pire des tests — celui qui donne raison à qui
 * l'écrit.
 */
const T = new Date(2026, 7, 4, 9, 0).getTime()
const H = 3_600_000

const echeance = (regimes: Regime[], libelle: string, classification?: number) =>
  jalons({ connaissance: T, classification, regimes }).find((j) =>
    j.libelle.includes(libelle),
  )!

describe('unMois', () => {
  const rendu = (a: number, m: number, j: number) => {
    const d = new Date(unMois(new Date(a, m, j, 9, 0).getTime()))
    return [d.getFullYear(), d.getMonth(), d.getDate()]
  }

  it('ajoute un mois calendaire, pas trente jours', () => {
    expect(rendu(2026, 0, 15)).toEqual([2026, 1, 15])
    // Trente jours après le 15 janvier tomberait le 14 février : le règlement
    // dit « un mois », et l'écart d'un jour est un jour de retard.
  })

  it('recule au dernier jour du mois quand le quantième n’existe pas', () => {
    // 31 janvier + un mois = 28 février, et non 3 mars.
    expect(rendu(2026, 0, 31)).toEqual([2026, 1, 28])
    // 2028 est bissextile.
    expect(rendu(2028, 0, 31)).toEqual([2028, 1, 29])
  })

  it('franchit correctement une fin d’année', () => {
    expect(rendu(2026, 11, 15)).toEqual([2027, 0, 15])
  })
})

describe('RGPD', () => {
  it('pose la notification à l’autorité à 72 heures pile', () => {
    expect(echeance(['rgpd'], "Notification à l'autorité").echeance).toBe(T + 72 * H)
  })

  it('signale que le délai de l’article 34 n’est pas dans le texte', () => {
    // Le règlement dit « dans les meilleurs délais » sans chiffre : l'outil
    // affiche un repère, il doit dire que c'en est un.
    const j = echeance(['rgpd'], 'Communication aux personnes')
    expect(j.contenu).toContain('pas dans le règlement')
  })
})

describe('NIS 2', () => {
  it('pose la cascade 24 h / 72 h / un mois', () => {
    expect(echeance(['nis2'], 'Alerte précoce').echeance).toBe(T + 24 * H)
    expect(echeance(['nis2'], "Notification d'incident").echeance).toBe(T + 72 * H)
    expect(echeance(['nis2'], 'Rapport final').echeance).toBe(unMois(T))
  })
})

describe('CRA', () => {
  it('pose le rapport final de vulnérabilité à 14 jours', () => {
    expect(echeance(['cra-vulnerabilite'], 'Rapport final').echeance).toBe(
      T + 14 * 24 * H,
    )
  })

  it('pose le rapport final d’incident grave à un mois', () => {
    expect(echeance(['cra-incident'], 'Rapport final').echeance).toBe(unMois(T))
  })

  it('cumule les deux régimes sans les confondre', () => {
    const liste = jalons({
      connaissance: T,
      regimes: ['cra-vulnerabilite', 'cra-incident'],
    })
    expect(liste).toHaveLength(6)
  })
})

describe('DORA', () => {
  it('retient les 4 heures après classification quand elle est rapide', () => {
    // Classification une heure après la découverte : 1 h + 4 h = 5 h, ce qui
    // est plus contraignant que les 24 heures depuis la prise de connaissance.
    const j = echeance(['dora'], 'Notification initiale', T + 1 * H)
    expect(j.echeance).toBe(T + 5 * H)
  })

  it('retient les 24 heures depuis la connaissance quand la classification traîne', () => {
    // Classification à 22 heures : 22 h + 4 h = 26 h, au-delà du plafond de
    // 24 heures — c'est ce dernier qui s'impose. Classer tard ne repousse pas
    // l'échéance, et c'est là que les équipes se trompent.
    const j = echeance(['dora'], 'Notification initiale', T + 22 * H)
    expect(j.echeance).toBe(T + 24 * H)
  })

  it('décompte le rapport intermédiaire depuis la notification initiale', () => {
    const initiale = echeance(['dora'], 'Notification initiale', T + 1 * H).echeance
    const intermediaire = echeance(['dora'], 'Rapport intermédiaire', T + 1 * H).echeance
    expect(intermediaire).toBe(initiale + 72 * H)
    // Et non depuis la prise de connaissance.
    expect(intermediaire).not.toBe(T + 72 * H)
  })

  it('décompte le rapport final depuis le rapport intermédiaire', () => {
    const intermediaire = echeance(['dora'], 'Rapport intermédiaire', T + 1 * H).echeance
    expect(echeance(['dora'], 'Rapport final', T + 1 * H).echeance).toBe(
      unMois(intermediaire),
    )
  })

  it('retombe sur la prise de connaissance sans classification saisie', () => {
    expect(echeance(['dora'], 'Notification initiale').echeance).toBe(T + 4 * H)
  })
})

describe('superposition des régimes', () => {
  it('trie du plus urgent au plus lointain', () => {
    const liste = jalons({
      connaissance: T,
      classification: T,
      regimes: ['rgpd', 'nis2', 'cra-vulnerabilite', 'dora'],
    })
    const dates = liste.map((j) => j.echeance)
    expect(dates).toEqual([...dates].sort((a, b) => a - b))
  })

  it('donne DORA comme premier jalon quand les quatre régimes s’appliquent', () => {
    // Quatre heures : c'est le délai qui dicte le rythme de la cellule de
    // crise, avant même la première alerte NIS 2.
    const premier = premierJalon({
      connaissance: T,
      classification: T,
      regimes: ['rgpd', 'nis2', 'cra-vulnerabilite', 'dora'],
    })!
    expect(premier.regime).toBe('dora')
    expect(premier.echeance).toBe(T + 4 * H)
  })

  it('ne rend rien sans régime coché', () => {
    expect(jalons({ connaissance: T, regimes: [] })).toEqual([])
  })
})

describe('état et reste', () => {
  const j = echeance(['nis2'], 'Alerte précoce') // T + 24 h

  it('bascule en critique dans les deux dernières heures', () => {
    expect(etat(j, T)).toBe('ouvert')
    expect(etat(j, T + 21 * H)).toBe('ouvert')
    expect(etat(j, T + 22 * H)).toBe('critique')
    expect(etat(j, T + 25 * H)).toBe('depasse')
  })

  it('formule le reste selon son ordre de grandeur', () => {
    expect(reste(j, T + 23.5 * H)).toBe('30 min')
    expect(reste(j, T + 23 * H)).toBe('1 h 00')
    expect(reste(j, T + 20 * H)).toBe('4 h 00')
    expect(reste(j, T + 25 * H)).toBe('dépassé de 1 h 00')
  })

  it('passe en jours au-delà de 48 heures', () => {
    const final = echeance(['cra-vulnerabilite'], 'Rapport final') // T + 14 j
    expect(reste(final, T)).toBe('14 j 0 h')
  })
})
