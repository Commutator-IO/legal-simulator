/**
 * La traçabilité, partagée par toutes les pièces du site.
 *
 * Une pièce de conformité vaut par trois choses au moins autant que par son
 * contenu : **qui la porte**, **qui l'a validée**, et **de quand elle date**.
 * Un contrôleur regarde la date de dernière revue avant de lire le fond, parce
 * qu'elle dit seule si le document est vivant ou s'il a été produit une fois
 * pour un audit puis oublié.
 *
 * C'était le manque transverse de la première version du site : les lignes du
 * registre de l'article 30 n'avaient ni responsable ni date, alors que la page
 * responsabilités reprochait précisément cela au reste du monde.
 */

export type Suivi = {
  /** Le nom d'une personne. Un service ne répond de rien. */
  responsable: string
  /** Celui qui engage l'organisation en approuvant — souvent le DPO ou un dirigeant. */
  validateur: string
  /** `AAAA-MM-JJ` de la dernière revue. */
  derniereRevue: string
}

export function suiviVide(): Suivi {
  return { responsable: '', validateur: '', derniereRevue: '' }
}

/** Vrai si la dernière revue remonte à plus que la périodicité attendue. */
export function perimee(derniereRevue: string, mois: number, aujourdhui: string): boolean {
  if (!derniereRevue) return false
  const [a, m, j] = derniereRevue.split('-').map(Number)
  const limite = new Date(Date.UTC(a, m - 1 + mois, j))
  const [a2, m2, j2] = aujourdhui.split('-').map(Number)
  return Date.UTC(a2, m2 - 1, j2) > limite.getTime()
}

export type EtatSuivi = 'orphelin' | 'jamais-revu' | 'perime' | 'a-jour'

/**
 * L'état d'une pièce, dans l'ordre où les défauts comptent.
 *
 * L'absence de responsable passe avant l'absence de revue : une pièce que
 * personne ne porte ne sera pas revue non plus, et l'afficher « à revoir »
 * laisserait croire qu'il suffit de cocher une date.
 */
export function etatSuivi(s: Suivi, mois: number, aujourdhui: string): EtatSuivi {
  if (!s.responsable.trim()) return 'orphelin'
  if (!s.derniereRevue) return 'jamais-revu'
  if (perimee(s.derniereRevue, mois, aujourdhui)) return 'perime'
  return 'a-jour'
}

export const LIBELLE_ETAT: Record<EtatSuivi, string> = {
  orphelin: 'sans responsable',
  'jamais-revu': 'jamais revu',
  perime: 'revue périmée',
  'a-jour': 'à jour',
}

export const TEINTE_ETAT: Record<EtatSuivi, 'ember' | 'gold' | 'jade'> = {
  orphelin: 'ember',
  'jamais-revu': 'gold',
  perime: 'gold',
  'a-jour': 'jade',
}
