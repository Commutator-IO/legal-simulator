import { useId } from 'react'

/**
 * Les champs de formulaire, définis une fois.
 *
 * Ce site est fait de formulaires, et un formulaire de conformité a une
 * exigence propre : chaque champ doit dire *pourquoi* il est là et quel
 * article l'impose. D'où le couple `aide` / `article` présent sur presque tous
 * les contrôles — un registre rempli sans comprendre ce qu'on remplit ne
 * protège personne.
 */

export function Case({
  coche,
  onChange,
  label,
  aide,
}: {
  coche: boolean
  onChange: (v: boolean) => void
  label: string
  aide?: string
}) {
  const id = useId()
  return (
    <div className="flex gap-3">
      <input
        id={id}
        type="checkbox"
        checked={coche}
        autoComplete="off"
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
      />
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm leading-snug font-medium text-ink-800">
          {label}
        </label>
        {aide && <p className="mt-1 text-xs leading-relaxed text-ink-500">{aide}</p>}
      </div>
    </div>
  )
}

export function Texte({
  label,
  valeur,
  onChange,
  aide,
  article,
  placeholder,
  lignes = 1,
}: {
  label: string
  valeur: string
  onChange: (v: string) => void
  aide?: string
  /** L'article qui impose la mention, affiché à droite du libellé. */
  article?: string
  placeholder?: string
  lignes?: number
}) {
  const id = useId()
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink-700">
          {label}
        </label>
        {article && <span className="ref shrink-0">{article}</span>}
      </div>
      {lignes > 1 ? (
        <textarea
          id={id}
          rows={lignes}
          className="zone-texte"
          value={valeur}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          className="champ-texte"
          value={valeur}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {aide && <p className="field-hint">{aide}</p>}
    </div>
  )
}

export function Liste<T extends string>({
  label,
  valeur,
  options,
  onChange,
  aide,
  article,
}: {
  label: string
  valeur: T | ''
  options: { id: T; label: string }[]
  onChange: (v: T | '') => void
  aide?: string
  article?: string
}) {
  const id = useId()
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink-700">
          {label}
        </label>
        {article && <span className="ref shrink-0">{article}</span>}
      </div>
      <select
        id={id}
        className="champ-texte"
        value={valeur}
        onChange={(e) => onChange(e.target.value as T | '')}
      >
        <option value="">— à renseigner —</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {aide && <p className="field-hint">{aide}</p>}
    </div>
  )
}

export function Segments<T extends string>({
  label,
  valeur,
  options,
  onChange,
  aide,
}: {
  label?: string
  valeur: T
  options: { id: T; label: string }[]
  onChange: (v: T) => void
  aide?: string
}) {
  return (
    <div>
      {label && <span className="field-label">{label}</span>}
      {/* Le contrôle passe à la ligne plutôt que de déborder : quatre options
          n'ont pas la place dans une colonne étroite, et un libellé tronqué est
          pire que deux rangées. */}
      <div className="flex flex-wrap rounded-xl border border-ink-200 bg-ink-100/60 p-1">
        {options.map((o) => {
          const actif = o.id === valeur
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={actif}
              onClick={() => onChange(o.id)}
              className={[
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition',
                actif
                  ? 'bg-white text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-800',
              ].join(' ')}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {aide && <p className="field-hint">{aide}</p>}
    </div>
  )
}

export function Date_({
  label,
  valeur,
  onChange,
  aide,
}: {
  label: string
  valeur: string
  onChange: (v: string) => void
  aide?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type="date"
        className="champ-texte tabular"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
      />
      {aide && <p className="field-hint">{aide}</p>}
    </div>
  )
}
