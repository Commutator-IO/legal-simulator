/**
 * L'accessibilité — directive (UE) 2019/882 et norme EN 301 549.
 *
 * Applicable depuis le 28 juin 2025, et le seul texte de ce site dont
 * l'obligation se vérifie de l'extérieur, par n'importe qui, en quelques
 * minutes. C'est ce qui en fait le risque contentieux le plus immédiat — et la
 * raison d'offrir une grille plutôt qu'une simple fiche.
 *
 * La directive pose des exigences fonctionnelles ; la norme harmonisée
 * EN 301 549 donne la présomption de conformité et renvoie, pour le web, aux
 * WCAG 2.1 niveau AA. On travaille donc sur les quatre principes des WCAG, qui
 * sont ce que les auditeurs utilisent réellement.
 */

import type { Suivi } from './suivi'
import { suiviVide } from './suivi'

export const PRINCIPES = [
  {
    id: 'perceptible',
    titre: 'Perceptible',
    note: "Alternatives textuelles, sous-titres, contraste d'au moins 4,5:1, contenu qui survit à un agrandissement à 200 %, information jamais portée par la seule couleur.",
  },
  {
    id: 'utilisable',
    titre: 'Utilisable',
    note: "Tout au clavier sans piège de focus, délais ajustables, pas de contenu clignotant à risque, ordre de tabulation cohérent, cibles tactiles suffisantes.",
  },
  {
    id: 'comprehensible',
    titre: 'Compréhensible',
    note: "Langue déclarée, navigation prévisible, erreurs de saisie identifiées et expliquées en texte, étiquettes présentes sur chaque champ.",
  },
  {
    id: 'robuste',
    titre: 'Robuste',
    note: "Balisage valide, rôles et états exposés aux technologies d'assistance, messages de statut annoncés. C'est le principe qui casse en premier sur une application à composants.",
  },
]

export type NiveauConformite = 'non-evalue' | 'non-conforme' | 'partiel' | 'conforme'

export const NIVEAUX_CONFORMITE: { id: NiveauConformite; label: string }[] = [
  { id: 'non-evalue', label: 'Non évalué' },
  { id: 'non-conforme', label: 'Non conforme' },
  { id: 'partiel', label: 'Partiellement conforme' },
  { id: 'conforme', label: 'Conforme' },
]

export type Audit = {
  id: string
  suivi: Suivi
  service: string
  /** Périmètre audité : les pages ou parcours réellement testés. */
  perimetre: string
  dateAudit: string
  /** Auditeur interne ou externe — la directive n'impose pas de tiers. */
  auditeur: string
  /** Principe → niveau atteint. */
  principes: Record<string, NiveauConformite>
  /** Écarts constatés, un par ligne. */
  ecarts: string
  /** Plan de correction daté : c'est lui qui rend une non-conformité tolérable. */
  planCorrection: string
  /** Charge disproportionnée invoquée (art. 14), et son évaluation documentée. */
  chargeDisproportionnee: string
}

export function auditVide(id: string): Audit {
  return {
    id,
    suivi: suiviVide(),
    service: '',
    perimetre: '',
    dateAudit: '',
    auditeur: '',
    principes: Object.fromEntries(PRINCIPES.map((p) => [p.id, 'non-evalue'])),
    ecarts: '',
    planCorrection: '',
    chargeDisproportionnee: '',
  }
}

export type VerdictAudit = {
  niveau: NiveauConformite
  motif: string
}

/**
 * Le niveau global est celui du **maillon le plus faible**, jamais une moyenne.
 *
 * Un service parfaitement perceptible mais inutilisable au clavier est
 * inaccessible : la personne concernée ne peut pas s'en servir, et le fait que
 * trois principes sur quatre soient tenus ne lui rend aucun service. Une
 * moyenne afficherait 75 % et laisserait croire à une conformité presque
 * atteinte.
 */
export function verdictAudit(a: Audit): VerdictAudit {
  const niveaux = PRINCIPES.map((p) => a.principes[p.id] ?? 'non-evalue')

  if (niveaux.some((n) => n === 'non-evalue')) {
    const restants = PRINCIPES.filter((p) => (a.principes[p.id] ?? 'non-evalue') === 'non-evalue')
    return {
      niveau: 'non-evalue',
      motif: `${restants.length} principe${restants.length > 1 ? 's' : ''} non évalué${
        restants.length > 1 ? 's' : ''
      } : ${restants.map((p) => p.titre.toLowerCase()).join(', ')}. Une déclaration d'accessibilité ne peut pas être publiée sur une évaluation partielle.`,
    }
  }

  if (niveaux.some((n) => n === 'non-conforme')) {
    const faibles = PRINCIPES.filter((p) => a.principes[p.id] === 'non-conforme')
    return {
      niveau: 'non-conforme',
      motif: `Non conforme sur : ${faibles
        .map((p) => p.titre.toLowerCase())
        .join(', ')}. Le niveau global est celui du maillon le plus faible — un service inutilisable au clavier est inaccessible, quel que soit le soin apporté au reste. Le plan de correction daté est ce qui rend la situation défendable en attendant.`,
    }
  }

  if (niveaux.some((n) => n === 'partiel')) {
    return {
      niveau: 'partiel',
      motif:
        "Partiellement conforme. La déclaration d'accessibilité doit énumérer les contenus non conformes et le motif — non-conformité, charge disproportionnée au sens de l'article 14, ou contenu hors champ.",
    }
  }

  return {
    niveau: 'conforme',
    motif:
      "Conforme aux quatre principes. La présomption de conformité tient tant que la norme EN 301 549 n'évolue pas et que le service ne change pas : datez la déclaration et fixez la prochaine revue.",
  }
}
