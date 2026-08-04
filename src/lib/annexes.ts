/**
 * Les pièces à produire : documentation technique de l'AI Act, évaluation des
 * risques et déclaration UE de conformité du CRA.
 *
 * Jusqu'ici le site qualifiait puis listait des obligations, sans jamais aider
 * à produire la pièce. C'était l'écart le plus visible entre ce qu'il promettait
 * — documenter — et ce qu'il faisait. Les trois documents rassemblés ici sont
 * ceux dont le contenu est **fixé par le texte lui-même**, section par section :
 * ce sont donc ceux qu'un formulaire peut réellement porter.
 *
 * Ce qu'aucun formulaire ne remplacera : la SBOM, qui sort d'une chaîne de
 * construction (CycloneDX, SPDX) et non d'une saisie. Le site indique où elle
 * doit être référencée, il ne prétend pas la produire.
 */

import type { Suivi } from './suivi'
import { suiviVide } from './suivi'
import { manquants, part } from './collection'
import type { Mention } from './registre'
import { jour } from './format'

// ---------------------------------------------------------------------------
// Documentation technique — AI Act, annexe IV
// ---------------------------------------------------------------------------

/**
 * Les neuf sections de l'annexe IV, dans l'ordre du texte.
 *
 * Elle doit être établie **avant** la mise sur le marché et tenue à jour
 * (art. 11 §1). Pour une PME, le §1 alinéa 2 autorise un formulaire simplifié
 * défini par la Commission — mais les rubriques restent les mêmes, seule la
 * profondeur change.
 */
export const SECTIONS_ANNEXE_IV = [
  {
    id: 'description',
    numero: '1',
    titre: 'Description générale du système',
    note: "Destination, nom du fournisseur, version, interactions avec du matériel ou d'autres logiciels, formes de mise sur le marché, matériel sur lequel il est destiné à fonctionner, instructions d'utilisation.",
  },
  {
    id: 'developpement',
    numero: '2',
    titre: 'Description détaillée des éléments et du développement',
    note: "Méthodes et étapes de développement, recours éventuel à des systèmes pré-entraînés de tiers, spécifications de conception, architecture, ressources de calcul.",
  },
  {
    id: 'donnees',
    numero: '2 d',
    titre: 'Données d’entraînement, de validation et d’essai',
    note: "Provenance, portée, caractéristiques principales, mode d'obtention et de sélection, procédures d'étiquetage, méthodes de détection des biais. C'est la section la plus scrutée, et la plus coûteuse à reconstituer après coup.",
  },
  {
    id: 'controle',
    numero: '2 e',
    titre: 'Mesures de contrôle humain',
    note: "Art. 14 : comment l'interface rend la supervision effective, et comment le déployeur peut interpréter les sorties.",
  },
  {
    id: 'performance',
    numero: '3',
    titre: 'Capacités, limites et exactitude',
    note: "Niveaux d'exactitude déclarés, métriques retenues et pourquoi elles sont adéquates, résultats non voulus prévisibles, sources de risque pour la santé, la sécurité et les droits fondamentaux.",
  },
  {
    id: 'risques',
    numero: '4',
    titre: 'Système de gestion des risques',
    note: "Art. 9 : le processus itératif tenu sur tout le cycle de vie, pas un document produit une fois.",
  },
  {
    id: 'modifications',
    numero: '5',
    titre: 'Modifications au cours du cycle de vie',
    note: "Toute modification substantielle relance l'évaluation de la conformité. Tenir la liste au fil de l'eau est la seule méthode qui fonctionne.",
  },
  {
    id: 'normes',
    numero: '6',
    titre: 'Normes harmonisées appliquées',
    note: "Références complètes. À défaut de norme appliquée, description détaillée des solutions retenues pour satisfaire les exigences du chapitre III section 2.",
  },
  {
    id: 'declaration',
    numero: '7',
    titre: 'Déclaration UE de conformité',
    note: 'Art. 47 : copie jointe à la documentation.',
  },
  {
    id: 'surveillance',
    numero: '8',
    titre: 'Surveillance après commercialisation',
    note: "Art. 72 : le plan de collecte et d'analyse des données d'exploitation, et le circuit de signalement des incidents graves de l'article 73 — quinze jours.",
  },
]

export type DocumentationIa = {
  id: string
  suivi: Suivi
  /** Renvoi vers la fiche de l'inventaire. */
  systeme: string
  version: string
  sections: Record<string, string>
}

