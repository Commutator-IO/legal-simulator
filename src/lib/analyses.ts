/**
 * Les analyses : AIPD, mise en balance, analyse de transfert, AIDF.
 *
 * Le criblage de l'article 35 concluait « analyse obligatoire »… et s'arrêtait
 * là. C'est l'impasse la plus gênante de la première version du site : dire à
 * quelqu'un qu'il doit produire un document sans lui en donner la forme, c'est
 * ne l'avoir aidé qu'à s'inquiéter.
 *
 * Les quatre analyses réunies ici partagent une propriété : elles ne se
 * concluent pas par une note globale mais par une **décision** — mener ou non
 * le traitement, transférer ou suspendre, déployer ou reconcevoir. Chacune rend
 * donc un verdict, et le raisonnement qui y conduit.
 */

import type { Suivi } from './suivi'
import { suiviVide } from './suivi'
import { manquants, part } from './collection'
import type { Mention } from './registre'

// ---------------------------------------------------------------------------
// AIPD — article 35 §7
// ---------------------------------------------------------------------------

/**
 * Les trois événements redoutés de la méthode du CEPD reprise par la CNIL.
 *
 * Découper le risque en trois plutôt que de l'apprécier globalement n'est pas
 * une commodité de formulaire : un traitement peut être irréprochable en
 * confidentialité et catastrophique en disponibilité, et une note unique
 * masquerait exactement le risque qu'il fallait voir.
 */
export const EVENEMENTS = [
  {
    id: 'acces',
    label: 'Accès illégitime aux données',
    note: "Atteinte à la confidentialité : divulgation, exfiltration, consultation par une personne non habilitée.",
  },
  {
    id: 'modification',
    label: 'Modification non désirée des données',
    note: "Atteinte à l'intégrité : altération qui fausse une décision prise sur la base des données.",
  },
  {
    id: 'disparition',
    label: 'Disparition des données',
    note: "Atteinte à la disponibilité : perte, destruction, chiffrement par un rançongiciel.",
  },
]

/** Échelle à quatre niveaux, celle de la méthode CNIL. */
export type Niveau = 0 | 1 | 2 | 3 | 4

export const NIVEAUX: { valeur: Niveau; label: string }[] = [
  { valeur: 0, label: '— non apprécié —' },
  { valeur: 1, label: '1 · négligeable' },
  { valeur: 2, label: '2 · limité' },
  { valeur: 3, label: '3 · important' },
  { valeur: 4, label: '4 · maximal' },
]

export type Risque = {
  /** Ampleur du préjudice pour la personne, pas pour l'organisation. */
  gravite: Niveau
  /** Probabilité que les sources de risque exploitent les vulnérabilités. */
  vraisemblance: Niveau
  /** Sources de risque et vulnérabilités identifiées. */
  sources: string
  /** Mesures existantes ou prévues — art. 35 §7 d. */
  mesures: string
  /** Gravité et vraisemblance une fois les mesures appliquées. */
  graviteResiduelle: Niveau
  vraisemblanceResiduelle: Niveau
}

export function risqueVide(): Risque {
  return {
    gravite: 0,
    vraisemblance: 0,
    sources: '',
    mesures: '',
    graviteResiduelle: 0,
    vraisemblanceResiduelle: 0,
  }
}

export type Aipd = {
  id: string
  suivi: Suivi
  /** Renvoi vers la ligne du registre de l'article 30. */
  traitement: string
  /** Art. 35 §7 a. */
  description: string
  finalites: string
  /** Art. 35 §7 b — nécessité et proportionnalité. */
  necessite: string
  proportionnalite: string
  /** Mesures garantissant les droits des personnes — art. 35 §7 d. */
  droitsPersonnes: string
  /** Art. 35 §7 c, par événement redouté. */
  risques: Record<string, Risque>
  /** Art. 35 §2 — l'avis du DPO doit être demandé et consigné. */
  avisDpo: string
  /** Art. 35 §9 — le cas échéant, l'avis des personnes concernées. */
  avisPersonnes: string
  /** Décision finale prise par le responsable de traitement. */
  decision: DecisionAipd
}

