import { useMemo, useState } from 'react'
import { Page } from './components/Cadre'
import { Case, Date_, Segments, Texte } from './components/Champs'
import { Encadre, Jauge, Obligations, Pastille, Stat } from './components/Blocs'
import {
  OBLIGATIONS,
  STATUTS,
  affectationVide,
  couverture,
  perimee,
} from './lib/responsabilites'
import type { Affectation, Domaine, Statut } from './lib/responsabilites'
import { REGIMES, etat, jalons, reste } from './lib/incident'
import type { Regime } from './lib/incident'
import { aujourdhui } from './lib/calendrier'
import { instantCourt, pct } from './lib/format'
import { exporterJson, useStockage } from './lib/stockage'
import type { Teinte } from './lib/couleurs'
import { BORDURE_GAUCHE, TEXTE as CLASSE_TEXTE } from './lib/couleurs'

const DOMAINES_OBLIGATION: Record<Domaine, { label: string; teinte: Teinte }> = {
  rgpd: { label: 'Données personnelles', teinte: 'brand' },
  ia: { label: 'Intelligence artificielle', teinte: 'gold' },
  cyber: { label: 'Cybersécurité', teinte: 'ember' },
  produit: { label: 'Produit', teinte: 'jade' },
}

export default function PageResponsabilites() {
  const [onglet, setOnglet] = useState<'registre' | 'incident'>('registre')

  return (
    <Page
      chemin="/responsabilites/"
      titre="Responsabilités et incidents"
      chapeau="Quatre textes disent la même chose de quatre façons : une obligation que personne ne porte nommément n'est portée par personne. Cette page tient le registre qui met un nom en face de chaque obligation transverse — puis, pour le jour où cela tourne mal, le calculateur qui superpose les quatre horloges de notification. Le premier jalon tombe quatre heures après la classification."
    >
      <div className="sans-impression mb-8 max-w-lg">
        <Segments
          valeur={onglet}
          onChange={setOnglet}
          options={[
            { id: 'registre', label: 'Registre de responsabilité' },
            { id: 'incident', label: 'Délais de notification' },
          ]}
        />
      </div>

      {onglet === 'registre' ? <BlocRegistre /> : <BlocIncident />}
    </Page>
  )
}

// ---------------------------------------------------------------------------

