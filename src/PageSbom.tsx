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
 * paragraphe : tout le reste est de l'ingénierie de pipeline.
 *
 * C'est aussi celle qui justifie le mieux le repositionnement du site vers
 * l'architecte. Le SBOM est la seule obligation du corpus qui se règle
 * entièrement dans la CI, sans juriste, en une semaine si l'on s'y prend au
 * début du projet — et qui coûte un trimestre si l'on s'y prend à la fin.
 *
 * Vocabulaire : contrairement au reste du site, cette page emploie les termes
 * anglais du métier — lockfile, digest, tag, plugin, scanner, registry,
 * pipeline. Un architecte qui écrit un fichier de CI ne cherche pas
 * « condensat », et « registre » entrerait ici en collision avec les registres
 * du RGPD tenus ailleurs. Les formulations officielles ne sont conservées que
 * dans les citations du texte.
 */
export default function PageSbom() {
  const today = aujourdhui()
  const versSignalement = joursRestants('2026-09-11', today)
  const versConformite = joursRestants('2027-12-11', today)

  return (
    <Page
      chemin="/sbom/"
      titre="Le SBOM"
      chapeau="Le CRA fait du SBOM la première obligation légale contraignante de ce genre au monde — et c'est la seule du corpus qui se règle entièrement dans votre pipeline, sans juriste. Le droit tient en une phrase : une « nomenclature logicielle », dans un format courant lisible par machine, couvrant au minimum les dépendances de premier niveau. Tout le reste est de l'ingénierie, et c'est la vôtre. Cette page emploie donc les termes du métier plutôt que leurs traductions — lockfile, digest, tag, plugin, registry."
    >
      <ModeEmploi
        quand="Dès la mise en place du pipeline. C'est une semaine au début d'un projet et un trimestre à la fin, quand il faut rétro-documenter des dépendances que plus personne n'a choisies."
        avecQui="Personne. C'est la seule obligation de ce site que vous pouvez livrer seul, et c'est ce qui en fait un bon premier gage à donner à un client qui doute que la conformité soit faisable."
        livrable="Un SBOM par version publiée, attaché à l'artefact, signé, conservé pour toute la période de support — et poussé dans un outil qui le monitore."
      >
        <p>
          L'ordre de mise en place, du plus rentable au moins urgent : générer depuis le
          lockfile, attacher à l'artefact publié, pousser dans un outil de monitoring
          continu. Les deux premières étapes prennent une journée ; la troisième est
          celle qui transforme un document en capacité de réponse, et celle qu'on saute.
        </p>
        <p>
          Argument à garder pour le comité de pilotage : le SBOM n'est pas un coût de
          conformité, c'est ce qui vous permettra de répondre en minutes plutôt qu'en
          semaines à la prochaine CVE de bibliothèque — et l'article 14 du CRA vous
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
              . C'est tout — et « nomenclature logicielle » est la traduction officielle
              de <em>software bill of materials</em>. Le règlement ne nomme aucun format,
              ne définit pas ce qu'est une dépendance <em>top-level</em>, et n'impose
              aucune publication.
            </p>
            <p>
              Ce vide est son principal défaut pratique, et il se comble par ailleurs :
              la directive technique <strong>BSI TR-03183-2</strong> de l'office fédéral
              allemand donne la première interprétation nationale détaillée d'un SBOM
              conforme au CRA, avec des correspondances champ à champ pour CycloneDX 1.6
              et SPDX 3.0.1. Ce n'est pas du droit de l'Union, mais c'est aujourd'hui la
              référence la plus précise, et un dossier qui la suit sera difficile à
              prendre en défaut.
            </p>
            <p>
              Le SBOM n'est pas isolé : c'est une pièce de la documentation technique, il
              nourrit l'évaluation des risques de l'article 13 §2, et c'est lui qui rend
              tenable le signalement de l'article 14.
            </p>
          </div>

          <div className="space-y-3">
            <Encadre
              teinte={versSignalement >= 0 ? 'ember' : 'ink'}
              titre={`11 septembre 2026 — ${echeanceRelative(versSignalement)}`}
            >
              Signalement des vulnérabilités activement exploitées : vingt-quatre heures.
              Sans SBOM exploitable, la question « sommes-nous touchés ? » se traite en
              semaines.
            </Encadre>
            <Encadre teinte="gold" titre={`11 décembre 2027 — ${echeanceRelative(versConformite)}`}>
              Exigences essentielles, dont le SBOM lui-même. C'est la date de conformité
              du produit, pas celle de mise en place du pipeline.
            </Encadre>
          </div>
        </div>
      </section>

      {/* --- Les formats ------------------------------------------------ */}
      <section className="mb-14">
        <h2 className="titre mb-1 text-lg text-ink-900">Choisir un format</h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Le règlement n'en impose aucun. Trois sont couramment cités comme acceptables,
          et le choix n'est pas indifférent : il décide de ce que vous pourrez faire du
          SBOM ensuite.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {FORMATS.map((f) => (
            <article key={f.id} className="card p-5">
              <h3 className="titre text-base text-ink-900">{f.nom}</h3>
              <p className="mt-1 text-xs text-ink-500">{f.norme}</p>
              <p className="mt-0.5 text-xs text-ink-400">Publié par {f.origine}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                <RicheAvecCode>{f.fort}</RicheAvecCode>
              </p>
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
            <strong className="text-ink-800">scanners</strong> observent un répertoire ou
            une image et déduisent les composants : ils couvrent tout, et se trompent aux
            marges — dépendance <em>vendored</em> dans le repo, binaire lié statiquement.
            Les <strong className="text-ink-800">plugins de build</strong> s'insèrent dans
            le résolveur et voient exactement l'arbre que le build a résolu, sans
            heuristique ; ils sont plus justes et ne couvrent qu'un écosystème.
          </p>
          <p>
            Un pipeline sérieux emploie les deux : le plugin pour le code que vous
            écrivez, le scanner pour l'artefact que vous publiez.
          </p>
          <p className="text-ink-500">
            Les commandes sont indicatives — les options dérivent d'une version à
            l'autre. Confrontez-les à la documentation de la version que vous épinglez.
          </p>
        </div>

        <TableOutils titre="Scanners génériques" outils={OUTILS_GENERIQUES} />
        <TableOutils
          titre="Plugins de build, au plus près du résolveur"
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
          Quatre moments. L'erreur la plus répandue est de s'arrêter au premier : un SBOM
          généré et jamais rattaché à l'artefact ne prouve rien, et un SBOM jamais
          monitoré n'a rien empêché.
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
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                <RicheAvecCode>{e.note}</RicheAvecCode>
              </p>
            </li>
          ))}
        </ol>

        <h3 className="titre mb-2 text-base text-ink-900">
          Une chaîne complète — GitHub Actions
        </h3>
        <p className="mb-2 max-w-3xl text-sm leading-relaxed text-ink-600">
          Générer, attacher à l'image publiée, signer l'attestation, pousser dans le
          monitoring. Les actions sont pinnées à un commit SHA et non à un tag — la
          raison est plus bas, et elle est récente.
        </p>
        <Code legende="Extrait de .github/workflows/release.yml. Remplacez les SHA par ceux que vous avez vérifiés.">{`jobs:
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
        <Code legende="Extrait de .gitlab-ci.yml. GitLab sait aussi produire des rapports CycloneDX nativement via ses templates de sécurité.">{`nomenclature:
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
            <Cmd>expire_in</Cmd> et la rétention des artifacts de CI. Si vous annoncez
            une période de support de cinq ans au titre de l'article 13 §8, vous devez
            pouvoir répondre pendant cinq ans sur une version publiée aujourd'hui. Un
            SBOM qui vit dans les artifacts d'un job purgé à quatre-vingt-dix jours ne
            tient pas cet engagement — et personne ne s'en aperçoit avant d'en avoir
            besoin.
          </Encadre>
        </div>
      </section>

      {/* --- Le générateur est lui-même une dépendance ------------------- */}
      <section className="mb-14 max-w-3xl">
        <h2 className="titre mb-3 text-lg text-ink-900">
          Votre générateur de SBOM est lui-même une dépendance
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-ink-700">
          <p>
            Le 19 mars 2026, <strong>Trivy</strong> — l'un des scanners les plus répandus
            — a été compromis. L'attaquant a publié une release piégée, puis a{' '}
            <strong>force-pushé soixante-seize des soixante-dix-sept tags</strong> du repo{' '}
            <Cmd>aquasecurity/trivy-action</Cmd> vers un <em>credential stealer</em>, ainsi
            que l'ensemble des tags de <Cmd>aquasecurity/setup-trivy</Cmd>. Des images
            Docker Hub malveillantes ont suivi le 22 mars. Les secrets de CI ont été
            exfiltrés, et un worm s'est propagé dans l'écosystème npm à partir des tokens
            de publication volés.
          </p>
          <p>
            L'incident est résolu : les composants malveillants ont été retirés et des
            versions saines republiées. Mais il laisse une leçon d'architecture qui vaut
            bien au-delà de Trivy, et qui est exactement le sujet de cette page.
          </p>
          <div className="rounded-xl border-l-4 border-l-ember-500 bg-ember-50 p-4">
            <p className="font-semibold text-ember-900">
              Pinner un tag, ce n'est pas pinner.
            </p>
            <p className="mt-1.5 text-ember-900">
              Un tag est un pointeur mutable : il peut être déplacé par quiconque obtient
              les droits de publication, et c'est précisément ce qui s'est passé
              soixante-seize fois. Pinnez les actions à un{' '}
              <strong>commit SHA complet</strong>, et les images à un{' '}
              <strong>digest</strong> — jamais à <Cmd>@v1</Cmd> ni à <Cmd>:latest</Cmd>.
              C'est la seule mesure qui aurait tenu ce jour-là.
            </p>
          </div>
          <p>
            Et l'ironie utile : une organisation disposant de SBOM à jour et d'un
            monitoring continu a su en quelques minutes lesquels de ses pipelines avaient
            tiré les versions piégées. Les autres ont passé la semaine à chercher. C'est
            le meilleur argument que vous puissiez présenter pour financer ce chantier —
            il ne s'agit pas de conformité, il s'agit de savoir.
          </p>
        </div>
      </section>

      {/* --- Les pièges -------------------------------------------------- */}
      <section className="mb-14">
        <h2 className="titre mb-1 text-lg text-ink-900">Six pièges</h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Ceux qui font qu'un SBOM existe et ne sert à rien.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {PIEGES.map((p) => (
            <article key={p.titre} className="card p-5">
              <div className="flex items-baseline gap-2">
                <Pastille teinte="ember">piège</Pastille>
                <h3 className="titre text-base text-ink-900">{p.titre}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                <RicheAvecCode>{p.note}</RicheAvecCode>
              </p>
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
              'Publier le SBOM',
              "Le règlement demande de l'établir, de le tenir à jour et de le fournir à l'autorité de surveillance du marché sur demande motivée. La publication est un choix commercial ou contractuel, jamais une obligation légale — et elle expose votre surface d'attaque.",
            ],
            [
              'Produire l’arbre transitif complet',
              "Le minimum légal est le top-level. Produisez tout de même l'arbre complet, que l'outillage donne gratuitement : c'est dans les dépendances transitives que se logent les CVE.",
            ],
            [
              'Adopter un format précis',
              "Aucun n'est nommé dans le texte. CycloneDX, SPDX et SWID sont les formats couramment cités comme acceptables.",
            ],
            [
              'Un SBOM par déploiement continu',
              "L'obligation porte sur le produit mis sur le marché. Si vous déployez cent fois par jour en interne et livrez une release par trimestre, ce sont les releases qui doivent être documentées et conservées.",
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
            Le SBOM se déclare dans l'
            <a href="/produit/" className="font-medium underline">
              évaluation des risques de l'article 13 §2
            </a>{' '}
            — champ « nomenclature logicielle » —, et la chaîne de signalement qu'il
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
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              <RicheAvecCode>{o.note}</RicheAvecCode>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
