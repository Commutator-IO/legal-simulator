import { useState } from 'react'
import { Page } from './components/Cadre'
import { Case, Liste, Segments, Texte } from './components/Champs'
import { Encadre, Pastille, Stat } from './components/Blocs'
import {
  Amorce,
  BarreOutils,
  ChampsSuivi,
  EnteteFiche,
  Manquants,
  ModeEmploi,
  Onglets,
} from './components/Pieces'
import { useCollection } from './lib/collection'
import type { Collection } from './lib/collection'
import {
  DECISIONS_AIPD,
  ETAPES_TIA,
  EVENEMENTS,
  LIBELLE_RISQUE,
  NIVEAUX,
  TEINTE_RISQUE,
  TESTS_LIA,
  VOLETS_AIDF,
  aidfVide,
  aipdVide,
  champsManquantsAidf,
  champsManquantsAipd,
  completudeAidf,
  completudeAipd,
  liaVide,
  niveauRisque,
  risqueVide,
  tiaVide,
  verdictAipd,
  verdictLia,
  verdictTia,
} from './lib/analyses'
import type { Aidf, Aipd, Lia, Niveau, Risque, Tia } from './lib/analyses'

type Onglet = 'aipd' | 'lia' | 'tia' | 'aidf'

/**
 * Les quatre analyses.
 *
 * Elles sont réunies parce qu'elles partagent une propriété : aucune ne se
 * conclut par une note, toutes se concluent par une **décision** — mener ou
 * non le traitement, transférer ou suspendre, déployer ou reconcevoir. L'AIDF
 * de l'AI Act voisine ici avec l'AIPD du RGPD à dessein : l'article 27 §4
 * permet de s'appuyer sur la seconde pour les parties qui se recouvrent, mais
 * ne dispense jamais de la première.
 */
export default function PageAnalyses() {
  const [onglet, setOnglet] = useState<Onglet>('aipd')

  const aipds = useCollection<Aipd>('laws.aipd', aipdVide)
  const lias = useCollection<Lia>('laws.lia', liaVide)
  const tias = useCollection<Tia>('laws.tia', tiaVide)
  const aidfs = useCollection<Aidf>('laws.aidf', aidfVide)

  return (
    <Page
      chemin="/analyses/"
      titre="Les analyses"
      chapeau="Quatre analyses écrites que les textes imposent avant d'agir, jamais après. Elles ressemblent à des formalités juridiques ; ce sont en réalité des revues de conception déguisées — l'analyse d'impact demande de justifier chaque donnée collectée, l'analyse de transfert demande où vivent vos clés de chiffrement, la mise en balance demande si un moyen moins intrusif existait. Ce sont vos arbitrages qu'elles instruisent, pas ceux du juriste."
    >
      <Onglets<Onglet>
        valeur={onglet}
        onChange={setOnglet}
        options={[
          { id: 'aipd', label: 'Impact — RGPD art. 35', compte: aipds.items.length },
          { id: 'lia', label: 'Intérêt légitime — art. 6 §1 f', compte: lias.items.length },
          { id: 'tia', label: 'Transferts — Schrems II', compte: tias.items.length },
          { id: 'aidf', label: 'Droits fondamentaux — IA art. 27', compte: aidfs.items.length },
        ]}
      />

      <ModeEmploi
        quand="Avant le gel de l'architecture, jamais après la mise en production. L'article 35 §1 dit « avant le traitement » — et si l'analyse conclut à un risque résiduel élevé, l'article 36 impose de consulter l'autorité avant de commencer : huit semaines, prorogeables de six."
        avecQui="Le DPO instruit et rend un avis, le responsable de traitement décide. Vous fournissez la matière : flux, mesures techniques, et surtout l'appréciation honnête de ce que les mesures réduisent réellement."
        livrable="Une analyse datée et signée, avec l'avis du DPO consigné — y compris s'il n'est pas suivi, auquel cas le motif l'est aussi."
      >
        <p>
          Le point que les architectes tranchent seuls, et mal : la différence entre
          risque <strong>brut</strong> et risque <strong>résiduel</strong>. C'est le
          résiduel — après mesures — qui déclenche la consultation préalable. Un chiffrement
          dont vous détenez la clé ne réduit pas le risque d'accès par votre propre
          administrateur : baisser le résiduel dans le formulaire sans avoir changé la
          conception est la manière la plus courante de produire une analyse fausse.
        </p>
        <p>
          Les trois événements redoutés — accès, modification, disparition — se lisent
          comme confidentialité, intégrité, disponibilité. Vous savez déjà les évaluer ;
          la seule bascule est que la gravité s'apprécie <em>pour la personne</em>, pas
          pour le système.
        </p>
      </ModeEmploi>

      {onglet === 'aipd' && <BlocAipd c={aipds} />}
      {onglet === 'lia' && <BlocLia c={lias} />}
      {onglet === 'tia' && <BlocTia c={tias} />}
      {onglet === 'aidf' && <BlocAidf c={aidfs} />}
    </Page>
  )
}

