/**
 * Constantes du site.
 *
 * Elles vivent dans `lib/` et non dans un fichier de composants : la règle
 * `react/only-export-components` d'oxlint échoue en intégration continue dès
 * qu'un module exportant du JSX exporte aussi autre chose.
 */

export const DEPOT = 'https://github.com/Commutator-IO/legal-simulator'

/**
 * L'ordre des pages est celui du raisonnement, pas celui de l'importance :
 * d'abord ce qui vous concerne, puis quand cela tombe, puis ce que disent les
 * textes — et ensuite seulement les cinq outils qui produisent les pièces du
 * dossier, groupés par domaine parce que c'est ainsi qu'on travaille : on
 * s'occupe du RGPD un jour, du produit un autre.
 */
export const PAGES: { chemin: string; libelle: string }[] = [
  { chemin: '/', libelle: 'Périmètre' },
  { chemin: '/calendrier/', libelle: 'Calendrier' },
  { chemin: '/textes/', libelle: 'Les textes' },
  { chemin: '/rgpd/', libelle: 'Registres RGPD' },
  { chemin: '/analyses/', libelle: 'Analyses' },
  { chemin: '/ia/', libelle: 'IA' },
  { chemin: '/produit/', libelle: 'Produit' },
  { chemin: '/sbom/', libelle: 'SBOM' },
  { chemin: '/responsabilites/', libelle: 'Responsabilités' },
  // La liste de lecture ferme la navigation : elle ne produit aucune pièce,
  // elle dit ce qu'il faut savoir pour produire les autres.
  { chemin: '/lectures/', libelle: 'Lectures' },
]
