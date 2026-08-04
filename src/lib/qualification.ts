/**
 * Qualification d'un système d'IA (AI Act) et d'un produit numérique (CRA).
 *
 * Tout le raisonnement est ici, en fonctions pures, et nulle part dans les
 * composants : c'est ce qui permet de le tester. Un arbre de décision
 * réglementaire enfoui dans du JSX ne peut être vérifié que par un humain qui
 * relit, et il dérive au premier ajout de case à cocher.
 *
 * Ce que ce module fait : il *oriente*. Ce qu'il ne fait pas : trancher. La
 * frontière entre l'annexe III et l'usage anodin se joue souvent sur une
 * phrase de considérant, et la qualification finale engage une responsabilité
 * qu'aucun formulaire ne porte à la place de celui qui la signe.
 */

// ---------------------------------------------------------------------------
// AI Act
// ---------------------------------------------------------------------------

/** Le rôle décide de la charge : le fournisseur porte l'essentiel (art. 16). */
export type Role = 'fournisseur' | 'deployeur' | 'importateur' | 'distributeur'

export type ReponsesIa = {
  /** Répond-il à la définition de l'art. 3 §1 — inférence et adaptativité ? */
  estSystemeIa: boolean
  role: Role
  /** Mis sur le marché de l'Union, ou sortie utilisée dans l'Union (art. 2). */
  lienUnion: boolean
  /** Identifiants des pratiques de l'art. 5 cochées. */
  pratiquesInterdites: string[]
  /** Composant de sécurité d'un produit couvert par l'annexe I. */
  annexeI: boolean
  /** Identifiants des usages de l'annexe III cochés. */
  usagesAnnexeIII: string[]
  /** L'un des quatre cas de l'art. 6 §3 — tâche procédurale étroite, etc. */
  derogationArticle6: boolean
  /** Profilage de personnes physiques : neutralise la dérogation (art. 6 §3 al. 2). */
  profilage: boolean
  /** Interagit avec des personnes, ou produit du contenu de synthèse. */
  transparenceArticle50: string[]
  /** Fournisseur d'un modèle à usage général (art. 51). */
  modeleUsageGeneral: boolean
  /** Entraînement au-delà de 10²⁵ FLOP : risque systémique présumé (art. 51 §2). */
  seuilRisqueSystemique: boolean
}

export const REPONSES_IA_VIDES: ReponsesIa = {
  estSystemeIa: false,
  role: 'deployeur',
  lienUnion: true,
  pratiquesInterdites: [],
  annexeI: false,
  usagesAnnexeIII: [],
  derogationArticle6: false,
  profilage: false,
  transparenceArticle50: [],
  modeleUsageGeneral: false,
  seuilRisqueSystemique: false,
}

/** Les huit pratiques de l'art. 5, plus celle ajoutée par l'omnibus. */
export const PRATIQUES_INTERDITES = [
  {
    id: 'manipulation',
    label: 'Techniques subliminales ou manipulatrices',
    note: "Altèrent le comportement d'une manière qui cause ou risque de causer un préjudice important (art. 5 §1 a).",
  },
  {
    id: 'vulnerabilite',
    label: 'Exploitation d’une vulnérabilité',
    note: "Âge, handicap, situation sociale ou économique particulière (art. 5 §1 b).",
  },
  {
    id: 'notation-sociale',
    label: 'Notation sociale',
    note: "Évaluation du comportement social conduisant à un traitement défavorable dans un contexte sans rapport avec les données collectées (art. 5 §1 c).",
  },
  {
    id: 'police-predictive',
    label: 'Prédiction du risque d’infraction',
    note: "Fondée sur le seul profilage ou les traits de personnalité (art. 5 §1 d).",
  },
  {
    id: 'moissonnage',
    label: 'Moissonnage non ciblé d’images faciales',
    note: "Depuis internet ou la vidéosurveillance, pour constituer des bases de reconnaissance faciale (art. 5 §1 e).",
  },
  {
    id: 'emotions',
    label: 'Reconnaissance des émotions au travail ou à l’école',
    note: "Sauf usage médical ou de sécurité (art. 5 §1 f). L'interdiction vise le lieu de travail, y compris pendant le recrutement.",
  },
  {
    id: 'categorisation',
    label: 'Catégorisation biométrique sensible',
    note: "Déduire la race, les opinions politiques, l'appartenance syndicale, les convictions, la vie ou l'orientation sexuelle (art. 5 §1 g).",
  },
  {
    id: 'biometrie-temps-reel',
    label: 'Identification biométrique à distance en temps réel',
    note: "Dans les espaces accessibles au public, à des fins répressives, hors les trois exceptions strictement encadrées (art. 5 §1 h).",
  },
  {
    id: 'ncii',
    label: 'Génération d’images intimes non consenties ou de contenus pédocriminels',
    note: "Interdiction ajoutée par le règlement (UE) 2026/1744 ; pleinement opposable au 2 décembre 2026.",
  },
]

