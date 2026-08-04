import { useState } from 'react'
import { Page } from './components/Cadre'
import { Detail, Encadre, Pastille } from './components/Blocs'
import { DOMAINES, TEXTES } from './lib/textes'
import type { Domaine, Nature, Texte } from './lib/textes'
import { ECHEANCES, aujourdhui, instant, joursRestants } from './lib/calendrier'
import { echeanceRelative, jour } from './lib/format'
import { TEXTE as CLASSE_TEXTE } from './lib/couleurs'
import type { Teinte } from './lib/couleurs'
import { NOTIONS } from './lib/notions'
import { Riche } from './components/Texte'
import { ModeEmploi } from './components/Pieces'

const LIBELLE_NATURE: Record<Nature, string> = {
  reglement: 'Règlement — d’application directe',
  directive: 'Directive — à lire avec sa transposition',
  proposition: 'Proposition — pas encore du droit',
}

const TEINTE_NATURE: Record<Nature, Teinte> = {
  reglement: 'brand',
  directive: 'gold',
  proposition: 'ink',
}

export default function PageTextes() {
  const today = aujourdhui()
  const [filtre, setFiltre] = useState<Domaine | 'tous'>('tous')
  const visibles = TEXTES.filter((t) => filtre === 'tous' || t.domaine === filtre)

  return (
    <Page
      chemin="/textes/"
      titre="Les textes, et comment les lire"
      chapeau="Vous n'avez pas à devenir juriste, mais vous ne pouvez pas concevoir sans savoir lire ces textes : ce sont eux qui fixent des contraintes que votre architecture devra porter pendant des années. Commencez par les huit notions ci-dessous — elles suffisent à lire un règlement seul et à savoir quand appeler un juriste. Chaque fiche dit ensuite ce que le texte impose, et surtout ce qu'il impose à la conception."
    >
      <ModeEmploi
        quand="Au démarrage d'une mission, avant l'atelier de cadrage. Une demi-journée de lecture ici évite de découvrir une contrainte structurante après le gel de l'architecture."
        avecQui="Seul. C'est le seul écran du site qui ne demande l'avis de personne — il sert à ne pas arriver ignorant devant le juriste."
        livrable="Rien de formel. Mais vous devez pouvoir dire, pour chaque texte retenu, quel article contraint votre conception et à quelle date."
      >
        <p>
          Lisez d'abord les notions, puis n'ouvrez que les fiches des textes que la{' '}
          <a href="/" className="font-medium underline">
            page Périmètre
          </a>{' '}
          a retenus pour votre client. Sur chaque fiche, la rubrique{' '}
          <em>Ce que ça impose à la conception</em> est celle qui vous concerne
          directement : le reste sert à situer et à argumenter.
        </p>
        <p>
          Un réflexe qui fait gagner du temps en réunion : citez toujours l'article, pas
          le règlement. « L'AI Act nous oblige » n'est discutable par personne ;
          « l'article 12 impose six mois de journaux » se chiffre, se conteste et se
          planifie.
        </p>
      </ModeEmploi>

      <section className="mb-14">
        <h2 className="titre mb-1 text-lg text-ink-900">
          Huit notions pour lire le droit de l'Union
        </h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Chacune est ici parce que la méconnaître produit une erreur de conception
          coûteuse — et l'exemple joint dit laquelle.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {NOTIONS.map((n, i) => (
            <article key={n.id} className="card p-5">
              <div className="flex items-baseline gap-2.5">
                <span className="tabular text-xs font-semibold text-brand-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="titre text-base text-ink-900">{n.titre}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed font-medium text-ink-800">
                <Riche>{n.resume}</Riche>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                <Riche>{n.detail}</Riche>
              </p>
              <p className="mt-3 border-t border-ink-100 pt-3 text-sm leading-relaxed text-ember-800">
                <span className="font-semibold">L'erreur que ça évite : </span>
                <Riche>{n.erreur}</Riche>
              </p>
            </article>
          ))}
        </div>
      </section>

      <h2 className="titre mb-4 text-lg text-ink-900">Les treize textes</h2>
      <div className="sans-impression mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltre('tous')}
          aria-pressed={filtre === 'tous'}
          className={[
            'rounded-lg px-3 py-1.5 text-sm font-medium transition',
            filtre === 'tous'
              ? 'bg-ink-900 text-white'
              : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:text-ink-900',
          ].join(' ')}
        >
          Tous ({TEXTES.length})
        </button>
        {Object.entries(DOMAINES).map(([id, d]) => {
          const n = TEXTES.filter((t) => t.domaine === id).length
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFiltre(id as Domaine)}
              aria-pressed={filtre === id}
              className={[
                'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                filtre === id
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:text-ink-900',
              ].join(' ')}
            >
              {d.label} ({n})
            </button>
          )
        })}
      </div>

      <div className="space-y-6">
        {visibles.map((t) => (
          <Fiche key={t.id} texte={t} today={today} />
        ))}
      </div>
    </Page>
  )
}

