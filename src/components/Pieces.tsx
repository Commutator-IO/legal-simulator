import { useRef } from 'react'
import { Date_, Texte } from './Champs'
import { Jauge, Pastille } from './Blocs'
import type { Suivi } from '../lib/suivi'
import { LIBELLE_ETAT, TEINTE_ETAT, etatSuivi } from '../lib/suivi'
import { exporterJson, importerJson } from '../lib/stockage'
import { aujourdhui } from '../lib/calendrier'

/**
 * Les briques communes à toutes les pièces du site.
 *
 * Huit registres écrits huit fois divergent en trois semaines : le bouton
 * d'export d'un formulaire finit ailleurs que celui du voisin, l'un se souvient
 * de la date de revue et l'autre l'oublie. Ces composants existent pour que la
 * question ne se pose pas.
 */

/** Les onglets internes d'une page. */
export function Onglets<T extends string>({
  valeur,
  options,
  onChange,
}: {
  valeur: T
  options: { id: T; label: string; compte?: number }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="sans-impression mb-8 flex flex-wrap gap-1 border-b border-ink-200">
      {options.map((o) => {
        const actif = o.id === valeur
        return (
          <button
            key={o.id}
            type="button"
            aria-current={actif ? 'page' : undefined}
            onClick={() => onChange(o.id)}
            className={[
              '-mb-px flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition',
              actif
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-900',
            ].join(' ')}
          >
            {o.label}
            {o.compte !== undefined && (
              <span
                className={[
                  'tabular rounded-full px-1.5 py-0.5 text-[11px]',
                  actif ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-500',
                ].join(' ')}
              >
                {o.compte}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Ajouter, exporter, importer, imprimer.
 *
 * L'export est au même niveau visuel que la saisie, et non relégué en bas de
 * page : tout vit dans le navigateur, donc vider le cache efface le travail.
 * Une sauvegarde qu'on ne voit pas n'est pas faite.
 */
export function BarreOutils<T>({
  onAjouter,
  libelleAjout,
  donnees,
  onImporter,
  nomFichier,
  vide,
}: {
  onAjouter: () => void
  libelleAjout: string
  donnees: T[]
  onImporter: (d: T[]) => void
  nomFichier: string
  vide: boolean
}) {
  const fichier = useRef<HTMLInputElement>(null)

  return (
    <div className="sans-impression mb-8 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onAjouter}
        className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800"
      >
        {libelleAjout}
      </button>
      <button
        type="button"
        onClick={() => exporterJson(`${nomFichier}-${aujourdhui()}.json`, donnees)}
        disabled={vide}
        className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-ink-700 ring-1 ring-ink-200 transition hover:text-ink-900 disabled:opacity-40"
      >
        Exporter
      </button>
      <button
        type="button"
        onClick={() => fichier.current?.click()}
        className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-ink-700 ring-1 ring-ink-200 transition hover:text-ink-900"
      >
        Importer
      </button>
      <input
        ref={fichier}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (!f) return
          importerJson<T[]>(f)
            .then((d) => Array.isArray(d) && onImporter(d))
            .catch(() => undefined)
          // Sans cette remise à zéro, réimporter le même fichier deux fois de
          // suite ne déclenche aucun événement.
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-ink-700 ring-1 ring-ink-200 transition hover:text-ink-900"
      >
        Imprimer
      </button>
      <span className="text-xs text-ink-400">
        Tout reste dans votre navigateur. Vider le cache efface les registres — exportez.
      </span>
    </div>
  )
}

/** Les trois champs de traçabilité, identiques sur toutes les pièces. */
export function ChampsSuivi({
  suivi,
  onChange,
  roleValidateur = 'Validé par',
}: {
  suivi: Suivi
  onChange: (s: Suivi) => void
  roleValidateur?: string
}) {
  return (
    <div className="grid gap-4 rounded-xl bg-ink-50 p-4 sm:grid-cols-3">
      <Texte
        label="Responsable"
        valeur={suivi.responsable}
        onChange={(v) => onChange({ ...suivi, responsable: v })}
        placeholder="Nom et prénom"
        aide="Une personne, pas un service : « la DSI » ne répond de rien."
      />
      <Texte
        label={roleValidateur}
        valeur={suivi.validateur}
        onChange={(v) => onChange({ ...suivi, validateur: v })}
        placeholder="Nom et prénom"
      />
      <Date_
        label="Dernière revue"
        valeur={suivi.derniereRevue}
        onChange={(v) => onChange({ ...suivi, derniereRevue: v })}
      />
    </div>
  )
}

/** L'en-tête d'une fiche : rang, titre, état de suivi, complétude, actions. */
export function EnteteFiche({
  index,
  titre,
  vide,
  suivi,
  revueMois = 12,
  completude,
  onDupliquer,
  onSupprimer,
  children,
}: {
  index: number
  titre: string
  /** Ce qu'on affiche quand la fiche n'a pas encore de nom. */
  vide: string
  suivi: Suivi
  revueMois?: number
  completude?: number
  onDupliquer?: () => void
  onSupprimer: () => void
  /** Pastilles supplémentaires, propres à la page. */
  children?: React.ReactNode
}) {
  const etat = etatSuivi(suivi, revueMois, aujourdhui())

  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-semibold text-ink-600">
          {index}
        </span>
        <div className="min-w-0">
          <h3 className="titre truncate text-base text-ink-900">
            {titre || <span className="text-ink-400">{vide}</span>}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Pastille teinte={TEINTE_ETAT[etat]}>{LIBELLE_ETAT[etat]}</Pastille>
            {children}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {completude !== undefined && (
          <div className="w-28">
            <Jauge
              part={completude}
              teinte={completude > 0.85 ? 'jade' : completude > 0.5 ? 'gold' : 'ember'}
              libelle="complétude"
            />
          </div>
        )}
        <div className="sans-impression flex gap-3 text-xs">
          {onDupliquer && (
            <button
              type="button"
              onClick={onDupliquer}
              className="text-ink-400 transition hover:text-brand-700"
            >
              Dupliquer
            </button>
          )}
          <button
            type="button"
            onClick={onSupprimer}
            className="text-ink-400 transition hover:text-ember-600"
          >
            Supprimer
          </button>
        </div>
      </div>
    </header>
  )
}

/** Les mentions dues et non renseignées, en pied de fiche. */
export function Manquants({ items }: { items: { champ: string; article: string }[] }) {
  if (items.length === 0) return null
  return (
    <div className="mt-5 border-t border-ink-100 pt-4">
      <p className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
        Mentions dues et non renseignées
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((m) => (
          <Pastille key={m.champ} teinte="ember">
            {m.champ} · {m.article}
          </Pastille>
        ))}
      </div>
    </div>
  )
}

/** L'invite affichée quand un registre est vide, avec ce par quoi commencer. */
export function Amorce({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="card max-w-3xl p-6">
      <h3 className="titre mb-2 text-base text-ink-900">{titre}</h3>
      <div className="space-y-3 text-sm leading-relaxed text-ink-600">{children}</div>
    </div>
  )
}

/**
 * Le mode d'emploi d'un outil, en mission.
 *
 * Un formulaire de conformité posé sans contexte laisse la question la plus
 * utile sans réponse : *quand est-ce que je remplis ça, avec qui, et qu'est-ce
 * que j'en sors ?* C'est particulièrement vrai pour un architecte, qui
 * n'exécute pas une procédure mais prépare une décision — et dont la valeur
 * ajoutée tient souvent à avoir posé la question au bon moment du projet.
 *
 * Les trois champs sont volontairement rigides : le moment, l'interlocuteur,
 * le livrable. Un outil dont on ne sait pas nommer le livrable n'a pas sa place
 * dans une mission.
 */
export function ModeEmploi({
  quand,
  avecQui,
  livrable,
  children,
}: {
  /** À quel moment du projet on s'en sert — et pourquoi pas plus tard. */
  quand: string
  /** Qui doit être dans la pièce : l'architecte seul ne tranche presque rien. */
  avecQui: string
  /** Ce qu'on remet à la fin. */
  livrable: string
  /** La marche à suivre, en deux ou trois phrases. */
  children?: React.ReactNode
}) {
  return (
    <details className="mb-8 rounded-[var(--radius-card)] border border-brand-200 bg-brand-50/60">
      <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-semibold text-brand-800">
        <span className="mr-1.5" aria-hidden="true">
          ▸
        </span>
        Dans votre mission — quand s'en servir, avec qui, ce que vous produisez
      </summary>
      <div className="border-t border-brand-200 px-5 py-4">
        <dl className="grid gap-4 sm:grid-cols-3">
          {[
            { t: 'Quand', v: quand },
            { t: 'Avec qui', v: avecQui },
            { t: 'Ce que vous produisez', v: livrable },
          ].map((x) => (
            <div key={x.t}>
              <dt className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
                {x.t}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-700">{x.v}</dd>
            </div>
          ))}
        </dl>
        {children && (
          <div className="mt-4 space-y-2 border-t border-brand-200/70 pt-4 text-sm leading-relaxed text-ink-700">
            {children}
          </div>
        )}
      </div>
    </details>
  )
}
