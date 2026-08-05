/**
 * La liste de lecture.
 *
 * Trois parcours, classés par retour sur investissement et non par intérêt.
 * Chacun se rattache à une échéance du calendrier, ce qui est la seule façon
 * honnête de hiérarchiser une liste de lecture : sans date, tout paraît
 * également urgent et rien ne se fait.
 *
 * Deux règles tenues ici, et elles expliquent la brièveté de la liste.
 *
 * **Lire est la moitié du travail.** Chaque parcours sépare ce qu'on lit de ce
 * qu'on fait, et le second compte davantage : générer un SBOM sur un projet
 * qu'on connaît déjà apprend plus que la spécification du format.
 *
 * **Le livrable est nommé.** Un parcours dont on ne sait pas dire ce qu'on
 * saura faire à la fin est un signet, pas une formation.
 *
 * Liens vérifiés le 4 août 2026.
 */

export type TypeRessource = 'spec' | 'guide' | 'autorite' | 'texte' | 'outil'

export const TYPES: Record<TypeRessource, { label: string; teinte: string }> = {
  spec: { label: 'spécification', teinte: 'brand' },
  guide: { label: 'guide', teinte: 'brand' },
  autorite: { label: 'autorité', teinte: 'gold' },
  texte: { label: 'texte officiel', teinte: 'jade' },
  outil: { label: 'outil', teinte: 'ink' },
}

export type Ressource = {
  titre: string
  url: string
  type: TypeRessource
  /** Pourquoi celui-là, et ce qu'il faut en retenir. */
  note: string
  /** Le temps que ça prend réellement, quand il est prévisible. */
  duree?: string
  /** Une mise en garde, quand il y en a une. */
  reserve?: string
}

export type Parcours = {
  id: string
  titre: string
  /** Le classement, dit franchement. */
  rang: string
  /** Pourquoi c'est sur la liste. */
  enjeu: string
  /** L'échéance du calendrier qui rend le sujet urgent, si elle existe. */
  echeance?: string
  /** À lire, dans cet ordre. */
  lectures: Ressource[]
  /** Puis à faire — c'est la moitié qui compte. */
  pratique: Ressource[]
  /** Ce qu'on doit savoir faire à la fin. */
  livrable: string
}

