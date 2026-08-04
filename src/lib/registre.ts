/**
 * Les registres du RGPD.
 *
 * Trois registres, et non un : le règlement en impose autant, et la première
 * version de ce site n'en offrait qu'un.
 *
 * — **Article 30 §1**, tenu par le responsable de traitement. Le plus connu.
 * — **Article 30 §2**, tenu par le sous-traitant. Mentions différentes, plus
 *   courtes, organisées par client et non par finalité — un sous-traitant ne
 *   décide pas des finalités, il ne peut donc pas les inscrire. La plupart des
 *   éditeurs de logiciel doivent celui-ci, et beaucoup l'ignorent.
 * — **Article 33 §5**, le registre interne des violations, qui doit porter
 *   *toutes* les violations, y compris celles qu'on a choisi de ne pas
 *   notifier, avec le motif de ce choix. C'est lui que l'autorité demande pour
 *   vérifier que l'absence de notification était réfléchie et non subie.
 */

import type { Suivi } from './suivi'
import { suiviVide } from './suivi'
import { manquants, part } from './collection'

export type Mention = { champ: string; article: string; valeur: string }

// ---------------------------------------------------------------------------
// Article 30 §1 — registre du responsable de traitement
// ---------------------------------------------------------------------------

export type Transfert = {
  /** Vrai dès qu'un destinataire, y compris un sous-traitant, est hors EEE. */
  horsEee: boolean
  pays: string
  /** Adéquation, clauses contractuelles types, règles d'entreprise contraignantes… */
  garantie: string
}

