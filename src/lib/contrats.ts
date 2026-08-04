/**
 * Le contrat de sous-traitance — article 28 §3.
 *
 * Huit mentions, et le règlement dit « notamment » : ce n'est donc pas un
 * plafond. La raison d'en faire une liste à cocher plutôt qu'un paragraphe :
 * les conditions générales d'un fournisseur cloud contiennent presque toujours
 * six mentions sur huit, et il faut savoir lesquelles manquent — le plus
 * souvent l'assistance aux demandes d'exercice de droits et le choix entre
 * suppression et restitution en fin de contrat.
 */

import type { Suivi } from './suivi'
import { suiviVide } from './suivi'

export const MENTIONS_28 = [
  {
    id: 'instructions',
    lettre: 'a',
    titre: 'Traitement sur instruction documentée',
    note: "Y compris pour les transferts hors Union. Le sous-traitant doit informer le responsable s'il estime qu'une instruction viole le règlement.",
  },
  {
    id: 'confidentialite',
    lettre: 'b',
    titre: 'Engagement de confidentialité des personnes autorisées',
    note: 'Contractuel ou légal, et nominatif au niveau des habilitations.',
  },
  {
    id: 'securite',
    lettre: 'c',
    titre: 'Mesures de sécurité de l’article 32',
    note: "Décrites, pas seulement promises. Un renvoi à une page web modifiable unilatéralement ne vaut pas engagement.",
  },
  {
    id: 'ulterieurs',
    lettre: 'd',
    titre: 'Encadrement des sous-traitants ultérieurs',
    note: "Autorisation écrite préalable, spécifique ou générale, et information préalable de tout changement laissant au responsable la possibilité de s'y opposer.",
  },
  {
    id: 'droits',
    lettre: 'e',
    titre: 'Assistance à l’exercice des droits des personnes',
    note: "Par des mesures techniques et organisationnelles appropriées. C'est l'une des deux mentions les plus souvent absentes des conditions générales.",
  },
  {
    id: 'assistance',
    lettre: 'f',
    titre: 'Assistance à la sécurité, aux violations et aux analyses d’impact',
    note: "Articles 32 à 36 : notification sans délai des violations au responsable, contribution aux AIPD et aux consultations préalables.",
  },
  {
    id: 'sort',
    lettre: 'g',
    titre: 'Sort des données en fin de prestation',
    note: "Suppression ou restitution, **au choix du responsable**, et destruction des copies. L'autre mention le plus souvent absente — ou rédigée au choix du sous-traitant, ce qui ne satisfait pas l'article.",
  },
  {
    id: 'audit',
    lettre: 'h',
    titre: 'Mise à disposition des informations et audits',
    note: "Y compris les inspections, réalisées par le responsable ou un auditeur qu'il mandate. Un rapport de certification peut y contribuer, il ne le remplace pas de plein droit.",
  },
]

export type Contrat = {
  id: string
  suivi: Suivi
  /** Le sous-traitant, ou le client si l'on est soi-même sous-traitant. */
  partie: string
  /** `sous-traitant` : nous sommes responsable. `client` : nous sommes sous-traitant. */
  position: 'nous-responsable' | 'nous-sous-traitant'
  objet: string
  reference: string
  dateSignature: string
  /** Identifiants des mentions vérifiées comme présentes. */
  mentionsPresentes: string[]
  /** Où se trouve chaque mention, quand elle est éparpillée dans plusieurs annexes. */
  localisation: string
  reserves: string
}

export function contratVide(id: string): Contrat {
  return {
    id,
    suivi: suiviVide(),
    partie: '',
    position: 'nous-responsable',
    objet: '',
    reference: '',
    dateSignature: '',
    mentionsPresentes: [],
    localisation: '',
    reserves: '',
  }
}

export type VerdictContrat = {
  conforme: boolean
  manquantes: { lettre: string; titre: string }[]
  motif: string
}

/**
 * Les huit mentions sont cumulatives : sept sur huit ne vaut pas 87 % de
 * conformité, cela vaut un contrat non conforme. D'où un verdict binaire, et
 * non une jauge — une jauge inviterait à se satisfaire d'un bon score.
 */
export function verdictContrat(c: Contrat): VerdictContrat {
  const manquantes = MENTIONS_28.filter((m) => !c.mentionsPresentes.includes(m.id)).map(
    (m) => ({ lettre: m.lettre, titre: m.titre }),
  )

  if (manquantes.length === 0) {
    return {
      conforme: true,
      manquantes,
      motif:
        "Les huit mentions de l'article 28 §3 sont présentes. Le « notamment » du texte laisse la porte ouverte à d'autres clauses nécessaires selon le traitement — localisation des données, réversibilité, niveaux de service sur les demandes de droits.",
    }
  }

  return {
    conforme: false,
    manquantes,
    motif: `${manquantes.length} mention${manquantes.length > 1 ? 's' : ''} sur huit ${
      manquantes.length > 1 ? 'manquent' : 'manque'
    } : ${manquantes.map((m) => `${m.lettre}) ${m.titre.toLowerCase()}`).join(' ; ')}. Les mentions sont cumulatives — le contrat n'est pas conforme à l'article 28 §3, et le responsable de traitement engage sa propre responsabilité en confiant des données sur cette base.`,
  }
}
