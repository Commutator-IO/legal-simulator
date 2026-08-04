/**
 * Le corpus : un texte de l'Union par entrée, avec ce qu'il faut pour décider
 * s'il vous concerne et où aller vérifier.
 *
 * Une règle tenue partout dans ce fichier : **rien n'est affirmé sans être
 * rattaché à un article**. Un site de conformité qui résume sans référencer
 * fabrique de la fausse assurance — le lecteur croit savoir, et ne peut rien
 * opposer à un contrôleur. Chaque obligation citée porte donc son numéro
 * d'article, et chaque texte son identifiant ELI, qui est l'adresse stable
 * d'EUR-Lex : elle ne bouge pas quand le site de la Commission est refondu.
 *
 * État du droit arrêté au 4 août 2026. Les dates de l'AI Act intègrent le
 * règlement (UE) 2026/1744 — « omnibus numérique sur l'IA » — publié au JOUE
 * le 24 juillet 2026, qui a reporté les échéances des systèmes à haut risque.
 */

/** Nature de l'acte : elle décide qui est directement lié par le texte. */
export type Nature =
  /** D'application directe dans les 27 États membres, sans loi nationale. */
  | 'reglement'
  /** Ne lie que l'État, qui doit la transposer ; regarder aussi le droit national. */
  | 'directive'
  /** Déposé par la Commission, pas encore droit positif : à surveiller, pas à appliquer. */
  | 'proposition';

/** Le domaine, qui sert à filtrer le calendrier et à colorer la frise. */
export type Domaine =
  | 'donnees'
  | 'ia'
  | 'cybersecurite'
  | 'produit'
  | 'marche';

export type Texte = {
  id: string;
  /** Le sigle sous lequel on en parle réellement en réunion. */
  sigle: string;
  nom: string;
  reference: string;
  nature: Nature;
  domaine: Domaine;
  /** Deux phrases : ce que le texte impose, et à qui. */
  objet: string;
  /** Qui est visé, en langage d'entreprise plutôt que de législateur. */
  concerne: string
  /**
   * Ce que le texte impose **à la conception**, traduit en contraintes
   * d'architecture. C'est la seule rubrique de ce fichier qui ne paraphrase
   * pas le droit : elle dit ce qu'il faut changer dans un schéma, un modèle de
   * données ou une chaîne de construction. Un architecte à qui l'on récite un
   * article ne sait pas quoi en faire ; à qui l'on dit « il faut une clé de
   * chiffrement qui ne quitte pas l'Union », si.
   */
  architecture: string;
  /** Le plafond de sanction, avec son article. Vide si le texte n'en porte pas. */
  sanction?: string;
  /** Les articles qu'on ouvre en pratique, avec ce qu'ils demandent. */
  articles: { numero: string; titre: string; note: string }[];
  /** Adresse ELI sur EUR-Lex — stable, contrairement aux URL de portail. */
  eli: string;
};

export const DOMAINES: Record<Domaine, { label: string; couleur: string }> = {
  donnees: { label: 'Données personnelles et industrielles', couleur: 'brand' },
  ia: { label: 'Intelligence artificielle', couleur: 'gold' },
  cybersecurite: { label: 'Cybersécurité et résilience', couleur: 'ember' },
  produit: { label: 'Produit, conformité et responsabilité', couleur: 'jade' },
  marche: { label: 'Marchés et plateformes', couleur: 'ink' },
};