export function documentationVide(id: string): DocumentationIa {
  return {
    id,
    suivi: suiviVide(),
    systeme: '',
    version: '',
    sections: Object.fromEntries(SECTIONS_ANNEXE_IV.map((s) => [s.id, ''])),
  }
}

export function mentionsDocumentation(d: DocumentationIa): Mention[] {
  return [
    { champ: 'Système concerné', article: 'art. 11', valeur: d.systeme },
    { champ: 'Version documentée', article: 'art. 11 §1', valeur: d.version },
    ...SECTIONS_ANNEXE_IV.map((s) => ({
      champ: s.titre,
      article: `annexe IV §${s.numero}`,
      valeur: d.sections[s.id] ?? '',
    })),
    { champ: 'Responsable de la documentation', article: 'art. 5 §2', valeur: d.suivi.responsable },
  ]
}

export const completudeDocumentation = (d: DocumentationIa) => part(mentionsDocumentation(d))
export const champsManquantsDocumentation = (d: DocumentationIa) =>
  manquants(mentionsDocumentation(d))

// ---------------------------------------------------------------------------
// Évaluation des risques de cybersécurité — CRA, article 13 §2
// ---------------------------------------------------------------------------

/**
 * Les exigences essentielles de l'annexe I partie I : le principe de conception
 * fondée sur les risques, puis les treize propriétés de sécurité des points a
 * à m — quatorze lignes en tout.
 *
 * L'article 13 §2 demande que l'évaluation identifie celles qui s'appliquent
 * **et justifie celles qui ne s'appliquent pas**. C'est cette seconde moitié
 * qui est presque toujours absente : une exigence écartée sans motif écrit est
 * une non-conformité, pas une exigence écartée.
 */
export const EXIGENCES_ANNEXE_I = [
  { id: 'risques', label: 'Conception fondée sur les risques de cybersécurité' },
  { id: 'sans-vulnerabilite', label: 'Livraison sans vulnérabilité exploitable connue' },
  { id: 'configuration', label: 'Configuration sécurisée par défaut, et remise à l’état initial' },
  { id: 'correctifs', label: 'Correction des vulnérabilités, mises à jour automatiques par défaut' },
  { id: 'acces', label: 'Protection contre les accès non autorisés, authentification' },
  { id: 'confidentialite', label: 'Confidentialité des données stockées, transmises, traitées' },
  { id: 'integrite', label: 'Intégrité des données, commandes, configurations et programmes' },
  { id: 'minimisation', label: 'Limitation des données au strict nécessaire à l’usage prévu' },
  { id: 'disponibilite', label: 'Disponibilité des fonctions essentielles, résilience au déni de service' },
  { id: 'impact-reseau', label: 'Limitation de l’impact négatif sur d’autres appareils ou réseaux' },
  { id: 'surface', label: 'Surface d’attaque limitée, y compris les interfaces externes' },
  { id: 'attenuation', label: 'Atténuation des conséquences d’un incident, techniques d’exploitation' },
  { id: 'journalisation', label: 'Journalisation et surveillance des accès, avec information de l’utilisateur' },
  { id: 'effacement', label: 'Effacement ou transfert sécurisé des données et paramètres' },
]

export type EvaluationCra = {
  id: string
  suivi: Suivi
  produit: string
  version: string
  /** Usage prévu et usage raisonnablement prévisible — le périmètre de l'analyse. */
  usagePrevu: string
  /** Menaces, scénarios d'attaque et actifs à protéger. */
  analyse: string
  /** Exigence → « applicable » avec sa mesure, ou « écartée » avec sa justification. */
  exigences: Record<string, ExigenceCra>
  /** Où se trouve la SBOM, dans quel format, et à quelle version elle se rattache. */
  sbom: string
  /** Composants tiers et libres : diligence de l'art. 13 §5. */
  composants: string
}

export type ExigenceCra = {
  applicable: 'applicable' | 'ecartee' | 'non-tranchee'
  /** La mesure retenue, ou le motif de mise à l'écart. */
  justification: string
}

export function evaluationCraVide(id: string): EvaluationCra {
  return {
    id,
    suivi: suiviVide(),
    produit: '',
    version: '',
    usagePrevu: '',
    analyse: '',
    exigences: Object.fromEntries(
      EXIGENCES_ANNEXE_I.map((e) => [e.id, { applicable: 'non-tranchee', justification: '' }]),
    ),
    sbom: '',
    composants: '',
  }
}

