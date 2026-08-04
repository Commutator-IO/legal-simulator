/**
 * La nomenclature logicielle — SBOM.
 *
 * C'est la page la plus technique du site, et la seule où le droit tient en un
 * paragraphe. L'annexe I partie II point 1 du CRA demande une nomenclature
 * « dans un format courant lisible par machine, couvrant au minimum les
 * dépendances de premier niveau ». Tout le reste est de l'ingénierie — et c'est
 * précisément pour cela qu'un architecte doit s'en emparer : c'est la seule
 * obligation du corpus qui se règle entièrement dans la chaîne de construction,
 * sans juriste, en une semaine si l'on s'y prend au début.
 *
 * Le contenu de ce module est daté : les outils bougent, les versions dérivent,
 * et une commande recopiée d'un article de blog de 2024 ne marche plus. Les
 * commandes sont donc données à titre indicatif, avec pour chacune le principe
 * qu'elle applique — le principe survit à la syntaxe.
 */

export type Format = {
  id: string
  nom: string
  norme: string
  origine: string
  /** Ce pour quoi ce format est le meilleur choix. */
  fort: string
  /** Sa limite, dite franchement. */
  limite: string
}

export const FORMATS: Format[] = [
  {
    id: 'cyclonedx',
    nom: 'CycloneDX',
    norme: 'ECMA-424 (version 1.6, juin 2024)',
    origine: 'OWASP',
    fort: "Conçu pour la sécurité : il porte nativement les avis de vulnérabilité et le VEX, qui permet de déclarer « ce composant est présent mais l'exploitation n'est pas possible chez nous ». C'est ce qui en fait le format à privilégier pour répondre à l'article 14 du CRA — signaler une vulnérabilité activement exploitée en 24 heures suppose de savoir en quelques minutes si l'on est touché.",
    limite:
      "Moins riche que SPDX sur la description des licences, ce qui compte si votre besoin réel est la conformité des licences libres plutôt que la sécurité.",
  },
  {
    id: 'spdx',
    nom: 'SPDX',
    norme: 'ISO/IEC 5962:2021 (version 2.2.1) ; version 3.0 depuis 2024',
    origine: 'Linux Foundation',
    fort: "Le format le plus solide sur les licences et la provenance, et le seul normalisé ISO — argument qui compte face à un acheteur public ou à un client industriel qui raisonne en normes.",
    limite:
      "Le volet sécurité est arrivé plus tard et reste moins outillé ; l'écosystème VEX y est moins mature.",
  },
  {
    id: 'swid',
    nom: 'SWID',
    norme: 'ISO/IEC 19770-2:2015',
    origine: 'ISO',
    fort: "Cité par les guides comme format acceptable, et présent dans certains parcs logiciels propriétaires.",
    limite:
      "En pratique quasi absent des chaînes de construction modernes. Ne le choisissez que si un client vous l'impose.",
  },
]

/**
 * Le contenu minimal. Le CRA ne le détaille pas — c'est son principal défaut
 * pratique. Deux sources comblent le vide : les « minimum elements » publiés
 * par la NTIA américaine, largement repris, et la directive technique
 * BSI TR-03183-2, qui donne la première interprétation nationale détaillée
 * d'une SBOM conforme au CRA, avec des correspondances champ à champ pour
 * CycloneDX 1.6 et SPDX 3.0.1.
 */
