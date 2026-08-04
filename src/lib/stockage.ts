import { useEffect, useState } from 'react'

/**
 * Persistance locale des registres.
 *
 * Un choix d'architecture, pas une facilité : **rien de ce qui est saisi ici
 * ne quitte le navigateur**. Un registre de traitement décrit précisément où
 * sont vos données personnelles et comment elles sont protégées ; c'est le
 * document qu'on souhaite le moins voir transiter par un serveur tiers. Le
 * site est un fichier statique, il n'a pas de dorsale, et le formulaire
 * d'export produit un JSON que l'utilisateur range où il veut.
 *
 * La contrepartie est réelle et doit être dite dans l'interface : vider le
 * cache du navigateur efface le travail. D'où le bouton d'export, mis au même
 * niveau visuel que la saisie plutôt que relégué en bas de page.
 */
export function useStockage<T>(cle: string, initial: T) {
  const [valeur, setValeur] = useState<T>(() => {
    try {
      const brut = localStorage.getItem(cle)
      return brut ? (JSON.parse(brut) as T) : initial
    } catch {
      // Navigation privée, quota saturé, JSON corrompu par une version
      // antérieure du format : dans tous les cas on repart de l'état initial
      // plutôt que de laisser une page blanche.
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur))
    } catch {
      // Ignoré volontairement : l'écriture peut échouer, la session en cours
      // doit continuer de fonctionner.
    }
  }, [cle, valeur])

  return [valeur, setValeur] as const
}

/** Télécharge un objet en JSON, sans serveur. */
export function exporterJson(nomFichier: string, donnees: unknown) {
  const blob = new Blob([JSON.stringify(donnees, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomFichier
  a.click()
  URL.revokeObjectURL(url)
}

/** Lit un fichier JSON choisi par l'utilisateur. */
export function importerJson<T>(fichier: File): Promise<T> {
  return fichier.text().then((texte) => JSON.parse(texte) as T)
}

/**
 * Identifiant local d'une ligne de registre. `crypto.randomUUID` n'existe pas
 * sur les contextes non sécurisés — un aperçu servi en http sur le réseau
 * local, typiquement — d'où le repli.
 */
export function identifiant(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `t-${Math.random().toString(36).slice(2, 10)}`
}
