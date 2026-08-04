# Conformité UE — données et logiciels

Un site statique qui répond à quatre questions, dans l'ordre où on se les pose :
**quels textes européens me concernent**, **à quelle date ils mordent**, **ce
qu'ils exigent de mon système ou de mon produit**, et **comment le documenter**.

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
| `/qualification/` | Deux arbres de décision — niveau de risque d'un système d'IA, catégorie CRA d'un produit — qui rendent leur raisonnement |
| `/registre/` | Registre de l'article 30 avec indicateur de complétude, et criblage d'analyse d'impact de l'article 35 |
| `/responsabilites/` | Registre de responsabilité sur dix-neuf obligations transverses, et calculateur superposant les quatre horloges de notification d'incident |

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
src/lib/        le droit — corpus, dates, arbres de décision, et leurs tests
src/components/ Cadre, Champs, Blocs, Frise
src/Page*.tsx   une page par fichier ; un point d'entrée HTML par page
```

Tout le raisonnement réglementaire est dans `src/lib/`, en fonctions pures, et
nulle part dans les composants — un arbre de décision enfoui dans du JSX ne peut
être vérifié que par relecture, et il dérive au premier ajout de case à cocher.

### Les tests

89 tests, dont les valeurs attendues viennent des textes publiés au journal
officiel, jamais de ce que le code produit. Ce qu'ils gardent en priorité :

- les dates d'application, y compris celles déplacées par l'omnibus, et
  l'absence de l'ancienne date d'annexe III ;
- l'ordre des tests dans l'arbre IA — le profilage doit fermer la dérogation de
  l'article 6 §3 *avant* qu'on l'examine, sinon un outil de tri de CV ressort
  « tâche procédurale étroite » ;
- l'arithmétique des délais d'incident : « un mois » est un mois calendaire, et
  la notification initiale DORA retient la plus proche de deux bornes.

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