export type VerdictEvaluationCra = {
  tranchees: number
  /** Exigences écartées sans motif écrit : la faille classique du dossier. */
  ecarteesSansMotif: string[]
  applicablesSansMesure: string[]
  motif: string
}

export function verdictEvaluationCra(e: EvaluationCra): VerdictEvaluationCra {
  const ecarteesSansMotif: string[] = []
  const applicablesSansMesure: string[] = []
  let tranchees = 0

  for (const x of EXIGENCES_ANNEXE_I) {
    const v = e.exigences[x.id] ?? { applicable: 'non-tranchee', justification: '' }
    if (v.applicable === 'non-tranchee') continue
    tranchees++
    if (v.applicable === 'ecartee' && !v.justification.trim()) ecarteesSansMotif.push(x.label)
    if (v.applicable === 'applicable' && !v.justification.trim()) applicablesSansMesure.push(x.label)
  }

  const restant = EXIGENCES_ANNEXE_I.length - tranchees
  const morceaux: string[] = []
  if (restant > 0) morceaux.push(`${restant} exigence${restant > 1 ? 's' : ''} non tranchée${restant > 1 ? 's' : ''}`)
  if (ecarteesSansMotif.length > 0)
    morceaux.push(`${ecarteesSansMotif.length} écartée${ecarteesSansMotif.length > 1 ? 's' : ''} sans motif écrit`)
  if (applicablesSansMesure.length > 0)
    morceaux.push(`${applicablesSansMesure.length} applicable${applicablesSansMesure.length > 1 ? 's' : ''} sans mesure décrite`)

  return {
    tranchees,
    ecarteesSansMotif,
    applicablesSansMesure,
    motif:
      morceaux.length === 0
        ? "Les quatorze exigences de l'annexe I partie I sont tranchées et motivées. L'évaluation doit être tenue à jour pendant toute la période de support (art. 13 §2 alinéa 2), pas seulement à la mise sur le marché."
        : `${morceaux.join(', ')}. L'article 13 §2 exige que l'évaluation identifie les exigences applicables **et justifie** celles qui ne le sont pas : une exigence écartée sans motif écrit est une non-conformité, pas une exigence écartée.`,
  }
}

// ---------------------------------------------------------------------------
// Déclaration UE de conformité — CRA, annexe V
// ---------------------------------------------------------------------------

/**
 * Le contenu est fixé par l'annexe V, huit points. C'est le document le plus
 * court du règlement et le plus facile à produire — et pourtant celui sans
 * lequel le marquage CE ne peut pas être apposé.
 *
 * Le point 3 mérite d'être lu deux fois : la déclaration est établie « sous la
 * seule responsabilité du fabricant ». Aucun organisme notifié, aucun
 * consultant, aucun outil ne partage cette responsabilité — ce site pas
 * davantage.
 */
export type Declaration = {
  id: string
  suivi: Suivi
  /** Annexe V §1. */
  produit: string
  typeLot: string
  /** Annexe V §2. */
  fabricant: string
  adresse: string
  mandataire: string
  /** Annexe V §4 — identification permettant la traçabilité. */
  objet: string
  /** Annexe V §6. */
  normes: string
  /** Annexe V §7 — organisme notifié, si la catégorie l'impose. */
  organismeNotifie: string
  numeroOrganisme: string
  procedure: string
  certificat: string
  /** Annexe V §8. */
  lieu: string
  date: string
  signataire: string
  fonction: string
  /** Les autres actes d'harmonisation couverts par la même déclaration. */
  autresActes: string
}

export function declarationVide(id: string): Declaration {
  return {
    id,
    suivi: suiviVide(),
    produit: '',
    typeLot: '',
    fabricant: '',
    adresse: '',
    mandataire: '',
    objet: '',
    normes: '',
    organismeNotifie: '',
    numeroOrganisme: '',
    procedure: '',
    certificat: '',
    lieu: '',
    date: '',
    signataire: '',
    fonction: '',
    autresActes: '',
  }
}

/**
 * Les mentions dues. L'organisme notifié n'est exigé que pour les catégories
 * qui ferment l'auto-évaluation, d'où le paramètre : l'imposer partout ferait
 * apparaître un manque là où il n'y en a pas.
 */
