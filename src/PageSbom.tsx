import { Page } from './components/Cadre'
import { Encadre, Pastille } from './components/Blocs'
import { ModeEmploi } from './components/Pieces'
import { Cmd, Code } from './components/Code'
import { Riche } from './components/Texte'
import {
  CHAMPS,
  ETAPES,
  FORMATS,
  OUTILS_CONSOMMATION,
  OUTILS_ECOSYSTEME,
  OUTILS_GENERIQUES,
  PIEGES,
} from './lib/sbom'
import type { Outil } from './lib/sbom'
import { aujourdhui, joursRestants } from './lib/calendrier'
import { echeanceRelative } from './lib/format'

/**
 * La page la plus technique du site, et la seule dont le droit tient en un
 * paragraphe : tout le reste est de l'ingénierie de chaîne de construction.
 *
 * C'est aussi celle qui justifie le mieux le repositionnement du site vers
 * l'architecte. La SBOM est la seule obligation du corpus qui se règle
 * entièrement dans la CI, sans juriste, en une semaine si l'on s'y prend au
 * début du projet — et qui coûte un trimestre si l'on s'y prend à la fin.
 */
export default function PageSbom() {
  const today = aujourdhui()
  const versSignalement = joursRestants('2026-09-11', today)
  const versConformite = joursRestants('2027-12-11', today)

  return (
    <Page
      chemin="/sbom/"
      titre="La nomenclature logicielle"
      chapeau="Le CRA fait de la SBOM la première obligation légale contraignante de ce genre au monde — et c'est la seule du corpus qui se règle entièrement dans votre chaîne de construction, sans juriste. Le droit tient en une phrase : une nomenclature, dans un format courant lisible par machine, couvrant au minimum les dépendances de premier niveau. Tout le reste est de l'ingénierie, et c'est la vôtre."
    >
      <ModeEmploi
        quand="Dès la mise en place de la chaîne de construction. C'est une semaine au début d'un projet et un trimestre à la fin, quand il faut rétro-documenter des dépendances que plus personne n'a choisies."
        avecQui="Personne. C'est la seule obligation de ce site que vous pouvez livrer seul, et c'est ce qui en fait un bon premier gage à donner à un client qui doute que la conformité soit faisable."
        livrable="Une nomenclature par version publiée, attachée à l'artefact, signée, conservée pour toute la période de support — et versée dans un outil qui la surveille."
      >
        <p>
          L'ordre de mise en place, du plus rentable au moins urgent : générer depuis le
          verrou de dépendances, attacher à l'artefact publié, verser dans un outil de
          surveillance continue. Les deux premières étapes prennent une journée ; la
          troisième est celle qui transforme un document en capacité de réponse, et
          celle qu'on saute.
        </p>
        <p>
          Argument à garder pour le comité de pilotage : la SBOM n'est pas un coût de
          conformité, c'est ce qui vous permettra de répondre en minutes plutôt qu'en
          semaines à la prochaine faille de bibliothèque — et l'article 14 du CRA vous
          donnera vingt-quatre heures.
        </p>
      </ModeEmploi>

      {/* --- Le droit, en un paragraphe -------------------------------- */}
      <section className="mb-14">
        <h2 className="titre mb-4 text-lg text-ink-900">Ce que le texte exige, exactement</h2>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-4 text-sm leading-relaxed text-ink-700">
            <p>
              L'annexe I, partie II, point 1 du règlement (UE) 2024/2847 demande au
              fabricant d'identifier et de documenter les composants de son produit,{' '}
              <strong className="font-semibold text-ink-900">
                y compris en établissant une nomenclature logicielle dans un format
                courant lisible par machine, couvrant au minimum les dépendances de
                premier niveau
              </strong>
              . C'est tout. Le règlement ne nomme aucun format, ne définit pas
              « dépendance de premier niveau », et n'impose pas de publication.
            </p>
            <p>
              Ce vide est son principal défaut pratique, et il se comble par ailleurs :
              la directive technique <strong>BSI TR-03183-2</strong> de l'office fédéral
              allemand donne la première interprétation nationale détaillée d'une
              nomenclature conforme au CRA, avec des correspondances champ à champ pour
              CycloneDX 1.6 et SPDX 3.0.1. Ce n'est pas du droit de l'Union, mais c'est
              aujourd'hui la référence la plus précise, et un dossier qui la suit sera
              difficile à prendre en défaut.
            </p>
            <p>
              La nomenclature n'est pas isolée : elle est une pièce de la documentation
              technique, elle nourrit l'évaluation des risques de l'article 13 §2, et
              c'est elle qui rend tenable le signalement de l'article 14.
            </p>
          </div>

          <div className="space-y-3">
            <Encadre
              teinte={versSignalement >= 0 ? 'ember' : 'ink'}
              titre={`11 septembre 2026 — ${echeanceRelative(versSignalement)}`}
            >
              Signalement des vulnérabilités activement exploitées : vingt-quatre heures.
              Sans nomenclature exploitable, la question « sommes-nous touchés ? » se
              traite en semaines.
            </Encadre>
            <Encadre teinte="gold" titre={`11 décembre 2027 — ${echeanceRelative(versConformite)}`}>
              Exigences essentielles, dont la nomenclature elle-même. C'est la date de
              conformité du produit, pas celle de mise en place de la chaîne.
            </Encadre>
          </div>
        </div>
      </section>

      {/* --- Les formats ------------------------------------------------ */}
      <section className="mb-14">
        <h2 className="titre mb-1 text-lg text-ink-900">Choisir un format</h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Le règlement n'en impose aucun. Trois sont couramment cités comme acceptables,
          et le choix n'est pas indifférent : il décide de ce que vous pourrez faire de
          la nomenclature ensuite.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {FORMATS.map((f) => (
            <article key={f.id} className="card p-5">
              <h3 className="titre text-base text-ink-900">{f.nom}</h3>
              <p className="mt-1 text-xs text-ink-500">{f.norme}</p>
              <p className="mt-0.5 text-xs text-ink-400">Publié par {f.origine}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">{f.fort}</p>
              <p className="mt-3 border-t border-ink-100 pt-3 text-sm leading-relaxed text-ink-500">
                <span className="font-medium text-ink-600">Sa limite : </span>
                {f.limite}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-5 max-w-3xl">
          <Encadre teinte="brand" titre="Si vous n’avez pas de raison de choisir autrement">
            Prenez <strong>CycloneDX</strong>. Il est conçu pour la sécurité, il porte le
            VEX nativement, et c'est le format que consomme Dependency-Track — donc celui
            qui vous mènera le plus vite d'un document à une capacité de réponse.
            Produisez SPDX en plus le jour où un client vous le demande : les outils
            savent convertir, et générer les deux coûte une ligne de plus.
          </Encadre>
        </div>
      </section>

      {/* --- Le contenu -------------------------------------------------- */}
      <section className="mb-14">
        <h2 className="titre mb-1 text-lg text-ink-900">Ce qu’il faut qu’elle contienne</h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Aucun outil ne produit spontanément tous ces champs : vérifiez la sortie avant
          de considérer l'obligation comme réglée.
        </p>
        <div className="card overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {CHAMPS.map((c) => (
              <li key={c.champ} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-5">
                <span className="shrink-0 text-sm font-medium text-ink-900 sm:w-64">
                  {c.champ}
                </span>
                <span className="text-sm leading-relaxed text-ink-600">
                  <RicheAvecCode>{c.note}</RicheAvecCode>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Les outils -------------------------------------------------- */}
      <section className="mb-14">
        <h2 className="titre mb-1 text-lg text-ink-900">Les outils</h2>
        <div className="mb-5 max-w-3xl space-y-3 text-sm leading-relaxed text-ink-600">
          <p>
            Deux familles, et le choix entre elles n'est pas anodin. Les{' '}
            <strong className="text-ink-800">scanneurs génériques</strong> observent un
            répertoire ou une image et déduisent les composants : ils couvrent tout, et
            se trompent aux marges — dépendance copiée dans le dépôt, binaire lié
            statiquement. Les{' '}
            <strong className="text-ink-800">greffons de build</strong> s'insèrent dans le
            résolveur et voient exactement l'arbre que la construction a résolu, sans
            heuristique ; ils sont plus justes et ne couvrent qu'un écosystème.
          </p>
          <p>
            Une chaîne sérieuse emploie les deux : le greffon pour le code que vous
            écrivez, le scanneur pour l'artefact que vous publiez.
          </p>
          <p className="text-ink-500">
            Les commandes sont indicatives — les options dérivent d'une version à
            l'autre. Confrontez-les à la documentation de la version que vous épinglez.
          </p>
        </div>

        <TableOutils titre="Scanneurs génériques" outils={OUTILS_GENERIQUES} />
        <TableOutils
          titre="Greffons de build, au plus près du résolveur"
          outils={OUTILS_ECOSYSTEME}
        />
        <TableOutils
          titre="Ce qu’on en fait ensuite — et c’est là que ça compte"
          outils={OUTILS_CONSOMMATION}
        />
      </section>

      {/* --- La chaîne --------------------------------------------------- */}
      <section className="mb-14">
        <h2 className="titre mb-1 text-lg text-ink-900">Où ça se branche</h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Quatre moments. L'erreur la plus répandue est de s'arrêter au premier : une
          nomenclature générée et jamais rattachée à l'artefact ne prouve rien, et une
          nomenclature jamais surveillée n'a rien empêché.
        </p>
        <ol className="mb-8 grid gap-4 md:grid-cols-2">
          {ETAPES.map((e, i) => (
            <li key={e.id} className="card border-l-4 border-l-brand-500 p-5">
              <div className="flex items-baseline gap-2.5">
                <span className="tabular text-xs font-semibold text-brand-600">
                  {i + 1}
                </span>
                <h3 className="titre text-base text-ink-900">{e.titre}</h3>
              </div>
              <p className="mt-1 text-xs font-medium text-ink-500">{e.quand}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{e.note}</p>
            </li>
          ))}
        </ol>

        <h3 className="titre mb-2 text-base text-ink-900">
          Une chaîne complète — GitHub Actions
        </h3>
        <p className="mb-2 max-w-3xl text-sm leading-relaxed text-ink-600">
          Générer, attacher à l'image publiée, signer l'attestation, verser dans la
          surveillance. Les actions sont épinglées à une empreinte de commit et non à une
          étiquette — la raison est plus bas, et elle est récente.
        </p>
        <Code legende="Extrait de .github/workflows/release.yml. Remplacez les empreintes par celles que vous avez vérifiées.">{`jobs:
  publier:
    permissions:
      contents: read
      packages: write
      id-token: write        # signature sans clé, via Sigstore
      attestations: write    # attestation rattachée à l'artefact
    steps:
      - uses: actions/checkout@<empreinte-de-commit>

      # 1. Construire l'image ET sa nomenclature, en une passe.
      #    BuildKit attache la SBOM à l'image dans le registre.
      - uses: docker/build-push-action@<empreinte-de-commit>
        id: build
        with:
          push: true
          sbom: true
          provenance: mode=max
          tags: ghcr.io/\${{ github.repository }}:\${{ github.ref_name }}

      # 2. Nomenclature du code source, plus juste que celle de l'image
      #    sur vos propres dépendances : les deux sont utiles.
      - run: npm sbom --sbom-format cyclonedx > sbom.json

      # 3. Rattacher la nomenclature à l'artefact publié, et la signer.
      - uses: actions/attest-sbom@<empreinte-de-commit>
        with:
          subject-name: ghcr.io/\${{ github.repository }}
          subject-digest: \${{ steps.build.outputs.digest }}
          sbom-path: sbom.json

      # 4. Verser dans la surveillance continue. Sans cette étape,
      #    vous avez produit un document, pas une capacité de réponse.
      - run: |
          curl -sSf -X POST "$DT_URL/api/v1/bom" \\
            -H "X-Api-Key: $DT_KEY" \\
            -F "projectName=\${{ github.repository }}" \\
            -F "projectVersion=\${{ github.ref_name }}" \\
            -F "autoCreate=true" \\
            -F "bom=@sbom.json"
        env:
          DT_URL: \${{ vars.DEPENDENCY_TRACK_URL }}
          DT_KEY: \${{ secrets.DEPENDENCY_TRACK_KEY }}`}</Code>

        <h3 className="titre mt-8 mb-2 text-base text-ink-900">La même chose — GitLab CI</h3>
        <Code legende="Extrait de .gitlab-ci.yml. GitLab sait aussi produire des rapports CycloneDX nativement via ses modèles de sécurité.">{`nomenclature:
  stage: build
  image: anchore/syft:v1.20.0@sha256:<empreinte>
  script:
    # Générer depuis l'artefact construit, pas depuis le dépôt.
    - syft scan oci-dir:./image -o cyclonedx-json=sbom.json
    - syft scan oci-dir:./image -o spdx-json=sbom.spdx.json
  artifacts:
    paths: [sbom.json, sbom.spdx.json]
    # Aligner sur la période de support annoncée, pas sur la valeur
    # par défaut : une nomenclature purgée à 30 jours ne tient pas
    # un engagement de cinq ans.
    expire_in: never

surveillance:
  stage: deploy
  needs: [nomenclature]
  script:
    - |
      curl -sSf -X POST "$DT_URL/api/v1/bom" \\
        -H "X-Api-Key: $DT_KEY" \\
        -F "projectName=$CI_PROJECT_PATH" \\
        -F "projectVersion=$CI_COMMIT_TAG" \\
        -F "autoCreate=true" \\
        -F "bom=@sbom.json"`}</Code>

        <div className="mt-6 max-w-3xl">
          <Encadre teinte="gold" titre="Le point que tout le monde rate">
            <Cmd>expire_in</Cmd> et la rétention des artefacts de CI. Si vous annoncez
            une période de support de cinq ans au titre de l'article 13 §8, vous devez
            pouvoir répondre pendant cinq ans sur une version publiée aujourd'hui. Une
            nomenclature qui vit dans les artefacts d'un job purgé à quatre-vingt-dix
            jours ne tient pas cet engagement — et personne ne s'en aperçoit avant d'en
            avoir besoin.
          </Encadre>
        </div>
      </section>

      {/* --- Le générateur est lui-même une dépendance ------------------- */}
      <section className="mb-14 max-w-3xl">
        <h2 className="titre mb-3 text-lg text-ink-900">
          Votre générateur de nomenclature est lui-même une dépendance
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-ink-700">
          <p>
            Le 19 mars 2026, <strong>Trivy</strong> — l'un des scanneurs les plus
            répandus — a été compromis. L'attaquant a publié une version piégée, puis a
            <strong> réécrit soixante-seize des soixante-dix-sept étiquettes</strong> du
            dépôt <Cmd>aquasecurity/trivy-action</Cmd> pour les faire pointer vers un
            voleur d'identifiants, et l'ensemble des étiquettes de{' '}
            <Cmd>aquasecurity/setup-trivy</Cmd>. Des images Docker Hub malveillantes ont
            suivi le 22 mars. Les secrets de chaînes d'intégration ont été exfiltrés, et
            un ver s'est propagé dans l'écosystème npm à partir des jetons de publication
            volés.
          </p>
          <p>
            L'incident est résolu : les composants malveillants ont été retirés et des
            versions saines republiées. Mais il laisse une leçon d'architecture qui vaut
            bien au-delà de Trivy, et qui est exactement le sujet de cette page.
          </p>
          <div className="rounded-xl border-l-4 border-l-ember-500 bg-ember-50 p-4">
            <p className="font-semibold text-ember-900">
              Épingler une étiquette n'est pas épingler.
            </p>
            <p className="mt-1.5 text-ember-900">
              Une étiquette est un pointeur mutable : elle peut être déplacée par
              quiconque obtient les droits de publication, et c'est précisément ce qui
              s'est passé soixante-seize fois. Épinglez les actions à une{' '}
              <strong>empreinte de commit complète</strong>, et les images à un{' '}
              <strong>condensat</strong> — jamais à <Cmd>@v1</Cmd> ni à{' '}
              <Cmd>:latest</Cmd>. C'est la seule mesure qui aurait tenu ce jour-là.
            </p>
          </div>
          <p>
            Et l'ironie utile : une organisation disposant de nomenclatures à jour et
            d'une surveillance continue a su en quelques minutes quels de ses pipelines
            avaient tiré les versions piégées. Les autres ont passé la semaine à
            chercher. C'est le meilleur argument que vous puissiez présenter pour
            financer ce chantier — il ne s'agit pas de conformité, il s'agit de savoir.
          </p>
        </div>
      </section>

      {/* --- Les pièges -------------------------------------------------- */}
      <section className="mb-14">
        <h2 className="titre mb-1 text-lg text-ink-900">Six pièges</h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Ceux qui font qu'une nomenclature existe et ne sert à rien.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {PIEGES.map((p) => (
            <article key={p.titre} className="card p-5">
              <div className="flex items-baseline gap-2">
                <Pastille teinte="ember">piège</Pastille>
                <h3 className="titre text-base text-ink-900">{p.titre}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{p.note}</p>
            </article>
          ))}
        </div>
      </section>

      {/* --- Ce que le CRA n'exige pas ----------------------------------- */}
      <section className="max-w-3xl">
        <h2 className="titre mb-3 text-lg text-ink-900">Ce que le CRA n’exige pas</h2>
        <p className="mb-4 text-sm leading-relaxed text-ink-600">
          Autant que ce qu'il exige : un chantier de conformité déborde presque toujours
          sur des choses que personne ne demande.
        </p>
        <ul className="space-y-3 text-sm leading-relaxed text-ink-700">
          {[
            [
              'Publier la nomenclature',
              "Le règlement demande de l'établir, de la tenir à jour et de la fournir à l'autorité de surveillance du marché sur demande motivée. La publication est un choix commercial ou contractuel, jamais une obligation légale — et elle expose votre surface d'attaque.",
            ],
            [
              'Produire l’arbre transitif complet',
              "Le minimum légal est le premier niveau. Produisez tout de même l'arbre complet, que l'outillage donne gratuitement : c'est dans les dépendances transitives que se logent les failles.",
            ],
            [
              'Adopter un format précis',
              "Aucun n'est nommé dans le texte. CycloneDX, SPDX et SWID sont les formats couramment cités comme acceptables.",
            ],
            [
              'Une nomenclature par livraison continue',
              "L'obligation porte sur le produit mis sur le marché. Si vous publiez cent fois par jour en interne et livrez une version par trimestre, ce sont les versions livrées qui doivent être documentées et conservées.",
            ],
          ].map(([titre, note]) => (
            <li key={titre} className="flex gap-3">
              <span aria-hidden="true" className="mt-1 shrink-0 text-jade-600">
                ✕
              </span>
              <span>
                <strong className="font-semibold text-ink-900">{titre}.</strong> {note}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Encadre teinte="brand" titre="Où ça se raccroche au reste du site">
            La nomenclature se déclare dans l'
            <a href="/produit/" className="font-medium underline">
              évaluation des risques de l'article 13 §2
            </a>{' '}
            — champ « nomenclature logicielle » —, et la chaîne de signalement qu'elle
            alimente se prépare dans les{' '}
            <a href="/responsabilites/" className="font-medium underline">
              délais de notification
            </a>
            . Elle figure enfin au registre de responsabilité, avec une revue attendue
            tous les trois mois : c'est la périodicité la plus courte du registre, parce
            que c'est la pièce qui se périme le plus vite.
          </Encadre>
        </div>
      </section>
    </Page>
  )
}

/** Les notes du module portent leur emphase en gras et leurs commandes en `dos d'âne`. */
function RicheAvecCode({ children }: { children: string }) {
  const morceaux = children.split(/(`[^`]+`)/g)
  return (
    <>
      {morceaux.map((m, i) =>
        m.startsWith('`') && m.endsWith('`') ? (
          <Cmd key={i}>{m.slice(1, -1)}</Cmd>
        ) : (
          <Riche key={i}>{m}</Riche>
        ),
      )}
    </>
  )
}

function TableOutils({ titre, outils }: { titre: string; outils: Outil[] }) {
  return (
    <div className="mb-8">
      <h3 className="titre mb-3 text-base text-ink-900">{titre}</h3>
      <div className="card divide-y divide-ink-100 overflow-hidden">
        {outils.map((o) => (
          <div key={o.outil + o.ecosysteme} className="p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h4 className="text-sm font-semibold text-ink-900">{o.outil}</h4>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-ink-400">{o.ecosysteme}</span>
                <Pastille teinte="brand">{o.formats}</Pastille>
              </div>
            </div>
            <pre className="mt-2.5 overflow-x-auto rounded-lg bg-ink-900 px-3 py-2 font-mono text-xs text-ink-100">
              {o.commande}
            </pre>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{o.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
