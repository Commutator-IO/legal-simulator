import { describe, expect, it } from 'vitest'
import { PROFIL_VIDE, perimetre } from './perimetre'
import type { Profil } from './perimetre'
import { TEXTES } from './textes'
import { OBLIGATIONS, affectationVide, couverture, perimee } from './responsabilites'

const p = (x: Partial<Profil>): Profil => ({ ...PROFIL_VIDE, ...x })
const ids = (x: Partial<Profil>) => perimetre(p(x)).map((a) => a.texte)

describe('périmètre', () => {
  it('ne retient rien sans réponse', () => {
    expect(perimetre(PROFIL_VIDE)).toEqual([])
  })

  it('ne renvoie que des textes du corpus', () => {
    const connus = new Set(TEXTES.map((t) => t.id))
    const tout = Object.keys(PROFIL_VIDE).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Profil,
    )
    for (const a of perimetre(tout)) expect(connus.has(a.texte)).toBe(true)
  })

  it('ne retient jamais deux fois le même texte', () => {
    // L'AI Act sort par deux portes — usage et fourniture de modèle — et le
    // Data Act par deux également. Le dédoublonnage est le point du module.
    const l = ids({ ia: true, modeleIa: true, objetConnecte: true, serviceCloud: true })
    expect(new Set(l).size).toBe(l.length)
  })

  it('déclenche le RGPD sur les seules données de salariés', () => {
    expect(ids({ donneesPersonnelles: true })).toContain('rgpd')
  })

  it('sépare le RGPD d’ePrivacy', () => {
    // Deux régimes distincts : on peut déposer des traceurs non personnels
    // sans traiter de données personnelles, et l'inverse.
    expect(ids({ traceurs: true })).toEqual(['eprivacy'])
    expect(ids({ donneesPersonnelles: true })).toEqual(['rgpd'])
  })

  it('associe la responsabilité du fait des produits à la mise sur le marché', () => {
    const l = ids({ produitNumerique: true })
    expect(l).toContain('cra')
    expect(l).toContain('pld')
  })

  it('fait primer DORA pour une entité financière', () => {
    expect(ids({ finance: true })).toContain('dora')
  })

  it('marque comme probable ce qui dépend des seuils nationaux', () => {
    const nis2 = perimetre(p({ serviceCloud: true })).find((a) => a.texte === 'nis2')
    expect(nis2?.degre).toBe('probable')
    // Mais certain lorsque le secteur est revendiqué directement.
    const direct = perimetre(p({ secteurNis2: true })).find((a) => a.texte === 'nis2')
    expect(direct?.degre).toBe('certain')
  })

  it('nuance le DSA pour une micro-entreprise sans l’écarter', () => {
    const a = perimetre(p({ plateforme: true, microEntreprise: true })).find(
      (x) => x.texte === 'dsa',
    )!
    expect(a.raison).toContain('micro-entreprise')
    expect(a.raison).toContain('art. 19')
  })

  it('n’écarte jamais un texte sur le seul statut de micro-entreprise', () => {
    // La règle du module : un faux positif coûte une lecture, un faux négatif
    // coûte le dossier.
    const avec = ids({ donneesPersonnelles: true, plateforme: true, microEntreprise: true })
    const sans = ids({ donneesPersonnelles: true, plateforme: true })
    expect(avec).toEqual(expect.arrayContaining(sans))
  })
})

describe('couverture du registre de responsabilité', () => {
  const today = '2026-08-04'

  it('compte toutes les obligations comme applicables par défaut', () => {
    expect(couverture({}, today).applicables).toBe(OBLIGATIONS.length)
    expect(couverture({}, today).orphelines).toBe(OBLIGATIONS.length)
  })

  it('retire du dénominateur ce qui est déclaré sans objet', () => {
    const c = couverture(
      { dpo: { ...affectationVide(), statut: 'sans-objet' } },
      today,
    )
    expect(c.applicables).toBe(OBLIGATIONS.length - 1)
    expect(c.orphelines).toBe(OBLIGATIONS.length - 1)
  })

  it('compte comme orpheline une obligation faite sans responsable nommé', () => {
    // Le cœur de l'indicateur : « fait » sans nom ne vaut que jusqu'au départ
    // de celui qui s'en occupait sans le dire.
    const c = couverture({ dpo: { ...affectationVide(), statut: 'fait' } }, today)
    expect(c.faites).toBe(1)
    expect(c.orphelines).toBe(OBLIGATIONS.length)
  })

  it('ne compte pas comme orpheline une obligation dotée d’un nom', () => {
    const c = couverture(
      { dpo: { ...affectationVide(), statut: 'fait', responsable: 'A. Martin' } },
      today,
    )
    expect(c.orphelines).toBe(OBLIGATIONS.length - 1)
  })

  it('repère les revues périmées', () => {
    const c = couverture(
      {
        // Registre art. 30 : revue tous les 6 mois.
        'registre-30': {
          ...affectationVide(),
          responsable: 'A. Martin',
          derniereRevue: '2025-01-01',
        },
      },
      today,
    )
    expect(c.perimees).toBe(1)
  })
})

describe('péremption d’une revue', () => {
  it('tolère exactement la périodicité', () => {
    expect(perimee('2026-02-04', 6, '2026-08-04')).toBe(false)
    expect(perimee('2026-02-04', 6, '2026-08-05')).toBe(true)
  })

  it('franchit une fin d’année', () => {
    expect(perimee('2026-10-01', 6, '2027-04-01')).toBe(false)
    expect(perimee('2026-10-01', 6, '2027-04-02')).toBe(true)
  })
})
