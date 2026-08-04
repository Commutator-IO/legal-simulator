import { useMemo, useState } from 'react'
import { Page } from './components/Cadre'
import { Encadre, Pastille, Stat } from './components/Blocs'
import { Frise } from './components/Frise'
import { ECHEANCES, aujourdhui, instant, joursRestants, statut } from './lib/calendrier'
import type { Echeance, Statut } from './lib/calendrier'
import { DOMAINES, texte } from './lib/textes'
import type { Domaine } from './lib/textes'
import { echeanceRelative, jour } from './lib/format'
import { BORDURE_GAUCHE, TEXTE } from './lib/couleurs'
import type { Teinte } from './lib/couleurs'

const TEINTE_STATUT: Record<Statut, Teinte> = {
  passee: 'ink',
  imminente: 'ember',
  proche: 'gold',
  lointaine: 'brand',
}

const LIBELLE_STATUT: Record<Statut, string> = {
  passee: 'déjà applicable',
  imminente: 'moins de 90 jours',
  proche: 'dans l’année',
  lointaine: 'au-delà d’un an',
}

export default function PageCalendrier() {
  const today = aujourdhui()
  const [filtre, setFiltre] = useState<Domaine | 'tous'>('tous')
  const [montrerPassees, setMontrerPassees] = useState(false)
  const [selection, setSelection] = useState<string | undefined>()

  const visibles = useMemo(() => {
    return ECHEANCES.filter((e) => filtre === 'tous' || e.domaine === filtre)
      .filter((e) => montrerPassees || joursRestants(e.date, today) >= 0)
      .sort((a, b) => instant(a.date) - instant(b.date))
  }, [filtre, montrerPassees, today])

  const futures = visibles.filter((e) => joursRestants(e.date, today) >= 0)
  const imminentes = futures.filter((e) => statut(e.date, today) === 'imminente')
  const dansLAnnee = futures.filter((e) => joursRestants(e.date, today) <= 365)

  return (
    <Page
      chemin="/calendrier/"
      titre="Calendrier d'application"
      chapeau="Une échéance est la date à laquelle une obligation devient opposable — pas celle de l'adoption du texte, ni celle de son entrée en vigueur. L'AI Act est en vigueur depuis août 2024 ; ses obligations sur les systèmes à haut risque de l'annexe III ne mordront qu'en décembre 2027. Confondre les deux fait paniquer trop tôt, ou découvrir trop tard qu'une échéance intermédiaire est passée."
    >
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat valeur={String(futures.length)} libelle="échéances à venir" teinte="brand" />
        <Stat
          valeur={String(imminentes.length)}
          libelle="à moins de 90 jours"
          teinte={imminentes.length > 0 ? 'ember' : 'ink'}
        />
        <Stat
          valeur={String(dansLAnnee.length)}
          libelle="dans les douze mois"
          teinte="gold"
        />
        <Stat
          valeur={String(ECHEANCES.length - futures.length)}
          libelle="déjà applicables"
          teinte="ink"
        />
      </div>

      <div className="sans-impression mb-6 flex flex-wrap items-center gap-2">
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
          Tous les domaines
        </button>
        {Object.entries(DOMAINES).map(([id, d]) => (
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
            {d.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={montrerPassees}
            onChange={(e) => setMontrerPassees(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Afficher les échéances écoulées
        </label>
      </div>

      <Frise
        echeances={visibles}
        aujourdhui={today}
        selection={selection}
        onSelect={(e) => setSelection(`${e.date}-${e.titre}`)}
      />

      <ol className="mt-8 space-y-4">
        {visibles.map((e) => (
          <Ligne
            key={`${e.date}-${e.titre}`}
            echeance={e}
            today={today}
            actif={selection === `${e.date}-${e.titre}`}
            onSelect={() => setSelection(`${e.date}-${e.titre}`)}
          />
        ))}
      </ol>

      {visibles.length === 0 && (
        <Encadre teinte="ink">
          Aucune échéance à venir dans ce domaine. Cochez « afficher les échéances
          écoulées » : ce qui est derrière vous reste opposable, et c'est souvent là
          que se trouvent les retards.
        </Encadre>
      )}

      <section className="mt-14 max-w-3xl">
        <h2 className="titre mb-3 text-lg text-ink-900">Trois dates à retenir</h2>
        <div className="space-y-3 text-sm leading-relaxed text-ink-700">
          <p>
            <strong className="font-semibold text-ink-900">11 septembre 2026.</strong>{' '}
            Le signalement du CRA devient exigible quinze mois avant le reste du
            règlement. C'est une inversion de l'ordre habituel : il faut une chaîne
            d'astreinte capable de tenir 24 heures un week-end, pour des produits qui,
            eux, n'ont pas encore à être conformes.
          </p>
          <p>
            <strong className="font-semibold text-ink-900">2 décembre 2027.</strong>{' '}
            Les systèmes d'IA à haut risque de l'annexe III. L'échéance a été reportée
            de seize mois par l'omnibus, ce qui a produit le plus grand malentendu de
            l'année : le report ne concerne ni les pratiques interdites, ni la maîtrise
            de l'IA, ni les modèles à usage général, ni la transparence de l'article
            50 — tous déjà applicables.
          </p>
          <p>
            <strong className="font-semibold text-ink-900">11 décembre 2027.</strong>{' '}
            Le CRA en entier. À partir de là, un produit comportant des éléments
            numériques ne peut plus être mis sur le marché de l'Union sans marquage CE
            de cybersécurité et sans période de support annoncée. Neuf jours après
            l'échéance IA : les deux chantiers se télescopent, et ils mobilisent les
            mêmes équipes.
          </p>
        </div>
      </section>
    </Page>
  )
}

function Ligne({
  echeance: e,
  today,
  actif,
  onSelect,
}: {
  echeance: Echeance
  today: string
  actif: boolean
  onSelect: () => void
}) {
  const s = statut(e.date, today)
  const jours = joursRestants(e.date, today)
  const t = texte(e.texte)
  const teinte = TEINTE_STATUT[s]

  return (
    <li
      onClick={onSelect}
      className={[
        'card cursor-pointer border-l-4 p-5 transition',
        BORDURE_GAUCHE[teinte],
        actif ? 'ring-2 ring-brand-300' : 'hover:shadow-md',
        s === 'passee' ? 'opacity-70' : '',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <time
          dateTime={e.date}
          className={`tabular text-sm font-semibold ${TEXTE[teinte]}`}
        >
          {jour(e.date)}
        </time>
        <Pastille teinte={teinte}>{LIBELLE_STATUT[s]}</Pastille>
        <span className="text-xs text-ink-400">{echeanceRelative(jours)}</span>
        <span className="ml-auto text-xs text-ink-400">{t.reference}</span>
      </div>

      <h3 className="titre mt-2 text-base text-ink-900">{e.titre}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{e.detail}</p>
      <p className="mt-2 text-xs text-ink-500">
        <span className="font-medium">Concerne :</span> {e.qui}
      </p>
    </li>
  )
}
