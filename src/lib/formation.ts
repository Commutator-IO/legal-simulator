/**
 * Le journal de maîtrise de l'IA — AI Act, article 4.
 *
 * L'obligation la plus ancienne du règlement — applicable depuis le 2 février
 * 2025 — et la plus souvent manquée, pour une raison précise : elle ne produit
 * spontanément aucun document. Un système à haut risque laisse derrière lui une
 * documentation technique ; une équipe formée ne laisse rien, sauf si on tient
 * le registre.
 *
 * Le texte ne fixe ni programme ni durée : il demande un niveau « suffisant »,
 * apprécié au regard des connaissances des personnes, du contexte d'usage et
 * des personnes sur lesquelles le système est utilisé. Le journal doit donc
 * porter le raisonnement d'adéquation, pas seulement une liste de présents.
 */

import type { Suivi } from './suivi'
import { suiviVide } from './suivi'

export const PUBLICS = [
  {
    id: 'utilisateurs',
    label: 'Utilisateurs opérationnels',
    note: "Ceux qui exploitent le système au quotidien. Doivent savoir lire une sortie, reconnaître un cas limite et savoir à qui remonter un doute.",
  },
  {
    id: 'superviseurs',
    label: 'Personnes chargées du contrôle humain',
    note: "Art. 14 et 26 §2 : compétence, formation *et* autorité pour écarter la sortie du système. Le niveau attendu est nettement supérieur.",
  },
  {
    id: 'concepteurs',
    label: 'Équipes de conception et de développement',
    note: 'Gouvernance des données, biais, robustesse, journalisation.',
  },
  {
    id: 'direction',
    label: 'Direction et fonctions support',
    note: "Ce qui engage l'organisation : rôles de fournisseur et de déployeur, pratiques interdites, échéances.",
  },
]

export type Session = {
  id: string
  suivi: Suivi
  intitule: string
  date: string
  /** Identifiants des publics visés. */
  publics: string[]
  /** Systèmes concernés — renvoi vers l'inventaire. */
  systemes: string
  contenu: string
  /** Pourquoi ce contenu est suffisant pour ce public et ce contexte d'usage. */
  adequation: string
  /** Nombre de participants, ou la liste si elle tient. */
  participants: string
  /** Où sont conservés les émargements. */
  preuve: string
}

export function sessionVide(id: string): Session {
  return {
    id,
    suivi: suiviVide(),
    intitule: '',
    date: '',
    publics: [],
    systemes: '',
    contenu: '',
    adequation: '',
    participants: '',
    preuve: '',
  }
}

/**
 * Les publics qu'aucune session n'a couverts.
 *
 * C'est le seul indicateur utile de ce journal : une organisation qui a formé
 * trois fois ses développeurs et jamais ses superviseurs n'a pas satisfait
 * l'article 4, quel que soit le nombre de sessions tenues.
 */
export function publicsNonCouverts(sessions: Session[]): string[] {
  const couverts = new Set(sessions.flatMap((s) => s.publics))
  return PUBLICS.filter((p) => !couverts.has(p.id)).map((p) => p.label)
}
