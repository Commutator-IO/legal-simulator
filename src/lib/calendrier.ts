/**
 * Le calendrier d'application.
 *
 * Une échéance est une date à laquelle une obligation *devient opposable*, pas
 * la date d'adoption ni celle d'entrée en vigueur. La distinction n'est pas
 * scolaire : l'AI Act est en vigueur depuis le 1ᵉʳ août 2024, mais ses
 * obligations sur les systèmes à haut risque de l'annexe III ne mordront qu'au
 * 2 décembre 2027. Confondre les deux fait soit paniquer trop tôt, soit
 * — bien plus souvent — découvrir trop tard qu'une échéance intermédiaire est
 * passée.
 *
 * Les dates sont des chaînes ISO `AAAA-MM-JJ` et se comparent en UTC. Pas de
 * fuseau : une échéance réglementaire est un jour civil, pas un instant.
 */

import type { Domaine } from './textes'

export type Echeance = {
  /** `AAAA-MM-JJ`. */
  date: string
  /** Identifiant du texte dans `TEXTES`. */
  texte: string
  domaine: Domaine
  titre: string
  /** Ce qui devient exigible ce jour-là, et pourquoi cela compte. */
  detail: string
  /** Qui doit avoir agi avant. */
  qui: string
  /** Vrai pour les échéances déjà écoulées qu'on garde pour la mémoire du dossier. */
  historique?: boolean
}