export type DecisionAipd = 'a-instruire' | 'favorable' | 'sous-reserve' | 'defavorable'

export const DECISIONS_AIPD: { id: DecisionAipd; label: string }[] = [
  { id: 'a-instruire', label: 'À instruire' },
  { id: 'favorable', label: 'Favorable' },
  { id: 'sous-reserve', label: 'Favorable sous réserve' },
  { id: 'defavorable', label: 'Défavorable' },
]

export function aipdVide(id: string): Aipd {
  return {
    id,
    suivi: suiviVide(),
    traitement: '',
    description: '',
    finalites: '',
    necessite: '',
    proportionnalite: '',
    droitsPersonnes: '',
    risques: Object.fromEntries(EVENEMENTS.map((e) => [e.id, risqueVide()])),
    avisDpo: '',
    avisPersonnes: '',
    decision: 'a-instruire',
  }
}

export type NiveauRisque = 'non-apprecie' | 'negligeable' | 'limite' | 'important' | 'maximal'

/**
 * Le croisement gravité × vraisemblance.
 *
 * On retient le **maximum** des deux et non leur produit ni leur moyenne. Le
 * produit écraserait un risque maximal en gravité mais peu vraisemblable — or
 * c'est précisément le profil d'un fichier de santé exfiltré : rare, et
 * irrattrapable pour les personnes. La méthode du CEPD raisonne de même : la
 * gravité pour la personne prime, la vraisemblance module la priorité de
 * traitement, pas la qualification du risque.
 */
export function niveauRisque(gravite: Niveau, vraisemblance: Niveau): NiveauRisque {
  if (gravite === 0 || vraisemblance === 0) return 'non-apprecie'
  const n = Math.max(gravite, vraisemblance)
  if (n <= 1) return 'negligeable'
  if (n === 2) return 'limite'
  if (n === 3) return 'important'
  return 'maximal'
}

export const LIBELLE_RISQUE: Record<NiveauRisque, string> = {
  'non-apprecie': 'non apprécié',
  negligeable: 'négligeable',
  limite: 'limité',
  important: 'important',
  maximal: 'maximal',
}

export const TEINTE_RISQUE: Record<NiveauRisque, 'ink' | 'jade' | 'gold' | 'ember'> = {
  'non-apprecie': 'ink',
  negligeable: 'jade',
  limite: 'jade',
  important: 'gold',
  maximal: 'ember',
}

export type VerdictAipd = {
  /** Le plus élevé des trois risques résiduels. */
  residuelMax: NiveauRisque
  /** Art. 36 : consultation préalable de l'autorité avant toute mise en œuvre. */
  consultationPrealable: boolean
  /** Les événements dont le risque résiduel reste élevé. */
  evenementsCritiques: string[]
  motif: string
}

/**
 * Le verdict, et la seule question qui compte à la fin : faut-il consulter
 * l'autorité avant de commencer ?
 *
 * L'article 36 §1 l'impose lorsque l'analyse indique un risque élevé **que le
 * responsable ne peut pas atténuer**. C'est donc le risque *résiduel* — après
 * mesures — qui déclenche, jamais le risque brut. Beaucoup d'AIPD s'arrêtent au
 * risque brut et concluent de travers, dans les deux sens.
 */