/** Les huit domaines de l'annexe III, dans l'ordre du texte. */
export const USAGES_ANNEXE_III = [
  {
    id: 'biometrie',
    label: 'Biométrie',
    note: "Identification à distance a posteriori, catégorisation biométrique, reconnaissance des émotions — hors les cas déjà interdits par l'art. 5.",
  },
  {
    id: 'infrastructures',
    label: 'Infrastructures critiques',
    note: "Composant de sécurité de la gestion du trafic routier, de l'eau, du gaz, du chauffage ou de l'électricité.",
  },
  {
    id: 'education',
    label: 'Éducation et formation',
    note: "Admission, évaluation des acquis, orientation vers un niveau, surveillance des examens.",
  },
  {
    id: 'emploi',
    label: 'Emploi et gestion des travailleurs',
    note: "Tri de candidatures, décisions de promotion ou de rupture, répartition des tâches, suivi de la performance. Le cas le plus fréquent en entreprise, et le plus souvent manqué : un outil de présélection de CV entre ici.",
  },
  {
    id: 'services-essentiels',
    label: 'Services essentiels publics et privés',
    note: "Prestations sociales, évaluation de la solvabilité, tarification en assurance vie et santé, tri des appels d'urgence.",
  },
  {
    id: 'repression',
    label: 'Répression',
    note: "Évaluation du risque de victimisation ou de récidive, fiabilité des preuves, profilage dans le cadre d'enquêtes.",
  },
  {
    id: 'migration',
    label: 'Migration, asile et contrôle aux frontières',
    note: "Détecteurs d'états émotionnels, examen des demandes, évaluation des risques migratoires.",
  },
  {
    id: 'justice',
    label: 'Justice et processus démocratiques',
    note: "Aide à la recherche et à l'interprétation des faits et du droit ; influence sur le résultat d'une élection ou d'un référendum.",
  },
]

/** Les quatre situations de l'art. 50, qui se cumulent avec le haut risque. */
export const CAS_TRANSPARENCE = [
  {
    id: 'interaction',
    label: 'Interaction directe avec des personnes',
    note: "Agent conversationnel, assistant vocal : la personne doit être informée qu'elle s'adresse à une machine, sauf si c'est évident (art. 50 §1).",
  },
  {
    id: 'contenu-synthetique',
    label: 'Génération de contenu de synthèse',
    note: "Texte, image, son, vidéo : le marquage doit être lisible par machine et détectable — un simple bandeau visuel ne suffit pas (art. 50 §2).",
  },
  {
    id: 'emotions-biometrie',
    label: 'Reconnaissance des émotions ou catégorisation biométrique',
    note: "Les personnes exposées doivent en être informées (art. 50 §3).",
  },
  {
    id: 'hypertrucage',
    label: 'Hypertrucage',
    note: "Contenu ressemblant à des personnes ou des événements réels : la nature artificielle doit être déclarée (art. 50 §4).",
  },
]

export type NiveauIa =
  | 'hors-champ'
  | 'interdit'
  | 'haut-risque'
  | 'transparence'
  | 'minimal'

export type Qualification = {
  niveau: NiveauIa
  /** Le résultat en une phrase, tel qu'on l'écrirait dans une note interne. */
  verdict: string
  /** Pourquoi ce niveau, article à l'appui. */
  motifs: string[]
  /** Ce qu'il faut produire, avec l'article qui l'exige. */
  obligations: { article: string; texte: string }[]
  /** Date d'exigibilité au format ISO, si le niveau en a une. */
  echeance?: string
  /** Obligations qui s'ajoutent en tant que fournisseur d'un modèle. */
  modele: { article: string; texte: string }[]
}