export const ECHEANCES: Echeance[] = [
  {
    date: '2018-05-25',
    texte: 'rgpd',
    domaine: 'donnees',
    titre: 'RGPD applicable',
    detail:
      "Fin des deux ans de transition. Le registre de l'article 30 et la procédure de violation de l'article 33 sont exigibles depuis ce jour.",
    qui: 'Tout responsable de traitement et tout sous-traitant.',
    historique: true,
  },
  {
    date: '2023-09-24',
    texte: 'dga',
    domaine: 'donnees',
    titre: 'Gouvernance des données applicable',
    detail:
      "Le régime déclaratif des services d'intermédiation de données ouvre.",
    qui: "Intermédiaires de données, organisations altruistes, secteur public.",
    historique: true,
  },
  {
    date: '2024-02-17',
    texte: 'dsa',
    domaine: 'marche',
    titre: 'Services numériques pleinement applicable',
    detail:
      "Extension à tous les intermédiaires, après les très grandes plateformes désignées dès août 2023.",
    qui: 'Hébergeurs et plateformes en ligne.',
    historique: true,
  },
  {
    date: '2024-10-17',
    texte: 'nis2',
    domaine: 'cybersecurite',
    titre: 'NIS 2 — échéance de transposition',
    detail:
      "Date limite pour les États membres. Plusieurs, dont la France, ont transposé après : c'est le droit national de transposition qu'il faut lire, pas la directive seule.",
    qui: 'Les États membres, puis les entités essentielles et importantes.',
    historique: true,
  },
  {
    date: '2025-01-17',
    texte: 'dora',
    domaine: 'cybersecurite',
    titre: 'DORA applicable',
    detail:
      "Registre d'information des prestataires informatiques tiers et régime de notification des incidents majeurs exigibles.",
    qui: 'Entités financières et leurs prestataires informatiques.',
    historique: true,
  },
  {
    date: '2025-02-02',
    texte: 'ai-act',
    domaine: 'ia',
    titre: 'IA — pratiques interdites et maîtrise de l’IA',
    detail:
      "Les huit pratiques de l'article 5 deviennent interdites, et l'obligation de maîtrise de l'IA de l'article 4 s'applique à tous, fournisseurs comme déployeurs.",
    qui: "Toute organisation utilisant un système d'IA, y compris acheté sur étagère.",
    historique: true,
  },
  {
    date: '2025-06-28',
    texte: 'eaa',
    domaine: 'produit',
    titre: 'Accessibilité applicable',
    detail:
      "Les nouveaux produits et services doivent être accessibles. Les contrats de service en cours bénéficient d'une transition jusqu'au 28 juin 2030.",
    qui: 'Commerce électronique, banque de détail, livres numériques, transport.',
    historique: true,
  },
  {
    date: '2025-08-02',
    texte: 'ai-act',
    domaine: 'ia',
    titre: 'IA — modèles à usage général, gouvernance, sanctions',
    detail:
      "Les obligations des articles 51 à 56 s'appliquent aux modèles mis sur le marché à compter de cette date, et le régime de sanctions de l'article 99 devient effectif.",
    qui: "Fournisseurs de modèles d'IA à usage général ; États membres pour la désignation des autorités.",
    historique: true,
  },
  {
    date: '2025-09-12',
    texte: 'data-act',
    domaine: 'donnees',
    titre: 'Data Act applicable',
    detail:
      "Droit d'accès de l'utilisateur aux données de son objet connecté, et obligations de changement de fournisseur pour les services d'informatique en nuage.",
    qui: "Fabricants d'objets connectés et fournisseurs de services de traitement de données.",
    historique: true,
  },
  {
    date: '2026-06-11',
    texte: 'cra',
    domaine: 'cybersecurite',
    titre: 'Cyberrésilience — organismes notifiés',
    detail:
      "Le chapitre IV s'applique : les États membres peuvent notifier les organismes d'évaluation de la conformité. Sans effet direct sur les fabricants, mais c'est la condition pour que les évaluations de classe II et critiques soient possibles à temps.",
    qui: "États membres et organismes d'évaluation de la conformité.",
    historique: true,
  },
  {
    date: '2026-08-02',
    texte: 'ai-act',
    domaine: 'ia',
    titre: 'IA — transparence et application générale',
    detail:
      "L'article 50 s'applique : signaler l'interaction avec une machine, marquer les contenus synthétiques dans un format lisible par machine, déclarer les hypertrucages. C'est l'obligation qui touche le plus grand nombre d'organisations, bien au-delà du haut risque.",
    qui: "Fournisseurs et déployeurs de tout système d'IA interagissant avec des personnes ou générant du contenu.",
    historique: true,
  },
  {
    date: '2026-09-11',
    texte: 'cra',
    domaine: 'cybersecurite',
    titre: 'Cyberrésilience — signalement obligatoire',
    detail:
      "L'article 14 devient exigible quinze mois avant le reste du règlement : toute vulnérabilité activement exploitée et tout incident grave doivent être signalés au CSIRT et à l'ENISA en 24 heures, puis 72 heures. Il faut donc que la chaîne d'astreinte, les points de contact et la plateforme de dépôt soient en place — pour des produits qui, eux, n'ont pas encore à être conformes.",
    qui: "Tout fabricant d'un produit comportant des éléments numériques déjà sur le marché de l'Union.",
  },
  {
    date: '2026-09-12',
    texte: 'data-act',
    domaine: 'donnees',
    titre: 'Data Act — accessibilité par conception',
    detail:
      "L'article 3 §1 ne vise que les produits mis sur le marché *après* cette date : ils doivent être conçus pour que les données qu'ils génèrent soient accessibles à l'utilisateur par défaut. Une contrainte d'architecture, à trancher avant le gel de conception.",
    qui: "Fabricants d'objets connectés et fournisseurs de services associés.",
  },
  {
    date: '2026-12-02',
    texte: 'ai-act',
    domaine: 'ia',
    titre: 'IA — fin du délai de grâce sur le marquage',
    detail:
      "Les systèmes génératifs déjà sur le marché au 2 août 2026 devaient marquer leurs sorties : le délai supplémentaire accordé par l'omnibus expire. La nouvelle interdiction visant les images intimes non consenties et le matériel pédopornographique devient également pleinement opposable.",
    qui: "Fournisseurs de systèmes d'IA générative mis sur le marché avant le 2 août 2026.",
  },
  {
    date: '2026-12-09',
    texte: 'pld',
    domaine: 'produit',
    titre: 'Responsabilité produits — transposition',
    detail:
      "Date limite de transposition. Le nouveau régime s'appliquera aux produits mis sur le marché après cette date : le logiciel devient un produit, et une vulnérabilité non corrigée peut valoir défaut.",
    qui: "États membres, puis tout éditeur de logiciel et fabricant de produit connecté.",
  },
  {
    date: '2027-01-12',
    texte: 'data-act',
    domaine: 'donnees',
    titre: 'Data Act — fin des frais de transfert',
    detail:
      "L'article 29 supprime tout frais de changement de fournisseur. La période transitoire, pendant laquelle des frais réduits au coût réel étaient tolérés, s'achève.",
    qui: 'Fournisseurs de services de traitement de données.',
  },
  {
    date: '2027-01-20',
    texte: 'machines',
    domaine: 'produit',
    titre: 'Règlement machines applicable',
    detail:
      "Remplace la directive 2006/42/CE. Les logiciels assurant des fonctions de sécurité y sont explicitement visés, ce qui déclenche par ricochet la qualification haut risque de l'annexe I de l'AI Act.",
    qui: 'Fabricants de machines et de produits connexes.',
  },
  {
    date: '2027-08-02',
    texte: 'ai-act',
    domaine: 'ia',
    titre: 'IA — bacs à sable et modèles antérieurs',
    detail:
      "Chaque État membre doit disposer d'au moins un bac à sable réglementaire opérationnel — l'omnibus a reporté cette échéance d'un an. Les modèles à usage général mis sur le marché avant le 2 août 2025 doivent à cette date être mis en conformité.",
    qui: "États membres ; fournisseurs de modèles antérieurs à août 2025.",
  },
  {
    date: '2027-12-02',
    texte: 'ai-act',
    domaine: 'ia',
    titre: 'IA — systèmes à haut risque de l’annexe III',
    detail:
      "L'échéance déplacée par l'omnibus : elle était fixée au 2 août 2026, elle tombe seize mois plus tard. Système de gestion des risques, gouvernance des données, documentation technique, journalisation, contrôle humain, déclaration UE de conformité et enregistrement dans la base de données de l'Union. C'est le bloc le plus lourd du règlement.",
    qui: "Fournisseurs et déployeurs de systèmes relevant des usages de l'annexe III.",
  },
  {
    date: '2027-12-11',
    texte: 'cra',
    domaine: 'cybersecurite',
    titre: 'Cyberrésilience pleinement applicable',
    detail:
      "Plus aucun produit comportant des éléments numériques ne peut être mis sur le marché de l'Union sans satisfaire les exigences essentielles de l'annexe I, porter le marquage CE et annoncer sa période de support.",
    qui: 'Fabricants, importateurs et distributeurs.',
  },
  {
    date: '2028-08-02',
    texte: 'ai-act',
    domaine: 'ia',
    titre: 'IA — haut risque de l’annexe I',
    detail:
      "Systèmes d'IA constituant un composant de sécurité d'un produit couvert par la législation sectorielle d'harmonisation — dispositifs médicaux, machines, ascenseurs, équipements radio. Reporté d'un an par l'omnibus, pour laisser aux normes harmonisées le temps d'exister.",
    qui: 'Fabricants de produits réglementés intégrant de l’IA.',
  },
  {
    date: '2030-06-28',
    texte: 'eaa',
    domaine: 'produit',
    titre: 'Accessibilité — fin de la transition des services',
    detail:
      "Les contrats de service conclus avant le 28 juin 2025 cessent de bénéficier de la période transitoire.",
    qui: 'Fournisseurs de services visés par la directive.',
  },
  {
    date: '2030-08-02',
    texte: 'ai-act',
    domaine: 'ia',
    titre: 'IA — systèmes hérités du secteur public',
    detail:
      "Les systèmes à haut risque déjà utilisés par des autorités publiques avant l'échéance générale doivent à cette date être mis en conformité. La tolérance la plus longue du règlement.",
    qui: 'Autorités publiques déployant des systèmes antérieurs.',
  },
]

