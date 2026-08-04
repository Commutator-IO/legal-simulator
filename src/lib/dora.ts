/**
 * Le registre d'information DORA — article 28 §3.
 *
 * Chaque entité financière tient un registre de tous ses accords contractuels
 * portant sur des services informatiques fournis par des tiers, et le remet
 * **chaque année** à son autorité compétente, dans un format normalisé par des
 * normes techniques d'exécution. Un registre incomplet est un manquement
 * autonome, indépendamment de la qualité des prestations.
 *
 * Les champs retenus ici sont ceux qui portent une décision — la criticité, la
 * substituabilité, la stratégie de sortie —, pas la totalité des modèles B_01
 * à B_07 des normes techniques, qui comptent plus de cent colonnes et se
 * remplissent depuis un système d'information, pas depuis un navigateur. Le but
 * est de faire apparaître les trous avant l'échéance de remise, pas de produire
 * le fichier de dépôt.
 */

import type { Suivi } from './suivi'
import { suiviVide } from './suivi'
import { manquants, part } from './collection'
import type { Mention } from './registre'

export type Accord = {
  id: string
  suivi: Suivi
  /** Raison sociale du prestataire. */
  prestataire: string
  /** Identifiant d'entité juridique — exigé par les normes techniques. */
  lei: string
  /** Nature du service : hébergement, logiciel, traitement de données… */
  service: string
  /** Pays d'établissement et pays de stockage ou de traitement des données. */
  paysEtablissement: string
  paysDonnees: string
  dateDebut: string
  dateFin: string
  /** Le service soutient-il une fonction critique ou importante ? */
  fonctionCritique: boolean
  /** La fonction soutenue, nommée. */
  fonction: string
  /** Sous-traitance en chaîne : le risque que le registre existe pour révéler. */
  sousTraitance: string
  /** Substituabilité du prestataire — art. 28 §3 et 29 §2. */
  substituabilite: Substituabilite
  /** Stratégie de sortie documentée — art. 28 §8. */
  strategieSortie: string
  /** Droit d'audit et d'accès stipulé — art. 30 §3 e. */
  droitAudit: string
  /** Date du dernier réexamen du risque de concentration. */
  derniereEvaluation: string
}

export type Substituabilite = 'non-evaluee' | 'aisee' | 'complexe' | 'impossible'

export const SUBSTITUABILITES: { id: Substituabilite; label: string; note: string }[] = [
  { id: 'non-evaluee', label: 'Non évaluée', note: 'À trancher avant la remise annuelle.' },
  {
    id: 'aisee',
    label: 'Aisément substituable',
    note: 'Plusieurs prestataires équivalents, migration éprouvée.',
  },
  {
    id: 'complexe',
    label: 'Substituable avec difficulté',
    note: "Migration longue ou coûteuse, mais possible. Exige une stratégie de sortie détaillée et testée.",
  },
  {
    id: 'impossible',
    label: 'Non substituable',
    note: "Situation à signaler à la direction : elle constitue un risque de concentration au sens de l'article 29, et c'est ce que l'autorité cherche dans le registre.",
  },
]

export function accordVide(id: string): Accord {
  return {
    id,
    suivi: suiviVide(),
    prestataire: '',
    lei: '',
    service: '',
    paysEtablissement: '',
    paysDonnees: '',
    dateDebut: '',
    dateFin: '',
    fonctionCritique: false,
    fonction: '',
    sousTraitance: '',
    substituabilite: 'non-evaluee',
    strategieSortie: '',
    droitAudit: '',
    derniereEvaluation: '',
  }
}

/**
 * Les mentions dues. Un accord soutenant une fonction critique en doit
 * davantage : c'est la logique de l'article 30 §3, qui réserve les clauses
 * renforcées à ces seuls contrats.
 */
export function mentionsAccord(a: Accord): Mention[] {
  const m: Mention[] = [
    { champ: 'Prestataire', article: 'art. 28 §3', valeur: a.prestataire },
    { champ: 'Identifiant d’entité juridique', article: 'normes techniques', valeur: a.lei },
    { champ: 'Service fourni', article: 'art. 28 §3', valeur: a.service },
    { champ: 'Pays d’établissement', article: 'art. 28 §3', valeur: a.paysEtablissement },
    { champ: 'Pays de traitement des données', article: 'art. 29 §2 d', valeur: a.paysDonnees },
    { champ: 'Date de début', article: 'art. 28 §3', valeur: a.dateDebut },
    { champ: 'Responsable de la fiche', article: 'art. 5 §2 RGPD', valeur: a.suivi.responsable },
  ]
  if (a.fonctionCritique) {
    m.push({ champ: 'Fonction critique soutenue', article: 'art. 28 §3', valeur: a.fonction })
    m.push({ champ: 'Sous-traitance en chaîne', article: 'art. 29 §2 a', valeur: a.sousTraitance })
    m.push({ champ: 'Stratégie de sortie', article: 'art. 28 §8', valeur: a.strategieSortie })
    m.push({ champ: 'Droit d’audit et d’accès', article: 'art. 30 §3 e', valeur: a.droitAudit })
    m.push({ champ: 'Dernier réexamen', article: 'art. 28 §1 b', valeur: a.derniereEvaluation })
  }
  return m
}

export const completudeAccord = (a: Accord) => part(mentionsAccord(a))
export const champsManquantsAccord = (a: Accord) => manquants(mentionsAccord(a))

export type EtatRegistreDora = {
  total: number
  critiques: number
  /** Fonctions critiques sans stratégie de sortie : le manquement le plus reproché. */
  sansStrategieSortie: number
  /** Prestataires jugés non substituables — le risque de concentration. */
  nonSubstituables: number
  /** Accords soutenant une fonction critique dont la substituabilité n'est pas tranchée. */
  nonEvalues: number
}

export function etatRegistre(accords: Accord[]): EtatRegistreDora {
  let critiques = 0
  let sansStrategieSortie = 0
  let nonSubstituables = 0
  let nonEvalues = 0

  for (const a of accords) {
    if (!a.fonctionCritique) continue
    critiques++
    if (!a.strategieSortie.trim()) sansStrategieSortie++
    if (a.substituabilite === 'impossible') nonSubstituables++
    if (a.substituabilite === 'non-evaluee') nonEvalues++
  }

  return { total: accords.length, critiques, sansStrategieSortie, nonSubstituables, nonEvalues }
}