/**
 * Qualifie un système. L'ordre des tests suit celui du règlement, qui est
 * aussi celui de la gravité : une pratique interdite ne se rachète par aucune
 * documentation, il est donc inutile — et trompeur — d'afficher ensuite une
 * liste d'obligations de haut risque.
 */
export function qualifierIa(r: ReponsesIa): Qualification {
  const modele = obligationsModele(r)

  if (!r.estSystemeIa && !r.modeleUsageGeneral) {
    return {
      niveau: 'hors-champ',
      verdict:
        "Hors du champ matériel du règlement : un logiciel qui applique des règles écrites à la main n'est pas un système d'IA au sens de l'article 3 §1.",
      motifs: [
        "L'article 3 §1 exige une capacité d'inférence — déduire des sorties à partir des entrées — et un certain degré d'autonomie.",
      ],
      obligations: [],
      modele,
    }
  }

  if (!r.lienUnion) {
    return {
      niveau: 'hors-champ',
      verdict:
        "Hors du champ territorial : ni mise sur le marché de l'Union, ni sortie utilisée dans l'Union.",
      motifs: [
        "L'article 2 rattache le règlement au marché de l'Union. Attention toutefois : la sortie du système suffit — un modèle exploité depuis un pays tiers dont les résultats servent dans l'Union est visé.",
      ],
      obligations: [],
      modele,
    }
  }

  if (r.pratiquesInterdites.length > 0) {
    const noms = r.pratiquesInterdites
      .map((id) => PRATIQUES_INTERDITES.find((p) => p.id === id)?.label ?? id)
      .join(' ; ')
    return {
      niveau: 'interdit',
      verdict:
        "Le système relève d'au moins une pratique interdite. Il ne peut être ni mis sur le marché, ni mis en service, ni utilisé — aucune mesure de conformité ne rend l'usage licite.",
      motifs: [
        `Article 5 : ${noms}.`,
        "Interdiction applicable depuis le 2 février 2025, sous le plafond de sanction le plus élevé du règlement : 35 M€ ou 7 % du chiffre d'affaires mondial (art. 99 §3).",
      ],
      obligations: [
        {
          article: 'art. 5',
          texte:
            "Arrêter l'usage, ou reconcevoir la fonction de manière à sortir de la pratique visée. Faire vérifier la qualification par un conseil : les exceptions de l'article 5 sont étroites, mais elles existent.",
        },
      ],
      echeance: '2025-02-02',
      modele,
    }
  }

  const hautRisque = estHautRisque(r)
  if (hautRisque.oui) {
    return {
      niveau: 'haut-risque',
      verdict:
        r.role === 'fournisseur'
          ? "Système à haut risque, et vous en êtes le fournisseur : la totalité du chapitre III section 2 vous incombe."
          : "Système à haut risque. En tant que déployeur vous portez les obligations de l'article 26, plus légères que celles du fournisseur mais réellement contrôlées.",
      motifs: hautRisque.motifs,
      obligations:
        r.role === 'fournisseur' ? OBLIGATIONS_FOURNISSEUR : OBLIGATIONS_DEPLOYEUR,
      echeance: r.annexeI ? '2028-08-02' : '2027-12-02',
      modele,
    }
  }

  if (r.transparenceArticle50.length > 0) {
    return {
      niveau: 'transparence',
      verdict:
        "Risque limité : le système échappe au haut risque, mais les obligations de transparence de l'article 50 sont exigibles — et elles le sont déjà.",
      motifs: r.transparenceArticle50.map((id) => {
        const c = CAS_TRANSPARENCE.find((x) => x.id === id)
        return `${c?.label ?? id} — ${c?.note ?? ''}`
      }),
      obligations: [
        {
          article: 'art. 50',
          texte:
            "Informer la personne qu'elle interagit avec un système d'IA, marquer les sorties synthétiques dans un format lisible par machine, et déclarer les hypertrucages. L'information doit être donnée au plus tard lors de la première interaction.",
        },
        {
          article: 'art. 4',
          texte:
            "Assurer la maîtrise de l'IA des personnes qui exploitent le système : formation tracée, à conserver.",
        },
      ],
      echeance: '2026-08-02',
      modele,
    }
  }

  return {
    niveau: 'minimal',
    verdict:
      "Risque minimal : aucune obligation spécifique du règlement, hors la maîtrise de l'IA de l'article 4. La majorité des systèmes déployés en entreprise se trouvent ici.",
    motifs: [
      "Ni pratique interdite, ni usage de l'annexe III, ni composant de sécurité d'un produit réglementé, ni situation de transparence de l'article 50.",
      "Le règlement encourage l'adhésion volontaire à un code de conduite (art. 95), ce qui n'ajoute aucune obligation mais donne un cadre de revue.",
    ],
    obligations: [
      {
        article: 'art. 4',
        texte:
          "Maîtrise de l'IA : garantir que les personnes qui utilisent le système ont le niveau de connaissance nécessaire. Applicable depuis le 2 février 2025, quel que soit le niveau de risque.",
      },
    ],
    modele,
  }
}