// ---------------------------------------------------------------------------
// Manipulation des dates
// ---------------------------------------------------------------------------

/**
 * Instant UTC de minuit pour une date ISO. Passer par `Date.UTC` plutôt que par
 * `new Date('2026-09-11')` évite qu'un poste réglé sur un fuseau à l'ouest de
 * Greenwich décale toutes les échéances d'un jour.
 */
export function instant(iso: string): number {
  const [a, m, j] = iso.split('-').map(Number)
  return Date.UTC(a, m - 1, j)
}

/** Jours calendaires de `depuis` à `date`. Négatif si l'échéance est passée. */
export function joursRestants(date: string, depuis: string): number {
  return Math.round((instant(date) - instant(depuis)) / 86_400_000)
}

export type Statut = 'passee' | 'imminente' | 'proche' | 'lointaine'

/**
 * Trois seuils, choisis sur ce qu'ils déclenchent et non sur des ronds de
 * chiffres : 90 jours, c'est le dernier moment pour ouvrir un chantier
 * transverse ; 365 jours, l'horizon d'un budget annuel. Au-delà, une échéance
 * relève de la veille, pas du plan de charge.
 */
export function statut(date: string, aujourdhui: string): Statut {
  const j = joursRestants(date, aujourdhui)
  if (j < 0) return 'passee'
  if (j <= 90) return 'imminente'
  if (j <= 365) return 'proche'
  return 'lointaine'
}

/** Les échéances à venir, de la plus proche à la plus lointaine. */
export function aVenir(aujourdhui: string, limite?: number): Echeance[] {
  const futures = ECHEANCES.filter((e) => joursRestants(e.date, aujourdhui) >= 0).sort(
    (a, b) => instant(a.date) - instant(b.date),
  )
  return limite === undefined ? futures : futures.slice(0, limite)
}

/** Les échéances écoulées, de la plus récente à la plus ancienne. */
export function passees(aujourdhui: string): Echeance[] {
  return ECHEANCES.filter((e) => joursRestants(e.date, aujourdhui) < 0).sort(
    (a, b) => instant(b.date) - instant(a.date),
  )
}

/** `2026-08-04` pour le jour courant, en heure locale du lecteur. */
export function aujourdhui(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
