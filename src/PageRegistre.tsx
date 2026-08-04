import { useMemo, useRef } from 'react'
import { Page } from './components/Cadre'
import { Case, Liste, Texte } from './components/Champs'
import { Detail, Encadre, Jauge, Pastille, Stat } from './components/Blocs'
import {
  BASES_LEGALES,
  CRITERES_RISQUE,
  aipd,
  champsManquants,
  completude,
  traitementVide,
} from './lib/registre'
import type { BaseLegale, Traitement } from './lib/registre'
import { exporterJson, identifiant, importerJson, useStockage } from './lib/stockage'
import { pct } from './lib/format'
import { aujourdhui } from './lib/calendrier'

/**
 * Le registre de l'article 30.
 *
 * Un choix d'interface mérite d'être dit : l'indicateur de complétude est
 * affiché en permanence, y compris quand il est à 0 %. Les mises en garde qui
 * n'apparaissent qu'en cas d'anomalie ne sont pas lues — et un registre à
 * moitié rempli, personne ne le regarde comme une anomalie.
 */
export default function PageRegistre() {
  const [traitements, setTraitements] = useStockage<Traitement[]>('laws.registre', [])
  const fichier = useRef<HTMLInputElement>(null)

  const global = useMemo(() => {
    if (traitements.length === 0) return 0
    return traitements.reduce((s, t) => s + completude(t), 0) / traitements.length
  }, [traitements])

  const aipdRequises = useMemo(
    () => traitements.filter((t) => aipd(t).requise).length,
    [traitements],
  )
  const transferts = traitements.filter((t) => t.transfert.horsEee).length

  const ajouter = () =>
    setTraitements([...traitements, traitementVide(identifiant())])

  const modifier = (id: string, p: Partial<Traitement>) =>
    setTraitements(traitements.map((t) => (t.id === id ? { ...t, ...p } : t)))

  const supprimer = (id: string) =>
    setTraitements(traitements.filter((t) => t.id !== id))

  return (
    <Page
      chemin="/registre/"
      titre="Registre des activités de traitement"
      chapeau="La première pièce demandée en cas de contrôle, et la seule qui matérialise le principe de responsabilité de l'article 5 §2 : il ne suffit pas d'être conforme, il faut pouvoir le démontrer. Ce formulaire tient les mentions de l'article 30 §1, plus quatre colonnes que le règlement n'impose pas mais dont l'absence oblige à tout refaire à la première question de l'autorité."
    >
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat valeur={String(traitements.length)} libelle="traitements inscrits" teinte="brand" />
        <Stat
          valeur={traitements.length ? pct(global) : '—'}
          libelle="mentions renseignées"
          teinte={global > 0.85 ? 'jade' : global > 0.5 ? 'gold' : 'ember'}
        />
        <Stat
          valeur={String(aipdRequises)}
          libelle="analyses d'impact à mener"
          teinte={aipdRequises > 0 ? 'gold' : 'ink'}
        />
        <Stat
          valeur={String(transferts)}
          libelle="transferts hors EEE"
          teinte={transferts > 0 ? 'gold' : 'ink'}
        />
      </div>

      <div className="sans-impression mb-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={ajouter}
          className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          Ajouter un traitement
        </button>
        <button
          type="button"
          onClick={() =>
            exporterJson(`registre-traitements-${aujourdhui()}.json`, traitements)
          }
          disabled={traitements.length === 0}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-ink-700 ring-1 ring-ink-200 transition hover:text-ink-900 disabled:opacity-40"
        >
          Exporter en JSON
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
            importerJson<Traitement[]>(f)
              .then((d) => Array.isArray(d) && setTraitements(d))
              .catch(() => undefined)
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
          Tout reste dans votre navigateur. Vider le cache efface le registre —
          exportez.
        </span>
      </div>

      {traitements.length === 0 ? (
        <div className="max-w-3xl space-y-4">
          <Encadre teinte="brand" titre="Commencez par les trois que tout le monde a">
            La paie et la gestion du personnel, le fichier client et la prospection, la
            gestion des accès informatiques. Ces trois-là existent dans toute
            organisation, sont régulièrement traités — donc hors de l'exemption
            étroite de l'article 30 §5 — et suffisent à faire apparaître les questions
            que le reste du registre posera.
          </Encadre>
          <Encadre teinte="ink" titre="L'exemption des moins de 250 salariés">
            Elle ne joue que si le traitement n'est pas régulier, ne risque pas de
            porter atteinte aux droits des personnes, et ne porte ni sur des données
            sensibles ni sur des condamnations. La paie étant mensuelle, la condition
            de régularité tombe : en pratique, l'exemption ne dispense presque jamais
            de registre.
          </Encadre>
        </div>
      ) : (
        <div className="space-y-6">
          {traitements.map((t, i) => (
            <Ligne
              key={t.id}
              t={t}
              index={i + 1}
              onChange={(p) => modifier(t.id, p)}
              onSupprimer={() => supprimer(t.id)}
            />
          ))}
        </div>
      )}
    </Page>
  )
}

