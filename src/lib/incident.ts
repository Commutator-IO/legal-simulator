/**
 * Les délais de notification d'incident.
 *
 * Quatre régimes se superposent sans se coordonner, et c'est le vrai problème :
 * une intrusion chez un éditeur de logiciel financier traitant des données
 * personnelles déclenche simultanément le RGPD, NIS 2, le CRA et DORA, vers
 * quatre destinataires différents, sur des horloges qui ne partent pas au même
 * instant. Le premier jalon tombe quatre heures après la classification — le
 * temps de finir la réunion de crise.
 *
 * Deux règles de lecture appliquées partout ici :
 *
 * — Les délais courent depuis la **prise de connaissance**, pas depuis le début
 *   de l'incident ni depuis la fin de la remédiation. Un incident découvert
 *   trois semaines après son déclenchement laisse quand même 24 heures.
 * — Une horloge réglementaire ne s'arrête ni la nuit, ni le week-end, ni au
 *   mois d'août. Les jalons sont donc calculés en heures calendaires pleines.
 */

export type Regime = 'rgpd' | 'nis2' | 'cra-vulnerabilite' | 'cra-incident' | 'dora'

export type Jalon = {
  regime: Regime
  /** Ce qu'il faut envoyer. */
  libelle: string
  /** À qui. */
  destinataire: string
  /** L'article qui fixe le délai. */
  article: string
  /** Instant limite, en millisecondes depuis l'époque. */
  echeance: number
  /** Le contenu minimal attendu à ce stade. */
  contenu: string
}

export const REGIMES: { id: Regime; label: string; note: string }[] = [
  {
    id: 'rgpd',
    label: 'RGPD — violation de données personnelles',
    note: "Dès qu'il y a atteinte à la confidentialité, à l'intégrité ou à la disponibilité de données personnelles. La perte d'accès à une sauvegarde chiffrée en est une.",
  },
  {
    id: 'nis2',
    label: 'NIS 2 — incident important',
    note: "Entités essentielles et importantes. Un incident est important s'il cause une perturbation opérationnelle grave, une perte financière, ou un préjudice à des tiers.",
  },
  {
    id: 'cra-vulnerabilite',
    label: 'CRA — vulnérabilité activement exploitée',
    note: "Fabricants de produits comportant des éléments numériques. C'est l'exploitation constatée qui déclenche, pas la découverte de la faille.",
  },
  {
    id: 'cra-incident',
    label: 'CRA — incident grave affectant la sécurité du produit',
    note: 'Distinct du régime vulnérabilité, et cumulable avec lui.',
  },
  {
    id: 'dora',
    label: 'DORA — incident majeur lié aux TIC',
    note: "Entités financières. L'horloge principale part de la *classification* de l'incident comme majeur, pas de sa détection.",
  },
]

/** Ajoute des heures pleines. */
function heures(t: number, n: number): number {
  return t + n * 3_600_000
}

/** Ajoute des jours calendaires. */
function jours(t: number, n: number): number {
  return t + n * 86_400_000
}

/**
 * Ajoute un mois *calendaire*, pas trente jours : le règlement dit « un mois »,
 * et un incident connu le 31 janvier a jusqu'au 28 février — le dernier jour du
 * mois d'arrivée quand le quantième n'existe pas.
 */
export function unMois(t: number): number {
  const d = new Date(t)
  const quantieme = d.getDate()
  const arrivee = new Date(t)
  arrivee.setMonth(arrivee.getMonth() + 1)
  if (arrivee.getDate() !== quantieme) arrivee.setDate(0)
  return arrivee.getTime()
}

export type Entrees = {
  /** Instant de la prise de connaissance de l'incident. */
  connaissance: number
  /** Instant de la classification comme majeur — DORA uniquement. */
  classification?: number
  regimes: Regime[]
}

/**
 * Tous les jalons applicables, du plus urgent au plus lointain.
 */