function estHautRisque(r: ReponsesIa): { oui: boolean; motifs: string[] } {
  if (r.annexeI) {
    return {
      oui: true,
      motifs: [
        "Article 6 §1 : le système est un composant de sécurité — ou constitue lui-même — un produit couvert par la législation d'harmonisation de l'annexe I, et ce produit est soumis à une évaluation de la conformité par un tiers.",
        "L'échéance a été reportée au 2 août 2028 par le règlement (UE) 2026/1744, pour laisser aux normes harmonisées sectorielles le temps de paraître.",
      ],
    }
  }

  if (r.usagesAnnexeIII.length === 0) return { oui: false, motifs: [] }

  const noms = r.usagesAnnexeIII
    .map((id) => USAGES_ANNEXE_III.find((u) => u.id === id)?.label ?? id)
    .join(' ; ')

  // L'ordre compte : le profilage ferme la dérogation avant qu'on l'examine.
  // Écrit dans l'autre sens, un système de tri de CV qui note les candidats
  // ressortirait « tâche procédurale étroite », ce qui est exactement l'erreur
  // que l'alinéa 2 de l'article 6 §3 vise à empêcher.
  if (r.profilage) {
    return {
      oui: true,
      motifs: [
        `Annexe III : ${noms}.`,
        "Article 6 §3 alinéa 2 : le système effectuant un profilage de personnes physiques, la dérogation est fermée — elle ne peut pas être invoquée, même si l'une des quatre conditions est par ailleurs remplie.",
      ],
    }
  }

  if (r.derogationArticle6) {
    return {
      oui: false,
      motifs: [
        `Annexe III : ${noms}, mais la dérogation de l'article 6 §3 est invoquée.`,
      ],
    }
  }

  return {
    oui: true,
    motifs: [
      `Annexe III : ${noms}.`,
      "Aucune des quatre conditions de l'article 6 §3 n'est invoquée — le système est donc à haut risque de plein droit.",
    ],
  }
}

const OBLIGATIONS_FOURNISSEUR: { article: string; texte: string }[] = [
  {
    article: 'art. 9',
    texte:
      "Système de gestion des risques : un processus itératif tenu sur tout le cycle de vie, pas un document produit une fois pour le dossier.",
  },
  {
    article: 'art. 10',
    texte:
      "Gouvernance des données : jeux d'entraînement, de validation et de test pertinents, représentatifs, et examinés au regard des biais possibles.",
  },
  {
    article: 'art. 11 et annexe IV',
    texte:
      "Documentation technique, établie avant la mise sur le marché et tenue à jour.",
  },
  {
    article: 'art. 12',
    texte:
      "Journalisation automatique des événements sur toute la durée de vie, conservée au moins six mois.",
  },
  {
    article: 'art. 13',
    texte:
      "Notice d'utilisation permettant au déployeur d'interpréter les sorties — y compris les limites connues et les performances attendues.",
  },
  {
    article: 'art. 14',
    texte:
      "Contrôle humain effectif : l'interface doit rendre la supervision possible, pas seulement nominale.",
  },
  {
    article: 'art. 15',
    texte:
      "Exactitude, robustesse et cybersécurité, avec déclaration des niveaux de performance atteints.",
  },
  {
    article: 'art. 17',
    texte:
      "Système de management de la qualité documenté. C'est la charge la plus lourde pour une petite structure.",
  },
  {
    article: 'art. 43 et 47',
    texte:
      "Évaluation de la conformité, puis déclaration UE de conformité et marquage CE.",
  },
  {
    article: 'art. 49',
    texte:
      "Enregistrement du système dans la base de données de l'Union avant la mise sur le marché.",
  },
  {
    article: 'art. 72 et 73',
    texte:
      "Surveillance après commercialisation, et signalement des incidents graves à l'autorité de surveillance du marché dans les 15 jours.",
  },
]

