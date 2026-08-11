# Conformité UE — données et logiciels

Un site statique **écrit pour un architecte logiciel**, pas pour un juriste. Il
répond à quatre questions dans l'ordre où on se les pose en mission : **quels
textes européens contraignent cette architecture**, **à quelle date ils
mordent**, **ce qu'ils imposent concrètement à la conception**, et **quelles
pièces il faut produire**.

Le pari : un architecte n'a pas à devenir juriste, mais il ne peut pas concevoir
sans savoir lire ces textes — ce sont eux qui fixent des contraintes que son
architecture portera pendant des années. Alors le site enseigne d'abord (huit
notions suffisent à lire un règlement seul), traduit ensuite chaque texte en
contraintes d'architecture, et dit enfin, pour chaque outil, **quand s'en
servir, avec qui, et ce qu'on en sort**.

→ [legal.commutator.io](https://legal.commutator.io)

État du droit arrêté au **4 août 2026**, règlement (UE) 2026/1744 — l'omnibus
numérique sur l'IA, publié au JOUE le 24 juillet 2026 — compris.

## Le parti pris

Un mémo de conformité liste des obligations. Ce site les **recalcule** à partir
de ce que vous décrivez, et rend son raisonnement article par article. La
différence n'est pas cosmétique : un tableau d'échéances recopié se périme en
silence, tandis qu'un arbre de décision est gardé par une suite de tests. Quand
l'omnibus a repoussé de seize mois les systèmes à haut risque de l'annexe III,
une ligne de `src/lib/calendrier.ts` a changé et trois tests ont dit où
regarder.

Trois règles tenues partout :

- **Chaque texte dit ce qu'il impose à la conception.** C'est la seule rubrique
  du corpus qui ne paraphrase pas le droit : elle parle de modèle de données, de
  purge exécutable, de clé de chiffrement qui ne quitte pas l'Union, de canal de
  mise à jour séparé du canal fonctionnel. Réciter un article à un architecte ne
  l'aide pas ; lui dire ce qu'il doit changer dans son schéma, si.
- **Chaque outil porte son mode d'emploi en mission** — le moment du projet,
  l'interlocuteur, le livrable. Un formulaire de conformité posé sans contexte
  laisse la question la plus utile sans réponse.

- **Rien n'est affirmé sans article.** Chaque obligation citée porte son numéro,
  chaque texte son identifiant ELI — l'adresse EUR-Lex stable, qui survit aux
  refontes de portail. Là où une date résulte d'un raisonnement plutôt que d'une
  lecture directe, le texte le dit.
- **Aucune donnée ne quitte le navigateur.** Un registre de traitement décrit
  précisément où sont vos données personnelles et comment elles sont protégées :
  c'est le document qu'on souhaite le moins voir transiter par un serveur tiers.
  Le site n'a pas de dorsale ; tout est en `localStorage`, exportable en JSON.
- **On ne retire jamais un texte sur une réponse incertaine.** Un faux positif
  coûte une lecture, un faux négatif coûte le dossier.

## Les pages

| Page | Ce qu'elle fait |
|---|---|
| `/` | Douze questions sur votre activité → les textes applicables, avec la raison de chacun et ses échéances |
| `/calendrier/` | Vingt-trois échéances de 2018 à 2030 sur une frise **linéaire dans le temps**, ce qui fait voir la grappe de l'automne 2026 et le creux que le report a ouvert derrière elle |
| `/textes/` | Une fiche par acte : objet, qui est visé, plafond de sanction, articles qu'on ouvre en pratique, lien EUR-Lex |
| `/rgpd/` | Les quatre registres écrits : responsable (art. 30 §1), sous-traitant (art. 30 §2), violations (art. 33 §5), et les huit mentions de l'article 28 |
| `/analyses/` | Impact (art. 35), intérêt légitime (art. 6 §1 f), transfert (Schrems II), droits fondamentaux (AI Act art. 27) |
| `/ia/` | Inventaire des systèmes avec qualification, documentation de l'annexe IV, journal de maîtrise de l'article 4 |
| `/produit/` | Catalogue et catégorie CRA, évaluation des risques (art. 13 §2), déclaration UE de conformité (annexe V), audit d'accessibilité EN 301 549 |
| `/sbom/` | Le SBOM de bout en bout : ce que le texte exige, CycloneDX contre SPDX, les générateurs par écosystème, deux pipelines CI/CD complets, et ce qu'on en fait ensuite. Seule page du site à employer les termes anglais du métier — lockfile, digest, tag, plugin — parce que c'est ce qu'on tape dans un fichier de CI |
| `/responsabilites/` | Registre de responsabilité, calculateur de délais de notification, registre d'information DORA (art. 28 §3) |
| `/lectures/` | Trois parcours de montée en compétence classés par retour et rattachés à une échéance — SBOM, data lineage, cadrage NIS 2 — avec ce qu'on lit, ce qu'on fait, et ce qu'on écarte |

Trois principes de structure :

- **Tout est multi-instances.** Une organisation n'a pas *un* système d'IA, elle
  en a douze ; un fabricant a un catalogue, pas un produit. Le livrable réel de
  l'AI Act est d'ailleurs l'inventaire — la qualification n'en est qu'une
  colonne.
- **Toute pièce porte un responsable, un validateur et une date de revue.** Un
  contrôleur regarde la date avant de lire le fond, parce qu'elle dit seule si
  le document est vivant ou s'il a été produit une fois pour un audit.
- **Chaque page s'ouvre sur un « dans votre mission »** : quand s'en servir,
  avec qui, ce qu'on produit. Un outil dont on ne sait pas nommer le livrable
  n'a pas sa place dans une mission.

## Le corpus

RGPD · ePrivacy · AI Act · Cyber Resilience Act · NIS 2 · DORA · Data Act · Data
Governance Act · DSA · DMA · responsabilité du fait des produits · accessibilité
· machines. Plus le volet données de l'omnibus, signalé comme **proposition** —
il n'est pas du droit positif, et aucune décision d'architecture ne devrait s'y
appuyer avant publication.

## Développement

```bash
npm install
npm run dev
```

Avant de pousser, dans cet ordre :

```bash
npx tsc -b && npm run lint && npm test && npm run build
```

`oxlint --deny-warnings` est indispensable : sans le drapeau, oxlint affiche les
avertissements et sort avec 0.

### Où vit quoi

```
vite.config.ts  greffon `plan-du-site` : émet sitemap.xml et robots.txt
src/lib/site.ts la liste des pages — source unique de la nav et du sitemap
src/lib/        le droit — corpus, dates, arbres de décision, et leurs tests
src/lib/notions.ts  les huit notions pédagogiques, et l'erreur que chacune évite
src/components/ Cadre, Champs, Blocs, Frise, Pieces (dont ModeEmploi)
src/Page*.tsx   une page par fichier ; un point d'entrée HTML par page
```

Tout le raisonnement réglementaire est dans `src/lib/`, en fonctions pures, et
nulle part dans les composants — un arbre de décision enfoui dans du JSX ne peut
être vérifié que par relecture, et il dérive au premier ajout de case à cocher.

### Les tests

143 tests, dont les valeurs attendues viennent des textes publiés au journal
officiel, jamais de ce que le code produit. Ce qu'ils gardent en priorité :

- les dates d'application, y compris celles déplacées par l'omnibus, et
  l'absence de l'ancienne date d'annexe III ;
- l'ordre des tests dans l'arbre IA — le profilage doit fermer la dérogation de
  l'article 6 §3 *avant* qu'on l'examine, sinon un outil de tri de CV ressort
  « tâche procédurale étroite » ;
- l'arithmétique des délais d'incident : « un mois » est un mois calendaire, et
  la notification initiale DORA retient la plus proche de deux bornes ;
- les choix d'agrégation qui portent un jugement : le risque d'une AIPD est le
  **maximum** de gravité et vraisemblance et non leur produit, l'accessibilité
  retient le **maillon le plus faible** et non une moyenne, et l'article 28 est
  **binaire** — sept mentions sur huit ne valent pas 87 % ;
- le fait que la consultation préalable de l'article 36 se déclenche sur le
  risque *résiduel*, jamais sur le risque brut ;
- le registre du sous-traitant, qui ne doit jamais réclamer les finalités : un
  sous-traitant ne les détermine pas.

## Avertissement

Ce site n'est pas un conseil juridique. Il oriente ; il ne qualifie pas à votre
place. La frontière entre un usage listé à l'annexe III et un usage anodin se
joue souvent sur une phrase de considérant, et la qualification engage celui qui
la signe.

Une erreur de droit ? [Ouvrez une
issue](https://github.com/Commutator-IO/legal-simulator/issues/new) — avec
l'article, si possible.

## Licence

MIT.