export function verdictAipd(a: Aipd): VerdictAipd {
  const evalues = EVENEMENTS.map((e) => {
    const r = a.risques[e.id] ?? risqueVide()
    return {
      id: e.id,
      label: e.label,
      residuel: niveauRisque(r.graviteResiduelle, r.vraisemblanceResiduelle),
    }
  })

  const rang: Record<NiveauRisque, number> = {
    'non-apprecie': -1,
    negligeable: 0,
    limite: 1,
    important: 2,
    maximal: 3,
  }
  const residuelMax = evalues.reduce<NiveauRisque>(
    (max, e) => (rang[e.residuel] > rang[max] ? e.residuel : max),
    'non-apprecie',
  )

  const critiques = evalues
    .filter((e) => e.residuel === 'important' || e.residuel === 'maximal')
    .map((e) => e.label)

  if (residuelMax === 'non-apprecie') {
    return {
      residuelMax,
      consultationPrealable: false,
      evenementsCritiques: [],
      motif:
        "Les risques résiduels ne sont pas encore appréciés : renseignez gravité et vraisemblance après mesures pour chacun des trois événements redoutés.",
    }
  }

  if (critiques.length > 0) {
    return {
      residuelMax,
      consultationPrealable: true,
      evenementsCritiques: critiques,
      motif: `Risque résiduel ${LIBELLE_RISQUE[residuelMax]} sur : ${critiques.join(
        ' ; ',
      )}. L'article 36 §1 impose alors de consulter l'autorité de contrôle **avant** toute mise en œuvre — elle dispose de huit semaines, prorogeables de six, pour rendre son avis. Reprendre les mesures pour ramener le résiduel sous ce seuil est presque toujours plus rapide.`,
    }
  }

  return {
    residuelMax,
    consultationPrealable: false,
    evenementsCritiques: [],
    motif: `Risque résiduel ${LIBELLE_RISQUE[residuelMax]} sur les trois événements redoutés : la consultation préalable de l'article 36 n'est pas requise. L'analyse doit être réexaminée si le traitement évolue, et au minimum lors de la revue périodique (art. 35 §11).`,
  }
}

export function mentionsAipd(a: Aipd): Mention[] {
  const m: Mention[] = [
    { champ: 'Traitement concerné', article: 'art. 35 §7 a', valeur: a.traitement },
    { champ: 'Description systématique', article: 'art. 35 §7 a', valeur: a.description },
    { champ: 'Finalités poursuivies', article: 'art. 35 §7 a', valeur: a.finalites },
    { champ: 'Nécessité', article: 'art. 35 §7 b', valeur: a.necessite },
    { champ: 'Proportionnalité', article: 'art. 35 §7 b', valeur: a.proportionnalite },
    { champ: 'Mesures garantissant les droits', article: 'art. 35 §7 d', valeur: a.droitsPersonnes },
    { champ: 'Avis du délégué à la protection des données', article: 'art. 35 §2', valeur: a.avisDpo },
    { champ: 'Responsable de l’analyse', article: 'art. 5 §2', valeur: a.suivi.responsable },
    { champ: 'Validation', article: 'art. 5 §2', valeur: a.suivi.validateur },
  ]
  for (const e of EVENEMENTS) {
    const r = a.risques[e.id] ?? risqueVide()
    m.push({ champ: `${e.label} — sources et vulnérabilités`, article: 'art. 35 §7 c', valeur: r.sources })
    m.push({ champ: `${e.label} — mesures`, article: 'art. 35 §7 d', valeur: r.mesures })
  }
  return m
}

export const completudeAipd = (a: Aipd) => part(mentionsAipd(a))
export const champsManquantsAipd = (a: Aipd) => manquants(mentionsAipd(a))

// ---------------------------------------------------------------------------
// Mise en balance de l'intérêt légitime — article 6 §1 f
// ---------------------------------------------------------------------------

/**
 * Le test en trois temps, dans l'ordre imposé par la Cour de justice.
 *
 * L'ordre n'est pas indifférent : si l'intérêt n'est pas légitime, la question
 * de la nécessité ne se pose pas, et si le traitement n'est pas nécessaire, la
 * mise en balance n'a pas à être faite. Un formulaire qui poserait les trois de
 * front laisserait croire qu'un bon score sur deux rattrape un échec sur le
 * troisième — ce qui est faux.
 */