// ---------------------------------------------------------------------------
// AIPD
// ---------------------------------------------------------------------------

function BlocAipd({ c }: { c: Collection<Aipd> }) {
  const consultations = c.items.filter((a) => verdictAipd(a).consultationPrealable).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="analyses ouvertes" teinte="brand" />
        <Stat
          valeur={String(consultations)}
          libelle="consultations préalables dues"
          teinte={consultations > 0 ? 'ember' : 'jade'}
        />
        <Stat
          valeur={String(c.items.filter((a) => a.decision === 'a-instruire').length)}
          libelle="sans décision finale"
          teinte="gold"
        />
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Ouvrir une analyse"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="analyses-impact"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="L'analyse se mène avant le traitement, pas après">
          <p>
            L'article 35 §1 dit « avant le traitement ». Une analyse produite après la
            mise en production ne corrige rien : elle constate. Et si elle conclut à un
            risque résiduel élevé, l'article 36 impose de consulter l'autorité{' '}
            <em>avant</em> de commencer — huit semaines, prorogeables de six.
          </p>
          <p>
            Le criblage de l'onglet correspondant du{' '}
            <a href="/rgpd/" className="font-medium underline">
              registre
            </a>{' '}
            vous dit lesquels de vos traitements en appellent une.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((a, i) => (
            <FicheAipd
              key={a.id}
              a={a}
              index={i + 1}
              onChange={(p) => c.modifier(a.id, p)}
              onSupprimer={() => c.supprimer(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FicheAipd({
  a,
  index,
  onChange,
  onSupprimer,
}: {
  a: Aipd
  index: number
  onChange: (p: Partial<Aipd>) => void
  onSupprimer: () => void
}) {
  const verdict = verdictAipd(a)

  const majRisque = (id: string, p: Partial<Risque>) =>
    onChange({ risques: { ...a.risques, [id]: { ...(a.risques[id] ?? risqueVide()), ...p } } })

  return (
    <article className="card p-6">
      <EnteteFiche
        index={index}
        titre={a.traitement}
        vide="Analyse sans traitement rattaché"
        suivi={a.suivi}
        completude={completudeAipd(a)}
        onDupliquer={undefined}
        onSupprimer={onSupprimer}
      >
        <Pastille teinte={TEINTE_RISQUE[verdict.residuelMax]}>
          risque résiduel {LIBELLE_RISQUE[verdict.residuelMax]}
        </Pastille>
        {verdict.consultationPrealable && (
          <Pastille teinte="ember">consultation préalable — art. 36</Pastille>
        )}
      </EnteteFiche>

      <div className="grid gap-5 md:grid-cols-2">
        <Texte
          label="Traitement concerné"
          article="art. 35 §7 a"
          valeur={a.traitement}
          onChange={(v) => onChange({ traitement: v })}
          placeholder="Tri automatisé des candidatures"
        />
        <Texte
          label="Finalités poursuivies"
          article="art. 35 §7 a"
          valeur={a.finalites}
          onChange={(v) => onChange({ finalites: v })}
        />
        <div className="md:col-span-2">
          <Texte
            label="Description systématique des opérations"
            article="art. 35 §7 a"
            valeur={a.description}
            onChange={(v) => onChange({ description: v })}
            lignes={3}
            aide="Données, flux, supports, durées, destinataires, sous-traitants. Le mot « systématique » du texte veut dire : de bout en bout, sans sauter l'étape qui gêne."
          />
        </div>
        <Texte
          label="Nécessité"
          article="art. 35 §7 b"
          valeur={a.necessite}
          onChange={(v) => onChange({ necessite: v })}
          lignes={2}
          aide="Pourquoi aucun moyen moins intrusif ne permet d'atteindre la finalité."
        />
        <Texte
          label="Proportionnalité"
          article="art. 35 §7 b"
          valeur={a.proportionnalite}
          onChange={(v) => onChange({ proportionnalite: v })}
          lignes={2}
          aide="Minimisation, durées de conservation, exactitude, limitation des finalités."
        />
        <div className="md:col-span-2">
          <Texte
            label="Mesures garantissant les droits des personnes"
            article="art. 35 §7 d"
            valeur={a.droitsPersonnes}
            onChange={(v) => onChange({ droitsPersonnes: v })}
            lignes={2}
            aide="Information, accès, rectification, opposition, et intervention humaine lorsqu'une décision est automatisée (art. 22 §3)."
          />
        </div>
      </div>

      <div className="mt-8">
        <h4 className="titre mb-1 text-base text-ink-900">Les trois événements redoutés</h4>
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-ink-600">
          Découper le risque en trois plutôt que l'apprécier globalement n'est pas une
          commodité : un traitement peut être irréprochable en confidentialité et
          catastrophique en disponibilité, et une note unique masquerait exactement le
          risque qu'il fallait voir. La gravité s'apprécie pour la <em>personne</em>, pas
          pour l'organisation.
        </p>

        <div className="space-y-5">
          {EVENEMENTS.map((e) => {
            const r = a.risques[e.id] ?? risqueVide()
            const brut = niveauRisque(r.gravite, r.vraisemblance)
            const residuel = niveauRisque(r.graviteResiduelle, r.vraisemblanceResiduelle)
            return (
              <div key={e.id} className="rounded-xl border border-ink-200 p-4">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{e.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{e.note}</p>
                  </div>
                  <div className="flex gap-2">
                    <Pastille teinte={TEINTE_RISQUE[brut]}>brut : {LIBELLE_RISQUE[brut]}</Pastille>
                    <Pastille teinte={TEINTE_RISQUE[residuel]}>
                      résiduel : {LIBELLE_RISQUE[residuel]}
                    </Pastille>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Texte
                    label="Sources de risque et vulnérabilités"
                    article="art. 35 §7 c"
                    valeur={r.sources}
                    onChange={(v) => majRisque(e.id, { sources: v })}
                    lignes={2}
                  />
                  <Texte
                    label="Mesures existantes ou prévues"
                    article="art. 35 §7 d"
                    valeur={r.mesures}
                    onChange={(v) => majRisque(e.id, { mesures: v })}
                    lignes={2}
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-4">
                  <NiveauChamp
                    label="Gravité (brut)"
                    valeur={r.gravite}
                    onChange={(v) => majRisque(e.id, { gravite: v })}
                  />
                  <NiveauChamp
                    label="Vraisemblance (brut)"
                    valeur={r.vraisemblance}
                    onChange={(v) => majRisque(e.id, { vraisemblance: v })}
                  />
                  <NiveauChamp
                    label="Gravité résiduelle"
                    valeur={r.graviteResiduelle}
                    onChange={(v) => majRisque(e.id, { graviteResiduelle: v })}
                  />
                  <NiveauChamp
                    label="Vraisemblance résiduelle"
                    valeur={r.vraisemblanceResiduelle}
                    onChange={(v) => majRisque(e.id, { vraisemblanceResiduelle: v })}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Texte
          label="Avis du délégué à la protection des données"
          article="art. 35 §2"
          valeur={a.avisDpo}
          onChange={(v) => onChange({ avisDpo: v })}
          lignes={2}
          aide="L'avis doit être demandé, et consigné — y compris lorsqu'il n'est pas suivi, auquel cas le motif doit l'être aussi."
        />
        <Texte
          label="Avis des personnes concernées"
          article="art. 35 §9"
          valeur={a.avisPersonnes}
          onChange={(v) => onChange({ avisPersonnes: v })}
          lignes={2}
          aide="« Le cas échéant » : consultation des représentants du personnel, d'un panel d'usagers. Motivez si vous ne l'avez pas recueilli."
        />
        <div className="md:col-span-2">
          <Segments
            label="Décision du responsable de traitement"
            valeur={a.decision}
            onChange={(v) => onChange({ decision: v })}
            options={DECISIONS_AIPD.map((d) => ({ id: d.id, label: d.label }))}
          />
        </div>
        <div className="md:col-span-2">
          <ChampsSuivi
            suivi={a.suivi}
            onChange={(s) => onChange({ suivi: s })}
            roleValidateur="Validé par"
          />
        </div>
      </div>

      <div className="mt-5">
        <Encadre
          teinte={
            verdict.consultationPrealable
              ? 'ember'
              : verdict.residuelMax === 'non-apprecie'
                ? 'ink'
                : 'jade'
          }
          titre={
            verdict.consultationPrealable
              ? "Consultation préalable de l'autorité requise"
              : 'Verdict'
          }
        >
          {verdict.motif}
        </Encadre>
      </div>

      <Manquants items={champsManquantsAipd(a)} />
    </article>
  )
}

function NiveauChamp({
  label,
  valeur,
  onChange,
}: {
  label: string
  valeur: Niveau
  onChange: (v: Niveau) => void
}) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <select
        className="champ-texte"
        value={valeur}
        onChange={(e) => onChange(Number(e.target.value) as Niveau)}
      >
        {NIVEAUX.map((n) => (
          <option key={n.valeur} value={n.valeur}>
            {n.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Intérêt légitime
// ---------------------------------------------------------------------------

function BlocLia({ c }: { c: Collection<Lia> }) {
  const soutenables = c.items.filter((l) => verdictLia(l).soutenable).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="mises en balance" teinte="brand" />
        <Stat
          valeur={String(soutenables)}
          libelle="bases soutenables"
          teinte={soutenables === c.items.length ? 'jade' : 'gold'}
        />
        <Stat
          valeur={String(c.items.length - soutenables)}
          libelle="à revoir ou à rebaser"
          teinte={c.items.length - soutenables > 0 ? 'ember' : 'jade'}
        />
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Ouvrir une mise en balance"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="interet-legitime"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="La seule base légale qui exige un raisonnement écrit">
          <p>
            L'intérêt légitime est la plus souple des six bases de l'article 6, et la
            seule dont la validité dépend d'un document. Sans mise en balance écrite,
            elle n'est pas invocable — et l'on ne peut pas la remplacer après coup par
            une autre base pour rattraper un consentement mal recueilli.
          </p>
          <p>
            Les trois étapes se prennent dans l'ordre : si l'intérêt n'est pas légitime,
            la question de la nécessité ne se pose pas.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((l, i) => {
            const verdict = verdictLia(l)
            return (
              <article key={l.id} className="card p-6">
                <EnteteFiche
                  index={i + 1}
                  titre={l.traitement}
                  vide="Mise en balance sans objet"
                  suivi={l.suivi}
                  onSupprimer={() => c.supprimer(l.id)}
                >
                  <Pastille teinte={verdict.soutenable ? 'jade' : 'ember'}>
                    {verdict.soutenable
                      ? 'base soutenable'
                      : `échec à l'étape ${verdict.echoue}`}
                  </Pastille>
                </EnteteFiche>

                <div className="grid gap-5 md:grid-cols-2">
                  <Texte
                    label="Traitement concerné"
                    valeur={l.traitement}
                    onChange={(v) => c.modifier(l.id, { traitement: v })}
                    placeholder="Prospection auprès de contacts professionnels"
                  />
                  <Texte
                    label="Intérêt poursuivi"
                    article="art. 6 §1 f"
                    valeur={l.interet}
                    onChange={(v) => c.modifier(l.id, { interet: v })}
                    placeholder="Développement commercial de l'entreprise"
                  />
                </div>

                <div className="mt-6 space-y-5">
                  {TESTS_LIA.map((t) => (
                    <div key={t.id} className="rounded-xl border border-ink-200 p-4">
                      <p className="mb-1 text-sm font-medium text-ink-900">
                        Étape {t.etape} — {t.titre}
                      </p>
                      <p className="mb-3 text-xs text-ink-500">
                        {t.etape < 3
                          ? 'Éliminatoire : tous les critères doivent être satisfaits.'
                          : 'Appréciée en faisceau — le seuil de trois est un repère d’exploitation, pas une règle de droit.'}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {t.criteres.map((cr) => (
                          <Case
                            key={cr.id}
                            coche={l.critereRetenus.includes(cr.id)}
                            onChange={() =>
                              c.modifier(l.id, {
                                critereRetenus: l.critereRetenus.includes(cr.id)
                                  ? l.critereRetenus.filter((x) => x !== cr.id)
                                  : [...l.critereRetenus, cr.id],
                              })
                            }
                            label={cr.label}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Texte
                    label="Argumentaire"
                    valeur={l.argumentaire}
                    onChange={(v) => c.modifier(l.id, { argumentaire: v })}
                    lignes={3}
                    aide="C'est cette pièce qui sera opposée, pas le tableau de cases. Écrivez-la comme si elle devait être lue par quelqu'un qui n'est pas d'accord."
                  />
                  <Texte
                    label="Garanties offertes"
                    valeur={l.garanties}
                    onChange={(v) => c.modifier(l.id, { garanties: v })}
                    lignes={3}
                    placeholder="Droit d'opposition en un clic, durée de conservation courte, absence de croisement avec d'autres fichiers"
                  />
                  <div className="md:col-span-2">
                    <ChampsSuivi
                      suivi={l.suivi}
                      onChange={(v) => c.modifier(l.id, { suivi: v })}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <Encadre teinte={verdict.soutenable ? 'jade' : 'ember'}>
                    {verdict.motif}
                  </Encadre>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Transferts
// ---------------------------------------------------------------------------

function BlocTia({ c }: { c: Collection<Tia> }) {
  const bloquants = c.items.filter((t) => !verdictTia(t).possible).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="transferts analysés" teinte="brand" />
        <Stat
          valeur={String(c.items.length - bloquants)}
          libelle="transferts soutenables"
          teinte="jade"
        />
        <Stat
          valeur={String(bloquants)}
          libelle="à suspendre ou compléter"
          teinte={bloquants > 0 ? 'ember' : 'jade'}
        />
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Analyser un transfert"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="analyses-transfert"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Les clauses ne suffisent plus depuis 2020">
          <p>
            Depuis l'arrêt Schrems II, signer les clauses contractuelles types ne clôt
            plus la question : il faut vérifier que le droit du pays de destination ne
            les prive pas d'effet. C'est l'obligation la plus systématiquement omise du
            chapitre V, parce qu'elle ne se règle pas par une signature.
          </p>
          <p>
            Rappel de périmètre : le simple accès à distance depuis un pays tiers est un
            transfert. Un prestataire d'astreinte qui se connecte depuis l'Inde transfère.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((t, i) => {
            const verdict = verdictTia(t)
            return (
              <article key={t.id} className="card p-6">
                <EnteteFiche
                  index={i + 1}
                  titre={t.destinataire ? `${t.destinataire} — ${t.pays}` : ''}
                  vide="Transfert non identifié"
                  suivi={t.suivi}
                  onSupprimer={() => c.supprimer(t.id)}
                >
                  <Pastille teinte={verdict.possible ? 'jade' : 'ember'}>
                    {verdict.possible ? 'transfert soutenable' : 'transfert à suspendre'}
                  </Pastille>
                </EnteteFiche>

                <div className="grid gap-5 md:grid-cols-3">
                  <Texte
                    label="Destinataire"
                    valeur={t.destinataire}
                    onChange={(v) => c.modifier(t.id, { destinataire: v })}
                    placeholder="Fournisseur d'hébergement"
                  />
                  <Texte
                    label="Pays de destination"
                    valeur={t.pays}
                    onChange={(v) => c.modifier(t.id, { pays: v })}
                    placeholder="États-Unis"
                  />
                  <Texte
                    label="Outil de transfert"
                    article="art. 45, 46 ou 49"
                    valeur={t.outil}
                    onChange={(v) => c.modifier(t.id, { outil: v })}
                    placeholder="Clauses contractuelles types, module 2"
                  />
                  <div className="md:col-span-3">
                    <Texte
                      label="Données transférées"
                      valeur={t.donnees}
                      onChange={(v) => c.modifier(t.id, { donnees: v })}
                      placeholder="Identité et coordonnées des clients, journaux applicatifs"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {ETAPES_TIA.map((e, n) => (
                    <div key={e.id}>
                      <Texte
                        label={`${n + 1}. ${e.titre}`}
                        valeur={t.etapes[e.id] ?? ''}
                        onChange={(v) =>
                          c.modifier(t.id, { etapes: { ...t.etapes, [e.id]: v } })
                        }
                        lignes={2}
                        aide={e.note}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Liste
                    label="Accès des autorités du pays tiers"
                    article="étape 3"
                    valeur={t.accesAutorites}
                    options={[
                      { id: 'non', label: 'Aucun accès disproportionné identifié' },
                      { id: 'oui-encadre', label: 'Accès existant, mais encadré et contrôlé' },
                      { id: 'oui-problematique', label: 'Accès disproportionné, sans recours effectif' },
                    ]}
                    onChange={(v) =>
                      c.modifier(t.id, { accesAutorites: (v || 'non-evalue') as Tia['accesAutorites'] })
                    }
                    aide="C'est l'étape qui décide. Une analyse qui ne la tranche pas n'existe pas."
                  />
                  <div className="flex items-end pb-2">
                    <Case
                      coche={t.mesuresSuffisantes}
                      onChange={(v) => c.modifier(t.id, { mesuresSuffisantes: v })}
                      label="Les mesures supplémentaires neutralisent cet accès"
                      aide="Techniques avant tout : chiffrement dont la clé ne quitte pas l'Union, pseudonymisation robuste. Les mesures contractuelles seules ne résistent pas à un pouvoir d'accès."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ChampsSuivi
                      suivi={t.suivi}
                      onChange={(v) => c.modifier(t.id, { suivi: v })}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <Encadre teinte={verdict.possible ? 'jade' : 'ember'}>{verdict.motif}</Encadre>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AIDF
// ---------------------------------------------------------------------------

function BlocAidf({ c }: { c: Collection<Aidf> }) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="analyses ouvertes" teinte="brand" />
        <Stat
          valeur={String(c.items.filter((a) => a.notifieeAutorite).length)}
          libelle="résultats notifiés"
          teinte="ink"
        />
        <Stat
          valeur={String(c.items.filter((a) => completudeAidf(a) < 1).length)}
          libelle="incomplètes"
          teinte={c.items.some((a) => completudeAidf(a) < 1) ? 'gold' : 'jade'}
        />
      </div>

      <div className="mb-6 max-w-3xl">
        <Encadre teinte="brand" titre="Elle ne remplace pas l'analyse d'impact du RGPD">
          L'AIDF regarde les droits fondamentaux dans leur ensemble — non-discrimination,
          dignité, recours effectif ; l'AIPD regarde le seul traitement de données
          personnelles. L'article 27 §4 permet de <em>s'appuyer</em> sur l'AIPD pour les
          parties qui se recouvrent, jamais de s'en dispenser. Les deux se mènent en
          parallèle, et il est plus rapide de les mener ensemble.
        </Encadre>
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Ouvrir une analyse"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="analyses-droits-fondamentaux"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Qui la doit">
          <p>
            Les organismes de droit public, et les entités privées fournissant des
            services publics — ainsi que les déployeurs des systèmes d'évaluation de
            solvabilité et de tarification en assurance vie et santé. Uniquement pour les
            systèmes à haut risque de l'annexe III, et avant la première utilisation.
          </p>
          <p>
            Le résultat doit être notifié à l'autorité de surveillance du marché (art. 27
            §3), au moyen d'un questionnaire type publié par le Bureau de l'IA.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((a, i) => (
            <article key={a.id} className="card p-6">
              <EnteteFiche
                index={i + 1}
                titre={a.systeme}
                vide="Analyse sans système rattaché"
                suivi={a.suivi}
                completude={completudeAidf(a)}
                onSupprimer={() => c.supprimer(a.id)}
              >
                {a.notifieeAutorite && <Pastille teinte="jade">notifiée — art. 27 §3</Pastille>}
              </EnteteFiche>

              <div className="grid gap-5 md:grid-cols-2">
                <Texte
                  label="Système concerné"
                  valeur={a.systeme}
                  onChange={(v) => c.modifier(a.id, { systeme: v })}
                  placeholder="Outil d'aide à l'attribution des aides sociales"
                  aide="Reprenez le nom porté à l'inventaire des systèmes d'IA."
                />
                <Texte
                  label="Analyse d'impact RGPD associée"
                  article="art. 27 §4"
                  valeur={a.aipdAssociee}
                  onChange={(v) => c.modifier(a.id, { aipdAssociee: v })}
                  placeholder="AIPD-2026-07"
                />
              </div>

              <div className="mt-6 space-y-4">
                {VOLETS_AIDF.map((v) => (
                  <Texte
                    key={v.id}
                    label={v.titre}
                    article={v.article}
                    valeur={a.volets[v.id] ?? ''}
                    onChange={(x) =>
                      c.modifier(a.id, { volets: { ...a.volets, [v.id]: x } })
                    }
                    lignes={2}
                    aide={v.note}
                  />
                ))}
              </div>

              <div className="mt-5 space-y-4">
                <Case
                  coche={a.notifieeAutorite}
                  onChange={(v) => c.modifier(a.id, { notifieeAutorite: v })}
                  label="Le résultat a été notifié à l'autorité de surveillance du marché"
                  aide="Art. 27 §3. La notification n'est pas une autorisation : elle ne purge pas votre responsabilité sur le contenu de l'analyse."
                />
                <ChampsSuivi suivi={a.suivi} onChange={(v) => c.modifier(a.id, { suivi: v })} />
              </div>

              <Manquants items={champsManquantsAidf(a)} />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