export type Traitement = {
  id: string
  suivi: Suivi
  nom: string
  /** Art. 30 §1 b. */
  finalites: string
  /** Art. 6 §1 a à f. */
  baseLegale: BaseLegale | ''
  /** Renvoi vers la mise en balance tenue dans les analyses (art. 6 §1 f). */
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
    note: "Art. 6 §1 f. La plus souple, et la seule qui exige une mise en balance écrite. Fermée aux autorités publiques agissant dans l'exercice de leurs missions.",
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
    note: "Objets connectés, biométrie, intelligence artificielle. Presque toujours rempli dès qu'un modèle appris intervient.",
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
    suivi: suiviVide(),
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

/** Les mentions dues pour *ce* traitement, avec l'article qui les impose. */
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
    { champ: 'Mesures de sécurité', article: 'art. 30 §1 g', valeur: t.mesuresSecurite },
    // La traçabilité entre dans le dénominateur : elle n'est pas exigée par
    // l'article 30, mais c'est le premier élément qu'un contrôleur regarde, et
    // l'exclure reviendrait à la traiter comme facultative.
    { champ: 'Responsable de la fiche', article: 'art. 5 §2', valeur: t.suivi.responsable },
    { champ: 'Date de dernière revue', article: 'art. 5 §2', valeur: t.suivi.derniereRevue },
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

export const champsManquants = (t: Traitement) => manquants(mentions(t))
export const completude = (t: Traitement) => part(mentions(t))

// ---------------------------------------------------------------------------
// Article 30 §2 — registre du sous-traitant
// ---------------------------------------------------------------------------

/**
 * Le registre du sous-traitant s'organise **par client**, pas par finalité.
 *
 * C'est la différence de fond avec le §1, et elle n'est pas cosmétique : un
 * sous-traitant ne détermine ni les finalités ni les durées de conservation,
 * il ne peut donc pas les inscrire — il inscrit les catégories de traitements
 * qu'il effectue *pour le compte de* chaque responsable. Recopier le modèle du
 * §1 en changeant le titre produit un registre faux, qui prétend décider de ce
 * qu'on ne décide pas.
 */
export type Sous_traitance = {
  id: string
  suivi: Suivi
  /** Art. 30 §2 a — le client, responsable de traitement. */
  client: string
  contactClient: string
  /** Art. 30 §2 b — les catégories de traitements effectués pour ce client. */
  categoriesTraitements: string
  /** Art. 30 §2 c. */
  transfert: Transfert
  /** Art. 30 §2 d, renvoyant à l'art. 32 §1. */
  mesuresSecurite: string
  /** Sous-traitants ultérieurs — art. 28 §2 et §4. */
  sousTraitantsUlterieurs: string
  /** Le client a-t-il autorisé ces sous-traitants ultérieurs, et comment ? */
  autorisationUlterieurs: string
  /** Référence du contrat portant les huit mentions de l'art. 28 §3. */
  contrat: string
}

export function sousTraitanceVide(id: string): Sous_traitance {
  return {
    id,
    suivi: suiviVide(),
    client: '',
    contactClient: '',
    categoriesTraitements: '',
    transfert: { horsEee: false, pays: '', garantie: '' },
    mesuresSecurite: '',
    sousTraitantsUlterieurs: '',
    autorisationUlterieurs: '',
    contrat: '',
  }
}

export function mentionsSousTraitance(s: Sous_traitance): Mention[] {
  const m: Mention[] = [
    { champ: 'Responsable de traitement (client)', article: 'art. 30 §2 a', valeur: s.client },
    { champ: 'Coordonnées du client', article: 'art. 30 §2 a', valeur: s.contactClient },
    {
      champ: 'Catégories de traitements effectués',
      article: 'art. 30 §2 b',
      valeur: s.categoriesTraitements,
    },
    { champ: 'Mesures de sécurité', article: 'art. 30 §2 d', valeur: s.mesuresSecurite },
    { champ: 'Référence du contrat', article: 'art. 28 §3', valeur: s.contrat },
    { champ: 'Responsable de la fiche', article: 'art. 5 §2', valeur: s.suivi.responsable },
    { champ: 'Date de dernière revue', article: 'art. 5 §2', valeur: s.suivi.derniereRevue },
  ]
  if (s.transfert.horsEee) {
    m.push({ champ: 'Pays de destination', article: 'art. 30 §2 c', valeur: s.transfert.pays })
    m.push({ champ: 'Garantie encadrant le transfert', article: 'art. 46', valeur: s.transfert.garantie })
  }
  if (s.sousTraitantsUlterieurs.trim()) {
    m.push({
      champ: 'Autorisation des sous-traitants ultérieurs',
      article: 'art. 28 §2',
      valeur: s.autorisationUlterieurs,
    })
  }
  return m
}

export const completudeSousTraitance = (s: Sous_traitance) => part(mentionsSousTraitance(s))
export const champsManquantsSousTraitance = (s: Sous_traitance) =>
  manquants(mentionsSousTraitance(s))

// ---------------------------------------------------------------------------
// Article 33 §5 — registre interne des violations
// ---------------------------------------------------------------------------

export type Violation = {
  id: string
  suivi: Suivi
  reference: string
  /** Instant de la prise de connaissance, format `datetime-local`. */
  connaissance: string
  /** Ce qui s'est passé — art. 33 §3 a. */
  nature: string
  /** Confidentialité, intégrité, disponibilité : les trois peuvent être atteintes. */
  atteintes: string[]
  categoriesPersonnes: string
  /** Nombre approximatif : l'article dit « approximatif », l'exactitude n'est pas due. */
  nombrePersonnes: string
  categoriesDonnees: string
  /** Art. 33 §3 c. */
  consequences: string
  /** Art. 33 §3 d. */
  mesures: string
  /** La décision de notifier ou non, et son motif — le cœur du registre. */
  notifieeAutorite: DecisionNotification
  motifNonNotification: string
  /** Art. 34 : information des personnes concernées. */
  notifieePersonnes: DecisionNotification
  motifNonInformation: string
  /** Date d'envoi effective à l'autorité, si notifiée. */
  dateNotification: string
}

export type DecisionNotification = 'oui' | 'non' | 'a-decider'

export const DECISIONS: { id: DecisionNotification; label: string }[] = [
  { id: 'a-decider', label: 'À décider' },
  { id: 'oui', label: 'Notifiée' },
  { id: 'non', label: 'Non notifiée' },
]

export const ATTEINTES = [
  {
    id: 'confidentialite',
    label: 'Confidentialité',
    note: 'Accès ou divulgation non autorisés.',
  },
  {
    id: 'integrite',
    label: 'Intégrité',
    note: 'Altération non autorisée des données.',
  },
  {
    id: 'disponibilite',
    label: 'Disponibilité',
    note: "Perte d'accès ou destruction. La perte de la seule sauvegarde en est une, même sans intrusion — c'est le cas le plus souvent oublié.",
  },
]

export function violationVide(id: string): Violation {
  return {
    id,
    suivi: suiviVide(),
    reference: '',
    connaissance: '',
    nature: '',
    atteintes: [],
    categoriesPersonnes: '',
    nombrePersonnes: '',
    categoriesDonnees: '',
    consequences: '',
    mesures: '',
    notifieeAutorite: 'a-decider',
    motifNonNotification: '',
    notifieePersonnes: 'a-decider',
    motifNonInformation: '',
    dateNotification: '',
  }
}

export function mentionsViolation(v: Violation): Mention[] {
  const m: Mention[] = [
    { champ: 'Référence interne', article: 'usage', valeur: v.reference },
    { champ: 'Prise de connaissance', article: 'art. 33 §1', valeur: v.connaissance },
    { champ: 'Nature de la violation', article: 'art. 33 §3 a', valeur: v.nature },
    {
      champ: 'Catégories de personnes concernées',
      article: 'art. 33 §3 a',
      valeur: v.categoriesPersonnes,
    },
    {
      champ: 'Nombre approximatif de personnes',
      article: 'art. 33 §3 a',
      valeur: v.nombrePersonnes,
    },
    { champ: 'Conséquences probables', article: 'art. 33 §3 c', valeur: v.consequences },
    { champ: 'Mesures prises', article: 'art. 33 §3 d', valeur: v.mesures },
    { champ: 'Responsable du dossier', article: 'art. 5 §2', valeur: v.suivi.responsable },
  ]
  // Le motif n'est dû que si l'on a décidé de ne pas notifier — mais il l'est
  // alors absolument : c'est la pièce qui distingue un choix documenté d'un
  // oubli, et c'est exactement ce que l'autorité vient chercher.
  if (v.notifieeAutorite === 'non') {
    m.push({
      champ: 'Motif de non-notification',
      article: 'art. 33 §1',
      valeur: v.motifNonNotification,
    })
  }
  if (v.notifieeAutorite === 'oui') {
    m.push({
      champ: "Date d'envoi à l'autorité",
      article: 'art. 33 §1',
      valeur: v.dateNotification,
    })
  }
  if (v.notifieePersonnes === 'non') {
    m.push({
      champ: 'Motif de non-information des personnes',
      article: 'art. 34 §3',
      valeur: v.motifNonInformation,
    })
  }
  return m
}

export const completudeViolation = (v: Violation) => part(mentionsViolation(v))
export const champsManquantsViolation = (v: Violation) => manquants(mentionsViolation(v))

/**
 * Le retard sur les 72 heures de l'article 33 §1.
 *
 * Rend `undefined` tant que la décision n'est pas prise ou que la date d'envoi
 * manque : afficher « à l'heure » pour une notification qui n'est pas partie
 * serait le pire des affichages.
 */
export function retardNotification(v: Violation): number | undefined {
  if (v.notifieeAutorite !== 'oui' || !v.connaissance || !v.dateNotification) return undefined
  const t0 = new Date(v.connaissance).getTime()
  const t1 = new Date(v.dateNotification).getTime()
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) return undefined
  return t1 - t0 - 72 * 3_600_000
}

// ---------------------------------------------------------------------------
// Criblage de l'analyse d'impact — article 35
// ---------------------------------------------------------------------------

export type Aipd = {
  requise: boolean
  /** `probable` quand seuls les critères de risque la font pencher. */
  certitude: 'certaine' | 'probable' | 'improbable'
  motif: string
}

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
