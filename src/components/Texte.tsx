/**
 * Rendu du gras dans les textes du corpus.
 *
 * Les notes de `lib/` sont des chaînes, pas du JSX — c'est ce qui permet de les
 * tester et de les relire comme un document. Elles portent donc leur emphase en
 * `**gras**`, et ce composant la restitue. Le sous-ensemble est
 * volontairement minuscule : une seule marque, aucun analyseur, aucune
 * dépendance. Rien de ce qui vient de `lib/` n'est saisi par un utilisateur, il
 * n'y a donc pas de contenu à assainir.
 */
export function Riche({ children }: { children: string }) {
  const morceaux = children.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {morceaux.map((m, i) =>
        m.startsWith('**') && m.endsWith('**') ? (
          <strong key={i} className="font-semibold text-ink-900">
            {m.slice(2, -2)}
          </strong>
        ) : (
          m
        ),
      )}
    </>
  )
}
