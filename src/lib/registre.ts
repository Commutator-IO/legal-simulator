/**
 * Le registre des activités de traitement (RGPD, art. 30) et le criblage
 * d'analyse d'impact (art. 35).
 *
 * Le registre est la première pièce demandée en cas de contrôle, et la seule
 * qui matérialise le principe de responsabilité de l'article 5 §2. On tient
 * ici exactement les mentions du §1, plus quatre colonnes que le règlement
 * n'impose pas — base légale, données sensibles, sous-traitants, besoin
 * d'analyse d'impact — parce qu'un registre qui ne les porte pas oblige à
 * refaire tout le travail dès la première question de l'autorité.
 */

export type Transfert = {
  /** Vrai dès qu'un destinataire, y compris un sous-traitant, est hors EEE. */
  horsEee: boolean
  pays: string
  /** Adéquation, clauses contractuelles types, règles d'entreprise contraignantes… */
  garantie: string
}

export type Traitement = {
  id: string
  nom: string
  /** Art. 30 §1 b. */
  finalites: string
  /** Art. 6 §1 a à f. */
  baseLegale: BaseLegale | ''
  /** Précision exigée lorsque la base est l'intérêt légitime (art. 6 §1 f). */
  interetLegitime: string
  /** Art. 30 §1 c. */
  categoriesPersonnes: string
  categoriesDonnees: string
  /** Art. 9 §1 : santé, biométrie, opinions, orientation sexuelle… */
  donneesSensibles: boolean
  /** La condition du §2 qui lève l'interdiction de principe. */
  conditionArticle9: string
  /** Art. 30 §1 d. */
  destinataires: string
  sousTraitants: string
  /** Art. 30 §1 e. */
  transfert: Transfert
  /** Art. 30 §1 f. */
  conservation: string
  /** Art. 30 §1 g, renvoyant à l'art. 32 §1. */
  mesuresSecurite: string
  /** Criblage art. 35 : identifiants des critères retenus. */
  criteresRisque: string[]
  /** Traitement figurant sur la liste de l'autorité rendant l'AIPD obligatoire. */
  listeAutorite: boolean
}

export type BaseLegale =
  | 'consentement'
  | 'contrat'
  | 'obligation-legale'
  | 'interets-vitaux'
  | 'mission-publique'
  | 'interet-legitime'

export const BASES_LEGALES: { id: BaseLegale; label: string; note: string }[] = [
  {
    id: 'consentement',
    label: 'Consentement',
    note: "Art. 6 §1 a. Libre, spécifique, éclairé, univoque — et retirable aussi facilement qu'il a été donné. Mauvaise base pour la relation employeur-salarié, où la liberté fait défaut.",
  },
  {
    id: 'contrat',
    label: "Exécution d'un contrat",
    note: "Art. 6 §1 b. Ne couvre que ce qui est objectivement nécessaire au contrat, pas ce qui est prévu par ses clauses.",
  },
  {
    id: 'obligation-legale',
    label: 'Obligation légale',
    note: "Art. 6 §1 c. Exige une obligation de droit de l'Union ou national, identifiable — pas un usage professionnel.",
  },
  {
    id: 'interets-vitaux',
    label: 'Intérêts vitaux',
    note: "Art. 6 §1 d. Réservé au danger pour la vie ou l'intégrité physique.",
  },
  {
    id: 'mission-publique',
    label: "Mission d'intérêt public",
    note: 'Art. 6 §1 e. Suppose une base dans le droit de l’Union ou national.',
  },
  {
    id: 'interet-legitime',
    label: 'Intérêt légitime',
    note: "Art. 6 §1 f. La plus souple, et la seule qui exige une mise en balance écrite avec les droits des personnes. Fermée aux autorités publiques agissant dans l'exercice de leurs missions.",
  },
]

/**
 * Les neuf critères du groupe de l'article 29, repris par le CEPD dans ses
 * lignes directrices WP248 et par la CNIL. Deux critères remplis font présumer
 * le risque élevé, donc l'analyse d'impact.
 */