export function jalons(e: Entrees): Jalon[] {
  const out: Jalon[] = []
  const t = e.connaissance

  if (e.regimes.includes('rgpd')) {
    out.push({
      regime: 'rgpd',
      libelle: "Notification à l'autorité de contrôle",
      destinataire: "Autorité de contrôle chef de file (la CNIL en France)",
      article: 'RGPD, art. 33 §1',
      echeance: heures(t, 72),
      contenu:
        "Nature de la violation, catégories et nombre approximatif de personnes et d'enregistrements, coordonnées du DPO, conséquences probables, mesures prises. Au-delà de 72 heures, la notification reste due mais doit être motivée.",
    })
    out.push({
      regime: 'rgpd',
      libelle: 'Communication aux personnes concernées',
      destinataire: 'Les personnes dont les données sont concernées',
      article: 'RGPD, art. 34',
      // Le texte dit « dans les meilleurs délais » sans chiffre. Aligner sur
      // 72 heures est un choix d'exploitation, pas une règle : c'est le seul
      // repère opérationnel disponible, et il est signalé comme tel.
      echeance: heures(t, 72),
      contenu:
        "Due seulement si le risque pour les droits et libertés est élevé, et sauf si les données étaient chiffrées de façon rendant l'accès impossible. Le texte dit « dans les meilleurs délais » sans chiffre : l'échéance affichée ici s'aligne sur celle de l'article 33 par prudence, elle n'est pas dans le règlement.",
    })
  }

  if (e.regimes.includes('nis2')) {
    out.push({
      regime: 'nis2',
      libelle: 'Alerte précoce',
      destinataire: 'CSIRT national ou autorité compétente',
      article: 'NIS 2, art. 23 §4 a',
      echeance: heures(t, 24),
      contenu:
        "Indiquer si l'incident est soupçonné d'être malveillant et s'il peut avoir un impact transfrontière. Trois lignes suffisent — à ce stade on signale, on ne qualifie pas.",
    })
    out.push({
      regime: 'nis2',
      libelle: "Notification d'incident",
      destinataire: 'CSIRT national ou autorité compétente',
      article: 'NIS 2, art. 23 §4 b',
      echeance: heures(t, 72),
      contenu:
        "Mise à jour de l'alerte précoce, évaluation initiale de la gravité et de l'impact, indicateurs de compromission lorsqu'ils sont disponibles.",
    })
    out.push({
      regime: 'nis2',
      libelle: 'Rapport final',
      destinataire: 'CSIRT national ou autorité compétente',
      article: 'NIS 2, art. 23 §4 d',
      echeance: unMois(t),
      contenu:
        "Description détaillée, type de menace et cause profonde, mesures d'atténuation appliquées, impact transfrontière le cas échéant. Si l'incident est toujours en cours à cette date, un rapport d'avancement remplace le rapport final, qui suit dans le mois de la clôture.",
    })
  }

  if (e.regimes.includes('cra-vulnerabilite')) {
    out.push({
      regime: 'cra-vulnerabilite',
      libelle: 'Alerte précoce — vulnérabilité exploitée',
      destinataire: 'CSIRT désigné coordinateur, et ENISA',
      article: 'CRA, art. 14 §1',
      echeance: heures(t, 24),
      contenu:
        "États membres où le produit a été mis à disposition, si l'information est disponible. Dépôt par la plateforme unique de signalement prévue à l'article 16.",
    })
    out.push({
      regime: 'cra-vulnerabilite',
      libelle: 'Notification de vulnérabilité',
      destinataire: 'CSIRT coordinateur, et ENISA',
      article: 'CRA, art. 14 §2',
      echeance: heures(t, 72),
      contenu:
        "Informations générales sur le produit, nature de la vulnérabilité, mesures correctives ou d'atténuation prises et celles que les utilisateurs peuvent appliquer.",
    })
    out.push({
      regime: 'cra-vulnerabilite',
      libelle: 'Rapport final',
      destinataire: 'CSIRT coordinateur, et ENISA',
      article: 'CRA, art. 14 §4',
      echeance: jours(t, 14),
      contenu:
        "Description de la vulnérabilité, de sa gravité et de son impact, et le cas échéant des acteurs malveillants. Le délai court à compter de la mise à disposition d'une mesure corrective : l'échéance affichée suppose un correctif disponible dès la prise de connaissance, c'est-à-dire le cas le plus contraint.",
    })
  }

  if (e.regimes.includes('cra-incident')) {
    out.push({
      regime: 'cra-incident',
      libelle: 'Alerte précoce — incident grave',
      destinataire: 'CSIRT coordinateur, et ENISA',
      article: 'CRA, art. 14 §3',
      echeance: heures(t, 24),
      contenu:
        "Signaler tout incident grave ayant une incidence sur la sécurité du produit.",
    })
    out.push({
      regime: 'cra-incident',
      libelle: "Notification d'incident",
      destinataire: 'CSIRT coordinateur, et ENISA',
      article: 'CRA, art. 14 §3',
      echeance: heures(t, 72),
      contenu:
        "Nature de l'incident, évaluation initiale, mesures correctives engagées.",
    })
    out.push({
      regime: 'cra-incident',
      libelle: 'Rapport final',
      destinataire: 'CSIRT coordinateur, et ENISA',
      article: 'CRA, art. 14 §4',
      echeance: unMois(t),
      contenu:
        "Description de l'incident, de sa gravité et de son impact, mesures correctives appliquées.",
    })
  }

  if (e.regimes.includes('dora')) {
    // Le RTS pose deux bornes pour la notification initiale et retient la plus
    // proche. Écrire un `Math.min` plutôt que de choisir l'une des deux à la
    // main : selon la vitesse de classification, ce n'est pas toujours la même
    // qui contraint, et c'est précisément là que les équipes se trompent.
    const classification = e.classification ?? t
    const initiale = Math.min(heures(classification, 4), heures(t, 24))
    out.push({
      regime: 'dora',
      libelle: 'Notification initiale',
      destinataire: 'Autorité compétente (ACPR ou AMF en France)',
      article: 'DORA, art. 19 §4 a',
      echeance: initiale,
      contenu:
        "Au plus tôt entre 4 heures après la classification comme incident majeur et 24 heures après la prise de connaissance. Identification de l'incident, moment de la détection, classification retenue.",
    })
    out.push({
      regime: 'dora',
      libelle: 'Rapport intermédiaire',
      destinataire: 'Autorité compétente',
      article: 'DORA, art. 19 §4 b',
      echeance: heures(initiale, 72),
      contenu:
        "Évolution depuis la notification initiale, impact sur les clients et les contreparties, état du rétablissement des activités. Délai décompté depuis la notification initiale, pas depuis la prise de connaissance.",
    })
    out.push({
      regime: 'dora',
      libelle: 'Rapport final',
      destinataire: 'Autorité compétente',
      article: 'DORA, art. 19 §4 c',
      echeance: unMois(heures(initiale, 72)),
      contenu:
        "Analyse de la cause profonde, coûts directs et indirects, mesures de remédiation permanentes. Un mois à compter du rapport intermédiaire.",
    })
  }

  return out.sort((a, b) => a.echeance - b.echeance)
}

