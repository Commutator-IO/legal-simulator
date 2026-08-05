/**
 * Rendu de l'emphase dans les textes du corpus.
 *
 * Les notes de `lib/` sont des chaînes, pas du JSX — c'est ce qui permet de les
 * tester et de les relire comme un document. Elles portent donc leur emphase en
 * `**gras**` et `*italique*`, et ce composant la restitue. Le sous-ensemble est
 * volontairement minuscule : deux marques, aucun analyseur, aucune dépendance.
 * Rien de ce qui vient de `lib/` n'est saisi par un utilisateur, il n'y a donc
 * pas de contenu à assainir.
 *
 * L'italique sert surtout à la page SBOM, où l'on cite des termes anglais dans
 * une phrase française — *lockfile*, *top-level*, *vendored*. Le gras vient en
 * premier dans l'alternative, sinon `**gras**` serait reconnu comme deux
 * italiques vides.
 */
export function Riche({ children }: { children: string }) {
  const morceaux = children.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {morceaux.map((m, i) => {
        if (m.startsWith('**') && m.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-ink-900">
              {m.slice(2, -2)}
            </strong>
          )
        }
        if (m.startsWith('*') && m.endsWith('*') && m.length > 2) {
          return <em key={i}>{m.slice(1, -1)}</em>
        }
        return m
      })}
    </>
  )
}
