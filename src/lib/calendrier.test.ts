import { describe, expect, it } from 'vitest'
import {
  ECHEANCES,
  aVenir,
  aujourdhui,
  joursRestants,
  passees,
  statut,
} from './calendrier'
import { TEXTES } from './textes'

/**
 * Les valeurs attendues viennent des textes eux-mêmes, pas du code : ce sont
 * les dates publiées au journal officiel de l'Union. Un test qui enregistrerait
 * ce que le module produit ne vérifierait rien.
 */

describe('joursRestants', () => {
  it('compte en jours calendaires, sans décalage de fuseau', () => {
    expect(joursRestants('2026-09-11', '2026-08-04')).toBe(38)
    expect(joursRestants('2026-08-04', '2026-08-04')).toBe(0)
    expect(joursRestants('2026-08-02', '2026-08-04')).toBe(-2)
  })

  it('traverse correctement une année bissextile', () => {
    // 2028 est bissextile : février compte 29 jours.
    expect(joursRestants('2028-03-01', '2028-02-01')).toBe(29)
    // 2027 ne l'est pas.
    expect(joursRestants('2027-03-01', '2027-02-01')).toBe(28)
  })

  it('reste juste sur une longue portée', () => {
    // Du RGPD applicable au CRA pleinement applicable.
    expect(joursRestants('2027-12-11', '2018-05-25')).toBe(3487)
  })
})

describe('statut', () => {
  it('classe selon les trois seuils', () => {
    const t = '2026-08-04'
    expect(statut('2026-08-02', t)).toBe('passee')
    expect(statut('2026-08-04', t)).toBe('imminente')
    expect(statut('2026-11-02', t)).toBe('imminente') // 90 jours pile
    expect(statut('2026-11-03', t)).toBe('proche') // 91 jours
    expect(statut('2027-08-04', t)).toBe('proche') // 365 jours
    expect(statut('2027-08-05', t)).toBe('lointaine')
  })
})

describe('le corpus des échéances', () => {
  it('porte les dates publiées de l’AI Act, omnibus 2026/1744 compris', () => {
    const ia = ECHEANCES.filter((e) => e.texte === 'ai-act').map((e) => e.date)
    // Inchangées par l'omnibus.
    expect(ia).toContain('2025-02-02') // pratiques interdites, art. 4
    expect(ia).toContain('2025-08-02') // modèles à usage général, sanctions
    expect(ia).toContain('2026-08-02') // application générale, art. 50
    // Reportées par le règlement (UE) 2026/1744.
    expect(ia).toContain('2027-12-02') // annexe III, ex-2026-08-02
    expect(ia).toContain('2028-08-02') // annexe I, ex-2027-08-02
    expect(ia).toContain('2027-08-02') // bacs à sable, ex-2026-08-02
    // L'ancienne échéance des systèmes de l'annexe III ne doit plus figurer
    // comme telle : c'est l'erreur que le report a rendue coûteuse.
    const annexeIII = ECHEANCES.find((e) => e.titre.includes('annexe III'))
    expect(annexeIII?.date).toBe('2027-12-02')
  })

  it('porte les trois dates du règlement cyberrésilience', () => {
    const cra = ECHEANCES.filter((e) => e.texte === 'cra').map((e) => e.date)
    expect(cra).toContain('2026-06-11') // chapitre IV, organismes notifiés
    expect(cra).toContain('2026-09-11') // art. 14, signalement
    expect(cra).toContain('2027-12-11') // application pleine
  })

  it('place le signalement du CRA avant son application pleine', () => {
    // L'inversion qui surprend : l'obligation de signaler précède de quinze
    // mois l'obligation de conformité du produit.
    expect(joursRestants('2027-12-11', '2026-09-11')).toBe(456)
  })

  it('rattache chaque échéance à un texte du corpus', () => {
    const ids = new Set(TEXTES.map((t) => t.id))
    for (const e of ECHEANCES) expect(ids.has(e.texte)).toBe(true)
  })

  it('donne à chaque échéance le domaine de son texte', () => {
    for (const e of ECHEANCES) {
      const t = TEXTES.find((x) => x.id === e.texte)!
      expect(e.domaine).toBe(t.domaine)
    }
  })

  it('n’a pas deux échéances identiques', () => {
    const cles = ECHEANCES.map((e) => `${e.date}-${e.titre}`)
    expect(new Set(cles).size).toBe(cles.length)
  })
})

describe('aVenir et passees', () => {
  const t = '2026-08-04'

  it('se partagent exactement le corpus', () => {
    expect(aVenir(t).length + passees(t).length).toBe(ECHEANCES.length)
  })

  it('trie les échéances à venir de la plus proche à la plus lointaine', () => {
    const dates = aVenir(t).map((e) => e.date)
    expect(dates).toEqual([...dates].sort())
    expect(dates[0]).toBe('2026-09-11')
  })

  it('trie les échéances passées de la plus récente à la plus ancienne', () => {
    const dates = passees(t).map((e) => e.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('respecte la limite demandée', () => {
    expect(aVenir(t, 3)).toHaveLength(3)
  })

  it('compte le jour même comme à venir', () => {
    // Une obligation exigible aujourd'hui l'est encore aujourd'hui.
    expect(aVenir('2026-09-11').some((e) => e.date === '2026-09-11')).toBe(true)
  })
})

describe('aujourdhui', () => {
  it('rend une date ISO en heure locale', () => {
    expect(aujourdhui(new Date(2026, 7, 4, 23, 30))).toBe('2026-08-04')
    // Le 1er janvier à 0 h 30 doit rester le 1er janvier, pas basculer la
    // veille par un passage inutile en UTC.
    expect(aujourdhui(new Date(2027, 0, 1, 0, 30))).toBe('2027-01-01')
  })
})