export const CHAMPS = [
  {
    champ: 'Nom du fournisseur du composant',
    note: "L'entité qui publie le composant, pas celle qui l'héberge.",
  },
  {
    champ: 'Nom du composant',
    note: 'Tel que publié, pas le nom que vous lui donnez en interne.',
  },
  {
    champ: 'Version',
    note: "Exacte et résolue, celle du verrou de dépendances — pas la contrainte du manifeste. « ^4.2.0 » n'est pas une version.",
  },
  {
    champ: 'Identifiant unique',
    note: "Un PURL (`pkg:npm/lodash@4.17.21`) de préférence, ou un CPE. C'est lui qui permet le rapprochement automatique avec les bases de vulnérabilités : sans identifiant normalisé, la SBOM n'est qu'un document.",
  },
  {
    champ: 'Relations de dépendance',
    note: "Quel composant dépend de quel autre. Le CRA n'exige que le premier niveau, mais la relation est ce qui distingue une SBOM d'une liste.",
  },
  {
    champ: 'Auteur de la nomenclature',
    note: "L'outil et sa version. Utile pour savoir ce qui a pu être manqué, et pour rejouer la génération.",
  },
  {
    champ: 'Horodatage',
    note: 'Le moment de la génération, qui rattache la SBOM à un état du dépôt.',
  },
  {
    champ: 'Empreinte des composants',
    note: "Recommandée plutôt qu'exigée, mais c'est elle qui rend la nomenclature vérifiable au lieu d'être déclarative.",
  },
]

export type Outil = {
  ecosysteme: string
  outil: string
  commande: string
  formats: string
  note: string
}

/**
 * Deux familles, et le choix entre elles n'est pas anodin.
 *
 * Les **scanneurs génériques** observent un répertoire ou une image et
 * déduisent les composants. Ils couvrent tout, et se trompent aux marges :
 * dépendance vendue dans le dépôt, binaire lié statiquement, artefact
 * reconstruit.
 *
 * Les **greffons de build** s'insèrent dans le résolveur de dépendances et
 * voient exactement l'arbre que la construction a résolu — sans heuristique.
 * Ils sont plus justes, et ne couvrent qu'un écosystème.
 *
 * La bonne chaîne emploie les deux : le greffon pour le code que vous
 * construisez, le scanneur pour l'image que vous publiez.
 */
export const OUTILS_GENERIQUES: Outil[] = [
  {
    ecosysteme: 'Tous — répertoires, images, systèmes de fichiers',
    outil: 'Syft (Anchore)',
    commande: 'syft scan dir:. -o cyclonedx-json=sbom.json',
    formats: 'CycloneDX, SPDX',
    note: "Le plus polyvalent, et le seul à produire proprement les deux formats. C'est le défaut raisonnable si vous n'en installez qu'un.",
  },
  {
    ecosysteme: 'Tous — plus de vingt langages',
    outil: 'cdxgen (OWASP)',
    commande: 'cdxgen -o sbom.json',
    formats: 'CycloneDX',
    note: "Le générateur de référence du format, donc le plus complet sur ses extensions. Le choix naturel si vous êtes déjà en CycloneDX.",
  },
  {
    ecosysteme: 'Tous — orienté Microsoft',
    outil: 'sbom-tool (Microsoft)',
    commande: 'sbom-tool generate -b ./build -bc . -pn Produit -pv 1.0',
    formats: 'SPDX',
    note: 'Utile si votre client impose SPDX et que vous êtes dans un environnement .NET ou Azure.',
  },
  {
    ecosysteme: 'Images de conteneur, au moment du build',
    outil: 'BuildKit',
    commande: 'docker buildx build --sbom=true --provenance=true -t image:tag .',
    formats: 'SPDX',
    note: "Le plus simple à mettre en place : la nomenclature est attachée à l'image dans le registre, sans étape supplémentaire. À préférer dès que vous publiez des images.",
  },
]