export const CRITERES_RISQUE = [
  {
    id: 'evaluation',
    label: 'Évaluation ou notation',
    note: 'Y compris le profilage et la prédiction de comportement.',
  },
  {
    id: 'decision-automatisee',
    label: 'Décision automatisée à effet juridique ou significatif',
    note: 'Art. 22 : refus de crédit, tri de candidatures, résiliation automatique.',
  },
  {
    id: 'surveillance',
    label: 'Surveillance systématique',
    note: 'Observation ou contrôle de personnes, notamment dans un espace public.',
  },
  {
    id: 'sensibles',
    label: 'Données sensibles ou à caractère hautement personnel',
    note: "Art. 9 et 10, mais aussi données financières, de localisation ou de communication.",
  },
  {
    id: 'grande-echelle',
    label: 'Traitement à grande échelle',
    note: 'Nombre de personnes, volume, durée, étendue géographique.',
  },
  {
    id: 'croisement',
    label: 'Croisement de jeux de données',
    note: "Issus d'opérations distinctes, au-delà de ce que la personne pouvait attendre.",
  },
  {
    id: 'vulnerables',
    label: 'Personnes vulnérables',
    note: 'Mineurs, patients, salariés, demandeurs d’asile — toute relation déséquilibrée.',
  },
  {
    id: 'innovation',
    label: 'Usage innovant ou nouvelle technologie',
    note: "Objets connectés, biométrie, intelligence artificielle. Ce critère est presque toujours rempli dès qu'un modèle appris intervient.",
  },
  {
    id: 'blocage',
    label: 'Blocage d’un droit ou d’un contrat',
    note: 'Le traitement empêche la personne d’exercer un droit ou de bénéficier d’un service.',
  },
]

export function traitementVide(id: string): Traitement {
  return {
    id,
    nom: '',
    finalites: '',
    baseLegale: '',
    interetLegitime: '',
    categoriesPersonnes: '',
    categoriesDonnees: '',
    donneesSensibles: false,
    conditionArticle9: '',
    destinataires: '',
    sousTraitants: '',
    transfert: { horsEee: false, pays: '', garantie: '' },
    conservation: '',
    mesuresSecurite: '',
    criteresRisque: [],
    listeAutorite: false,
  }
}

export type Mention = { champ: string; article: string; valeur: string }

/**
 * Les mentions dues pour *ce* traitement, avec l'article qui les impose.
 *
 * La liste est construite en fonction des réponses plutôt que fixée une fois
 * pour toutes : la garantie de transfert n'est due que s'il y a transfert, et
 * la condition de l'article 9 que s'il y a données sensibles. Un dénominateur
 * qui compterait des mentions sans objet plafonnerait le registre à 80 %
 * quoi qu'on fasse — et un indicateur qui ne peut pas atteindre 100 % cesse
 * très vite d'être regardé.
 */
export function mentions(t: Traitement): Mention[] {
  const m: Mention[] = [
    { champ: 'Nom du traitement', article: 'usage', valeur: t.nom },
    { champ: 'Finalités', article: 'art. 30 §1 b', valeur: t.finalites },
    { champ: 'Base légale', article: 'art. 6 §1', valeur: t.baseLegale },
    {
      champ: 'Catégories de personnes concernées',
      article: 'art. 30 §1 c',
      valeur: t.categoriesPersonnes,
    },
    {
      champ: 'Catégories de données',
      article: 'art. 30 §1 c',
      valeur: t.categoriesDonnees,
    },
    {
      champ: 'Catégories de destinataires',
      article: 'art. 30 §1 d',
      valeur: t.destinataires,
    },
    { champ: "Délais d'effacement", article: 'art. 30 §1 f', valeur: t.conservation },
    {
      champ: 'Mesures de sécurité',
      article: 'art. 30 §1 g',
      valeur: t.mesuresSecurite,
    },
  ]

  if (t.baseLegale === 'interet-legitime') {
    m.push({
      champ: "Mise en balance de l'intérêt légitime",
      article: 'art. 6 §1 f',
      valeur: t.interetLegitime,
    })
  }
  if (t.donneesSensibles) {
    m.push({
      champ: "Condition de levée de l'interdiction",
      article: 'art. 9 §2',
      valeur: t.conditionArticle9,
    })
  }
  if (t.transfert.horsEee) {
    m.push({
      champ: 'Pays de destination',
      article: 'art. 30 §1 e',
      valeur: t.transfert.pays,
    })
    m.push({
      champ: 'Garantie encadrant le transfert',
      article: 'art. 46',
      valeur: t.transfert.garantie,
    })
  }

  return m
}