function BlocRegistre() {
  const today = aujourdhui()
  const [affectations, setAffectations] = useStockage<Record<string, Affectation>>(
    'laws.responsabilites',
    {},
  )

  const c = useMemo(() => couverture(affectations, today), [affectations, today])
  const part = c.applicables === 0 ? 0 : c.faites / c.applicables

  const maj = (id: string, p: Partial<Affectation>) =>
    setAffectations({
      ...affectations,
      [id]: { ...(affectations[id] ?? affectationVide()), ...p },
    })

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          valeur={`${c.faites}/${c.applicables}`}
          libelle="obligations traitées"
          teinte={part > 0.8 ? 'jade' : part > 0.4 ? 'gold' : 'ember'}
        />
        <Stat
          valeur={String(c.orphelines)}
          libelle="sans responsable nommé"
          teinte={c.orphelines > 0 ? 'ember' : 'jade'}
        />
        <Stat
          valeur={String(c.perimees)}
          libelle="revues à refaire"
          teinte={c.perimees > 0 ? 'gold' : 'ink'}
        />
        <Stat valeur={pct(part)} libelle="couverture déclarée" teinte="brand" />
      </div>

      <div className="mb-8">
        <Jauge
          part={part}
          teinte={part > 0.8 ? 'jade' : part > 0.4 ? 'gold' : 'ember'}
          libelle="Obligations marquées « fait », hors celles déclarées sans objet"
        />
      </div>

      <div className="sans-impression mb-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            exporterJson(`registre-responsabilites-${today}.json`, affectations)
          }
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-ink-700 ring-1 ring-ink-200 transition hover:text-ink-900"
        >
          Exporter en JSON
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-ink-700 ring-1 ring-ink-200 transition hover:text-ink-900"
        >
          Imprimer
        </button>
      </div>

      {c.orphelines > 0 && (
        <div className="mb-8 max-w-3xl">
          <Encadre teinte="ember" titre={`${c.orphelines} obligations sans nom`}>
            C'est le seul chiffre de cette page qui compte vraiment. Une obligation
            marquée « fait » sans responsable nommé l'est jusqu'au départ de celui qui
            s'en occupait sans le dire — et personne ne s'en aperçoit avant le
            contrôle. Un service n'est pas un nom : « la DSI » ne répond de rien.
          </Encadre>
        </div>
      )}

      <div className="space-y-4">
        {OBLIGATIONS.map((o) => {
          const a = affectations[o.id] ?? affectationVide()
          const d = DOMAINES_OBLIGATION[o.domaine]
          const enRetard =
            a.derniereRevue && perimee(a.derniereRevue, o.revueMois, today)
          return (
            <article
              key={o.id}
              className={`card border-l-4 p-5 ${BORDURE_GAUCHE[d.teinte]} ${
                a.statut === 'sans-objet' ? 'opacity-60' : ''
              }`}
            >
              <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Pastille teinte={d.teinte}>{d.label}</Pastille>
                    <span className="ref">{o.article}</span>
                    {enRetard && <Pastille teinte="ember">revue périmée</Pastille>}
                    {!a.responsable.trim() && a.statut !== 'sans-objet' && (
                      <Pastille teinte="ember">sans responsable</Pastille>
                    )}
                  </div>
                  <h2 className="titre text-base text-ink-900">{o.intitule}</h2>
                </div>
                <span className="text-xs text-ink-400">
                  revue tous les {o.revueMois} mois
                </span>
              </header>

              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                <span className="font-medium text-ink-700">Ce qui fait preuve :</span>{' '}
                {o.preuve}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Texte
                  label="Responsable"
                  valeur={a.responsable}
                  onChange={(v) => maj(o.id, { responsable: v })}
                  placeholder="Nom et prénom"
                />
                <Texte
                  label="Suppléant"
                  valeur={a.suppleant}
                  onChange={(v) => maj(o.id, { suppleant: v })}
                  placeholder="Nom et prénom"
                />
                <Date_
                  label="Dernière revue"
                  valeur={a.derniereRevue}
                  onChange={(v) => maj(o.id, { derniereRevue: v })}
                />
                <div>
                  <span className="field-label">Statut</span>
                  <select
                    className="champ-texte"
                    value={a.statut}
                    onChange={(e) => maj(o.id, { statut: e.target.value as Statut })}
                  >
                    {STATUTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <Texte
                  label="Note"
                  valeur={a.note}
                  onChange={(v) => maj(o.id, { note: v })}
                  placeholder="Où se trouve la preuve, ce qu'il reste à faire"
                />
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

/** `2026-08-04T09:30` pour un `<input type="datetime-local">`. */
function maintenantLocal(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`
}

function BlocIncident() {
  const [connaissance, setConnaissance] = useState(maintenantLocal)
  const [classification, setClassification] = useState('')
  const [regimes, setRegimes] = useState<Regime[]>(['rgpd'])

  const t = new Date(connaissance).getTime()
  const tc = classification ? new Date(classification).getTime() : undefined
  const valide = Number.isFinite(t)

  const liste = useMemo(
    () =>
      valide ? jalons({ connaissance: t, classification: tc, regimes }) : [],
    [valide, t, tc, regimes],
  )

  // L'horloge de référence est celle de la prise de connaissance saisie, pas
  // l'heure courante : l'outil sert autant à préparer un exercice de crise sur
  // un horaire fictif qu'à suivre un incident réel.
  const premier = liste[0]

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="titre mb-4 text-base text-ink-900">L'incident</h2>
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="connaissance">
                Prise de connaissance
              </label>
              <input
                id="connaissance"
                type="datetime-local"
                className="champ-texte tabular"
                value={connaissance}
                onChange={(e) => setConnaissance(e.target.value)}
              />
              <p className="field-hint">
                Le moment où vous avez su, pas celui où l'incident a commencé ni celui
                où il sera résolu. Un incident découvert trois semaines après son
                déclenchement laisse quand même vingt-quatre heures.
              </p>
            </div>
            <div>
              <label className="field-label" htmlFor="classification">
                Classification comme incident majeur — DORA
              </label>
              <input
                id="classification"
                type="datetime-local"
                className="champ-texte tabular"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
              />
              <p className="field-hint">
                Facultatif, et sans effet hors DORA. La notification initiale est due
                au plus tôt entre quatre heures après cette classification et
                vingt-quatre heures après la prise de connaissance : selon la vitesse
                à laquelle vous classez, ce n'est pas toujours la même borne qui
                contraint.
              </p>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="titre mb-4 text-base text-ink-900">Régimes applicables</h2>
          <div className="space-y-3">
            {REGIMES.map((r) => (
              <Case
                key={r.id}
                coche={regimes.includes(r.id)}
                onChange={() =>
                  setRegimes(
                    regimes.includes(r.id)
                      ? regimes.filter((x) => x !== r.id)
                      : [...regimes, r.id],
                  )
                }
                label={r.label}
                aide={r.note}
              />
            ))}
          </div>
          <p className="field-hint mt-4">
            Ils se cumulent sans se coordonner. Une intrusion chez un éditeur de
            logiciel financier traitant des données personnelles en déclenche quatre à
            la fois, vers quatre destinataires différents.
          </p>
        </section>
      </div>

      <div>
        {!valide || regimes.length === 0 ? (
          <Encadre teinte="ink">
            Renseignez une date de prise de connaissance et cochez au moins un régime.
          </Encadre>
        ) : (
          <>
            {premier && (
              <div className="mb-6">
                <Encadre teinte="ember" titre="Premier jalon">
                  <p className="tabular text-lg font-semibold">
                    {instantCourt(premier.echeance)} — {reste(premier, t)} après la
                    prise de connaissance
                  </p>
                  <p className="mt-1">
                    {premier.libelle} · {premier.article}
                  </p>
                </Encadre>
              </div>
            )}

            <ol className="space-y-4">
              {liste.map((j) => {
                const e = etat(j, t)
                const teinte: Teinte =
                  e === 'depasse' ? 'ember' : e === 'critique' ? 'gold' : 'brand'
                return (
                  <li
                    key={`${j.regime}-${j.libelle}`}
                    className={`card border-l-4 p-5 ${BORDURE_GAUCHE[teinte]}`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="titre text-base text-ink-900">{j.libelle}</h3>
                      <span
                        className={`tabular text-sm font-semibold ${CLASSE_TEXTE[teinte]}`}
                      >
                        {instantCourt(j.echeance)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                      <span className="ref">{j.article}</span>
                      <span>{j.destinataire}</span>
                      <span className="tabular font-medium text-ink-700">
                        {reste(j, t)}
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-600">
                      {j.contenu}
                    </p>
                  </li>
                )
              })}
            </ol>

            <div className="mt-8 space-y-4">
              <Encadre teinte="brand" titre="Envoyer incomplet plutôt qu'en retard">
                Les trois régimes prévoient tous une mise à jour ultérieure : l'alerte
                précoce de vingt-quatre heures ne demande que de signaler, pas de
                qualifier. Un signalement lacunaire dans les délais vaut mieux qu'un
                signalement complet hors délai — au-delà de soixante-douze heures, le
                RGPD exige en outre de motiver le retard, ce qui figure ensuite au
                dossier.
              </Encadre>
              <Encadre teinte="ink" titre="Ce que le calculateur ne fait pas">
                Il ne dit pas si l'incident est notifiable. Le RGPD ne vise que les
                violations présentant un risque, NIS 2 les incidents « importants »,
                le CRA les vulnérabilités <em>activement exploitées</em>. Cette
                qualification-là vous appartient — et se prend, elle aussi, dans les
                premières heures.
              </Encadre>
            </div>
          </>
        )}

        <section className="mt-10">
          <h2 className="titre mb-3 text-lg text-ink-900">
            Les obligations permanentes derrière
          </h2>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-ink-600">
            Aucun de ces délais n'est tenable si la chaîne n'existe pas avant
            l'incident. Trois lignes du registre de responsabilité les portent.
          </p>
          <div className="card p-5">
            <Obligations
              items={OBLIGATIONS.filter((o) =>
                ['violations', 'notification-incident', 'divulgation'].includes(o.id),
              ).map((o) => ({ article: o.article, texte: o.preuve }))}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
