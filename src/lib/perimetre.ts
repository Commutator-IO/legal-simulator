/**
 * Quels textes vous concernent.
 *
 * L'erreur la plus coûteuse en conformité européenne n'est pas de mal
 * appliquer un règlement : c'est d'en ignorer un. Une équipe qui connaît
 * parfaitement le RGPD peut passer trois ans sans savoir que son produit
 * portera un marquage CE de cybersécurité au 11 décembre 2027.
 *
 * Ce module réduit un profil d'activité à une liste de textes, chacun rattaché
 * à la réponse qui le déclenche. La règle tenue partout : **on ne retire
 * jamais un texte sur une réponse incertaine**. Un faux positif coûte une
 * lecture ; un faux négatif coûte le dossier.
 */

export type Profil = {
  donneesPersonnelles: boolean
  traceurs: boolean
  /** Utilise, intègre ou fournit un système d'IA — y compris acheté sur étagère. */
  ia: boolean
  /** Entraîne ou publie un modèle à usage général. */
  modeleIa: boolean
  /** Met sur le marché un logiciel, un objet connecté ou un firmware. */
  produitNumerique: boolean
  /** Objet connecté générant des données d'usage. */
  objetConnecte: boolean
  /** Fournit de l'IaaS, du PaaS ou du SaaS. */
  serviceCloud: boolean
  /** Relève d'un secteur des annexes I ou II de NIS 2. */
  secteurNis2: boolean
  /** Entité financière au sens de DORA, ou prestataire informatique d'une telle entité. */
  finance: boolean
  /** Héberge ou diffuse des contenus de tiers. */
  plateforme: boolean
  /** Vend en ligne à des consommateurs, ou fournit un service visé par l'accessibilité. */
  grandPublic: boolean
  /** Sous les seuils de la micro-entreprise (< 10 personnes et ≤ 2 M€). */
  microEntreprise: boolean
}

export const PROFIL_VIDE: Profil = {
  donneesPersonnelles: false,
  traceurs: false,
  ia: false,
  modeleIa: false,
  produitNumerique: false,
  objetConnecte: false,
  serviceCloud: false,
  secteurNis2: false,
  finance: false,
  plateforme: false,
  grandPublic: false,
  microEntreprise: false,
}

export const QUESTIONS: {
  id: keyof Profil
  label: string
  aide: string
}[] = [
  {
    id: 'donneesPersonnelles',
    label: 'Nous traitons des données de personnes situées dans l’Union',
    aide: "Y compris les seules données de vos propres salariés, et y compris si vous n'êtes pas établis dans l'Union.",
  },
  {
    id: 'traceurs',
    label: 'Notre site ou notre application dépose des traceurs',
    aide: 'Cookies, pixels, empreintes de navigateur, identifiants publicitaires, mesure d’audience.',
  },
  {
    id: 'ia',
    label: 'Nous utilisons ou intégrons un système d’intelligence artificielle',
    aide: "Un assistant conversationnel acheté sur étagère compte. C'est le cas le plus fréquemment sous-estimé.",
  },
  {
    id: 'modeleIa',
    label: 'Nous entraînons ou publions un modèle à usage général',
    aide: "Modèle de fondation, modèle affiné et redistribué sous votre nom. L'ajustement fin peut vous faire endosser le rôle de fournisseur.",
  },
  {
    id: 'produitNumerique',
    label: 'Nous mettons sur le marché un logiciel ou un produit connecté',
    aide: "Logiciel vendu ou distribué, micrologiciel, objet communicant. Le logiciel libre développé hors activité commerciale reste hors champ du CRA.",
  },
  {
    id: 'objetConnecte',
    label: 'Nos produits génèrent des données d’usage',
    aide: "Capteurs, télémétrie, journaux d'utilisation renvoyés au fabricant.",
  },
  {
    id: 'serviceCloud',
    label: 'Nous fournissons un service d’informatique en nuage',
    aide: 'Infrastructure, plateforme ou logiciel en tant que service, quelle que soit la taille.',
  },
  {
    id: 'secteurNis2',
    label: 'Nous relevons d’un secteur listé par NIS 2',
    aide: "Énergie, transports, banque, santé, eau, infrastructure numérique, informatique en nuage, services gérés, espace, postes, déchets, alimentation, fabrication, places de marché, moteurs de recherche, réseaux sociaux, recherche.",
  },
  {
    id: 'finance',
    label: 'Nous sommes une entité financière, ou son prestataire informatique',
    aide: 'Banque, assurance, société de gestion, prestataire de services sur crypto-actifs, et leurs fournisseurs de services informatiques.',
  },
  {
    id: 'plateforme',
    label: 'Nous hébergeons ou diffusons des contenus de tiers',
    aide: 'Hébergement, place de marché, réseau social, espace de commentaires, forum.',
  },
  {
    id: 'grandPublic',
    label: 'Nous vendons en ligne à des consommateurs',
    aide: 'Commerce électronique, banque de détail, livres numériques, billetterie de transport, communications électroniques.',
  },
  {
    id: 'microEntreprise',
    label: 'Nous sommes une micro-entreprise',
    aide: 'Moins de dix personnes et chiffre d’affaires annuel n’excédant pas 2 M€. Ouvre quelques exemptions, jamais celle du RGPD.',
  },
]

export type Applicable = {
  texte: string
  /** Pourquoi ce texte sort, dans les termes de la réponse qui l'a déclenché. */
  raison: string
  /** `certain` : le texte s'applique. `probable` : à vérifier au cas d'espèce. */
  degre: 'certain' | 'probable'
}

