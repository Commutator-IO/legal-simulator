import { describe, expect, it } from 'vitest'
import {
  EVENEMENTS,
  aidfVide,
  aipdVide,
  completudeAipd,
  liaVide,
  niveauRisque,
  risqueVide,
  tiaVide,
  verdictAipd,
  verdictLia,
  verdictTia,
} from './analyses'
import type { Aipd, Lia, Niveau, Risque, Tia } from './analyses'

const risque = (g: Niveau, v: Niveau, gr: Niveau, vr: Niveau): Risque => ({
  ...risqueVide(),
  gravite: g,
  vraisemblance: v,
  graviteResiduelle: gr,
  vraisemblanceResiduelle: vr,
})

/** Une AIPD dont les trois événements portent le même niveau. */
const avecRisques = (r: Risque): Aipd => ({
  ...aipdVide('essai'),
  risques: Object.fromEntries(EVENEMENTS.map((e) => [e.id, r])),
})

describe('niveau de risque', () => {
  it('retient le maximum, jamais le produit', () => {
    // Le cas qui justifie le choix : un fichier de santé exfiltré est rare et
    // irrattrapable. Un produit (4 × 1 = 4 sur 16) l'écraserait ; le maximum le
    // maintient à « maximal », qui est ce que la personne subit.
    expect(niveauRisque(4, 1)).toBe('maximal')
    expect(niveauRisque(1, 4)).toBe('maximal')
    expect(niveauRisque(1, 1)).toBe('negligeable')
    expect(niveauRisque(2, 2)).toBe('limite')
    expect(niveauRisque(3, 1)).toBe('important')
  })

  it('rend « non apprécié » tant qu’une des deux échelles est à zéro', () => {
    expect(niveauRisque(0, 4)).toBe('non-apprecie')
    expect(niveauRisque(4, 0)).toBe('non-apprecie')
  })
})

describe('verdict d’analyse d’impact', () => {
  it('ne conclut rien tant que les risques résiduels ne sont pas appréciés', () => {
    const v = verdictAipd(aipdVide('essai'))
    expect(v.residuelMax).toBe('non-apprecie')
    expect(v.consultationPrealable).toBe(false)
  })

  it('déclenche la consultation préalable sur le risque RÉSIDUEL, pas le brut', () => {
    // Risque brut maximal, ramené à négligeable par les mesures : l'article 36
    // ne s'applique pas. Beaucoup d'analyses concluent de travers ici.
    const attenue = verdictAipd(avecRisques(risque(4, 4, 1, 1)))
    expect(attenue.consultationPrealable).toBe(false)
    expect(attenue.residuelMax).toBe('negligeable')

    // Risque brut modéré mais résiduel important : l'article 36 s'applique.
    const persistant = verdictAipd(avecRisques(risque(2, 2, 3, 2)))
    expect(persistant.consultationPrealable).toBe(true)
    expect(persistant.motif).toContain('36 §1')
  })

  it('retient le plus élevé des trois événements', () => {
    const a = aipdVide('essai')
    a.risques[EVENEMENTS[0].id] = risque(1, 1, 1, 1)
    a.risques[EVENEMENTS[1].id] = risque(1, 1, 4, 1)
    a.risques[EVENEMENTS[2].id] = risque(1, 1, 2, 1)
    const v = verdictAipd(a)
    expect(v.residuelMax).toBe('maximal')
    expect(v.evenementsCritiques).toHaveLength(1)
    expect(v.evenementsCritiques[0]).toBe(EVENEMENTS[1].label)
  })

  it('compte la traçabilité dans la complétude', () => {
    const a = aipdVide('essai')
    const avant = completudeAipd(a)
    a.suivi.responsable = 'A. Martin'
    expect(completudeAipd(a)).toBeGreaterThan(avant)
  })
})

describe('mise en balance de l’intérêt légitime', () => {
  const avec = (ids: string[]): Lia => ({ ...liaVide('essai'), critereRetenus: ids })
  const ETAPE1 = ['licite', 'precis', 'reel']
  const ETAPE2 = ['utile', 'minimal', 'proportionne']
  const ETAPE3 = ['attentes', 'impact', 'pas-sensibles', 'opposition', 'garanties']

  it('échoue à l’étape 1 si un seul critère de légitimité manque', () => {
    const v = verdictLia(avec([...ETAPE1.slice(0, 2), ...ETAPE2, ...ETAPE3]))
    expect(v.echoue).toBe(1)
    expect(v.soutenable).toBe(false)
  })

  it('échoue à l’étape 2 même avec une mise en balance parfaite', () => {
    // Les deux premières étapes sont éliminatoires : cinq critères sur cinq à
    // l'étape 3 ne rattrapent pas un défaut de nécessité.
    const v = verdictLia(avec([...ETAPE1, ...ETAPE2.slice(0, 2), ...ETAPE3]))
    expect(v.echoue).toBe(2)
    expect(v.soutenable).toBe(false)
  })

  it('passe au seuil de trois critères de mise en balance', () => {
    expect(verdictLia(avec([...ETAPE1, ...ETAPE2, ...ETAPE3.slice(0, 3)])).soutenable).toBe(
      true,
    )
    expect(verdictLia(avec([...ETAPE1, ...ETAPE2, ...ETAPE3.slice(0, 2)])).soutenable).toBe(
      false,
    )
  })

  it('dit que le seuil de trois est un repère, pas une règle de droit', () => {
    const v = verdictLia(avec([...ETAPE1, ...ETAPE2]))
    expect(v.motif).toContain("repère d'exploitation")
  })
})

describe('analyse d’impact du transfert', () => {
  const avec = (p: Partial<Tia>): Tia => ({ ...tiaVide('essai'), ...p })

  it('refuse de conclure tant que l’étape 3 n’est pas faite', () => {
    const v = verdictTia(avec({}))
    expect(v.possible).toBe(false)
    expect(v.motif).toContain('étape 3')
  })

  it('bloque un accès problématique non neutralisé', () => {
    expect(
      verdictTia(avec({ accesAutorites: 'oui-problematique', mesuresSuffisantes: false }))
        .possible,
    ).toBe(false)
  })

  it('autorise un accès problématique neutralisé par des mesures', () => {
    const v = verdictTia(
      avec({ accesAutorites: 'oui-problematique', mesuresSuffisantes: true }),
    )
    expect(v.possible).toBe(true)
    // Le motif doit rappeler que la défense repose sur les mesures, pas les
    // clauses : c'est tout l'enseignement de Schrems II.
    expect(v.motif).toContain('mesures')
  })

  it('autorise un transfert sans accès disproportionné, mais impose un réexamen', () => {
    const v = verdictTia(avec({ accesAutorites: 'non' }))
    expect(v.possible).toBe(true)
    expect(v.motif).toContain('réexamen')
  })
})

describe('analyse des droits fondamentaux', () => {
  it('ouvre les six volets de l’article 27 §1', () => {
    expect(Object.keys(aidfVide('essai').volets)).toHaveLength(6)
  })
})