/** Les mentions dues et non renseignées. */
export function champsManquants(t: Traitement): { champ: string; article: string }[] {
  return mentions(t)
    .filter((m) => !m.valeur.trim())
    .map(({ champ, article }) => ({ champ, article }))
}

/** Part des mentions dues effectivement renseignées, entre 0 et 1. */
export function completude(t: Traitement): number {
  const m = mentions(t)
  return m.length === 0 ? 1 : m.filter((x) => x.valeur.trim()).length / m.length
}

export type Aipd = {
  requise: boolean
  /** `probable` quand seuls les critères de risque la font pencher. */
  certitude: 'certaine' | 'probable' | 'improbable'
  motif: string
}

/**
 * Criblage de l'article 35. Deux voies mènent à l'obligation : les trois cas
 * du §3, qui la rendent certaine, et le faisceau de critères du CEPD, qui la
 * rend probable au-delà de deux.
 */
export function aipd(t: Traitement): Aipd {
  if (t.listeAutorite) {
    return {
      requise: true,
      certitude: 'certaine',
      motif:
        "Le traitement figure sur la liste des types d'opérations pour lesquelles l'autorité de contrôle a rendu l'analyse d'impact obligatoire (art. 35 §4).",
    }
  }

  const automatique = t.criteresRisque.includes('decision-automatisee')
  const surveillance = t.criteresRisque.includes('surveillance')
  const grandeEchelle = t.criteresRisque.includes('grande-echelle')

  if (automatique && t.criteresRisque.includes('evaluation')) {
    return {
      requise: true,
      certitude: 'certaine',
      motif:
        "Article 35 §3 a : évaluation systématique et approfondie d'aspects personnels fondée sur un traitement automatisé, servant de base à des décisions produisant des effets juridiques ou affectant significativement les personnes.",
    }
  }

  if (t.donneesSensibles && grandeEchelle) {
    return {
      requise: true,
      certitude: 'certaine',
      motif:
        "Article 35 §3 b : traitement à grande échelle de catégories particulières de données.",
    }
  }

  if (surveillance && grandeEchelle) {
    return {
      requise: true,
      certitude: 'certaine',
      motif:
        "Article 35 §3 c : surveillance systématique à grande échelle d'une zone accessible au public.",
    }
  }

  if (t.criteresRisque.length >= 2) {
    return {
      requise: true,
      certitude: 'probable',
      motif: `${t.criteresRisque.length} critères de risque sur neuf sont réunis. Le seuil retenu par le CEPD est de deux : l'analyse d'impact doit être menée, ou son absence motivée et consignée.`,
    }
  }

  if (t.criteresRisque.length === 1) {
    return {
      requise: false,
      certitude: 'improbable',
      motif:
        "Un seul critère de risque. L'analyse d'impact n'est probablement pas due, mais consignez le raisonnement : c'est l'absence de trace, plus que l'absence d'analyse, qui est sanctionnée.",
    }
  }

  return {
    requise: false,
    certitude: 'improbable',
    motif: "Aucun critère de risque retenu : l'analyse d'impact n'est pas requise.",
  }
}