function Ligne({
  t,
  index,
  onChange,
  onSupprimer,
}: {
  t: Traitement
  index: number
  onChange: (p: Partial<Traitement>) => void
  onSupprimer: () => void
}) {
  const part = completude(t)
  const manquants = champsManquants(t)
  const analyse = aipd(t)

  const bascule = (id: string) =>
    onChange({
      criteresRisque: t.criteresRisque.includes(id)
        ? t.criteresRisque.filter((x) => x !== id)
        : [...t.criteresRisque, id],
    })

  return (
    <article className="card p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="tabular flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 text-xs font-semibold text-ink-600">
            {index}
          </span>
          <h2 className="titre text-base text-ink-900">
            {t.nom || <span className="text-ink-400">Traitement sans nom</span>}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32">
            <Jauge
              part={part}
              teinte={part > 0.85 ? 'jade' : part > 0.5 ? 'gold' : 'ember'}
              libelle="complétude"
            />
          </div>
          <button
            type="button"
            onClick={onSupprimer}
            className="sans-impression text-xs text-ink-400 transition hover:text-ember-600"
          >
            Supprimer
          </button>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Texte
          label="Nom du traitement"
          valeur={t.nom}
          onChange={(v) => onChange({ nom: v })}
          placeholder="Gestion de la paie"
        />
        <Liste<BaseLegale>
          label="Base légale"
          article="art. 6 §1"
          valeur={t.baseLegale}
          options={BASES_LEGALES.map((b) => ({ id: b.id, label: b.label }))}
          onChange={(v) => onChange({ baseLegale: v })}
          aide={BASES_LEGALES.find((b) => b.id === t.baseLegale)?.note}
        />
        <div className="md:col-span-2">
          <Texte
            label="Finalités"
            article="art. 30 §1 b"
            valeur={t.finalites}
            onChange={(v) => onChange({ finalites: v })}
            lignes={2}
            placeholder="Établir les bulletins de paie, déclarer les cotisations sociales…"
            aide="Une finalité par ligne. « Améliorer notre service » n'est pas une finalité déterminée : ce qui n'est pas assez précis pour être écrit ne l'est pas assez pour être licite."
          />
        </div>

        {t.baseLegale === 'interet-legitime' && (
          <div className="md:col-span-2">
            <Texte
              label="Mise en balance de l'intérêt légitime"
              article="art. 6 §1 f"
              valeur={t.interetLegitime}
              onChange={(v) => onChange({ interetLegitime: v })}
              lignes={2}
              aide="L'intérêt poursuivi, la nécessité du traitement pour l'atteindre, et pourquoi il ne prévaut pas sur les droits des personnes. Le raisonnement écrit est la condition même de la base légale."
            />
          </div>
        )}

        <Texte
          label="Catégories de personnes concernées"
          article="art. 30 §1 c"
          valeur={t.categoriesPersonnes}
          onChange={(v) => onChange({ categoriesPersonnes: v })}
          placeholder="Salariés, anciens salariés, stagiaires"
        />
        <Texte
          label="Catégories de données"
          article="art. 30 §1 c"
          valeur={t.categoriesDonnees}
          onChange={(v) => onChange({ categoriesDonnees: v })}
          placeholder="Identité, coordonnées, RIB, situation familiale"
        />

        <div className="md:col-span-2">
          <Case
            coche={t.donneesSensibles}
            onChange={(v) => onChange({ donneesSensibles: v })}
            label="Le traitement porte sur des catégories particulières de données"
            aide="Origine, opinions politiques, convictions, appartenance syndicale, génétique, biométrie aux fins d'identification, santé, vie ou orientation sexuelle (art. 9 §1). L'arrêt de travail transmis au service RH en fait partie."
          />
        </div>
        {t.donneesSensibles && (
          <div className="md:col-span-2">
            <Texte
              label="Condition levant l'interdiction de principe"
              article="art. 9 §2"
              valeur={t.conditionArticle9}
              onChange={(v) => onChange({ conditionArticle9: v })}
              aide="L'une des dix conditions du §2 — le plus souvent le b) pour les obligations en droit du travail et de la sécurité sociale. Sans elle, le traitement est interdit, quelle que soit la base légale de l'article 6."
            />
          </div>
        )}

        <Texte
          label="Catégories de destinataires"
          article="art. 30 §1 d"
          valeur={t.destinataires}
          onChange={(v) => onChange({ destinataires: v })}
          placeholder="Service RH, URSSAF, organisme de prévoyance"
        />
        <Texte
          label="Sous-traitants"
          article="art. 28"
          valeur={t.sousTraitants}
          onChange={(v) => onChange({ sousTraitants: v })}
          placeholder="Éditeur du logiciel de paie, hébergeur"
          aide="Chacun doit être lié par un contrat portant les huit mentions du §3 — les conditions générales d'un fournisseur ne suffisent que si elles les contiennent toutes."
        />

        <Texte
          label="Délais d'effacement"
          article="art. 30 §1 f"
          valeur={t.conservation}
          onChange={(v) => onChange({ conservation: v })}
          placeholder="5 ans après le départ, sauf bulletins conservés 50 ans"
          aide="Par catégorie de données si les durées diffèrent. « Le temps nécessaire » n'est pas un délai."
        />
        <Texte
          label="Mesures de sécurité"
          article="art. 30 §1 g"
          valeur={t.mesuresSecurite}
          onChange={(v) => onChange({ mesuresSecurite: v })}
          placeholder="Habilitations nominatives, chiffrement au repos, journalisation des accès"
          aide="Description générale. Pensez au §1 d de l'article 32 : la procédure de test régulier de leur efficacité, celle qui manque presque toujours."
        />

        <div className="md:col-span-2 space-y-4 rounded-xl bg-ink-50 p-4">
          <Case
            coche={t.transfert.horsEee}
            onChange={(v) => onChange({ transfert: { ...t.transfert, horsEee: v } })}
            label="Des données sont transférées hors de l'Espace économique européen"
            aide="Y compris lorsque le transfert résulte du seul accès à distance par un sous-traitant établi hors EEE, ou d'un support technique depuis un pays tiers. C'est le cas le plus souvent omis."
          />
          {t.transfert.horsEee && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Texte
                label="Pays de destination"
                article="art. 30 §1 e"
                valeur={t.transfert.pays}
                onChange={(v) => onChange({ transfert: { ...t.transfert, pays: v } })}
                placeholder="États-Unis, Inde"
              />
              <Texte
                label="Garantie encadrant le transfert"
                article="art. 46"
                valeur={t.transfert.garantie}
                onChange={(v) =>
                  onChange({ transfert: { ...t.transfert, garantie: v } })
                }
                placeholder="Clauses contractuelles types + analyse d'impact du transfert"
                aide="Depuis Schrems II, les clauses ne suffisent plus seules : il faut aussi l'analyse du droit du pays de destination et, le cas échéant, des mesures supplémentaires."
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-ink-100 pt-5">
        <Detail resume="Criblage d'analyse d'impact — article 35">
          <p className="mb-4 text-sm leading-relaxed text-ink-600">
            Cochez les critères réunis. Le seuil retenu par le Comité européen de la
            protection des données est de deux sur neuf ; trois situations du §3
            rendent l'analyse obligatoire à elles seules.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CRITERES_RISQUE.map((c) => (
              <Case
                key={c.id}
                coche={t.criteresRisque.includes(c.id)}
                onChange={() => bascule(c.id)}
                label={c.label}
                aide={c.note}
              />
            ))}
          </div>
          <div className="mt-4">
            <Case
              coche={t.listeAutorite}
              onChange={(v) => onChange({ listeAutorite: v })}
              label="Le traitement figure sur la liste de l'autorité de contrôle"
              aide="Chaque autorité publie la liste des types de traitement pour lesquels l'analyse est obligatoire (art. 35 §4). En France, celle de la CNIL compte quatorze entrées."
            />
          </div>

          <div className="mt-5">
            <Encadre
              teinte={
                analyse.certitude === 'certaine'
                  ? 'ember'
                  : analyse.requise
                    ? 'gold'
                    : 'jade'
              }
              titre={
                analyse.requise
                  ? analyse.certitude === 'certaine'
                    ? "Analyse d'impact obligatoire"
                    : "Analyse d'impact probablement requise"
                  : "Analyse d'impact non requise"
              }
            >
              {analyse.motif}
            </Encadre>
          </div>
        </Detail>
      </div>

      {manquants.length > 0 && (
        <div className="mt-5 border-t border-ink-100 pt-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
            Mentions dues et non renseignées
          </p>
          <div className="flex flex-wrap gap-2">
            {manquants.map((m) => (
              <Pastille key={m.champ} teinte="ember">
                {m.champ} · {m.article}
              </Pastille>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