export const TESTS_LIA = [
  {
    etape: 1,
    id: 'legitimite',
    titre: 'L’intérêt est-il légitime ?',
    criteres: [
      { id: 'licite', label: 'Il est licite — conforme au droit applicable' },
      { id: 'precis', label: 'Il est formulé de manière suffisamment précise' },
      { id: 'reel', label: 'Il est réel et présent, non hypothétique' },
    ],
  },
  {
    etape: 2,
    id: 'necessite',
    titre: 'Le traitement est-il nécessaire ?',
    criteres: [
      { id: 'utile', label: 'Il permet effectivement d’atteindre l’intérêt poursuivi' },
      {
        id: 'minimal',
        label: 'Aucun moyen moins intrusif ne permettrait de l’atteindre',
      },
      { id: 'proportionne', label: 'Les données traitées sont limitées au nécessaire' },
    ],
  },
  {
    etape: 3,
    id: 'balance',
    titre: 'La balance penche-t-elle du bon côté ?',
    criteres: [
      {
        id: 'attentes',
        label: 'Le traitement entre dans les attentes raisonnables des personnes',
      },
      { id: 'impact', label: 'L’impact sur les personnes est limité' },
      { id: 'pas-sensibles', label: 'Il ne porte ni sur des données sensibles ni sur des mineurs' },
      { id: 'opposition', label: 'Un droit d’opposition simple et effectif est offert' },
      { id: 'garanties', label: 'Des garanties supplémentaires réduisent l’impact' },
    ],
  },
]

export type Lia = {
  id: string
  suivi: Suivi
  traitement: string
  interet: string
  /** Identifiants des critères satisfaits. */
  critereRetenus: string[]
  /** L'argumentaire écrit, qui est la pièce réellement opposable. */
  argumentaire: string
  garanties: string
}

export function liaVide(id: string): Lia {
  return {
    id,
    suivi: suiviVide(),
    traitement: '',
    interet: '',
    critereRetenus: [],
    argumentaire: '',
    garanties: '',
  }
}

export type VerdictLia = {
  /** L'étape à laquelle le test échoue, ou 0 s'il passe. */
  echoue: number
  soutenable: boolean
  motif: string
}

/**
 * Les deux premières étapes sont éliminatoires : leurs critères doivent être
 * *tous* satisfaits. La troisième s'apprécie en faisceau, et le seuil retenu
 * ici — trois critères sur cinq — est un repère d'exploitation, pas une règle
 * de droit. L'interface doit le dire.
 */
export function verdictLia(l: Lia): VerdictLia {
  for (const t of TESTS_LIA.slice(0, 2)) {
    const manquant = t.criteres.filter((c) => !l.critereRetenus.includes(c.id))
    if (manquant.length > 0) {
      return {
        echoue: t.etape,
        soutenable: false,
        motif: `Étape ${t.etape} — ${t.titre} Le test échoue : ${manquant
          .map((c) => c.label.toLowerCase())
          .join(' ; ')}. Les deux premières étapes sont éliminatoires : l'intérêt légitime ne peut pas fonder ce traitement, il faut une autre base légale ou renoncer.`,
      }
    }
  }

  const balance = TESTS_LIA[2]
  const retenus = balance.criteres.filter((c) => l.critereRetenus.includes(c.id)).length
  if (retenus >= 3) {
    return {
      echoue: 0,
      soutenable: true,
      motif: `Les deux étapes éliminatoires sont franchies et ${retenus} critères de mise en balance sur ${balance.criteres.length} sont satisfaits. La base de l'intérêt légitime paraît soutenable — à condition que l'argumentaire écrit soit conservé : c'est lui, et non ce tableau, qui sera opposé.`,
    }
  }

  return {
    echoue: 3,
    soutenable: false,
    motif: `Seulement ${retenus} critères de mise en balance sur ${balance.criteres.length}. La balance penche vers les droits des personnes : renforcez les garanties, ouvrez un droit d'opposition effectif, ou changez de base légale. Le seuil de trois est un repère d'exploitation, pas une règle de droit — un traitement à deux critères solidement argumentés peut tenir, un traitement à trois critères mal étayés non.`,
  }
}

// ---------------------------------------------------------------------------
// Analyse d'impact du transfert — Schrems II
// ---------------------------------------------------------------------------