const OBLIGATIONS_DEPLOYEUR: { article: string; texte: string }[] = [
  {
    article: 'art. 26 §1',
    texte:
      "Utiliser le système conformément à la notice. S'en écarter fait basculer le déployeur dans le rôle de fournisseur (art. 25).",
  },
  {
    article: 'art. 26 §2',
    texte:
      "Confier le contrôle humain à des personnes qui en ont la compétence, la formation et l'autorité — donc aussi celle de passer outre la sortie du système.",
  },
  {
    article: 'art. 26 §5',
    texte:
      "Surveiller le fonctionnement, et suspendre l'usage en informant le fournisseur en cas de risque identifié.",
  },
  {
    article: 'art. 26 §6',
    texte: 'Conserver les journaux générés, au moins six mois.',
  },
  {
    article: 'art. 26 §7',
    texte:
      "Informer les représentants du personnel et les travailleurs concernés avant la mise en service sur le lieu de travail. Obligation autonome, indépendante du droit du travail national.",
  },
  {
    article: 'art. 26 §11',
    texte:
      "Informer les personnes soumises à une décision prise ou assistée par le système, et leur expliquer le rôle de l'IA dans cette décision.",
  },
  {
    article: 'art. 27',
    texte:
      "Analyse d'impact sur les droits fondamentaux, si vous êtes un organisme public ou un fournisseur de services privés essentiels. Elle ne remplace pas l'analyse d'impact du RGPD, qui reste due de son côté.",
  },
]

function obligationsModele(r: ReponsesIa): { article: string; texte: string }[] {
  if (!r.modeleUsageGeneral) return []
  const base = [
    {
      article: 'art. 53 §1 a-b',
      texte:
        "Documentation technique du modèle, et information des fournisseurs en aval qui l'intègrent dans leurs systèmes.",
    },
    {
      article: 'art. 53 §1 c',
      texte:
        "Politique de respect du droit d'auteur, couvrant notamment la réservation des droits opposée à la fouille de textes et de données.",
    },
    {
      article: 'art. 53 §1 d',
      texte:
        "Résumé suffisamment détaillé des contenus utilisés pour l'entraînement, publié selon le modèle du Bureau de l'IA.",
    },
  ]
  if (!r.seuilRisqueSystemique) return base
  return [
    ...base,
    {
      article: 'art. 55 §1 a',
      texte:
        "Évaluation du modèle selon des protocoles normalisés, incluant des tests contradictoires documentés.",
    },
    {
      article: 'art. 55 §1 b-c',
      texte:
        "Évaluation et atténuation des risques systémiques à l'échelle de l'Union, et suivi des incidents graves avec signalement au Bureau de l'IA.",
    },
    {
      article: 'art. 55 §1 d',
      texte: 'Niveau adéquat de cybersécurité du modèle et de son infrastructure.',
    },
    {
      article: 'art. 52',
      texte:
        "Notification à la Commission dans les deux semaines suivant le franchissement du seuil de 10²⁵ FLOP.",
    },
  ]
}

// ---------------------------------------------------------------------------
// Cyber Resilience Act
// ---------------------------------------------------------------------------

