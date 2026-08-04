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
 * textes, puis les trois outils qui produisent les pièces du dossier.
 */
export const PAGES: { chemin: string; libelle: string }[] = [
  { chemin: '/', libelle: 'Périmètre' },
  { chemin: '/calendrier/', libelle: 'Calendrier' },
  { chemin: '/textes/', libelle: 'Les textes' },
  { chemin: '/qualification/', libelle: 'Qualification' },
  { chemin: '/registre/', libelle: 'Registre RGPD' },
  { chemin: '/responsabilites/', libelle: 'Responsabilités' },
]
