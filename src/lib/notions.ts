/**
 * Le mode d'emploi du droit de l'Union, pour quelqu'un qui conçoit des
 * systèmes et n'a pas à devenir juriste.
 *
 * Ces huit notions ne sont pas de la culture générale : chacune a été retenue
 * parce que **la méconnaître produit une erreur de conception coûteuse**, et
 * l'exemple joint dit laquelle. Un architecte qui les tient peut lire un
 * règlement seul, discuter avec un juriste sans traducteur, et surtout savoir
 * quand il doit en appeler un.
 */

export type Notion = {
  id: string
  titre: string
  /** L'idée en une phrase, telle qu'on la redirait à un collègue. */
  resume: string
  /** L'explication, en langage d'ingénieur. */
  detail: string
  /** L'erreur concrète que la notion évite. */
  erreur: string
}

export const NOTIONS: Notion[] = [
  {
    id: 'reglement-directive',
    titre: 'Règlement ou directive',
    resume:
      "Un règlement s'applique tel quel dans les vingt-sept États ; une directive ne lie que l'État, qui doit la transposer.",
    detail:
      "C'est la première chose à regarder sur la fiche d'un texte, parce qu'elle décide de ce qu'il faut lire ensuite. Pour un règlement — RGPD, AI Act, CRA, Data Act, DORA — le texte européen est directement opposable : vous pouvez concevoir dessus. Pour une directive — NIS 2, accessibilité, responsabilité du fait des produits —, ce qui vous est opposable est la **loi nationale de transposition**, qui peut être plus stricte, arriver en retard, et différer d'un pays à l'autre.",
    erreur:
      "Concevoir un service paneuropéen sur le texte de NIS 2 en croyant qu'il dit la même chose partout : les seuils d'assujettissement et les autorités compétentes sont fixés par chaque loi nationale.",
  },
  {
    id: 'vigueur-application',
    titre: 'Entrée en vigueur ou date d’application',
    resume:
      "Un texte peut être en vigueur depuis deux ans sans qu'aucune de ses obligations ne soit encore exigible.",
    detail:
      "L'entrée en vigueur fait exister le texte ; la date d'application le rend opposable, et il y en a souvent plusieurs, par blocs d'articles. L'AI Act est en vigueur depuis le 1ᵉʳ août 2024, mais ses obligations sur les systèmes à haut risque de l'annexe III ne mordront qu'au 2 décembre 2027 — tandis que ses pratiques interdites mordent depuis février 2025.",
    erreur:
      "Lire « l'AI Act a été repoussé » et en conclure qu'il n'y a rien à faire. Le report de l'omnibus n'a touché ni les pratiques interdites, ni la maîtrise de l'IA, ni les modèles à usage général, ni la transparence de l'article 50 — tous applicables aujourd'hui.",
  },
  {
    id: 'roles',
    titre: 'Le rôle décide de la charge',
    resume:
      "Le même système impose des obligations très différentes selon que vous le fournissez ou que vous l'utilisez.",
    detail:
      "Chaque texte définit ses rôles, et c'est la question qu'il faut trancher avant toute autre. L'AI Act oppose **fournisseur** — qui met le système sur le marché sous son nom et porte l'essentiel de la charge — et **déployeur**, qui l'utilise. Le RGPD oppose **responsable de traitement**, qui détermine les finalités, et **sous-traitant**, qui exécute. Le CRA parle de **fabricant**, importateur, distributeur. Les rôles se cumulent : une même société est responsable pour sa paie et sous-traitante pour ses clients.",
    erreur:
      "Oublier l'article 25 de l'AI Act : un déployeur qui modifie substantiellement un système, ou l'exploite sous sa propre marque, **devient fournisseur** — et hérite de la totalité du chapitre III. Un simple réglage fin peut suffire.",
  },
  {
    id: 'annexes-normes',
    titre: 'Les annexes et les normes harmonisées',
    resume:
      "Le corps du texte pose les principes ; le détail exécutable est dans les annexes et dans les normes.",
    detail:
      "Un règlement européen dit rarement comment faire. Il fixe des **exigences essentielles** — annexe I du CRA, chapitre III de l'AI Act — et renvoie à des **normes harmonisées** publiées au journal officiel. Appliquer intégralement une norme harmonisée donne la **présomption de conformité** : la charge de la preuve s'inverse. C'est le chemin le moins cher, et la raison pour laquelle il faut savoir si la norme de votre domaine existe déjà.",
    erreur:
      "Bâtir un dossier de conformité maison alors qu'une norme harmonisée couvre le sujet — trois fois plus de travail, et une présomption qu'on n'a pas. À l'inverse, promettre une norme qui n'est pas encore publiée : c'est le cas de plusieurs normes CRA et IA.",
  },
  {
    id: 'marquage-ce',
    titre: 'Le marquage CE appliqué au logiciel',
    resume:
      "Le CRA fait entrer le logiciel dans la mécanique du droit des produits : conformité avant mise sur le marché.",
    detail:
      "Jusqu'ici, un logiciel se corrigeait après. Le droit des produits fonctionne autrement : évaluation de la conformité, déclaration UE, marquage CE **avant** la mise sur le marché — et pour certaines catégories, un organisme notifié tiers. La conséquence de calendrier est brutale : la disponibilité de ces organismes devient le facteur limitant, pas votre documentation.",
    erreur:
      "Découvrir six mois avant la date que le produit relève de la classe II, où l'auto-évaluation est fermée, et qu'aucun organisme notifié n'a de créneau.",
  },
  {
    id: 'accountability',
    titre: 'La documentation *est* l’obligation',
    resume:
      "Le principe de responsabilité renverse la charge de la preuve : être conforme sans pouvoir le démontrer ne vaut rien.",
    detail:
      "L'article 5 §2 du RGPD, l'article 17 de l'AI Act et l'article 13 du CRA disent la même chose de trois façons. En pratique, un contrôle ne regarde pas votre code : il demande vos registres, vos analyses, vos décisions et leurs dates. Un système impeccable sans dossier se défend moins bien qu'un système imparfait dont les écarts sont constatés, motivés et planifiés.",
    erreur:
      "Traiter la documentation comme un livrable de fin de projet. Les données d'entraînement, les décisions de conception écartées et les motifs de non-notification ne se reconstituent pas après coup.",
  },
  {
    id: 'lex-specialis',
    titre: 'Les textes s’empilent, et le spécial l’emporte',
    resume:
      "Plusieurs règlements s'appliquent en même temps ; quand deux se recouvrent, le plus spécial prime.",
    detail:
      "Un éditeur de logiciel financier traitant des données personnelles relève simultanément du RGPD, du CRA, de DORA et peut-être de l'AI Act. Ils ne se remplacent pas : ils se cumulent. La règle du spécial ne joue qu'entre textes visant la même chose — DORA prime sur NIS 2 pour les entités financières, la réglementation sectorielle prime sur le CRA pour les dispositifs médicaux. Une exclusion ne signifie donc jamais l'absence d'obligation, mais un régime qui prend le relais, en général plus exigeant.",
    erreur:
      "Conclure d'une exclusion du CRA qu'il n'y a rien à faire côté sécurité produit, alors que le règlement sectoriel qui s'y substitue demande davantage.",
  },
  {
    id: 'sanctions',
    titre: 'Pourquoi la direction écoute',
    resume:
      "Les plafonds sont exprimés en pourcentage du chiffre d'affaires **mondial**, pas du chiffre d'affaires du produit.",
    detail:
      "7 % pour une pratique interdite par l'AI Act, 4 % pour le RGPD, 2,5 % pour les exigences essentielles du CRA, 6 % pour le DSA — calculés sur le chiffre d'affaires mondial du groupe. C'est ce qui explique qu'un sujet de conception devienne un sujet de comité de direction, et c'est l'argument à sortir quand un arbitrage technique se heurte à un budget. NIS 2 ajoute une **responsabilité personnelle des dirigeants** sur l'approbation des mesures.",
    erreur:
      "Présenter un chantier de conformité comme un coût technique. Chiffré en risque, il change de nature — et de sponsor.",
  },
]