export const OUTILS_ECOSYSTEME: Outil[] = [
  {
    ecosysteme: 'Node — npm, pnpm, yarn',
    outil: 'npm (intégré depuis la 10.1)',
    commande: 'npm sbom --sbom-format cyclonedx > sbom.json',
    formats: 'CycloneDX, SPDX',
    note: "Rien à installer. Lit l'arbre résolu du verrou, donc juste par construction.",
  },
  {
    ecosysteme: 'Python',
    outil: 'cyclonedx-py',
    commande: 'cyclonedx-py environment -o sbom.json',
    formats: 'CycloneDX',
    note: "Générez depuis l'environnement installé plutôt que depuis `requirements.txt` : c'est ce qui est réellement embarqué qui compte.",
  },
  {
    ecosysteme: 'Java — Maven',
    outil: 'cyclonedx-maven-plugin',
    commande: 'mvn org.cyclonedx:cyclonedx-maven-plugin:makeAggregateBom',
    formats: 'CycloneDX',
    note: "Voit l'arbre exact que Maven a résolu, portées comprises. Aucune heuristique.",
  },
  {
    ecosysteme: 'Java — Gradle',
    outil: 'plugin org.cyclonedx.bom',
    commande: './gradlew cyclonedxBom',
    formats: 'CycloneDX',
    note: 'Même principe, dans le graphe de configurations Gradle.',
  },
  {
    ecosysteme: 'Go',
    outil: 'cyclonedx-gomod',
    commande: 'cyclonedx-gomod mod -json -output sbom.json',
    formats: 'CycloneDX',
    note: "Go embarque déjà ses métadonnées dans le binaire (`go version -m`), ce qui rend la nomenclature vérifiable a posteriori — cas rare et confortable.",
  },
  {
    ecosysteme: 'Rust',
    outil: 'cargo-cyclonedx',
    commande: 'cargo cyclonedx --format json',
    formats: 'CycloneDX',
    note: "Pensez aussi à `cargo auditable`, qui inscrit la liste des dépendances dans le binaire produit.",
  },
  {
    ecosysteme: '.NET',
    outil: 'CycloneDX pour dotnet',
    commande: 'dotnet CycloneDX Solution.sln -o .',
    formats: 'CycloneDX',
    note: 'Se branche sur la restauration NuGet.',
  },
  {
    ecosysteme: 'PHP — Composer',
    outil: 'cyclonedx-php-composer',
    commande: 'composer CycloneDX:make-sbom --output-file=sbom.json',
    formats: 'CycloneDX',
    note: 'Greffon Composer, lit le verrou.',
  },
]

/** Ce qu'on fait de la nomenclature une fois produite — le vrai sujet. */
export const OUTILS_CONSOMMATION: Outil[] = [
  {
    ecosysteme: 'Surveillance continue',
    outil: 'Dependency-Track (OWASP)',
    commande: 'curl -X POST .../api/v1/bom -F "bom=@sbom.json"',
    formats: 'CycloneDX',
    note: "La pièce maîtresse, et celle qu'on oublie. Il ingère vos nomenclatures et rapproche en continu chaque composant des bases de vulnérabilités : vous êtes alerté quand une faille paraît, pas quand vous relancez un scan. C'est cela qui rend l'article 14 tenable.",
  },
  {
    ecosysteme: 'Analyse ponctuelle',
    outil: 'Grype (Anchore)',
    commande: 'grype sbom:./sbom.json',
    formats: 'CycloneDX, SPDX',
    note: "Analyse une nomenclature déjà produite, sans réaccéder au code — utile pour rejouer l'analyse d'une version livrée il y a deux ans.",
  },
  {
    ecosysteme: 'Analyse ponctuelle',
    outil: 'OSV-Scanner (Google)',
    commande: 'osv-scanner --sbom=sbom.json',
    formats: 'CycloneDX, SPDX',
    note: "S'appuie sur la base OSV, dont les identifiants sont rattachés aux écosystèmes plutôt qu'aux CPE — moins de faux positifs sur les paquets libres.",
  },
  {
    ecosysteme: 'Signature et attestation',
    outil: 'Cosign (Sigstore)',
    commande: 'cosign attest --predicate sbom.json --type cyclonedx image:tag',
    formats: 'toutes',
    note: "Attache la nomenclature à l'artefact et la signe. Une SBOM non signée et non rattachée est une affirmation ; signée, c'est une preuve.",
  },
]

export type Etape = {
  id: string
  titre: string
  quand: string
  note: string
}

/**
 * Les quatre moments. L'erreur la plus répandue est de s'arrêter au premier :
 * une nomenclature générée et jamais rattachée à l'artefact ne prouve rien, et
 * une nomenclature jamais surveillée n'a rien empêché.
 */
