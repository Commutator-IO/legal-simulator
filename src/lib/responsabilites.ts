/**
 * Le registre de responsabilité.
 *
 * Le RGPD, l'AI Act, NIS 2 et le CRA partagent une même idée, exprimée quatre
 * fois : une obligation qui n'est portée par personne en particulier n'est
 * portée par personne. L'article 5 §2 du RGPD parle de responsabilité,
 * l'article 20 de NIS 2 engage nommément les organes de direction, l'article
 * 17 de l'AI Act impose un système de management de la qualité, l'article 13
 * du CRA fait du fabricant le point de responsabilité unique.
 *
 * D'où ce registre : une ligne par obligation transverse, un nom, une date de
 * revue. Sa valeur n'est pas dans la liste — elle est dans les cases vides,
 * qu'il rend visibles.
 */

export type Domaine = 'rgpd' | 'ia' | 'cyber' | 'produit'

export type Obligation = {
  id: string
  domaine: Domaine
  intitule: string
  article: string
  /** Ce que « fait » veut dire concrètement, pour éviter l'auto-évaluation complaisante. */
  preuve: string
  /** Périodicité de revue attendue, en mois. */
  revueMois: number
}

export const OBLIGATIONS: Obligation[] = [
  {
    id: 'dpo',
    domaine: 'rgpd',
    intitule: 'Désignation et positionnement du délégué à la protection des données',
    article: 'RGPD, art. 37-39',
    preuve:
      "Lettre de désignation, coordonnées publiées et communiquées à l'autorité, et rattachement au plus haut niveau sans conflit d'intérêts — un DSI ou un directeur juridique cumulant la fonction est régulièrement censuré.",
    revueMois: 12,
  },
  {
    id: 'registre-30',
    domaine: 'rgpd',
    intitule: 'Tenue du registre des activités de traitement',
    article: 'RGPD, art. 30',
    preuve:
      "Registre daté, couvrant tous les traitements, y compris ceux des services support. La date de dernière mise à jour est le premier signal de sérieux.",
    revueMois: 6,
  },
  {
    id: 'securite-32',
    domaine: 'rgpd',
    intitule: 'Mesures techniques et organisationnelles de sécurité',
    article: 'RGPD, art. 32',
    preuve:
      "Politique de sécurité, chiffrement, gestion des habilitations, et surtout la « procédure visant à tester, analyser et évaluer régulièrement l'efficacité » du §1 d — c'est cette dernière qui manque presque toujours.",
    revueMois: 12,
  },
  {
    id: 'violations',
    domaine: 'rgpd',
    intitule: 'Procédure de gestion des violations de données',
    article: 'RGPD, art. 33-34',
    preuve:
      "Registre interne des violations — y compris celles non notifiées, avec leur motif —, chaîne d'astreinte joignable hors heures ouvrées, et un exercice de simulation déjà tenu.",
    revueMois: 12,
  },
  {
    id: 'aipd',
    domaine: 'rgpd',
    intitule: "Processus d'analyse d'impact",
    article: 'RGPD, art. 35',
    preuve:
      "Criblage systématique en amont de tout nouveau traitement, et analyses conservées avec l'avis du DPO.",
    revueMois: 12,
  },
  {
    id: 'sous-traitants',
    domaine: 'rgpd',
    intitule: 'Contrats de sous-traitance et suivi des fournisseurs',
    article: 'RGPD, art. 28',
    preuve:
      "Clauses portant les huit mentions du §3 pour chaque sous-traitant, liste des sous-traitants ultérieurs autorisés, et preuve de la diligence exercée avant leur choix.",
    revueMois: 12,
  },
  {
    id: 'transferts',
    domaine: 'rgpd',
    intitule: 'Encadrement des transferts hors Union',
    article: 'RGPD, ch. V',
    preuve:
      "Clauses contractuelles types signées, et analyse d'impact du transfert documentant le droit du pays de destination — l'exigence issue de Schrems II, distincte des clauses elles-mêmes.",
    revueMois: 12,
  },
  {
    id: 'droits',
    domaine: 'rgpd',
    intitule: 'Traitement des demandes d’exercice de droits',
    article: 'RGPD, art. 12-22',
    preuve:
      "Canal identifié, délai d'un mois tenu et mesuré, et traçabilité des réponses. Un délai moyen non mesuré est un délai non tenu.",
    revueMois: 6,
  },
  {
    id: 'inventaire-ia',
    domaine: 'ia',
    intitule: "Inventaire des systèmes d'IA et de leur qualification",
    article: 'AI Act, art. 6 et 50',
    preuve:
      "Liste exhaustive incluant les outils acquis sur étagère et ceux introduits par les métiers sans passer par la DSI, avec pour chacun le niveau de risque retenu et le raisonnement.",
    revueMois: 6,
  },
  {
    id: 'maitrise-ia',
    domaine: 'ia',
    intitule: "Maîtrise de l'IA des utilisateurs",
    article: 'AI Act, art. 4',
    preuve:
      "Formation adaptée au rôle et au risque, avec émargement. Applicable depuis le 2 février 2025 — c'est l'obligation la plus ancienne et la moins souvent tracée, parce qu'elle ne produit spontanément aucun document.",
    revueMois: 12,
  },
  {
    id: 'transparence-ia',
    domaine: 'ia',
    intitule: 'Transparence des systèmes et marquage des contenus',
    article: 'AI Act, art. 50',
    preuve:
      "Mention d'interaction sur chaque interface conversationnelle, marquage lisible par machine des sorties génératives, déclaration des hypertrucages. Exigible depuis le 2 août 2026.",
    revueMois: 6,
  },
  {
    id: 'controle-humain',
    domaine: 'ia',
    intitule: 'Contrôle humain des systèmes à haut risque',
    article: 'AI Act, art. 14 et 26 §2',
    preuve:
      "Personnes désignées, formées, et dotées de l'autorité de passer outre la sortie du système. Un contrôle humain que la hiérarchie décourage d'exercer n'existe pas.",
    revueMois: 6,
  },
  {
    id: 'gouvernance-nis2',
    domaine: 'cyber',
    intitule: 'Approbation des mesures par les organes de direction',
    article: 'NIS 2, art. 20',
    preuve:
      "Délibération datée du conseil ou du comité de direction, et attestation de la formation suivie. La responsabilité peut être engagée personnellement : c'est le vrai levier de la directive.",
    revueMois: 12,
  },
  {
    id: 'chaine-appro',
    domaine: 'cyber',
    intitule: 'Sécurité de la chaîne d’approvisionnement',
    article: 'NIS 2, art. 21 §2 d',
    preuve:
      "Évaluation des fournisseurs critiques, clauses de sécurité, et prise en compte des vulnérabilités propres à chacun.",
    revueMois: 12,
  },
  {
    id: 'notification-incident',
    domaine: 'cyber',
    intitule: 'Chaîne de notification des incidents',
    article: 'NIS 2 art. 23 ; CRA art. 14 ; DORA art. 19',
    preuve:
      "Points de contact enregistrés auprès de chaque autorité, modèles de message prêts, et astreinte capable de tenir 24 heures un week-end. Le premier jalon tombe quatre heures après classification sous DORA.",
    revueMois: 6,
  },
  {
    id: 'sbom',
    domaine: 'produit',
    intitule: 'Nomenclature logicielle et suivi des composants tiers',
    article: 'CRA, annexe I partie II §1',
    preuve:
      "SBOM à jour des composants de premier niveau, dans un format exploitable, et rattachée à la version livrée du produit.",
    revueMois: 3,
  },
  {
    id: 'divulgation',
    domaine: 'produit',
    intitule: 'Politique de divulgation coordonnée des vulnérabilités',
    article: 'CRA, annexe I partie II §5',
    preuve:
      "Adresse de contact publiée, délai de réponse annoncé, et procédure de traitement écrite. Le point d'entrée doit être trouvable sans compte client.",
    revueMois: 12,
  },
  {
    id: 'support',
    domaine: 'produit',
    intitule: 'Période de support annoncée et tenue',
    article: 'CRA, art. 13 §8',
    preuve:
      "Durée affichée à l'achat, au moins cinq ans sauf durée de vie attendue plus courte et démontrée, et un plan de fin de vie qui existe avant d'en avoir besoin.",
    revueMois: 12,
  },
  {
    id: 'accessibilite',
    domaine: 'produit',
    intitule: 'Conformité en accessibilité',
    article: 'Directive (UE) 2019/882, annexe I',
    preuve:
      "Audit selon la norme EN 301 549, déclaration d'accessibilité publiée, et plan de correction daté des écarts constatés.",
    revueMois: 12,
  },
]

