import { useMemo, useState } from 'react'
import { Page } from './components/Cadre'
import { Case, Segments } from './components/Champs'
import { Encadre, Obligations, Pastille } from './components/Blocs'
import {
  CAS_TRANSPARENCE,
  CATEGORIES_CRA,
  EXCLUSIONS_CRA,
  PRATIQUES_INTERDITES,
  REPONSES_CRA_VIDES,
  REPONSES_IA_VIDES,
  USAGES_ANNEXE_III,
  qualifierCra,
  qualifierIa,
} from './lib/qualification'
import type {
  CategorieCra,
  NiveauIa,
  ReponsesCra,
  ReponsesIa,
  Role,
} from './lib/qualification'
import { aujourdhui, joursRestants } from './lib/calendrier'
import { echeanceRelative, jour } from './lib/format'
import { useStockage } from './lib/stockage'
import type { Teinte } from './lib/couleurs'

const TEINTE_NIVEAU: Record<NiveauIa, Teinte> = {
  interdit: 'ember',
  'haut-risque': 'gold',
  transparence: 'brand',
  minimal: 'jade',
  'hors-champ': 'ink',
}

const LIBELLE_NIVEAU: Record<NiveauIa, string> = {
  interdit: 'Pratique interdite',
  'haut-risque': 'Haut risque',
  transparence: 'Risque limité — transparence',
  minimal: 'Risque minimal',
  'hors-champ': 'Hors champ',
}

export default function PageQualification() {
  const [outil, setOutil] = useState<'ia' | 'cra'>('ia')

  return (
    <Page
      chemin="/qualification/"
      titre="Qualification"
      chapeau="Deux arbres de décision, ceux qui décident de tout le reste : le niveau de risque d'un système d'IA, et la catégorie d'un produit sous le règlement cyberrésilience. Ils affichent leur raisonnement article par article, parce qu'une qualification qu'on ne peut pas justifier ne vaut rien devant une autorité de surveillance."
    >
      <div className="sans-impression mb-8 max-w-md">
        <Segments
          valeur={outil}
          onChange={setOutil}
          options={[
            { id: 'ia', label: "Système d'IA" },
            { id: 'cra', label: 'Produit numérique' },
          ]}
        />
      </div>

      {outil === 'ia' ? <BlocIa /> : <BlocCra />}
    </Page>
  )
}

// ---------------------------------------------------------------------------