export const ETAPES: Etape[] = [
  {
    id: 'generer',
    titre: 'Générer',
    quand: 'À chaque construction, pas à chaque publication.',
    note: "Générez depuis l'état résolu — verrou de dépendances ou environnement installé —, jamais depuis le manifeste. Deux nomenclatures pour un même produit : celle du code que vous écrivez, produite par le greffon de build, et celle de l'image que vous publiez, produite par un scanneur. Elles ne contiennent pas la même chose, et le CRA vise la seconde.",
  },
  {
    id: 'attacher',
    titre: 'Attacher et signer',
    quand: 'Au moment de la publication de l’artefact.',
    note: "Une nomenclature dans un dossier partagé se désynchronise en trois semaines. Attachez-la à l'artefact lui-même : attestation OCI dans le registre, attestation de build GitHub, ou pièce jointe de release. Signez-la — une nomenclature qu'on ne peut pas rattacher à une version précise ne répond à aucune question.",
  },
  {
    id: 'conserver',
    titre: 'Conserver',
    quand: 'Pour toute la période de support annoncée.',
    note: "C'est le point que la période de support du CRA rend structurant : si vous annoncez cinq ans, vous devez pouvoir répondre pendant cinq ans sur une version publiée aujourd'hui. Une nomenclature vivant dans les artefacts d'un job de CI purgé à 90 jours ne tient pas cet engagement.",
  },
  {
    id: 'surveiller',
    titre: 'Surveiller',
    quand: 'En continu, et c’est là que tout se joue.',
    note: "Une nomenclature est une entrée, pas un livrable. Versée dans un Dependency-Track ou équivalent, elle vous alerte quand une faille paraît sur un composant que vous embarquez — y compris dans une version livrée il y a trois ans. Sans cette étape, vous avez produit un document ; avec elle, vous avez une capacité de réponse.",
  },
]

export type Piege = {
  titre: string
  note: string
}

export const PIEGES: Piege[] = [
  {
    titre: 'La nomenclature du dépôt n’est pas celle du produit livré',
    note: "Scanner le dépôt donne les dépendances déclarées ; l'artefact publié contient en plus la distribution de base, les paquets système, et parfois des bibliothèques liées statiquement. C'est l'artefact qui est mis sur le marché, donc lui qu'il faut décrire.",
  },
  {
    titre: 'Générer depuis le manifeste plutôt que depuis le verrou',
    note: "Une contrainte de version n'est pas une version. Deux constructions du même manifeste à un mois d'écart n'embarquent pas les mêmes composants — et la nomenclature doit décrire ce qui est parti chez le client, pas ce qui aurait pu partir.",
  },
  {
    titre: 'Les dépendances invisibles',
    note: "Bibliothèque copiée dans le dépôt, binaire lié statiquement, module natif compilé à l'installation, modèle ou jeu de données embarqué : rien de tout cela ne sort d'un résolveur de dépendances. Ce sont les angles morts de toute nomenclature générée, et ils doivent être documentés à la main.",
  },
  {
    titre: 'Confondre premier niveau et exhaustivité',
    note: "Le CRA n'exige que les dépendances de premier niveau, ce qui est bien plus léger qu'on ne le croit. Mais les failles se logent dans les dépendances transitives : produisez l'arbre complet, que l'outillage donne gratuitement, et n'invoquez le minimum légal que si la génération complète est réellement impossible.",
  },
  {
    titre: 'Publier la nomenclature par réflexe',
    note: "Le CRA ne l'exige pas : il demande de l'établir, de la tenir à jour et de la fournir à l'autorité de surveillance du marché sur demande motivée. Publier révèle votre surface d'attaque à qui la demande. Décidez-le, ne le subissez pas — et si un client l'exige contractuellement, c'est une négociation, pas une obligation légale.",
  },
  {
    titre: 'Oublier le VEX',
    note: "Embarquer un composant vulnérable ne signifie pas être vulnérable : le code fautif peut être inatteignable dans votre usage. Le VEX est le format qui permet de le dire de façon exploitable, plutôt que de répondre à la main à chaque client à chaque faille. Sans lui, une SBOM publiée génère plus de questions qu'elle n'en règle.",
  },
]