/**
 * Les six étapes des recommandations 01/2020 du CEPD.
 *
 * Depuis l'arrêt Schrems II, les clauses contractuelles types ne suffisent plus
 * seules : il faut vérifier que le droit du pays de destination ne les prive
 * pas d'effet. C'est l'obligation la plus systématiquement omise du chapitre V,
 * parce qu'elle ne se règle pas par une signature.
 */
export const ETAPES_TIA = [
  {
    id: 'cartographie',
    titre: 'Connaître son transfert',
    note: "Quelles données, vers quel pays, chez quel destinataire, par quel moyen technique, et les transferts ultérieurs éventuels. Le simple accès à distance depuis un pays tiers est un transfert.",
  },
  {
    id: 'outil',
    titre: 'Identifier l’outil de transfert',
    note: "Décision d'adéquation (art. 45), garanties appropriées (art. 46), ou dérogation (art. 49). Les dérogations de l'article 49 sont d'interprétation stricte et ne peuvent pas fonder un transfert répétitif.",
  },
  {
    id: 'legislation',
    titre: 'Évaluer le droit et les pratiques du pays tiers',
    note: "Pouvoirs d'accès des autorités, voies de recours effectives pour la personne concernée, transparence des demandes. C'est l'étape qui demande un travail réel, et celle qu'on saute.",
  },
  {
    id: 'mesures',
    titre: 'Adopter des mesures supplémentaires',
    note: "Techniques d'abord — chiffrement dont la clé reste dans l'Union, pseudonymisation robuste, calcul multipartite. Les mesures contractuelles et organisationnelles seules ne résistent pas à un pouvoir d'accès.",
  },
  {
    id: 'procedure',
    titre: 'Accomplir les étapes procédurales',
    note: "Modification des clauses le cas échéant, autorisation de l'autorité si les mesures s'écartent des clauses types.",
  },
  {
    id: 'reevaluation',
    titre: 'Réévaluer à intervalles réguliers',
    note: "Le droit du pays de destination change, la jurisprudence aussi. Une analyse de transfert sans date de revue est périmée par construction.",
  },
]

export type Tia = {
  id: string
  suivi: Suivi
  destinataire: string
  pays: string
  donnees: string
  /** Étape → constat écrit. */
  etapes: Record<string, string>
  /** L'outil de transfert retenu. */
  outil: string
  /** Le droit du pays permet-il un accès disproportionné des autorités ? */
  accesAutorites: 'non-evalue' | 'non' | 'oui-encadre' | 'oui-problematique'
  /** Les mesures supplémentaires suffisent-elles à neutraliser cet accès ? */
  mesuresSuffisantes: boolean
}

export function tiaVide(id: string): Tia {
  return {
    id,
    suivi: suiviVide(),
    destinataire: '',
    pays: '',
    donnees: '',
    etapes: Object.fromEntries(ETAPES_TIA.map((e) => [e.id, ''])),
    outil: '',
    accesAutorites: 'non-evalue',
    mesuresSuffisantes: false,
  }
}

export type VerdictTia = {
  possible: boolean
  motif: string
}

export function verdictTia(t: Tia): VerdictTia {
  if (t.accesAutorites === 'non-evalue') {
    return {
      possible: false,
      motif:
        "L'étape 3 n'est pas faite : sans appréciation du droit et des pratiques du pays de destination, l'analyse n'existe pas et les clauses contractuelles types ne couvrent rien.",
    }
  }
  if (t.accesAutorites === 'oui-problematique' && !t.mesuresSuffisantes) {
    return {
      possible: false,
      motif:
        "Le droit du pays permet un accès des autorités que les mesures supplémentaires ne neutralisent pas. Le transfert doit être suspendu — ou les données rendues inintelligibles pour le destinataire comme pour ces autorités, ce qui suppose que la clé de chiffrement ne quitte jamais l'Union.",
    }
  }
  if (t.accesAutorites === 'oui-problematique') {
    return {
      possible: true,
      motif:
        "Accès problématique identifié, mais neutralisé par des mesures supplémentaires. Documentez précisément ces mesures : c'est sur elles, et non sur les clauses, que reposera la défense du transfert.",
    }
  }
  return {
    possible: true,
    motif:
      "Aucun accès disproportionné identifié en l'état du droit du pays de destination. Fixez une date de réexamen : c'est le droit du pays qui change, pas votre analyse.",
  }
}

