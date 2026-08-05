import { Page } from './components/Cadre'
import { Encadre, Pastille } from './components/Blocs'
import { ModeEmploi } from './components/Pieces'
import { Riche } from './components/Texte'
import { HORS_LISTE, PARCOURS, TYPES } from './lib/lectures'
import type { Parcours, Ressource } from './lib/lectures'
import type { Teinte } from './lib/couleurs'
import { aujourdhui, joursRestants } from './lib/calendrier'
import { echeanceRelative, jour } from './lib/format'

/**
 * La liste de lecture.
 *
 * Une page qui n'a aucun formulaire et ne calcule presque rien, mais qui a sa
 * place ici : le reste du site dit ce qu'il faut produire, celle-ci dit ce
 * qu'il faut savoir pour le produire. Elle est courte à dessein — une liste de
 * lecture longue ne se lit pas.
 *
 * Les liens sont datés et vérifiés. Une liste de lecture aux liens morts est
 * pire qu'aucune liste : elle fait perdre du temps *et* de la confiance.
 */
export default function PageLectures() {
  const today = aujourdhui()

  return (
    <Page
      chemin="/lectures/"
      titre="Liste de lecture"
      chapeau="Trois parcours, classés par retour et non par intérêt, chacun rattaché à une échéance du calendrier — c'est la seule façon honnête de hiérarchiser une liste de lecture, parce que sans date tout paraît également urgent et rien ne se fait. Chaque parcours sépare ce qu'on lit de ce qu'on fait, et nomme ce qu'on saura faire à la fin."
    >
      <ModeEmploi
        quand="Avant d'accepter une mission sur le sujet, pas pendant. Le premier parcours se boucle en deux jours, dont une après-midi de manipulation ; les deux autres en une journée chacun."
        avecQui="Seul. C'est de la montée en compétence, pas un atelier — mais le livrable de chaque parcours est fait pour être montré."
        livrable="Trois artefacts, pas trois certificats : un SBOM généré en CI et re-scanné, un graphe de lineage produit depuis un pipeline réel, et une note de cadrage NIS 2 traduisant l'assujettissement en périmètre technique."
      >
        <p>
          Le principe de tri : les trois sujets ne sont pas de même nature. Le premier
          est un <strong>vrai manque</strong> — un outillage à connaître et une échéance
          qui approche. Le deuxième est une <strong>pratique déjà exercée sans nom</strong>{' '}
          : ce qui manque n'est pas la compétence, c'est un outil qu'on ait fait tourner
          au moins une fois. Le troisième est simplement{' '}
          <strong>de la lecture</strong>, et se traite en une après-midi.
        </p>
        <p>
          Ce qui n'est pas sur la liste compte autant : ni certification, ni formation.
          La raison est en bas de page, et elle tient à ce qui fait votre valeur face à
          un client — traduire un texte en contrainte de conception, ce qu'aucun
          certificat n'atteste.
        </p>
      </ModeEmploi>

      <div className="space-y-14">
        {PARCOURS.map((p, i) => (
          <BlocParcours key={p.id} p={p} rang={i + 1} today={today} />
        ))}
      </div>

      {/* --- Ce qui n'y est pas ----------------------------------------- */}
      <section className="mt-16 max-w-3xl">
        <h2 className="titre mb-1 text-lg text-ink-900">
          Ce qui n’est délibérément pas sur la liste
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-ink-600">
          La moitié la plus utile d'une liste de lecture : dire ce qu'on écarte évite de
          le reconsidérer tous les six mois.
        </p>
        <ul className="space-y-4">
          {HORS_LISTE.map((h) => (
            <li key={h.titre} className="flex gap-3">
              <span aria-hidden="true" className="mt-0.5 shrink-0 text-ember-600">
                ✕
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{h.titre}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">
                  <Riche>{h.note}</Riche>
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Encadre teinte="brand" titre="Où ça se raccroche au reste du site">
            Le parcours SBOM se prolonge directement dans la{' '}
            <a href="/sbom/" className="font-medium underline">
              page SBOM
            </a>{' '}
            — outils par écosystème, pipelines complets, pièges. Le parcours NIS 2 répond
            à la question que le{' '}
            <a href="/" className="font-medium underline">
              questionnaire de périmètre
            </a>{' '}
            laisse ouverte, faute de pouvoir trancher un seuil national. Et le lineage
            alimente la section « données d'entraînement » de la{' '}
            <a href="/ia/" className="font-medium underline">
              documentation de l'annexe IV
            </a>
            , qui est la plus scrutée et la plus coûteuse à reconstituer après coup.
          </Encadre>
        </div>
      </section>
    </Page>
  )
}

function BlocParcours({
  p,
  rang,
  today,
}: {
  p: Parcours
  rang: number
  today: string
}) {
  const jours = p.echeance ? joursRestants(p.echeance, today) : undefined

  return (
    <section>
      <header className="mb-4 max-w-3xl">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="tabular text-xs font-semibold text-brand-600">
            {String(rang).padStart(2, '0')}
          </span>
          <Pastille teinte={rang === 1 ? 'ember' : 'ink'}>{p.rang}</Pastille>
          {p.echeance && jours !== undefined && (
            <Pastille teinte={jours <= 90 ? 'ember' : 'gold'}>
              {jour(p.echeance)} — {echeanceRelative(jours)}
            </Pastille>
          )}
        </div>
        <h2 className="titre text-xl text-ink-900">{p.titre}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          <Riche>{p.enjeu}</Riche>
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <ListeRessources
          titre="À lire, dans cet ordre"
          note="L'ordre n'est pas décoratif : chaque entrée suppose la précédente."
          items={p.lectures}
        />
        {p.pratique.length > 0 ? (
          <ListeRessources
            titre="Puis à faire, le même après-midi"
            note="C'est la moitié qui compte. Générer un SBOM sur un projet qu'on connaît déjà apprend plus que la spécification du format."
            items={p.pratique}
          />
        ) : (
          <div className="card flex items-center p-5">
            <p className="text-sm leading-relaxed text-ink-600">
              Pas de volet pratique : ce parcours est de la lecture. Le seul exercice
              utile est de prendre un client réel et d'écrire le périmètre technique que
              son assujettissement impliquerait.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 max-w-3xl rounded-xl border-l-4 border-l-jade-500 bg-jade-50 p-4">
        <p className="mb-1 text-xs font-semibold tracking-wide text-jade-800 uppercase">
          Ce que vous saurez faire à la fin
        </p>
        <p className="text-sm leading-relaxed text-ink-700">
          <Riche>{p.livrable}</Riche>
        </p>
      </div>
    </section>
  )
}

function ListeRessources({
  titre,
  note,
  items,
}: {
  titre: string
  note: string
  items: Ressource[]
}) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-100 bg-ink-50/60 px-5 py-3">
        <h3 className="text-sm font-semibold text-ink-900">{titre}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{note}</p>
      </div>
      <ol className="divide-y divide-ink-100">
        {items.map((r) => (
          <li key={r.url} className="p-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                {r.titre} ↗
              </a>
              <Pastille teinte={TYPES[r.type].teinte as Teinte}>
                {TYPES[r.type].label}
              </Pastille>
              {r.duree && <span className="text-xs text-ink-400">{r.duree}</span>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              <Riche>{r.note}</Riche>
            </p>
            {r.reserve && (
              <p className="mt-2 rounded-lg bg-ember-50 px-3 py-2 text-sm leading-relaxed text-ember-900">
                <span className="font-semibold">Réserve — </span>
                <Riche>{r.reserve}</Riche>
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