export const TEXTES: Texte[] = [
  {
    id: 'rgpd',
    sigle: 'RGPD',
    nom: 'Règlement général sur la protection des données',
    reference: 'Règlement (UE) 2016/679',
    nature: 'reglement',
    domaine: 'donnees',
    objet:
      "Encadre tout traitement de données personnelles : il faut une base légale, une finalité déterminée, et la capacité de prouver l'un et l'autre.",
    concerne:
      "Toute organisation qui traite des données de personnes situées dans l'Union, où qu'elle soit établie (art. 3).",
    architecture:
      "Trois contraintes structurantes, dans l'ordre où elles coûtent cher si on les découvre tard. **La finalité borne le modèle de données** : une colonne sans finalité déclarée est une non-conformité, pas une option ouverte pour plus tard. **L'effacement doit être exécutable** — une durée de conservation suppose une purge réelle, y compris dans les sauvegardes, les journaux, les réplicas de lecture et l'entrepôt analytique ; c'est le point qui casse les architectures événementielles, où le journal d'événements est immuable par construction. **La portabilité et l'accès supposent une extraction par personne**, ce qui n'est trivial que si l'identité est une clé de premier ordre dès la conception.",
    sanction:
      "20 M€ ou 4 % du chiffre d'affaires mondial annuel, le montant le plus élevé étant retenu (art. 83 §5).",
    articles: [
      {
        numero: 'art. 5 §2',
        titre: 'Responsabilité',
        note: "Le principe qui fait tout le reste : il ne suffit pas d'être conforme, il faut pouvoir le démontrer. C'est ce qui rend les registres de ce site utiles.",
      },
      {
        numero: 'art. 6',
        titre: 'Licéité',
        note: 'Six bases légales, et une seule à la fois par finalité. Changer de base en cours de route pour rattraper un consentement mal recueilli ne fonctionne pas.',
      },
      {
        numero: 'art. 9',
        titre: 'Catégories particulières',
        note: "Santé, opinions, biométrie, orientation sexuelle : interdites par défaut, sauf l'une des dix conditions du §2.",
      },
      {
        numero: 'art. 28',
        titre: 'Sous-traitants',
        note: 'Un contrat écrit portant les huit mentions obligatoires. Les conditions générales d\'un fournisseur cloud ne suffisent que si elles les contiennent toutes.',
      },
      {
        numero: 'art. 30',
        titre: 'Registre des activités de traitement',
        note: "La première pièce demandée en cas de contrôle. L'exemption « moins de 250 salariés » est étroite : elle tombe dès que le traitement est régulier, ce qui est le cas de la paie et du fichier client.",
      },
      {
        numero: 'art. 32',
        titre: 'Sécurité du traitement',
        note: "Mesures appropriées au risque — chiffrement, pseudonymisation, restauration, et un dispositif de test régulier de leur efficacité.",
      },
      {
        numero: 'art. 33-34',
        titre: 'Violations de données',
        note: "72 heures pour notifier l'autorité de contrôle à compter de la prise de connaissance ; information des personnes sans délai si le risque est élevé.",
      },
      {
        numero: 'art. 35',
        titre: "Analyse d'impact",
        note: "Obligatoire quand le traitement est susceptible d'engendrer un risque élevé. Le test opérationnel retenu par le CEPD : deux critères de risque cochés sur neuf.",
      },
      {
        numero: 'ch. V',
        titre: 'Transferts hors Union',
        note: "Décision d'adéquation, clauses contractuelles types, ou règles d'entreprise contraignantes — plus, depuis Schrems II, une analyse d'impact du transfert.",
      },
    ],
    eli: 'http://data.europa.eu/eli/reg/2016/679/oj',
  },
  {
    id: 'eprivacy',
    sigle: 'ePrivacy',
    nom: 'Directive vie privée et communications électroniques',
    reference: 'Directive 2002/58/CE, modifiée par la directive 2009/136/CE',
    nature: 'directive',
    domaine: 'donnees',
    objet:
      "Régit la lecture et l'écriture d'informations sur le terminal de l'utilisateur — traceurs, empreintes de navigateur, pixels — indépendamment du fait que ces informations soient personnelles.",
    concerne:
      "Tout éditeur de site, d'application ou de courriel commercial visant des utilisateurs dans l'Union.",
    architecture:
      "Le consentement au dépôt de traceurs est **préalable** : rien ne s'écrit sur le terminal avant le clic, ce qui interdit de charger les balises dans le `<head>` et impose un gestionnaire de consentement en amont du chargement des scripts tiers. Corollaire d'architecture souvent manqué : la mesure d'audience exemptée doit être cloisonnée du reste, sans identifiant partagé avec les traceurs publicitaires.",
    sanction:
      "Fixée par chaque État membre. En France, 2 % du chiffre d'affaires (art. 20 loi Informatique et Libertés) ; les amendes traceurs de la CNIL ont dépassé 100 M€.",
    articles: [
      {
        numero: 'art. 5 §3',
        titre: 'Consentement au dépôt de traceurs',
        note: "Consentement préalable, sauf pour ce qui est strictement nécessaire au service demandé. La mesure d'audience n'y échappe que sous conditions strictes.",
      },
      {
        numero: 'art. 13',
        titre: 'Prospection non sollicitée',
        note: "Opt-in pour le courriel, avec l'exception « clients existants, produits analogues ».",
      },
    ],
    eli: 'http://data.europa.eu/eli/dir/2002/58/oj',
  },
  {
    id: 'ai-act',
    sigle: 'AI Act',
    nom: "Règlement sur l'intelligence artificielle",
    reference:
      'Règlement (UE) 2024/1689, modifié par le règlement (UE) 2026/1744 (omnibus numérique sur l’IA)',
    nature: 'reglement',
    domaine: 'ia',
    objet:
      "Classe les systèmes d'IA par le risque qu'ils font peser sur les droits fondamentaux, et fait porter les obligations essentiellement au fournisseur — celui qui met le système sur le marché sous son nom.",
    concerne:
      "Fournisseurs, déployeurs, importateurs et distributeurs de systèmes d'IA mis sur le marché ou utilisés dans l'Union, y compris lorsque seule la sortie du système y est utilisée (art. 2).",
    architecture:
      "Ce qui pèse sur la conception vient du chapitre III, et se conçoit difficilement après coup. **La journalisation de l'article 12** est une exigence produit : traces automatiques sur toute la durée de vie, conservées six mois au moins — donc un volume, une rétention et un coût à budgéter dès l'architecture. **Le contrôle humain de l'article 14** est une exigence d'interface : il faut que la supervision soit possible, pas seulement prévue au contrat. **La traçabilité des données d'entraînement** ne se reconstitue pas deux ans plus tard : provenance, versions, étiquetage doivent être capturés par le pipeline dès le premier entraînement. Et **le marquage de l'article 50** doit être lisible par machine — filigrane, métadonnées C2PA ou équivalent —, un bandeau visuel ne suffit pas.",
    sanction:
      "35 M€ ou 7 % du chiffre d'affaires mondial pour une pratique interdite ; 15 M€ ou 3 % pour la plupart des autres manquements ; 7,5 M€ ou 1 % pour une information inexacte (art. 99).",
    articles: [
      {
        numero: 'art. 3 §1',
        titre: "Définition du système d'IA",
        note: "Un système automatisé qui, à partir des entrées reçues, déduit la manière de générer des sorties, et présente une capacité d'adaptation. Un moteur de règles écrit à la main en sort ; un modèle appris y entre.",
      },
      {
        numero: 'art. 4',
        titre: "Maîtrise de l'IA",
        note: "Fournisseurs et déployeurs doivent assurer un niveau suffisant de connaissance chez ceux qui utilisent les systèmes. Applicable depuis le 2 février 2025 — c'est l'obligation la plus souvent oubliée parce qu'elle ne produit aucun document.",
      },
      {
        numero: 'art. 5',
        titre: 'Pratiques interdites',
        note: "Manipulation subliminale, exploitation de vulnérabilités, notation sociale, police prédictive fondée sur le seul profilage, moissonnage non ciblé d'images faciales, reconnaissance des émotions au travail et à l'école, catégorisation biométrique sensible, identification biométrique à distance en temps réel à des fins répressives. L'omnibus y ajoute la génération d'images intimes non consenties et de matériel pédopornographique.",
      },
      {
        numero: 'art. 6 et annexes I, III',
        titre: 'Systèmes à haut risque',
        note: "Deux voies : composant de sécurité d'un produit déjà réglementé (annexe I), ou usage listé à l'annexe III — biométrie, infrastructures critiques, éducation, emploi, services essentiels dont la notation de crédit, répression, migration, justice. Le filtre de l'art. 6 §3 ne joue jamais si le système profile des personnes physiques.",
      },
      {
        numero: 'art. 26',
        titre: 'Obligations du déployeur',
        note: "Utiliser conformément à la notice, confier la supervision à des personnes compétentes, conserver les journaux, et informer les travailleurs concernés avant la mise en service sur le lieu de travail.",
      },
      {
        numero: 'art. 27',
        titre: 'Analyse des droits fondamentaux',
        note: "Pour les organismes publics et les services privés essentiels déployant un système de l'annexe III. Distincte de l'analyse d'impact du RGPD, qu'elle ne remplace pas.",
      },
      {
        numero: 'art. 50',
        titre: 'Transparence',
        note: "Dire à l'utilisateur qu'il parle à une machine, marquer les contenus synthétiques dans un format lisible par machine, signaler les hypertrucages et la reconnaissance des émotions. Applicable depuis le 2 août 2026 ; les systèmes déjà sur le marché ont jusqu'au 2 décembre 2026 pour le marquage.",
      },
      {
        numero: 'art. 51-56',
        titre: "Modèles d'IA à usage général",
        note: "Documentation technique, politique de respect du droit d'auteur, résumé public des données d'entraînement. Au-delà de 10²⁵ opérations en virgule flottante d'entraînement, le modèle est présumé présenter un risque systémique et les obligations s'alourdissent.",
      },
    ],
    eli: 'http://data.europa.eu/eli/reg/2024/1689/oj',
  },
  {
    id: 'cra',
    sigle: 'CRA',
    nom: 'Règlement sur la cyberrésilience',
    reference: 'Règlement (UE) 2024/2847',
    nature: 'reglement',
    domaine: 'cybersecurite',
    objet:
      "Fait de la sécurité une condition de mise sur le marché : un produit comportant des éléments numériques ne porte le marquage CE que s'il satisfait des exigences essentielles de sécurité et s'il est maintenu pendant une durée annoncée.",
    concerne:
      "Fabricants, importateurs et distributeurs de tout produit matériel ou logiciel connectable, commercialisé dans l'Union. Le logiciel vendu seul est un produit. Le SaaS n'est visé que par ses composants de traitement à distance intégrés au produit (art. 3 §2).",
    architecture:
      "Le texte transforme une version livrée en **engagement pluriannuel**, et c'est la contrainte qui remonte le plus haut dans les choix de conception. Il faut un **canal de mise à jour de sécurité séparé du canal fonctionnel**, capable d'atteindre un parc déployé pendant cinq ans au moins — donc une compatibilité ascendante tenue sur cette durée, et une infrastructure de distribution qui survit au produit. Il faut une **SBOM générée par la chaîne de construction**, rattachée à chaque artefact publié : cela se met en place en une semaine au début d'un projet, en un trimestre à la fin. Et la sécurisation par défaut se décide au moment du choix des valeurs de configuration, pas à la revue de sécurité.",
    sanction:
      "15 M€ ou 2,5 % du chiffre d'affaires mondial pour les exigences essentielles ; 10 M€ ou 2 % pour les autres obligations ; 5 M€ ou 1 % pour une information trompeuse (art. 64).",
    articles: [
      {
        numero: 'art. 13',
        titre: 'Obligations du fabricant',
        note: "Évaluation des risques de cybersécurité, documentation technique, diligence sur les composants tiers — y compris libres — et déclaration UE de conformité.",
      },
      {
        numero: 'art. 13 §8',
        titre: 'Période de support',
        note: "Au moins cinq ans, ou la durée de vie attendue du produit si elle est plus courte, et cette durée doit être annoncée à l'achat. C'est la disposition qui change le plus de choses dans un modèle économique logiciel.",
      },
      {
        numero: 'art. 14',
        titre: 'Signalement',
        note: "Vulnérabilité activement exploitée ou incident grave : alerte précoce à 24 heures, notification à 72 heures, rapport final à 14 jours ou un mois. Applicable dès le 11 septembre 2026, soit quinze mois avant le reste du règlement.",
      },
      {
        numero: 'annexe I, partie I',
        titre: 'Exigences essentielles de sécurité',
        note: "Configuration sécurisée par défaut, absence de vulnérabilité exploitable connue à la livraison, contrôle d'accès, chiffrement des données au repos et en transit, surface d'attaque minimale.",
      },
      {
        numero: 'annexe I, partie II',
        titre: 'Traitement des vulnérabilités',
        note: "Nomenclature logicielle — *software bill of materials*, SBOM : l'inventaire lisible par machine des composants qui entrent dans votre produit, avec leur version et leur provenance, dans un format courant comme CycloneDX ou SPDX. Le règlement n'en exige que les composants de **premier niveau**, ce qui est bien moins lourd qu'on ne le croit. S'y ajoutent une politique de divulgation coordonnée et la diffusion sans délai des correctifs de sécurité, séparés des mises à jour fonctionnelles.",
      },
      {
        numero: 'annexes III et IV',
        titre: 'Catégories',
        note: "Produits importants de classe I et II, produits critiques : la classe décide de la procédure d'évaluation de la conformité, et donc du recours ou non à un organisme notifié.",
      },
    ],
    eli: 'http://data.europa.eu/eli/reg/2024/2847/oj',
  },
  {
    id: 'nis2',
    sigle: 'NIS 2',
    nom: 'Directive sur la sécurité des réseaux et des systèmes d’information',
    reference: 'Directive (UE) 2022/2555',
    nature: 'directive',
    domaine: 'cybersecurite',
    objet:
      "Impose des mesures de gestion des risques et un régime de notification d'incident aux entités de dix-huit secteurs, avec une responsabilité personnelle des dirigeants sur l'approbation de ces mesures.",
    concerne:
      "Entités essentielles et importantes des secteurs listés aux annexes I et II — dont l'informatique en nuage, les centres de données, les réseaux de diffusion de contenu, les fournisseurs de services gérés et les places de marché — au-delà des seuils moyenne entreprise.",
    architecture:
      "Deux exigences se traduisent directement en architecture : l'**authentification à plusieurs facteurs ou l'authentification continue** sur les accès d'administration, et la **continuité** — sauvegardes testées, restauration mesurée, plan de reprise éprouvé. La sécurité de la chaîne d'approvisionnement, elle, se joue au niveau des dépendances et des fournisseurs d'exécution : ce que vous ne maîtrisez pas, vous devez au moins le connaître.",
    sanction:
      "10 M€ ou 2 % du chiffre d'affaires mondial pour une entité essentielle ; 7 M€ ou 1,4 % pour une entité importante (art. 34).",
    articles: [
      {
        numero: 'art. 20',
        titre: 'Gouvernance',
        note: "Les organes de direction approuvent les mesures et suivent une formation. Leur responsabilité peut être engagée personnellement : c'est le levier réel de la directive.",
      },
      {
        numero: 'art. 21',
        titre: 'Mesures de gestion des risques',
        note: "Dix domaines minimaux, dont la sécurité de la chaîne d'approvisionnement, la continuité, le chiffrement et l'authentification à plusieurs facteurs.",
      },
      {
        numero: 'art. 23',
        titre: "Notification d'incident",
        note: "Alerte précoce à 24 heures, notification d'incident à 72 heures, rapport final à un mois. Les délais courent depuis la prise de connaissance, pas depuis la fin de la remédiation.",
      },
    ],
    eli: 'http://data.europa.eu/eli/dir/2022/2555/oj',
  },
  {
    id: 'dora',
    sigle: 'DORA',
    nom: 'Règlement sur la résilience opérationnelle numérique',
    reference: 'Règlement (UE) 2022/2554',
    nature: 'reglement',
    domaine: 'cybersecurite',
    objet:
      "Le pendant financier de NIS 2 : résilience opérationnelle, tests, et surtout encadrement contractuel des prestataires informatiques tiers, avec une supervision directe des plus critiques d'entre eux.",
    concerne:
      "Entités financières — banques, assureurs, sociétés de gestion, prestataires de services sur crypto-actifs — et leurs prestataires de services informatiques tiers.",
    architecture:
      "L'exigence qui change une architecture est la **stratégie de sortie testée** de l'article 28 §8 : pouvoir quitter un fournisseur suppose de ne pas dépendre de ses services managés propriétaires sur le chemin critique, ou d'avoir écrit et éprouvé le plan de bascule. S'y ajoutent des **tests de résilience** — et, pour les entités les plus significatives, des tests d'intrusion fondés sur la menace, qui supposent des environnements de test représentatifs de la production.",
    sanction:
      "Fixée par chaque État membre ; astreinte pouvant atteindre 1 % du chiffre d'affaires mondial journalier pour un prestataire critique désigné (art. 35 §8).",
    articles: [
      {
        numero: 'art. 19',
        titre: 'Notification des incidents majeurs',
        note: "Notification initiale au plus tard 4 heures après la classification et 24 heures après la prise de connaissance, rapport intermédiaire à 72 heures, rapport final à un mois.",
      },
      {
        numero: 'art. 28-30',
        titre: 'Risque lié aux tiers',
        note: "Registre d'information des accords contractuels, remis chaque année à l'autorité, et clauses obligatoires — dont un droit d'audit et une stratégie de sortie documentée.",
      },
    ],
    eli: 'http://data.europa.eu/eli/reg/2022/2554/oj',
  },
  {
    id: 'data-act',
    sigle: 'Data Act',
    nom: "Règlement sur les données",
    reference: 'Règlement (UE) 2023/2854',
    nature: 'reglement',
    domaine: 'donnees',
    objet:
      "Donne à l'utilisateur d'un objet connecté un droit d'accès aux données qu'il génère et de partage avec un tiers, et impose aux services d'informatique en nuage de rendre le changement de fournisseur effectif.",
    concerne:
      "Fabricants d'objets connectés et fournisseurs de services associés, et tout fournisseur de service de traitement de données — IaaS, PaaS, SaaS.",
    architecture:
      "L'article 3 §1 est une **contrainte de conception à date fixe** : les produits mis sur le marché après le 12 septembre 2026 doivent être conçus pour que les données qu'ils génèrent soient accessibles à l'utilisateur par défaut. Cela signifie une API d'export documentée, un format lisible, et un modèle de données qui distingue ce qui appartient à l'utilisateur de ce qui appartient au fabricant. Côté fournisseur de nuage, l'**équivalence fonctionnelle** après migration suppose des interfaces standard et des données exportables sans transformation propriétaire.",
    sanction:
      "Fixée par chaque État membre ; pour les données personnelles, les plafonds du RGPD s'appliquent (art. 40).",
    articles: [
      {
        numero: 'art. 3 §1',
        titre: 'Accessibilité par conception',
        note: "Les produits doivent être conçus pour que les données soient accessibles par défaut. Ne vise que les produits mis sur le marché après le 12 septembre 2026 : c'est une contrainte de conception, à trancher en amont.",
      },
      {
        numero: 'art. 4-5',
        titre: 'Accès et partage',
        note: "Accès de l'utilisateur sans délai, gratuitement, et transmission à un tiers qu'il désigne — un concurrent y compris, à l'exception des contrôleurs d'accès du DMA.",
      },
      {
        numero: 'art. 23-31',
        titre: 'Changement de fournisseur',
        note: "Préavis maximal de deux mois, période de transition de 30 jours, équivalence fonctionnelle pour les services d'infrastructure, et clauses de sortie dans le contrat.",
      },
      {
        numero: 'art. 29',
        titre: 'Frais de transfert',
        note: "Frais réduits aux coûts pendant la période transitoire, puis suppression totale au 12 janvier 2027.",
      },
      {
        numero: 'art. 32',
        titre: 'Accès des autorités de pays tiers',
        note: "Le fournisseur doit prendre les mesures techniques et juridiques empêchant un transfert de données non personnelles contraire au droit de l'Union.",
      },
    ],
    eli: 'http://data.europa.eu/eli/reg/2023/2854/oj',
  },
  {
    id: 'dga',
    sigle: 'DGA',
    nom: 'Règlement sur la gouvernance des données',
    reference: 'Règlement (UE) 2022/868',
    nature: 'reglement',
    domaine: 'donnees',
    objet:
      "Organise la réutilisation des données détenues par le secteur public et crée un statut déclaré pour les intermédiaires de données et les organisations altruistes.",
    concerne:
      "Organismes du secteur public, services d'intermédiation de données, et organisations pratiquant l'altruisme en matière de données.",
    architecture:
      "Pour un intermédiaire de données, la neutralité imposée est une contrainte d'architecture : les données qui transitent ne peuvent pas être utilisées pour votre propre compte, ce qui interdit de les mêler à vos propres jeux d'entraînement ou d'analyse. En pratique, un cloisonnement strict, vérifiable et documenté.",
    articles: [
      {
        numero: 'art. 10-15',
        titre: "Services d'intermédiation",
        note: "Déclaration auprès de l'autorité compétente et neutralité stricte : l'intermédiaire ne peut pas utiliser pour lui-même les données qu'il fait circuler.",
      },
    ],
    eli: 'http://data.europa.eu/eli/reg/2022/868/oj',
  },
  {
    id: 'dsa',
    sigle: 'DSA',
    nom: 'Règlement sur les services numériques',
    reference: 'Règlement (UE) 2022/2065',
    nature: 'reglement',
    domaine: 'marche',
    objet:
      "Régit la modération des contenus, la transparence de la publicité et des systèmes de recommandation, avec des obligations croissant fortement avec la taille du service.",
    concerne:
      "Intermédiaires, hébergeurs, plateformes en ligne. Les micro et petites entreprises sont exemptées des obligations propres aux plateformes (art. 19).",
    architecture:
      "Le mécanisme de notification et action de l'article 16 est une fonctionnalité à construire : réception, accusé, décision motivée, voie de recours interne, le tout tracé. La transparence de la publicité et des systèmes de recommandation suppose de pouvoir expliquer un classement — donc de conserver les paramètres ayant produit chaque affichage.",
    sanction:
      "6 % du chiffre d'affaires mondial annuel (art. 52 §3).",
    articles: [
      {
        numero: 'art. 16',
        titre: 'Notification et action',
        note: "Un mécanisme accessible pour signaler un contenu illicite, et une décision motivée envoyée à l'auteur du contenu retiré.",
      },
      {
        numero: 'art. 26-28',
        titre: 'Publicité et mineurs',
        note: "Interdiction du ciblage publicitaire sur les données sensibles, et de tout ciblage fondé sur le profilage lorsque le destinataire est mineur.",
      },
    ],
    eli: 'http://data.europa.eu/eli/reg/2022/2065/oj',
  },
  {
    id: 'dma',
    sigle: 'DMA',
    nom: 'Règlement sur les marchés numériques',
    reference: 'Règlement (UE) 2022/1925',
    nature: 'reglement',
    domaine: 'marche',
    objet:
      "Impose des obligations de comportement aux très grandes plateformes désignées contrôleurs d'accès : interopérabilité, non-autopréférence, portabilité.",
    concerne:
      "Les contrôleurs d'accès désignés par la Commission, et indirectement leurs entreprises utilisatrices, qui en tirent des droits opposables.",
    architecture:
      "Pour une entreprise utilisatrice, le règlement ouvre des droits techniques exploitables : accès aux données que vous générez sur la plateforme, interopérabilité des services de messagerie, liberté de proposer d'autres conditions ailleurs. À traiter comme une réduction de dépendance possible, pas comme une charge.",
    sanction:
      "10 % du chiffre d'affaires mondial, 20 % en cas de récidive (art. 30).",
    articles: [
      {
        numero: 'art. 5-6',
        titre: 'Obligations des contrôleurs d’accès',
        note: "Ne pas combiner les données entre services sans consentement, autoriser la désinstallation des applications préinstallées, ouvrir l'accès aux données générées par les entreprises utilisatrices.",
      },
    ],
    eli: 'http://data.europa.eu/eli/reg/2022/1925/oj',
  },
  {
    id: 'pld',
    sigle: 'Responsabilité produits',
    nom: 'Directive sur la responsabilité du fait des produits défectueux',
    reference: 'Directive (UE) 2024/2853',
    nature: 'directive',
    domaine: 'produit',
    objet:
      "Refonte du régime de 1985 : le logiciel est désormais explicitement un produit, et une faille de sécurité non corrigée peut constituer un défaut engageant la responsabilité sans faute du fabricant.",
    concerne:
      "Fabricants de produits, y compris de logiciels autonomes et de systèmes d'IA. L'exploitation minière de données et la fourniture de mises à jour sont dans le champ.",
    architecture:
      "Le basculement à retenir : **une vulnérabilité non corrigée peut constituer un défaut**, et l'exonération pour défaut apparu après la mise en circulation tombe dès lors que le fabricant garde la maîtrise du produit — ce qui est le cas de tout logiciel mis à jour à distance. Conséquence de conception : la capacité à corriger et à distribuer un correctif n'est plus une commodité d'exploitation, c'est une pièce du dossier de responsabilité.",
    articles: [
      {
        numero: 'art. 4 §1',
        titre: 'Notion de produit',
        note: "« Tout bien meuble […] ; le terme englobe l'électricité, les fichiers de fabrication numériques, les matières premières et les logiciels. » Le point de bascule pour l'édition logicielle.",
      },
      {
        numero: 'art. 7',
        titre: 'Défectuosité',
        note: "S'apprécie au regard notamment des exigences de sécurité applicables — donc, pour un produit connecté, des exigences essentielles du CRA. Les deux textes se répondent.",
      },
      {
        numero: 'art. 10',
        titre: 'Exonérations',
        note: "L'exonération pour défaut apparu après la mise en circulation tombe si le fabricant gardait la maîtrise du produit — ce qui est le cas dès qu'il pousse des mises à jour.",
      },
    ],
    eli: 'http://data.europa.eu/eli/dir/2024/2853/oj',
  },
  {
    id: 'eaa',
    sigle: 'Accessibilité',
    nom: "Directive sur l'accessibilité des produits et services",
    reference: 'Directive (UE) 2019/882',
    nature: 'directive',
    domaine: 'produit',
    objet:
      "Rend l'accessibilité opposable pour une liste de produits et de services numériques grand public, sur la base des exigences fonctionnelles de son annexe I.",
    concerne:
      "Commerce électronique, services bancaires aux consommateurs, livres numériques, transport de voyageurs, communications électroniques. Les micro-entreprises fournissant des services sont exemptées (art. 4 §5).",
    architecture:
      "L'accessibilité est la seule exigence de ce corpus qui se vérifie de l'extérieur en quelques minutes, et la seule qui se rattrape mal : un composant d'interface choisi sans gestion du focus, sans rôles ARIA et sans annonce des messages de statut se remplace, il ne se corrige pas. Elle se décide donc au choix de la bibliothèque de composants, pas à la recette.",
    articles: [
      {
        numero: 'annexe I',
        titre: 'Exigences fonctionnelles',
        note: "Perceptible, utilisable, compréhensible, robuste. La norme harmonisée EN 301 549 donne la présomption de conformité, et renvoie pour le web aux WCAG 2.1 niveau AA.",
      },
    ],
    eli: 'http://data.europa.eu/eli/dir/2019/882/oj',
  },
  {
    id: 'machines',
    sigle: 'Machines',
    nom: 'Règlement sur les machines',
    reference: 'Règlement (UE) 2023/1230',
    nature: 'reglement',
    domaine: 'produit',
    objet:
      "Remplace la directive 2006/42/CE et intègre les logiciels de sécurité et les comportements évolutifs : une machine dont la fonction de sécurité repose sur de l'IA relève simultanément de ce texte et de l'AI Act.",
    concerne: 'Fabricants de machines et de produits connexes.',
    architecture:
      "Point de jonction à connaître : un logiciel assurant une fonction de sécurité sur une machine relève de ce règlement **et** fait basculer le système dans le haut risque de l'annexe I de l'AI Act. Les deux dossiers de conformité se construisent ensemble ou pas du tout.",
    articles: [
      {
        numero: 'annexe I',
        titre: 'Catégories à haut risque',
        note: "Y figurent les logiciels assurant des fonctions de sécurité, y compris les systèmes d'IA. C'est le point de jonction avec l'annexe I de l'AI Act.",
      },
    ],
    eli: 'http://data.europa.eu/eli/reg/2023/1230/oj',
  },
  {
    id: 'omnibus-donnees',
    sigle: 'Omnibus données',
    nom: 'Proposition de règlement omnibus numérique (volet données)',
    reference: 'COM(2025) 837 — en cours de négociation',
    nature: 'proposition',
    domaine: 'donnees',
    objet:
      "Volet resté en négociation après l'adoption du volet IA : il toucherait au RGPD (données pseudonymisées, intérêt légitime pour l'entraînement de modèles), à ePrivacy (refus des traceurs en un clic, délai de six mois avant nouvelle sollicitation), à NIS 2 et à DORA.",
    concerne:
      "Personne, pour l'instant. Ce n'est pas du droit positif : à surveiller, pas à appliquer. Aucune décision d'architecture ne devrait s'appuyer dessus avant publication au journal officiel.",
    architecture:
      "Rien. C'est précisément le message : aucune décision d'architecture ne devrait s'appuyer sur un texte non publié. Concevez sur le droit en vigueur, et notez les points où un assouplissement futur vous ferait gagner — pas l'inverse.",
    articles: [
      {
        numero: '—',
        titre: 'État au 4 août 2026',
        note: "Le volet IA a été adopté séparément et publié le 24 juillet 2026 sous le n° 2026/1744. Le volet données reste devant le Parlement et le Conseil ; le compromis du Conseil abandonnerait la redéfinition de la donnée à caractère personnel.",
      },
    ],
    eli: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:52025PC0837',
  },
]

export function texte(id: string): Texte {
  const t = TEXTES.find((x) => x.id === id)
  if (!t) throw new Error(`Texte inconnu : ${id}`)
  return t
}
