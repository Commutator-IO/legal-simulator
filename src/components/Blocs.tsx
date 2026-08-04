import { FOND, PASTILLE, PLEIN, TEXTE } from '../lib/couleurs'
import type { Teinte } from '../lib/couleurs'

/** Encadré d'avertissement ou de rappel. */
export function Encadre({
  teinte = 'brand',
  titre,
  children,
}: {
  teinte?: Teinte
  titre?: string
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border p-4 text-sm leading-relaxed ${FOND[teinte]}`}>
      {titre && <p className="mb-1.5 font-semibold">{titre}</p>}
      {children}
    </div>
  )
}

export function Pastille({
  teinte = 'ink',
  children,
}: {
  teinte?: Teinte
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${PASTILLE[teinte]}`}
    >
      {children}
    </span>
  )
}

export function Stat({
  valeur,
  libelle,
  teinte = 'ink',
}: {
  valeur: string
  libelle: string
  teinte?: Teinte
}) {
  return (
    <div className="card p-4">
      <p className={`tabular text-2xl font-semibold ${TEXTE[teinte]}`}>{valeur}</p>
      <p className="mt-1 text-xs leading-snug text-ink-500">{libelle}</p>
    </div>
  )
}

/** Barre de progression, avec sa valeur en clair — un ratio sans chiffre ne se cite pas. */
export function Jauge({
  part,
  teinte = 'brand',
  libelle,
}: {
  part: number
  teinte?: Teinte
  libelle?: string
}) {
  const pourcent = Math.round(Math.min(1, Math.max(0, part)) * 100)
  return (
    <div>
      {libelle && (
        <div className="mb-1 flex items-baseline justify-between text-xs text-ink-500">
          <span>{libelle}</span>
          <span className="tabular font-medium text-ink-700">{pourcent} %</span>
        </div>
      )}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-ink-200"
        role="progressbar"
        aria-valuenow={pourcent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${PLEIN[teinte]}`}
          style={{ width: `${pourcent}%` }}
        />
      </div>
    </div>
  )
}

/** Repli. Ouvert à l'impression par la règle `@media print` de index.css. */
export function Detail({
  resume,
  children,
  defaut = false,
}: {
  resume: string
  children: React.ReactNode
  defaut?: boolean
}) {
  return (
    <details open={defaut} className="group">
      <summary className="cursor-pointer list-none text-sm font-medium text-brand-700 transition hover:text-brand-900">
        <span className="group-open:hidden">▸ {resume}</span>
        <span className="hidden group-open:inline">▾ {resume}</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}

/** Liste d'obligations : article à gauche, exigence à droite. */
export function Obligations({
  items,
}: {
  items: { article: string; texte: string }[]
}) {
  return (
    <ul className="divide-y divide-ink-100">
      {items.map((o) => (
        <li key={o.article + o.texte.slice(0, 12)} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-4">
          <span className="ref shrink-0 self-start sm:w-40">{o.article}</span>
          <span className="text-sm leading-relaxed text-ink-700">{o.texte}</span>
        </li>
      ))}
    </ul>
  )
}