function Fiche({ texte: t, today }: { texte: Texte; today: string }) {
  const teinte = DOMAINES[t.domaine].couleur as Teinte
  const echeances = ECHEANCES.filter((e) => e.texte === t.id).sort(
    (a, b) => instant(a.date) - instant(b.date),
  )
  const prochaine = echeances.find((e) => joursRestants(e.date, today) >= 0)

  return (
    <article id={t.id} className="card scroll-mt-24 p-6">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className={`titre text-xl ${CLASSE_TEXTE[teinte]}`}>{t.sigle}</h2>
          <p className="mt-0.5 text-sm text-ink-700">{t.nom}</p>
          <p className="mt-0.5 text-xs text-ink-400">{t.reference}</p>
        </div>
        <Pastille teinte={TEINTE_NATURE[t.nature]}>{LIBELLE_NATURE[t.nature]}</Pastille>
      </header>

      <p className="mt-4 leading-relaxed text-ink-800">{t.objet}</p>

      <div className="mt-4 rounded-xl border-l-4 border-l-brand-500 bg-brand-50/70 p-4">
        <p className="mb-1.5 text-xs font-semibold tracking-wide text-brand-700 uppercase">
          Ce que ça impose à la conception
        </p>
        <p className="text-sm leading-relaxed text-ink-700">
          <Riche>{t.architecture}</Riche>
        </p>
      </div>

      <dl className="mt-5 grid gap-4 border-t border-ink-100 pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
            Qui est visé
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-ink-700">{t.concerne}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
            Sanction encourue
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-ink-700">
            {t.sanction ?? (
              <span className="text-ink-400">
                Le texte ne porte pas de plafond propre ; la sanction relève du droit
                national ou du régime général.
              </span>
            )}
          </dd>
        </div>
      </dl>

      {prochaine && (
        <div className="mt-5">
          <Encadre teinte={joursRestants(prochaine.date, today) <= 90 ? 'ember' : 'gold'}>
            <span className="font-semibold">Prochaine échéance — {jour(prochaine.date)}</span>{' '}
            ({echeanceRelative(joursRestants(prochaine.date, today))}) : {prochaine.titre}.{' '}
            {prochaine.detail}
          </Encadre>
        </div>
      )}

      <div className="mt-5 border-t border-ink-100 pt-5">
        <Detail resume={`Les articles qu'on ouvre (${t.articles.length})`}>
          <ul className="divide-y divide-ink-100">
            {t.articles.map((a) => (
              <li key={a.numero} className="py-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="ref">{a.numero}</span>
                  <span className="text-sm font-medium text-ink-900">{a.titre}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{a.note}</p>
              </li>
            ))}
          </ul>
        </Detail>
      </div>

      <footer className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-100 pt-4 text-sm">
        <a
          href={t.eli}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand-700 hover:underline"
        >
          Le texte sur EUR-Lex ↗
        </a>
        {echeances.length > 0 && (
          <a href="/calendrier/" className="text-ink-500 hover:text-ink-900">
            {echeances.length} échéance{echeances.length > 1 ? 's' : ''} au calendrier
          </a>
        )}
      </footer>
    </article>
  )
}
