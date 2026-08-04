import { useState } from 'react'

/**
 * Un bloc de commande, copiable.
 *
 * Sur une page dont l'objet est de se brancher dans une chaîne de
 * construction, une commande qu'on doit resaisir à la main est une commande
 * qu'on saisit mal. Le bouton de copie n'est pas un ornement.
 *
 * Pas de coloration syntaxique : elle coûterait une dépendance de plusieurs
 * dizaines de kilo-octets pour une quinzaine de lignes de shell et de YAML,
 * et n'aide personne à lire `npm sbom`.
 */
export function Code({
  children,
  legende,
}: {
  children: string
  /** Ce que fait la commande, s'il faut le dire. */
  legende?: string
}) {
  const [copie, setCopie] = useState(false)

  return (
    <figure className="my-4">
      <div className="relative">
        <pre className="overflow-x-auto rounded-xl bg-ink-900 p-4 pr-24 font-mono text-xs leading-relaxed text-ink-100">
          {children}
        </pre>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(children).then(
              () => {
                setCopie(true)
                // Le retour à l'état initial dit que le bouton reste
                // utilisable ; un « copié » définitif laisse croire à un
                // basculement irréversible.
                setTimeout(() => setCopie(false), 1600)
              },
              () => undefined,
            )
          }}
          className="sans-impression absolute top-3 right-3 rounded-lg bg-ink-700 px-2.5 py-1 text-xs font-medium text-ink-100 transition hover:bg-ink-600"
        >
          {copie ? 'copié' : 'copier'}
        </button>
      </div>
      {legende && (
        <figcaption className="mt-1.5 text-xs leading-relaxed text-ink-500">
          {legende}
        </figcaption>
      )}
    </figure>
  )
}

/** Une commande courte dans le fil du texte. */
export function Cmd({ children }: { children: string }) {
  return (
    <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[0.85em] text-ink-800">
      {children}
    </code>
  )
}