export type ReponsesCra = {
  /** Produit matériel ou logiciel pouvant être connecté (art. 3 §1). */
  produitNumerique: boolean
  /** Mis à disposition sur le marché de l'Union dans le cadre d'une activité commerciale. */
  marcheUnion: boolean
  /** Identifiant de l'exclusion invoquée (art. 2 §2 à §4), ou chaîne vide. */
  exclusion: string
  /** Catégorie retenue à l'annexe III ou IV. */
  categorie: CategorieCra
  /** Le fabricant sait-il déjà quelle période de support il annoncera ? */
  periodeSupportAnnee: number
}

export type CategorieCra = 'defaut' | 'important-i' | 'important-ii' | 'critique'

export const REPONSES_CRA_VIDES: ReponsesCra = {
  produitNumerique: false,
  marcheUnion: true,
  exclusion: '',
  categorie: 'defaut',
  periodeSupportAnnee: 5,
}

export const EXCLUSIONS_CRA = [
  {
    id: 'medical',
    label: 'Dispositif médical',
    note: 'Couvert par les règlements (UE) 2017/745 ou 2017/746 (art. 2 §2 a).',
  },
  {
    id: 'vehicule',
    label: 'Véhicule à moteur',
    note: 'Couvert par le règlement (UE) 2019/2144 (art. 2 §2 b).',
  },
  {
    id: 'aviation',
    label: 'Aéronautique civile',
    note: 'Couvert par le règlement (UE) 2018/1139 (art. 2 §2 c).',
  },
  {
    id: 'marine',
    label: 'Équipement marin',
    note: 'Couvert par la directive 2014/90/UE (art. 2 §2 d).',
  },
  {
    id: 'defense',
    label: 'Sécurité nationale, défense, information classifiée',
    note: 'Exclusion des §3 et §4 de l’article 2.',
  },
  {
    id: 'libre-non-commercial',
    label: 'Logiciel libre hors activité commerciale',
    note: "Le logiciel libre développé ou fourni en dehors d'une activité commerciale est hors champ (art. 2 §5 et considérants 18 à 19). Attention : le monétiser, l'intégrer à une offre payante ou le distribuer comme composant d'un produit vendu fait retomber dans le champ.",
  },
  {
    id: 'saas',
    label: 'Service en ligne pur',
    note: "Un SaaS n'est pas un produit comportant des éléments numériques, sauf pour ses solutions de traitement de données à distance intégrées au produit (art. 3 §2). Regarder plutôt NIS 2.",
  },
]

export const CATEGORIES_CRA: {
  id: CategorieCra
  label: string
  exemples: string
  evaluation: string
}[] = [
  {
    id: 'defaut',
    label: 'Produit par défaut',
    exemples:
      "Tout ce qui ne figure ni à l'annexe III ni à l'annexe IV : logiciels métier, applications mobiles, jeux, objets connectés courants. C'est environ 90 % des produits visés.",
    evaluation:
      "Contrôle interne de la production (module A de l'annexe VIII) : le fabricant s'auto-évalue, sans organisme notifié.",
  },
  {
    id: 'important-i',
    label: 'Produit important de classe I',
    exemples:
      "Gestion d'identité, navigateurs, gestionnaires de mots de passe, antivirus, VPN, gestion de réseau, SIEM, gestionnaires d'amorçage, infrastructures à clés publiques, systèmes d'exploitation, routeurs et commutateurs, microprocesseurs à fonctions de sécurité, assistants domestiques, jouets connectés, objets portables de santé.",
    evaluation:
      "Auto-évaluation possible *à condition* d'appliquer intégralement une norme harmonisée pertinente. À défaut, examen UE de type ou système qualité complet, avec organisme notifié.",
  },
  {
    id: 'important-ii',
    label: 'Produit important de classe II',
    exemples:
      "Hyperviseurs, environnements d'exécution de conteneurs, pare-feu, systèmes de détection et de prévention d'intrusion, microprocesseurs et microcontrôleurs résistants à l'altération.",
    evaluation:
      "Organisme notifié obligatoire : examen UE de type (module B + C) ou assurance qualité complète (module H). L'auto-évaluation n'est pas ouverte.",
  },
  {
    id: 'critique',
    label: 'Produit critique',
    exemples:
      "Dispositifs matériels à boîtiers sécurisés, passerelles de compteurs intelligents, cartes à puce et éléments sécurisés.",
    evaluation:
      "Organisme notifié, et la Commission peut imposer un schéma européen de certification de cybersécurité au titre du règlement (UE) 2019/881.",
  },
]

