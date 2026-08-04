import { identifiant, useStockage } from './stockage'

/**
 * Une collection de pièces persistée localement.
 *
 * Le défaut structurel de la première version : la qualification d'un système
 * d'IA et celle d'un produit étaient stockées dans un objet unique. Or une
 * entreprise n'a pas *un* système d'IA, elle en a douze — et un fabricant a un
 * catalogue, pas un produit. Le livrable réel de l'AI Act est d'ailleurs
 * l'inventaire ; la qualification n'en est qu'une colonne.
 *
 * Ce module donne à toutes les pages le même comportement — ajouter, modifier,
 * dupliquer, supprimer — pour qu'aucune n'invente le sien.
 */
export type Collection<T extends { id: string }> = {
  items: T[]
  ajouter: () => T
  modifier: (id: string, p: Partial<T>) => void
  supprimer: (id: string) => void
  dupliquer: (id: string) => void
  remplacer: (nouveaux: T[]) => void
}

export function useCollection<T extends { id: string }>(
  cle: string,
  creer: (id: string) => T,
): Collection<T> {
  const [items, setItems] = useStockage<T[]>(cle, [])

  const ajouter = () => {
    const nouveau = creer(identifiant())
    setItems([...items, nouveau])
    return nouveau
  }

  const modifier = (id: string, p: Partial<T>) =>
    setItems(items.map((x) => (x.id === id ? { ...x, ...p } : x)))

  const supprimer = (id: string) => setItems(items.filter((x) => x.id !== id))

  /**
   * Dupliquer plutôt que ressaisir : douze systèmes d'IA d'une même
   * organisation partagent le plus souvent leur gouvernance et ne diffèrent
   * que par l'usage. Sans duplication, l'inventaire ne se remplit jamais.
   */
  const dupliquer = (id: string) => {
    const source = items.find((x) => x.id === id)
    if (!source) return
    const copie = { ...source, id: identifiant() }
    const i = items.findIndex((x) => x.id === id)
    setItems([...items.slice(0, i + 1), copie, ...items.slice(i + 1)])
  }

  const remplacer = (nouveaux: T[]) => setItems(nouveaux)

  return { items, ajouter, modifier, supprimer, dupliquer, remplacer }
}

/**
 * Part des champs renseignés d'un ensemble de mentions.
 *
 * Le dénominateur est celui des mentions *dues*, calculées au cas par cas :
 * un indicateur qui ne peut pas atteindre 100 % cesse très vite d'être
 * regardé, et une pièce sans transfert hors EEE plafonnerait sinon
 * éternellement à 80 %.
 */
export function part(mentions: { valeur: string }[]): number {
  if (mentions.length === 0) return 1
  return mentions.filter((m) => m.valeur.trim()).length / mentions.length
}

/** Les mentions dues et non renseignées, prêtes à afficher. */
export function manquants<T extends { champ: string; article: string; valeur: string }>(
  mentions: T[],
): { champ: string; article: string }[] {
  return mentions
    .filter((m) => !m.valeur.trim())
    .map(({ champ, article }) => ({ champ, article }))
}