// ---------------------------------------------------------------------------
// Analyse d'impact sur les droits fondamentaux — AI Act, article 27
// ---------------------------------------------------------------------------

/**
 * L'AIDF est due par les organismes publics et les fournisseurs de services
 * privés essentiels déployant un système de l'annexe III.
 *
 * Elle ne remplace pas l'AIPD du RGPD et n'est pas remplacée par elle : la
 * première regarde les droits fondamentaux dans leur ensemble — non
 * discrimination, dignité, recours effectif —, la seconde le seul traitement de
 * données personnelles. L'article 27 §4 permet seulement de s'appuyer sur
 * l'AIPD pour les parties qui se recouvrent.
 */
export const VOLETS_AIDF = [
  {
    id: 'processus',
    titre: 'Processus de déploiement',
    article: 'art. 27 §1 a',
    note: "Dans quels processus le système sera utilisé, et conformément à quelle finalité prévue par le fournisseur.",
  },
  {
    id: 'periode',
    titre: 'Période et fréquence d’utilisation',
    article: 'art. 27 §1 b',
    note: 'Usage ponctuel, saisonnier ou continu — la fréquence change la nature du risque.',
  },
  {
    id: 'personnes',
    titre: 'Catégories de personnes affectées',
    article: 'art. 27 §1 c',
    note: "Y compris celles qui ne sont pas utilisatrices du système mais en subissent les effets : le candidat écarté, l'usager dont le dossier est priorisé.",
  },
  {
    id: 'prejudices',
    titre: 'Risques spécifiques de préjudice',
    article: 'art. 27 §1 d',
    note: "Discrimination directe ou indirecte, atteinte à la dignité, effet d'échelle d'une erreur systématique. Nommer les groupes exposés, pas seulement les risques.",
  },
  {
    id: 'controle',
    titre: 'Mesures de contrôle humain',
    article: 'art. 27 §1 e',
    note: "Qui supervise, avec quelle compétence, et surtout avec quelle autorité pour écarter la sortie du système. Un contrôle que la hiérarchie décourage d'exercer n'existe pas.",
  },
  {
    id: 'materialisation',
    titre: 'Mesures en cas de matérialisation des risques',
    article: 'art. 27 §1 f',
    note: "Gouvernance interne, mécanisme de plainte accessible aux personnes affectées, procédure de suspension du système.",
  },
]

export type Aidf = {
  id: string
  suivi: Suivi
  systeme: string
  volets: Record<string, string>
  /** L'AIPD sur laquelle l'analyse s'appuie, le cas échéant (art. 27 §4). */
  aipdAssociee: string
  /** Art. 27 §3 : notification du résultat à l'autorité de surveillance du marché. */
  notifieeAutorite: boolean
}

export function aidfVide(id: string): Aidf {
  return {
    id,
    suivi: suiviVide(),
    systeme: '',
    volets: Object.fromEntries(VOLETS_AIDF.map((v) => [v.id, ''])),
    aipdAssociee: '',
    notifieeAutorite: false,
  }
}

export function mentionsAidf(a: Aidf): Mention[] {
  return [
    { champ: 'Système concerné', article: 'art. 27 §1', valeur: a.systeme },
    ...VOLETS_AIDF.map((v) => ({
      champ: v.titre,
      article: v.article,
      valeur: a.volets[v.id] ?? '',
    })),
    { champ: 'Responsable de l’analyse', article: 'art. 5 §2', valeur: a.suivi.responsable },
  ]
}

export const completudeAidf = (a: Aidf) => part(mentionsAidf(a))
export const champsManquantsAidf = (a: Aidf) => manquants(mentionsAidf(a))
