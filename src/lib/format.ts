/**
 * Mise en forme. Français partout : espaces insécables, virgule décimale,
 * dates en toutes lettres — un site de conformité européenne lu par des
 * juristes n'affiche pas `2027-12-02`.
 */

const dateLongue = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const dateCourte = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

const horodatage = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/** `2027-12-02` → « 2 décembre 2027 ». */
export const jour = (iso: string) => dateLongue.format(new Date(`${iso}T00:00:00Z`))

/** `2027-12-02` → « 02/12/2027 », pour les tableaux serrés. */
export const jourCourt = (iso: string) => dateCourte.format(new Date(`${iso}T00:00:00Z`))

/** Instant → « 11 sept. 14:30 », en heure locale du lecteur. */
export const instantCourt = (ms: number) => horodatage.format(new Date(ms))

/**
 * Une durée en jours, dite comme on la dit à l'oral : au-delà de deux ans on
 * cesse de compter les jours, parce que « 1 216 jours » ne se compare à rien
 * dans une tête humaine alors que « dans 3 ans » se situe immédiatement.
 */
export function duree(jours: number): string {
  const j = Math.abs(jours)
  if (j === 0) return "aujourd'hui"
  if (j === 1) return '1 jour'
  if (j < 60) return `${j} jours`
  if (j < 365) return `${Math.round(j / 30)} mois`
  const annees = j / 365
  if (annees < 2) return `${Math.round(j / 30)} mois`
  return `${annees.toFixed(annees < 10 ? 1 : 0).replace('.', ',')} ans`
}

/** « dans 38 jours » / « il y a 3 mois ». */
export function echeanceRelative(jours: number): string {
  if (jours === 0) return "aujourd'hui"
  return jours > 0 ? `dans ${duree(jours)}` : `il y a ${duree(jours)}`
}

const pourcent = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

export const pct = (v: number) => pourcent.format(v)