/** Le premier jalon à tomber : celui qui dicte le rythme de la cellule de crise. */
export function premierJalon(e: Entrees): Jalon | undefined {
  return jalons(e)[0]
}

export type EtatJalon = 'depasse' | 'critique' | 'ouvert'

/**
 * Seuil de bascule à deux heures : en deçà, l'envoi ne peut plus être préparé,
 * il ne peut qu'être déclenché. C'est le moment où l'on cesse de rédiger et où
 * l'on envoie ce dont on dispose — un signalement incomplet dans les délais
 * vaut mieux qu'un signalement complet hors délai, les trois régimes prévoyant
 * tous une mise à jour ultérieure.
 */
export function etat(jalon: Jalon, maintenant: number): EtatJalon {
  const restant = jalon.echeance - maintenant
  if (restant < 0) return 'depasse'
  if (restant <= 2 * 3_600_000) return 'critique'
  return 'ouvert'
}

/** « 6 h 45 », « 2 j 4 h », « dépassé de 3 h ». */
export function reste(jalon: Jalon, maintenant: number): string {
  const ms = jalon.echeance - maintenant
  const abs = Math.abs(ms)
  const h = Math.floor(abs / 3_600_000)
  const min = Math.floor((abs % 3_600_000) / 60_000)
  const rendu =
    h >= 48
      ? `${Math.floor(h / 24)} j ${h % 24} h`
      : h >= 1
        ? `${h} h ${String(min).padStart(2, '0')}`
        : `${min} min`
  return ms < 0 ? `dépassé de ${rendu}` : rendu
}