export type Affectation = {
  /** Nom de la personne qui répond de l'obligation, pas d'un service. */
  responsable: string
  suppleant: string
  statut: Statut
  /** `AAAA-MM-JJ` de la dernière revue. */
  derniereRevue: string
  note: string
}

export type Statut = 'non-traite' | 'en-cours' | 'fait' | 'sans-objet'

export const STATUTS: { id: Statut; label: string; teinte: string }[] = [
  { id: 'non-traite', label: 'Non traité', teinte: 'ember' },
  { id: 'en-cours', label: 'En cours', teinte: 'gold' },
  { id: 'fait', label: 'Fait', teinte: 'jade' },
  { id: 'sans-objet', label: 'Sans objet', teinte: 'ink' },
]

export function affectationVide(): Affectation {
  return {
    responsable: '',
    suppleant: '',
    statut: 'non-traite',
    derniereRevue: '',
    note: '',
  }
}

export type Couverture = {
  /** Obligations retenues, hors « sans objet ». */
  applicables: number
  faites: number
  /** Applicables sans nom de responsable : le vrai indicateur. */
  orphelines: number
  /** Revues dont la périodicité est dépassée. */
  perimees: number
}

/**
 * L'état du registre. On compte séparément les obligations *orphelines* :
 * une obligation marquée « fait » sans nom en face l'est jusqu'au départ de
 * celui qui s'en occupait sans le dire.
 */
export function couverture(
  affectations: Record<string, Affectation>,
  aujourdhui: string,
): Couverture {
  let applicables = 0
  let faites = 0
  let orphelines = 0
  let perimees = 0

  for (const o of OBLIGATIONS) {
    const a = affectations[o.id] ?? affectationVide()
    if (a.statut === 'sans-objet') continue
    applicables++
    if (a.statut === 'fait') faites++
    if (!a.responsable.trim()) orphelines++
    if (a.derniereRevue && perimee(a.derniereRevue, o.revueMois, aujourdhui)) perimees++
  }

  return { applicables, faites, orphelines, perimees }
}

/** Vrai si la dernière revue remonte à plus que la périodicité attendue. */
export function perimee(derniereRevue: string, mois: number, aujourdhui: string): boolean {
  const [a, m, j] = derniereRevue.split('-').map(Number)
  const limite = new Date(Date.UTC(a, m - 1 + mois, j))
  const [a2, m2, j2] = aujourdhui.split('-').map(Number)
  return Date.UTC(a2, m2 - 1, j2) > limite.getTime()
}