export function perimetre(p: Profil): Applicable[] {
  const out: Applicable[] = []
  const ajouter = (texte: string, raison: string, degre: 'certain' | 'probable' = 'certain') => {
    if (!out.some((a) => a.texte === texte)) out.push({ texte, raison, degre })
  }
  /** Nuance apportée à un texte déjà retenu — une exemption, en général. */
  const preciser = (texte: string, ajout: string) => {
    const a = out.find((x) => x.texte === texte)
    if (a) a.raison += ` ${ajout}`
  }

  if (p.donneesPersonnelles) {
    ajouter(
      'rgpd',
      "Vous traitez des données personnelles. Aucun seuil d'effectif n'écarte le règlement : l'exemption de registre de l'article 30 §5 est étroite et tombe dès que le traitement est régulier, ce qui est le cas de la paie.",
    )
  }
  if (p.traceurs) {
    ajouter(
      'eprivacy',
      "Vous écrivez ou lisez des informations sur le terminal de l'utilisateur. La directive s'applique même quand ces informations ne sont pas personnelles, et prime sur le RGPD pour l'acte de dépôt.",
    )
  }

  if (p.ia) {
    ajouter(
      'ai-act',
      "Vous utilisez un système d'IA. Même à risque minimal, l'obligation de maîtrise de l'IA de l'article 4 s'applique depuis le 2 février 2025, et l'article 50 depuis le 2 août 2026 dès que le système parle à des personnes ou produit du contenu.",
    )
  }
  if (p.modeleIa) {
    ajouter(
      'ai-act',
      "Vous fournissez un modèle à usage général : documentation technique, politique de droit d'auteur et résumé des données d'entraînement sont dus au titre des articles 53 et suivants.",
    )
  }

  if (p.produitNumerique) {
    ajouter(
      'cra',
      "Vous mettez sur le marché un produit comportant des éléments numériques : exigences essentielles de sécurité, période de support annoncée et marquage CE au 11 décembre 2027, mais signalement des vulnérabilités exploitées dès le 11 septembre 2026.",
    )
    ajouter(
      'pld',
      "Le nouveau régime de responsabilité du fait des produits qualifie explicitement le logiciel de produit, et regarde une vulnérabilité non corrigée comme un défaut possible.",
    )
  }
  if (p.objetConnecte) {
    ajouter(
      'data-act',
      "Vos produits génèrent des données : l'utilisateur y a droit d'accès, et peut les faire transmettre à un tiers de son choix. Ceux mis sur le marché après le 12 septembre 2026 doivent en outre être conçus pour cela.",
    )
    ajouter(
      'machines',
      "À vérifier : si le produit est une machine ou un produit connexe, le règlement (UE) 2023/1230 s'applique au 20 janvier 2027 et peut faire basculer un composant logiciel dans le haut risque de l'AI Act.",
      'probable',
    )
  }
  if (p.serviceCloud) {
    ajouter(
      'data-act',
      "Vous fournissez un service de traitement de données : obligations de changement de fournisseur, préavis, équivalence fonctionnelle, et suppression totale des frais de transfert au 12 janvier 2027.",
    )
    ajouter(
      'nis2',
      "L'informatique en nuage figure à l'annexe I de NIS 2 comme infrastructure numérique. À confronter aux seuils de taille du droit national de transposition.",
      'probable',
    )
  }

  if (p.secteurNis2) {
    ajouter(
      'nis2',
      "Votre secteur figure aux annexes de la directive. Vérifiez la loi de transposition de chaque État membre où vous êtes établi : c'est elle qui fixe les seuils et l'autorité compétente.",
    )
  }
  if (p.finance) {
    ajouter(
      'dora',
      "DORA prime sur NIS 2 pour les entités financières (art. 4 de NIS 2, principe de lex specialis). Le registre d'information des prestataires tiers est remis chaque année.",
    )
  }

  if (p.plateforme) {
    ajouter(
      'dsa',
      "Vous hébergez des contenus de tiers : mécanisme de notification et action, motivation des décisions de modération, transparence de la publicité.",
    )
    if (p.microEntreprise) {
      preciser(
        'dsa',
        "En tant que micro-entreprise, vous êtes exempté des obligations propres aux plateformes en ligne (art. 19), mais pas de celles des services d'hébergement.",
      )
    }
  }
  if (p.grandPublic) {
    ajouter(
      'eaa',
      "Vos services relèvent de la directive accessibilité, applicable depuis le 28 juin 2025. La norme EN 301 549 donne la présomption de conformité, et renvoie aux WCAG 2.1 niveau AA pour le web.",
      p.microEntreprise ? 'probable' : 'certain',
    )
    if (p.microEntreprise) {
      preciser(
        'eaa',
        "Les micro-entreprises fournissant des services sont exemptées (art. 4 §5) — mais pas celles qui fabriquent des produits.",
      )
    }
  }

  // Le DMA ne crée d'obligations que pour les contrôleurs d'accès désignés,
  // que personne ne devient sans le savoir. On le mentionne uniquement à ceux
  // qui vivent sur ces plateformes, parce qu'ils en tirent des droits — c'est
  // pour eux un levier, pas une charge.
  if (p.plateforme || p.grandPublic) {
    ajouter(
      'dma',
      "Vous n'êtes vraisemblablement pas contrôleur d'accès, mais vous êtes probablement entreprise utilisatrice de l'un d'eux : le règlement vous ouvre des droits — accès aux données que vous générez, refus du couplage de services, liberté de proposer d'autres conditions ailleurs.",
      'probable',
    )
  }

  return out
}

/** Les textes que personne ne doit ignorer, quel que soit le profil. */
export function socleCommun(): string[] {
  return ['rgpd', 'ai-act', 'cra']
}