function BlocIa() {
  const [r, setR] = useStockage<ReponsesIa>('laws.ia', REPONSES_IA_VIDES)
  const resultat = useMemo(() => qualifierIa(r), [r])
  const today = aujourdhui()

  const maj = (p: Partial<ReponsesIa>) => setR({ ...r, ...p })
  const bascule = (liste: string[], id: string) =>
    liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id]

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="titre mb-4 text-base text-ink-900">Le système</h2>
          <div className="space-y-4">
            <Case
              coche={r.estSystemeIa}
              onChange={(v) => maj({ estSystemeIa: v })}
              label="C'est un système d'IA au sens de l'article 3 §1"
              aide="Il déduit, à partir des entrées qu'il reçoit, la manière de générer ses sorties. Un moteur de règles écrit à la main n'en est pas un ; un modèle appris, oui."
            />
            <Case
              coche={r.lienUnion}
              onChange={(v) => maj({ lienUnion: v })}
              label="Il est mis sur le marché de l'Union, ou ses sorties y sont utilisées"
              aide="L'article 2 suit la sortie : un modèle exploité depuis un pays tiers dont les résultats servent dans l'Union est visé."
            />
            <div>
              <span className="field-label">Votre rôle</span>
              <Segments
                valeur={r.role}
                onChange={(v: Role) => maj({ role: v })}
                options={[
                  { id: 'fournisseur', label: 'Fournisseur' },
                  { id: 'deployeur', label: 'Déployeur' },
                  { id: 'importateur', label: 'Importateur' },
                  { id: 'distributeur', label: 'Distributeur' },
                ]}
                aide="Le fournisseur met le système sur le marché sous son nom et porte l'essentiel de la charge. Attention : un déployeur qui modifie substantiellement le système, ou l'exploite sous sa propre marque, devient fournisseur (art. 25)."
              />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="titre mb-1 text-base text-ink-900">
            Pratiques interdites — article 5
          </h2>
          <p className="mb-4 text-xs leading-relaxed text-ink-500">
            Applicables depuis le 2 février 2025. Aucune documentation ne rachète une
            pratique interdite : elle rend l'usage illicite, point.
          </p>
          <div className="space-y-3">
            {PRATIQUES_INTERDITES.map((p) => (
              <Case
                key={p.id}
                coche={r.pratiquesInterdites.includes(p.id)}
                onChange={() =>
                  maj({ pratiquesInterdites: bascule(r.pratiquesInterdites, p.id) })
                }
                label={p.label}
                aide={p.note}
              />
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="titre mb-1 text-base text-ink-900">Haut risque</h2>
          <p className="mb-4 text-xs leading-relaxed text-ink-500">
            Deux voies indépendantes : l'annexe I par le produit, l'annexe III par
            l'usage.
          </p>
          <div className="space-y-4">
            <Case
              coche={r.annexeI}
              onChange={(v) => maj({ annexeI: v })}
              label="Composant de sécurité d'un produit déjà réglementé — annexe I"
              aide="Dispositif médical, machine, ascenseur, équipement radio, jouet, véhicule… et le produit est soumis à une évaluation de conformité par un tiers."
            />
            <div className="border-t border-ink-100 pt-4">
              <p className="field-label">Usages de l'annexe III</p>
              <div className="space-y-3">
                {USAGES_ANNEXE_III.map((u) => (
                  <Case
                    key={u.id}
                    coche={r.usagesAnnexeIII.includes(u.id)}
                    onChange={() =>
                      maj({ usagesAnnexeIII: bascule(r.usagesAnnexeIII, u.id) })
                    }
                    label={u.label}
                    aide={u.note}
                  />
                ))}
              </div>
            </div>
            {r.usagesAnnexeIII.length > 0 && (
              <div className="space-y-3 rounded-xl bg-ink-50 p-4">
                <p className="text-xs leading-relaxed text-ink-600">
                  L'article 6 §3 permet d'échapper au haut risque quand le système
                  n'accomplit qu'une tâche procédurale étroite, améliore le résultat
                  d'une activité humaine déjà accomplie, détecte des constantes de
                  décision sans se substituer à l'appréciation humaine, ou prépare une
                  évaluation. La dérogation doit être documentée avant la mise sur le
                  marché.
                </p>
                <Case
                  coche={r.derogationArticle6}
                  onChange={(v) => maj({ derogationArticle6: v })}
                  label="Nous invoquons l'une de ces quatre conditions"
                  aide="À documenter et à tenir à disposition de l'autorité (art. 6 §4)."
                />
                <Case
                  coche={r.profilage}
                  onChange={(v) => maj({ profilage: v })}
                  label="Le système effectue un profilage de personnes physiques"
                  aide="Si oui, la dérogation est fermée quoi qu'il arrive : c'est l'alinéa 2 de l'article 6 §3, et c'est ce qui fait basculer la plupart des outils de tri de candidatures."
                />
              </div>
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="titre mb-1 text-base text-ink-900">
            Transparence — article 50
          </h2>
          <p className="mb-4 text-xs leading-relaxed text-ink-500">
            Exigible depuis le 2 août 2026, et cumulable avec le haut risque. C'est
            l'obligation qui touche le plus grand nombre d'organisations.
          </p>
          <div className="space-y-3">
            {CAS_TRANSPARENCE.map((c) => (
              <Case
                key={c.id}
                coche={r.transparenceArticle50.includes(c.id)}
                onChange={() =>
                  maj({ transparenceArticle50: bascule(r.transparenceArticle50, c.id) })
                }
                label={c.label}
                aide={c.note}
              />
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="titre mb-4 text-base text-ink-900">
            Modèle à usage général
          </h2>
          <div className="space-y-4">
            <Case
              coche={r.modeleUsageGeneral}
              onChange={(v) => maj({ modeleUsageGeneral: v })}
              label="Nous fournissons un modèle d'IA à usage général"
              aide="Y compris un modèle affiné puis redistribué sous votre nom : l'ajustement fin peut vous faire endosser le rôle de fournisseur pour le modèle qui en résulte."
            />
            {r.modeleUsageGeneral && (
              <Case
                coche={r.seuilRisqueSystemique}
                onChange={(v) => maj({ seuilRisqueSystemique: v })}
                label="L'entraînement a dépassé 10²⁵ opérations en virgule flottante"
                aide="Le risque systémique est alors présumé (art. 51 §2), et la Commission doit être notifiée dans les deux semaines."
              />
            )}
          </div>
        </section>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Pastille teinte={TEINTE_NIVEAU[resultat.niveau]}>
                {LIBELLE_NIVEAU[resultat.niveau]}
              </Pastille>
              {resultat.echeance && (
                <span className="text-xs text-ink-500">
                  Exigible le {jour(resultat.echeance)} —{' '}
                  {echeanceRelative(joursRestants(resultat.echeance, today))}
                </span>
              )}
            </div>
            <p className="mt-3 leading-relaxed text-ink-800">{resultat.verdict}</p>
          </div>

          {resultat.motifs.length > 0 && (
            <div className="border-b border-ink-100 bg-ink-50 p-5">
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Le raisonnement
              </h3>
              <ul className="space-y-2 text-sm leading-relaxed text-ink-700">
                {resultat.motifs.map((m) => (
                  <li key={m} className="flex gap-2">
                    <span aria-hidden="true" className="text-ink-300">
                      —
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resultat.obligations.length > 0 && (
            <div className="p-5">
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Ce qu'il faut produire
              </h3>
              <Obligations items={resultat.obligations} />
            </div>
          )}

          {resultat.modele.length > 0 && (
            <div className="border-t border-ink-100 p-5">
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                En tant que fournisseur de modèle
              </h3>
              <Obligations items={resultat.modele} />
            </div>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <Encadre teinte="brand" titre="Les obligations se cumulent">
            Un système à haut risque qui parle à des utilisateurs doit aussi l'article
            50 ; un système d'IA traitant des données personnelles doit aussi le RGPD
            et, le plus souvent, une analyse d'impact — que le{' '}
            <a href="/registre/" className="font-medium underline">
              criblage de la page registre
            </a>{' '}
            fait apparaître. L'article 27 du règlement IA et l'article 35 du RGPD ne se
            remplacent pas l'un l'autre : ils se mènent en parallèle.
          </Encadre>
          <Encadre teinte="ink">
            Cette page oriente ; elle ne qualifie pas à votre place. La frontière entre
            un usage de l'annexe III et un usage anodin se joue souvent sur un
            considérant, et la qualification engage celui qui la signe.
          </Encadre>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function BlocCra() {
  const [r, setR] = useStockage<ReponsesCra>('laws.cra', REPONSES_CRA_VIDES)
  const resultat = useMemo(() => qualifierCra(r), [r])
  const today = aujourdhui()
  const maj = (p: Partial<ReponsesCra>) => setR({ ...r, ...p })

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="titre mb-4 text-base text-ink-900">Le produit</h2>
          <div className="space-y-4">
            <Case
              coche={r.produitNumerique}
              onChange={(v) => maj({ produitNumerique: v })}
              label="C'est un produit comportant des éléments numériques"
              aide="Produit matériel ou logiciel dont l'usage prévu comporte une connexion, directe ou indirecte, à un appareil ou à un réseau. Le logiciel vendu seul en est un."
            />
            <Case
              coche={r.marcheUnion}
              onChange={(v) => maj({ marcheUnion: v })}
              label="Il est mis à disposition sur le marché de l'Union, dans le cadre d'une activité commerciale"
              aide="La distribution gratuite mais commerciale — un client gratuit d'un service payant, par exemple — reste dans le champ."
            />
            <div>
              <span className="field-label">Une exclusion s'applique-t-elle ?</span>
              <select
                className="champ-texte"
                value={r.exclusion}
                onChange={(e) => maj({ exclusion: e.target.value })}
              >
                <option value="">Aucune</option>
                {EXCLUSIONS_CRA.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                {EXCLUSIONS_CRA.find((e) => e.id === r.exclusion)?.note ??
                  "Les exclusions de l'article 2 renvoient à un régime sectoriel, en général plus exigeant — jamais à l'absence d'obligation."}
              </p>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="titre mb-1 text-base text-ink-900">La catégorie</h2>
          <p className="mb-4 text-xs leading-relaxed text-ink-500">
            Elle décide de la procédure d'évaluation de la conformité, donc du recours
            ou non à un organisme notifié — et du calendrier, puisque les organismes
            ne sont notifiables que depuis juin 2026.
          </p>
          <div className="space-y-3">
            {CATEGORIES_CRA.map((c) => (
              <label
                key={c.id}
                className={[
                  'block cursor-pointer rounded-xl border p-4 transition',
                  r.categorie === c.id
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-ink-200 hover:border-ink-300',
                ].join(' ')}
              >
                <div className="flex items-baseline gap-2.5">
                  <input
                    type="radio"
                    name="categorie-cra"
                    checked={r.categorie === c.id}
                    onChange={() => maj({ categorie: c.id as CategorieCra })}
                    className="accent-brand-600"
                  />
                  <span className="text-sm font-medium text-ink-900">{c.label}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-600">{c.exemples}</p>
              </label>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="titre mb-4 text-base text-ink-900">Période de support</h2>
          <label className="field-label" htmlFor="support">
            Durée que vous comptez annoncer
          </label>
          <div className="flex items-center gap-3">
            <input
              id="support"
              type="number"
              min={1}
              max={20}
              value={r.periodeSupportAnnee}
              onChange={(e) => maj({ periodeSupportAnnee: Number(e.target.value) })}
              className="champ-texte tabular w-24"
            />
            <span className="text-sm text-ink-500">ans</span>
          </div>
          <p className="field-hint">
            L'article 13 §8 fixe un plancher de cinq ans, sauf durée de vie attendue
            plus courte — qu'il revient au fabricant de démontrer. C'est la disposition
            qui change le plus de choses dans un modèle économique logiciel : elle
            transforme une version livrée en engagement pluriannuel.
          </p>
        </section>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 p-5">
            <Pastille teinte={resultat.dansLeChamp ? 'gold' : 'ink'}>
              {resultat.dansLeChamp ? 'Dans le champ du CRA' : 'Hors champ'}
            </Pastille>
            <p className="mt-3 leading-relaxed text-ink-800">{resultat.verdict}</p>
            {resultat.motifs.map((m) => (
              <p key={m} className="mt-2 text-sm leading-relaxed text-ink-600">
                {m}
              </p>
            ))}
          </div>

          {resultat.alerteSupport && (
            <div className="border-b border-ink-100 p-5">
              <Encadre teinte="ember" titre="Période de support insuffisante">
                {resultat.alerteSupport}
              </Encadre>
            </div>
          )}

          {resultat.echeances.length > 0 && (
            <div className="border-b border-ink-100 bg-ink-50 p-5">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Vos deux dates
              </h3>
              <ul className="space-y-3">
                {resultat.echeances.map((e) => {
                  const j = joursRestants(e.date, today)
                  return (
                    <li key={e.date} className="flex flex-col gap-1">
                      <span className="tabular text-sm font-semibold text-ink-900">
                        {jour(e.date)}
                        <span className="ml-2 font-sans text-xs font-normal text-ink-500">
                          {echeanceRelative(j)}
                        </span>
                      </span>
                      <span className="text-sm leading-relaxed text-ink-600">
                        {e.quoi}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {resultat.obligations.length > 0 && (
            <div className="p-5">
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                Ce qu'il faut produire
              </h3>
              <Obligations items={resultat.obligations} />
            </div>
          )}
        </div>

        <div className="mt-5">
          <Encadre teinte="brand" titre="Le CRA ne vient jamais seul">
            La directive (UE) 2024/2853 apprécie la défectuosité d'un produit au regard
            des exigences de sécurité applicables : à partir du 9 décembre 2026, une
            vulnérabilité que vous n'avez pas corrigée peut constituer un défaut
            engageant votre responsabilité sans faute. Et la chaîne de signalement de
            l'article 14 est la même que celle de NIS 2 et de DORA — le{' '}
            <a href="/responsabilites/" className="font-medium underline">
              calculateur de délais
            </a>{' '}
            montre comment les trois horloges se superposent.
          </Encadre>
        </div>
      </div>
    </div>
  )
}