export const PARCOURS: Parcours[] = [
  {
    id: 'sbom',
    titre: 'SBOM et traitement des vulnérabilités',
    rang: 'Le seul vrai manque',
    echeance: '2026-09-11',
    enjeu:
      "Le signalement du CRA devient exigible le 11 septembre 2026, et l'horloge est de vingt-quatre heures. C'est ce chiffre qui fait passer le sujet du juridique à l'inventaire : une vulnérabilité activement exploitée ne se signale pas en un jour par quelqu'un qui ignore quelle bibliothèque, dans quelle version, se trouve dans quel build livré chez quel client.",
    lectures: [
      {
        titre: 'CycloneDX — vue d’ensemble de la spécification',
        url: 'https://cyclonedx.org/specification/overview/',
        type: 'spec',
        duree: '1 h',
        note: "Le format sur lequel l'outillage européen s'est aligné. Lisez la vue d'ensemble seulement : la spécification complète est une référence, pas une lecture.",
      },
      {
        titre: 'SPDX',
        url: 'https://spdx.dev/',
        type: 'spec',
        duree: '1 h',
        note: "L'autre format. Une heure, uniquement pour pouvoir dire pourquoi vous avez choisi l'un plutôt que l'autre — c'est la question qu'un client posera.",
      },
      {
        titre: 'CISA — exigences minimales pour le VEX',
        url: 'https://www.cisa.gov/resources-tools/resources/minimum-requirements-vulnerability-exploitability-exchange-vex',
        type: 'guide',
        duree: '2 h',
        note: "**La pièce que tout le monde saute, et celle sur laquelle le CRA repose réellement.** Le VEX est la façon de déclarer qu'une vulnérabilité présente dans votre SBOM n'est *pas exploitable* dans votre produit. Sans lui, un SBOM produit une liste d'alertes que personne ne peut trier.",
      },
      {
        titre: 'CISA — ressources SBOM',
        url: 'https://www.cisa.gov/sbom',
        type: 'guide',
        note: "Les *minimum elements*, utiles comme grille de lecture face à la pratique existante d'un client.",
      },
    ],
    pratique: [
      {
        titre: 'Syft',
        url: 'https://github.com/anchore/syft',
        type: 'outil',
        note: "Génère un SBOM depuis un arbre source ou une image. Le point de départ.",
      },
      {
        titre: 'Grype',
        url: 'https://github.com/anchore/grype',
        type: 'outil',
        note: "Scanne un SBOM contre les données de vulnérabilité. Même éditeur que Syft, s'enchaîne naturellement.",
      },
      {
        titre: 'Trivy',
        url: 'https://github.com/aquasecurity/trivy',
        type: 'outil',
        note: "Fait les deux, et c'est celui qu'on trouve le plus souvent déjà installé dans le pipeline d'un client — raison suffisante pour le connaître.",
        reserve:
          "Compromis en mars 2026 : soixante-seize tags sur soixante-dix-sept force-pushés vers un *credential stealer*. L'incident est résolu, mais n'utilisez que des versions pinnées au digest. La page SBOM détaille l'épisode et la leçon.",
      },
      {
        titre: 'OSV.dev et osv-scanner',
        url: 'https://osv.dev/',
        type: 'outil',
        note: "La base ouverte de vulnérabilités et son client. À connaître parce que c'est celle dont les données sont exploitables, sans produit derrière — et parce que ses identifiants sont rattachés aux écosystèmes plutôt qu'aux CPE, ce qui réduit nettement les faux positifs.",
      },
      {
        titre: 'OWASP Dependency-Track',
        url: 'https://dependencytrack.org/',
        type: 'outil',
        note: "Ce que devient un SBOM à l'échelle d'un parc plutôt que d'un projet : monitoring continu contre un inventaire stocké. C'est la forme dont un client aura besoin, et celle qu'il faut savoir esquisser au tableau.",
      },
    ],
    livrable:
      "Un SBOM généré en CI, stocké, et re-scanné périodiquement — parce que la vulnérabilité qui compte est découverte après le build, pas pendant. Cette phrase est tout l'argument, et elle vaut d'être dite dès la première réunion.",
  },
  {
    id: 'lineage',
    titre: 'Data lineage',
    rang: 'La pratique existe, l’outil manque',
    enjeu:
      "Rien de neuf ici : la traçabilité des données se fait déjà à la main sur chaque mission. Ce qui manque est un nom à lui donner et une implémentation à avoir fait tourner. Le lien avec les textes est direct — le dossier de haut risque de l'AI Act demande quelles données ont alimenté un système et ce qui a été journalisé. C'est une question de *lineage* habillée d'un vocabulaire juridique, et la réponse est le même artefact.",
    echeance: '2027-12-02',
    lectures: [
      {
        titre: 'OpenLineage',
        url: 'https://openlineage.io/',
        type: 'spec',
        note: "Le standard ouvert, et le seul qui vaille d'être appris puisque les autres le lisent. Son intégration Airflow est le moyen le plus rapide de voir un graphe apparaître depuis un pipeline qui existe déjà.",
      },
      {
        titre: 'dbt — exposures',
        url: 'https://docs.getdbt.com/docs/build/exposures',
        type: 'guide',
        note: "Le *lineage* le moins cher de tous, et déjà disponible sur les missions qui utilisent dbt : il prolonge le graphe au-delà de l'entrepôt, jusqu'aux tableaux de bord qui le consomment. **À faire en premier, parce que ça ne coûte rien.**",
      },
      {
        titre: 'Microsoft Purview',
        url: 'https://learn.microsoft.com/purview/',
        type: 'guide',
        note: "La réponse Fabric et Azure. À lire plutôt qu'à pratiquer, sauf si une mission l'appelle.",
      },
    ],
    pratique: [
      {
        titre: 'Marquez',
        url: 'https://marquezproject.ai/',
        type: 'outil',
        note: "Le serveur de référence pour OpenLineage. Une demi-journée pour le monter en local contre un DAG existant — c'est le meilleur rapport temps/compréhension de la liste.",
      },
      {
        titre: 'DataHub',
        url: 'https://github.com/datahub-project/datahub',
        type: 'outil',
        note: "Le catalogue de données le plus complet du lot, avec Amundsen. Un sujet qui traîne dans les signets de beaucoup d'équipes depuis des années sans jamais devenir une pratique : c'est cela qu'il s'agit de corriger, pas de redécouvrir.",
      },
    ],
    livrable:
      "Un graphe de lineage produit depuis un pipeline réel, et la capacité de dire à un client que sa gouvernance des données au sens de l'article 10 de l'AI Act et son lineage sont le même chantier.",
  },
  {
    id: 'nis2',
    titre: 'Cadrage NIS 2',
    rang: 'De la lecture, pas de la formation',
    enjeu:
      "Celui-ci ne demande aucun cours. Il demande le texte et une après-midi. L'enjeu pratique est le point que le questionnaire de périmètre ne peut pas trancher : l'assujettissement dépend de seuils fixés par chaque loi nationale de transposition, pas par la directive.",
    lectures: [
      {
        titre: 'ANSSI — La directive NIS 2',
        url: 'https://cyber.gouv.fr/reglementation/cybersecurite-systemes-dinformation/directives-nis-nis2-et-dispositif-saiv/directive-nis-2/',
        type: 'autorite',
        note: "Le cadrage de l'autorité française, c'est-à-dire celui que votre client aura lu. Commencez par là pour parler la même langue que lui.",
      },
      {
        titre: 'MesServicesCyber — NIS 2',
        url: 'https://messervices.cyber.gouv.fr/nis2',
        type: 'autorite',
        note: "Le parcours d'auto-évaluation vers lequel l'ANSSI oriente les entités. Utile parce qu'il montre les questions qui seront posées à votre client — donc celles auxquelles vous devrez l'aider à répondre.",
      },
      {
        titre: 'Commission européenne — directive NIS 2',
        url: 'https://digital-strategy.ec.europa.eu/en/policies/nis2-directive',
        type: 'autorite',
        note: 'Les catégories de champ dans leur formulation d’origine.',
      },
      {
        titre: 'Directive (UE) 2022/2555 sur EUR-Lex',
        url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj',
        type: 'texte',
        note: "**Les annexes I et II sont la seule partie à lire de près** : ce sont les listes de secteurs, et le champ se décide là.",
      },
      {
        titre: 'Règlement (UE) 2024/2847 sur EUR-Lex',
        url: 'https://eur-lex.europa.eu/eli/reg/2024/2847/oj',
        type: 'texte',
        note: "Le règlement cyberrésilience lui-même, pour la même raison : l'annexe I partie II tient en une page et décide de tout le chantier SBOM.",
      },
    ],
    pratique: [],
    livrable:
      "Traduire « entité essentielle ou importante » en un périmètre technique : quels systèmes, quels fournisseurs, quelle chaîne de signalement. **Pas** conseiller un client sur son assujettissement — c'est une réponse de juriste, et savoir le dire fait partie de la compétence.",
  },
]

export type HorsListe = { titre: string; note: string }

/**
 * Ce qu'on n'inscrit pas, et pourquoi. C'est la moitié la plus utile d'une
 * liste de lecture : dire ce qu'on écarte évite de le reconsidérer tous les
 * six mois.
 */
export const HORS_LISTE: HorsListe[] = [
  {
    titre: 'Aucune certification en conformité ou en gouvernance de l’IA',
    note: "Le marché qu'elles visaient s'est décalé avec le report des échéances haut risque de l'omnibus, et elles positionnent leur titulaire comme un juriste — c'est le seul terrain où l'avantage d'un architecte disparaît. Votre valeur est de traduire un texte en contrainte de conception, pas d'attester que vous l'avez lu.",
  },
  {
    titre: 'Aucune formation NIS 2 ou CRA',
    note: "Ces textes sont courts, gratuits, et écrits pour être lus par ceux qu'ils lient. Une formation ajoute un certificat, pas une compréhension. Le temps est mieux placé sur l'après-midi de lecture des annexes.",
  },
]