export type ResultatCra = {
  dansLeChamp: boolean
  categorie: CategorieCra
  verdict: string
  motifs: string[]
  obligations: { article: string; texte: string }[]
  /** Les deux dates qui comptent : le signalement d'abord, le reste ensuite. */
  echeances: { date: string; quoi: string }[]
  /** Alerte si la période de support annoncée est sous le plancher légal. */
  alerteSupport?: string
}

export function qualifierCra(r: ReponsesCra): ResultatCra {
  if (!r.produitNumerique || !r.marcheUnion) {
    return {
      dansLeChamp: false,
      categorie: r.categorie,
      verdict:
        "Hors du champ : le règlement vise les produits comportant des éléments numériques mis à disposition sur le marché de l'Union dans le cadre d'une activité commerciale.",
      motifs: ['Article 2 §1 et article 3 §1.'],
      obligations: [],
      echeances: [],
    }
  }

  if (r.exclusion) {
    const e = EXCLUSIONS_CRA.find((x) => x.id === r.exclusion)
    return {
      dansLeChamp: false,
      categorie: r.categorie,
      verdict: `Exclu du champ : ${e?.label ?? r.exclusion}.`,
      motifs: [
        e?.note ?? '',
        "Une exclusion du CRA ne signifie pas absence d'obligation de sécurité : le régime sectoriel qui s'y substitue est en général plus exigeant, pas moins.",
      ].filter(Boolean),
      obligations: [],
      echeances: [],
    }
  }

  const cat = CATEGORIES_CRA.find((c) => c.id === r.categorie)!

  const alerteSupport =
    r.periodeSupportAnnee < 5
      ? `Période de support annoncée de ${r.periodeSupportAnnee} an${r.periodeSupportAnnee > 1 ? 's' : ''} : l'article 13 §8 fixe un plancher de cinq ans, sauf si la durée de vie attendue du produit est plus courte — et c'est au fabricant de le démontrer.`
      : undefined

  return {
    dansLeChamp: true,
    categorie: r.categorie,
    verdict: `${cat.label}. ${cat.evaluation}`,
    motifs: [cat.exemples],
    obligations: [
      {
        article: 'art. 13 §2',
        texte:
          "Évaluation des risques de cybersécurité, documentée et jointe à la documentation technique.",
      },
      {
        article: 'art. 13 §5',
        texte:
          "Diligence sur les composants tiers intégrés, y compris libres : leur sécurité devient la vôtre au moment où vous les distribuez.",
      },
      {
        article: 'art. 13 §8',
        texte:
          "Annoncer la période de support et la faire figurer de manière claire à l'achat.",
      },
      {
        article: 'art. 13 §17-18',
        texte:
          "Diffuser les correctifs de sécurité sans délai et gratuitement, séparément des mises à jour fonctionnelles — un correctif ne doit pas être l'otage d'une montée de version payante.",
      },
      {
        article: 'annexe I, partie I',
        texte:
          "Exigences essentielles : livraison sans vulnérabilité exploitable connue, configuration sécurisée par défaut, contrôle d'accès, chiffrement au repos et en transit, surface d'attaque minimale.",
      },
      {
        article: 'annexe I, partie II',
        texte:
          "Traitement des vulnérabilités : nomenclature logicielle (SBOM) des composants de premier niveau, politique de divulgation coordonnée, adresse de contact publiée.",
      },
      {
        article: 'art. 14',
        texte:
          "Chaîne de signalement opérationnelle vers le CSIRT désigné et l'ENISA : 24 heures pour l'alerte précoce, 72 heures pour la notification.",
      },
      {
        article: 'art. 28 et 31',
        texte: 'Déclaration UE de conformité et marquage CE.',
      },
    ],
    echeances: [
      {
        date: '2026-09-11',
        quoi: "Signalement des vulnérabilités activement exploitées et des incidents graves (art. 14) — pour les produits déjà sur le marché.",
      },
      {
        date: '2027-12-11',
        quoi: 'Exigences essentielles, marquage CE et documentation technique.',
      },
    ],
    alerteSupport,
  }
}