export function mentionsDeclaration(d: Declaration, organismeRequis: boolean): Mention[] {
  const m: Mention[] = [
    { champ: 'Nom et type du produit', article: 'annexe V §1', valeur: d.produit },
    { champ: 'Identification du lot ou du numéro de série', article: 'annexe V §1', valeur: d.typeLot },
    { champ: 'Nom du fabricant', article: 'annexe V §2', valeur: d.fabricant },
    { champ: 'Adresse du fabricant', article: 'annexe V §2', valeur: d.adresse },
    { champ: 'Objet de la déclaration', article: 'annexe V §4', valeur: d.objet },
    { champ: 'Normes harmonisées ou spécifications appliquées', article: 'annexe V §6', valeur: d.normes },
    { champ: 'Lieu de signature', article: 'annexe V §8', valeur: d.lieu },
    { champ: 'Date de signature', article: 'annexe V §8', valeur: d.date },
    { champ: 'Nom du signataire', article: 'annexe V §8', valeur: d.signataire },
    { champ: 'Fonction du signataire', article: 'annexe V §8', valeur: d.fonction },
  ]
  if (organismeRequis) {
    m.push({ champ: 'Nom de l’organisme notifié', article: 'annexe V §7', valeur: d.organismeNotifie })
    m.push({ champ: 'Numéro de l’organisme notifié', article: 'annexe V §7', valeur: d.numeroOrganisme })
    m.push({ champ: 'Procédure d’évaluation suivie', article: 'annexe V §7', valeur: d.procedure })
    m.push({ champ: 'Référence du certificat', article: 'annexe V §7', valeur: d.certificat })
  }
  return m
}

export const completudeDeclaration = (d: Declaration, organismeRequis: boolean) =>
  part(mentionsDeclaration(d, organismeRequis))
export const champsManquantsDeclaration = (d: Declaration, organismeRequis: boolean) =>
  manquants(mentionsDeclaration(d, organismeRequis))

/** Le texte de la déclaration, tel qu'il doit être signé. */
export function rendreDeclaration(d: Declaration, organismeRequis: boolean): string {
  // Les lignes conditionnelles valent `null` et non `''` : filtrer sur la
  // chaîne vide écraserait aussi les lignes de séparation, et la déclaration
  // sortirait en un seul bloc illisible.
  const lignes: (string | null)[] = [
    'DÉCLARATION UE DE CONFORMITÉ',
    '',
    `1. Produit : ${d.produit || '[nom et type]'}`,
    d.typeLot ? `   Identification : ${d.typeLot}` : '   Identification : [lot ou numéro de série]',
    '',
    `2. Fabricant : ${d.fabricant || '[raison sociale]'}`,
    `   Adresse : ${d.adresse || '[adresse postale complète]'}`,
    d.mandataire ? `   Mandataire : ${d.mandataire}` : null,
    '',
    "3. La présente déclaration de conformité est établie sous la seule responsabilité du fabricant.",
    '',
    `4. Objet de la déclaration : ${d.objet || '[identification permettant la traçabilité du produit]'}`,
    '',
    "5. L'objet de la déclaration décrit ci-dessus est conforme au règlement (UE) 2024/2847 du Parlement européen et du Conseil du 23 octobre 2024 relatif à des exigences horizontales de cybersécurité pour les produits comportant des éléments numériques.",
    d.autresActes ? `   Il est également conforme à : ${d.autresActes}` : null,
    '',
    `6. Références des normes harmonisées ou des spécifications appliquées : ${
      d.normes || '[références complètes, avec date]'
    }`,
    '',
    organismeRequis
      ? `7. L'organisme notifié ${d.organismeNotifie || '[nom]'} (numéro ${
          d.numeroOrganisme || '[XXXX]'
        }) a réalisé ${d.procedure || '[procédure d’évaluation de la conformité]'} et a délivré le certificat ${
          d.certificat || '[référence]'
        }.`
      : "7. Sans objet : la catégorie du produit permet le contrôle interne de la production (module A de l'annexe VIII).",
    '',
    '8. Signé par et au nom de :',
    // La date sort en toutes lettres : c'est une pièce signée, pas un export
    // technique, et « 2027-11-02 » sur une déclaration de conformité fait
    // amateur.
    `   ${d.lieu || '[lieu]'}, le ${d.date ? jour(d.date) : '[date]'}`,
    `   ${d.signataire || '[nom]'} — ${d.fonction || '[fonction]'}`,
    '',
    '   Signature :',
  ]
  return lignes.filter((l) => l !== null).join('\n')
}
