import { useState } from 'react'
import { Page } from './components/Cadre'
import { Case, Segments, Texte } from './components/Champs'
import { Detail, Encadre, Obligations, Pastille, Stat } from './components/Blocs'
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
import { STATUTS_SYSTEME, etatInventaire, systemeVide } from './lib/inventaire'
import type { SystemeIa } from './lib/inventaire'
import {
  CAS_TRANSPARENCE,
  PRATIQUES_INTERDITES,
  USAGES_ANNEXE_III,
  qualifierIa,
} from './lib/qualification'
import type { NiveauIa, ReponsesIa, Role } from './lib/qualification'
import {
  SECTIONS_ANNEXE_IV,
  champsManquantsDocumentation,
  completudeDocumentation,
  documentationVide,
} from './lib/annexes'
import type { DocumentationIa } from './lib/annexes'
import { PUBLICS, publicsNonCouverts, sessionVide } from './lib/formation'
import type { Session } from './lib/formation'
import { aujourdhui, joursRestants } from './lib/calendrier'
import { echeanceRelative, jour } from './lib/format'
import type { Teinte } from './lib/couleurs'

const TEINTE_NIVEAU: Record<NiveauIa, Teinte> = {
  interdit: 'ember',
  'haut-risque': 'gold',
  transparence: 'brand',
  minimal: 'jade',
  'hors-champ': 'ink',
}

const LIBELLE_NIVEAU: Record<NiveauIa, string> = {
  interdit: 'pratique interdite',
  'haut-risque': 'haut risque',
  transparence: 'transparence — art. 50',
  minimal: 'risque minimal',
  'hors-champ': 'hors champ',
}

type Onglet = 'inventaire' | 'documentation' | 'formation'

export default function PageIa() {
  const [onglet, setOnglet] = useState<Onglet>('inventaire')

  const systemes = useCollection<SystemeIa>('laws.systemes', systemeVide)
  const docs = useCollection<DocumentationIa>('laws.documentationIa', documentationVide)
  const sessions = useCollection<Session>('laws.formation', sessionVide)

  return (
    <Page
      chemin="/ia/"
      titre="Intelligence artificielle"
      chapeau="La question que l'AI Act vous pose n'est pas « votre modèle est-il performant » mais « à quoi sert sa sortie ». Un même modèle de classification est hors champ dans un outil de tri documentaire et à haut risque dans un outil de présélection de candidatures : c'est l'usage qui qualifie, jamais la technique. D'où l'inventaire — le vrai livrable du règlement, celui qui révèle les systèmes que personne n'avait pensé à qualifier."
    >
      <Onglets<Onglet>
        valeur={onglet}
        onChange={setOnglet}
        options={[
          { id: 'inventaire', label: 'Inventaire et qualification', compte: systemes.items.length },
          { id: 'documentation', label: 'Documentation — annexe IV', compte: docs.items.length },
          { id: 'formation', label: 'Maîtrise de l’IA — art. 4', compte: sessions.items.length },
        ]}
      />

      <ModeEmploi
        quand="L'inventaire se tient en continu ; la qualification se fait au choix de la solution. Après, elle ne change plus que le budget — un système déjà intégré qui ressort « haut risque » coûte un système de gestion des risques, une documentation annexe IV et un enregistrement à la base de données de l'Union."
        avecQui="Les métiers, plus que la DSI. Les systèmes non qualifiés sont presque toujours ceux qu'une équipe a souscrits seule ; commencez par la liste des abonnements logiciels, pas par le schéma d'architecture."
        livrable="Un inventaire à jour, une ligne par système, avec le niveau de risque retenu et le raisonnement qui y conduit. C'est ce qu'une autorité demande en premier."
      >
        <p>
          Trois pièges de qualification qui reviennent à chaque mission.{' '}
          <strong>Le rôle</strong> d'abord : un déployeur qui affine un modèle ou
          l'exploite sous sa marque devient fournisseur (art. 25) et hérite de tout le
          chapitre III — un réglage fin suffit.{' '}
          <strong>Le profilage</strong> ensuite : dès que le système note des personnes
          physiques, la dérogation de l'article 6 §3 est fermée, quelle que soit
          l'étroitesse de la tâche.{' '}
          <strong>La transparence</strong> enfin : l'article 50 est déjà applicable et
          touche bien plus de systèmes que le haut risque.
        </p>
        <p>
          Ce qui doit remonter dans votre conception, indépendamment du niveau : la
          journalisation de l'article 12 — six mois au moins, à budgéter en volume —,
          la traçabilité des données d'entraînement qui ne se reconstitue pas après
          coup, et un marquage des sorties génératives <em>lisible par machine</em> :
          un bandeau visuel ne satisfait pas l'article 50 §2.
        </p>
      </ModeEmploi>

      {onglet === 'inventaire' && <BlocInventaire c={systemes} />}
      {onglet === 'documentation' && <BlocDocumentation c={docs} />}
      {onglet === 'formation' && <BlocFormation c={sessions} />}
    </Page>
  )
}

// ---------------------------------------------------------------------------
// Inventaire
// ---------------------------------------------------------------------------

function BlocInventaire({ c }: { c: Collection<SystemeIa> }) {
  const etat = etatInventaire(c.items)

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat valeur={String(etat.total)} libelle="systèmes actifs" teinte="brand" />
        <Stat
          valeur={String(etat.interdits)}
          libelle="pratiques interdites"
          teinte={etat.interdits > 0 ? 'ember' : 'jade'}
        />
        <Stat
          valeur={String(etat.hautRisque)}
          libelle="à haut risque"
          teinte={etat.hautRisque > 0 ? 'gold' : 'ink'}
        />
        <Stat
          valeur={String(etat.nonQualifies)}
          libelle="non qualifiés"
          teinte={etat.nonQualifies > 0 ? 'ember' : 'jade'}
        />
        <Stat
          valeur={String(etat.orphelins)}
          libelle="sans responsable"
          teinte={etat.orphelins > 0 ? 'ember' : 'jade'}
        />
      </div>

      {etat.interdits > 0 && (
        <div className="mb-6 max-w-3xl">
          <Encadre teinte="ember" titre="Une pratique interdite est inscrite à l'inventaire">
            Aucune documentation ne rachète une pratique de l'article 5 : elle rend
            l'usage illicite, sous le plafond de sanction le plus élevé du règlement —
            35 M€ ou 7 % du chiffre d'affaires mondial. Arrêtez l'usage, ou reconcevez la
            fonction pour sortir de la pratique visée.
          </Encadre>
        </div>
      )}

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Inscrire un système"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="inventaire-ia"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Commencez par ce que personne ne considère comme de l'IA">
          <p>
            L'assistant conversationnel du service client, le tri automatique des
            candidatures dans l'outil RH, le moteur de recommandation du site, la
            détection de fraude de l'outil comptable, la transcription automatique des
            réunions. Aucun n'a été acheté comme « un système d'IA », tous en sont.
          </p>
          <p>
            L'inventaire doit inclure les outils introduits par les métiers sans passer
            par la DSI : c'est là que se trouvent les systèmes à haut risque non
            qualifiés, et c'est précisément ce que l'inventaire sert à découvrir.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((s, i) => (
            <FicheSysteme
              key={s.id}
              s={s}
              index={i + 1}
              onChange={(p) => c.modifier(s.id, p)}
              onDupliquer={() => c.dupliquer(s.id)}
              onSupprimer={() => c.supprimer(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FicheSysteme({
  s,
  index,
  onChange,
  onDupliquer,
  onSupprimer,
}: {
  s: SystemeIa
  index: number
  onChange: (p: Partial<SystemeIa>) => void
  onDupliquer: () => void
  onSupprimer: () => void
}) {
  const q = qualifierIa(s.reponses)
  const today = aujourdhui()
  const majR = (p: Partial<ReponsesIa>) => onChange({ reponses: { ...s.reponses, ...p } })
  const bascule = (liste: string[], id: string) =>
    liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id]

  return (
    <article className="card p-6">
      <EnteteFiche
        index={index}
        titre={s.nom}
        vide="Système sans nom"
        suivi={s.suivi}
        revueMois={6}
        onDupliquer={onDupliquer}
        onSupprimer={onSupprimer}
      >
        <Pastille teinte={TEINTE_NIVEAU[q.niveau]}>{LIBELLE_NIVEAU[q.niveau]}</Pastille>
        <Pastille teinte="ink">
          {STATUTS_SYSTEME.find((x) => x.id === s.statut)?.label}
        </Pastille>
        {q.echeance && (
          <Pastille teinte={joursRestants(q.echeance, today) < 365 ? 'gold' : 'ink'}>
            exigible {jour(q.echeance)}
          </Pastille>
        )}
      </EnteteFiche>

      <div className="grid gap-5 md:grid-cols-2">
        <Texte
          label="Nom du système"
          valeur={s.nom}
          onChange={(v) => onChange({ nom: v })}
          placeholder="Assistant de présélection des candidatures"
        />
        <Texte
          label="Fournisseur"
          valeur={s.fournisseur}
          onChange={(v) => onChange({ fournisseur: v })}
          placeholder="Éditeur, ou « interne »"
          aide="Un système acheté sur étagère s'inventorie comme les autres : c'est votre usage qui décide de vos obligations."
        />
        <div className="md:col-span-2">
          <Texte
            label="Usage réel"
            valeur={s.usage}
            onChange={(v) => onChange({ usage: v })}
            lignes={2}
            placeholder="Le service RH s'en sert pour classer les candidatures avant l'entretien téléphonique"
            aide="Décrivez ce qui se passe vraiment, pas ce que prévoit le contrat : c'est l'usage effectif qui qualifie."
          />
        </div>
        <div className="md:col-span-2">
          <Segments
            label="Statut"
            valeur={s.statut}
            onChange={(v) => onChange({ statut: v })}
            options={STATUTS_SYSTEME.map((x) => ({ id: x.id, label: x.label }))}
            aide={STATUTS_SYSTEME.find((x) => x.id === s.statut)?.note}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-ink-100 pt-5">
        <Detail resume="Qualification" defaut={!s.reponses.estSystemeIa}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="space-y-4">
                <Case
                  coche={s.reponses.estSystemeIa}
                  onChange={(v) => majR({ estSystemeIa: v })}
                  label="C'est un système d'IA au sens de l'article 3 §1"
                  aide="Il déduit, à partir des entrées, la manière de générer ses sorties. Un moteur de règles écrit à la main n'en est pas un ; un modèle appris, oui."
                />
                <Case
                  coche={s.reponses.lienUnion}
                  onChange={(v) => majR({ lienUnion: v })}
                  label="Mis sur le marché de l'Union, ou sorties utilisées dans l'Union"
                />
                <Segments
                  label="Notre rôle"
                  valeur={s.reponses.role}
                  onChange={(v: Role) => majR({ role: v })}
                  options={[
                    { id: 'fournisseur', label: 'Fournisseur' },
                    { id: 'deployeur', label: 'Déployeur' },
                    { id: 'importateur', label: 'Importateur' },
                    { id: 'distributeur', label: 'Distributeur' },
                  ]}
                  aide="Un déployeur qui modifie substantiellement le système, ou l'exploite sous sa propre marque, devient fournisseur (art. 25)."
                />
              </div>

              <fieldset>
                <legend className="field-label">Pratiques interdites — article 5</legend>
                <div className="space-y-3">
                  {PRATIQUES_INTERDITES.map((p) => (
                    <Case
                      key={p.id}
                      coche={s.reponses.pratiquesInterdites.includes(p.id)}
                      onChange={() =>
                        majR({
                          pratiquesInterdites: bascule(s.reponses.pratiquesInterdites, p.id),
                        })
                      }
                      label={p.label}
                      aide={p.note}
                    />
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="space-y-5">
              <fieldset>
                <legend className="field-label">Haut risque</legend>
                <div className="space-y-3">
                  <Case
                    coche={s.reponses.annexeI}
                    onChange={(v) => majR({ annexeI: v })}
                    label="Composant de sécurité d'un produit réglementé — annexe I"
                    aide="Dispositif médical, machine, ascenseur, équipement radio, jouet, véhicule…"
                  />
                  {USAGES_ANNEXE_III.map((u) => (
                    <Case
                      key={u.id}
                      coche={s.reponses.usagesAnnexeIII.includes(u.id)}
                      onChange={() =>
                        majR({ usagesAnnexeIII: bascule(s.reponses.usagesAnnexeIII, u.id) })
                      }
                      label={u.label}
                      aide={u.note}
                    />
                  ))}
                </div>
              </fieldset>

              {s.reponses.usagesAnnexeIII.length > 0 && (
                <div className="space-y-3 rounded-xl bg-ink-50 p-4">
                  <Case
                    coche={s.reponses.derogationArticle6}
                    onChange={(v) => majR({ derogationArticle6: v })}
                    label="Nous invoquons la dérogation de l'article 6 §3"
                    aide="Tâche procédurale étroite, amélioration d'un résultat humain déjà acquis, détection de constantes sans substitution à l'appréciation humaine, ou tâche préparatoire. À documenter avant la mise sur le marché."
                  />
                  <Case
                    coche={s.reponses.profilage}
                    onChange={(v) => majR({ profilage: v })}
                    label="Le système effectue un profilage de personnes physiques"
                    aide="Si oui, la dérogation est fermée quoi qu'il arrive — alinéa 2 de l'article 6 §3."
                  />
                </div>
              )}

              <fieldset>
                <legend className="field-label">Transparence — article 50</legend>
                <div className="space-y-3">
                  {CAS_TRANSPARENCE.map((x) => (
                    <Case
                      key={x.id}
                      coche={s.reponses.transparenceArticle50.includes(x.id)}
                      onChange={() =>
                        majR({
                          transparenceArticle50: bascule(s.reponses.transparenceArticle50, x.id),
                        })
                      }
                      label={x.label}
                      aide={x.note}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="space-y-3">
                <Case
                  coche={s.reponses.modeleUsageGeneral}
                  onChange={(v) => majR({ modeleUsageGeneral: v })}
                  label="Nous fournissons ce modèle à usage général"
                  aide="Y compris un modèle affiné puis redistribué sous votre nom."
                />
                {s.reponses.modeleUsageGeneral && (
                  <Case
                    coche={s.reponses.seuilRisqueSystemique}
                    onChange={(v) => majR({ seuilRisqueSystemique: v })}
                    label="Entraînement au-delà de 10²⁵ opérations en virgule flottante"
                    aide="Risque systémique présumé (art. 51 §2), notification à la Commission sous deux semaines."
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-ink-200 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Pastille teinte={TEINTE_NIVEAU[q.niveau]}>{LIBELLE_NIVEAU[q.niveau]}</Pastille>
              {q.echeance && (
                <span className="text-xs text-ink-500">
                  exigible le {jour(q.echeance)} —{' '}
                  {echeanceRelative(joursRestants(q.echeance, today))}
                </span>
              )}
            </div>
            <p className="mt-3 leading-relaxed text-ink-800">{q.verdict}</p>
            {q.motifs.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-600">
                {q.motifs.map((m) => (
                  <li key={m} className="flex gap-2">
                    <span aria-hidden="true" className="text-ink-300">
                      —
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            )}
            {q.obligations.length > 0 && (
              <div className="mt-4 border-t border-ink-100 pt-4">
                <Detail resume={`Ce qu'il faut produire (${q.obligations.length})`}>
                  <Obligations items={q.obligations} />
                </Detail>
              </div>
            )}
            {q.modele.length > 0 && (
              <div className="mt-4 border-t border-ink-100 pt-4">
                <Detail resume={`En tant que fournisseur de modèle (${q.modele.length})`}>
                  <Obligations items={q.modele} />
                </Detail>
              </div>
            )}
          </div>
        </Detail>
      </div>

      <div className="mt-5">
        <ChampsSuivi suivi={s.suivi} onChange={(v) => onChange({ suivi: v })} />
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Documentation technique
// ---------------------------------------------------------------------------

function BlocDocumentation({ c }: { c: Collection<DocumentationIa> }) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="dossiers ouverts" teinte="brand" />
        <Stat
          valeur={String(c.items.filter((d) => completudeDocumentation(d) === 1).length)}
          libelle="dossiers complets"
          teinte="jade"
        />
        <Stat
          valeur={String(c.items.filter((d) => completudeDocumentation(d) < 1).length)}
          libelle="à compléter"
          teinte={c.items.some((d) => completudeDocumentation(d) < 1) ? 'gold' : 'jade'}
        />
      </div>

      <div className="mb-6 max-w-3xl">
        <Encadre teinte="brand" titre="Avant la mise sur le marché, pas après">
          L'article 11 §1 exige que la documentation soit établie <em>avant</em> la mise
          sur le marché et tenue à jour. La section sur les données d'entraînement est la
          plus scrutée et la plus coûteuse à reconstituer après coup : provenance,
          procédures d'étiquetage, méthodes de détection des biais ne se retrouvent pas
          deux ans plus tard. Pour une PME, l'alinéa 2 autorise un formulaire simplifié —
          les rubriques restent les mêmes, seule la profondeur change.
        </Encadre>
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Ouvrir un dossier"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="documentation-annexe-iv"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Qui la doit">
          <p>
            Le <strong>fournisseur</strong> d'un système à haut risque, et lui seul — un
            déployeur n'a pas à la produire, mais il doit pouvoir se la faire remettre
            pour exercer le contrôle humain de l'article 26 §2. Si l'inventaire fait
            apparaître un système à haut risque dont vous êtes fournisseur, ouvrez le
            dossier ici.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((d, i) => (
            <article key={d.id} className="card p-6">
              <EnteteFiche
                index={i + 1}
                titre={d.systeme ? `${d.systeme}${d.version ? ` — ${d.version}` : ''}` : ''}
                vide="Dossier sans système rattaché"
                suivi={d.suivi}
                revueMois={6}
                completude={completudeDocumentation(d)}
                onDupliquer={() => c.dupliquer(d.id)}
                onSupprimer={() => c.supprimer(d.id)}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Texte
                  label="Système concerné"
                  valeur={d.systeme}
                  onChange={(v) => c.modifier(d.id, { systeme: v })}
                  aide="Reprenez le nom porté à l'inventaire."
                />
                <Texte
                  label="Version documentée"
                  article="art. 11 §1"
                  valeur={d.version}
                  onChange={(v) => c.modifier(d.id, { version: v })}
                  placeholder="v2.4.0"
                  aide="Une modification substantielle relance l'évaluation de la conformité : la documentation se rattache à une version."
                />
              </div>

              <div className="mt-6 space-y-4">
                {SECTIONS_ANNEXE_IV.map((sec) => (
                  <Texte
                    key={sec.id}
                    label={`${sec.numero}. ${sec.titre}`}
                    article={`annexe IV §${sec.numero}`}
                    valeur={d.sections[sec.id] ?? ''}
                    onChange={(v) =>
                      c.modifier(d.id, { sections: { ...d.sections, [sec.id]: v } })
                    }
                    lignes={3}
                    aide={sec.note}
                  />
                ))}
              </div>

              <div className="mt-5">
                <ChampsSuivi suivi={d.suivi} onChange={(v) => c.modifier(d.id, { suivi: v })} />
              </div>

              <Manquants items={champsManquantsDocumentation(d)} />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Maîtrise de l'IA
// ---------------------------------------------------------------------------

function BlocFormation({ c }: { c: Collection<Session> }) {
  const nonCouverts = publicsNonCouverts(c.items)

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="sessions consignées" teinte="brand" />
        <Stat
          valeur={`${PUBLICS.length - nonCouverts.length}/${PUBLICS.length}`}
          libelle="publics couverts"
          teinte={nonCouverts.length === 0 ? 'jade' : 'ember'}
        />
        <Stat
          valeur={String(c.items.filter((s) => !s.preuve.trim()).length)}
          libelle="sessions sans preuve"
          teinte={c.items.some((s) => !s.preuve.trim()) ? 'gold' : 'jade'}
        />
      </div>

      <div className="mb-6 max-w-3xl">
        <Encadre teinte={nonCouverts.length > 0 ? 'ember' : 'jade'} titre="Ce que l'article 4 mesure">
          {nonCouverts.length > 0
            ? `Publics non couverts : ${nonCouverts.join(', ')}. Une organisation qui a formé trois fois ses développeurs et jamais ses superviseurs n'a pas satisfait l'article 4, quel que soit le nombre de sessions tenues.`
            : "Les quatre publics ont été couverts au moins une fois. Le texte demande un niveau « suffisant » apprécié au regard du contexte d'usage : refaites le point à chaque nouveau système inscrit à l'inventaire."}
        </Encadre>
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Consigner une session"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="journal-maitrise-ia"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="L'obligation qui ne laisse aucune trace">
          <p>
            Applicable depuis le 2 février 2025 — avant les modèles à usage général,
            avant la transparence, avant tout le reste. Et la plus souvent manquée, pour
            une raison précise : un système à haut risque laisse derrière lui une
            documentation technique, une équipe formée ne laisse rien, sauf si l'on tient
            le registre.
          </p>
          <p>
            Le texte ne fixe ni programme ni durée. Il demande un niveau « suffisant »,
            apprécié au regard des connaissances des personnes, du contexte d'usage et
            des personnes sur lesquelles le système est utilisé : le journal doit donc
            porter ce raisonnement d'adéquation, pas seulement une liste de présents.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((s, i) => (
            <article key={s.id} className="card p-6">
              <EnteteFiche
                index={i + 1}
                titre={s.intitule}
                vide="Session sans intitulé"
                suivi={s.suivi}
                onDupliquer={() => c.dupliquer(s.id)}
                onSupprimer={() => c.supprimer(s.id)}
              >
                {s.publics.map((p) => (
                  <Pastille key={p} teinte="brand">
                    {PUBLICS.find((x) => x.id === p)?.label}
                  </Pastille>
                ))}
              </EnteteFiche>

              <div className="grid gap-5 md:grid-cols-2">
                <Texte
                  label="Intitulé"
                  valeur={s.intitule}
                  onChange={(v) => c.modifier(s.id, { intitule: v })}
                  placeholder="Sensibilisation AI Act — équipe recrutement"
                />
                <div>
                  <label className="field-label" htmlFor={`date-${s.id}`}>
                    Date
                  </label>
                  <input
                    id={`date-${s.id}`}
                    type="date"
                    className="champ-texte tabular"
                    value={s.date}
                    onChange={(e) => c.modifier(s.id, { date: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <span className="field-label">Publics visés</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PUBLICS.map((p) => (
                      <Case
                        key={p.id}
                        coche={s.publics.includes(p.id)}
                        onChange={() =>
                          c.modifier(s.id, {
                            publics: s.publics.includes(p.id)
                              ? s.publics.filter((x) => x !== p.id)
                              : [...s.publics, p.id],
                          })
                        }
                        label={p.label}
                        aide={p.note}
                      />
                    ))}
                  </div>
                </div>

                <Texte
                  label="Systèmes concernés"
                  valeur={s.systemes}
                  onChange={(v) => c.modifier(s.id, { systemes: v })}
                  placeholder="Assistant de présélection, transcription des réunions"
                />
                <Texte
                  label="Participants"
                  valeur={s.participants}
                  onChange={(v) => c.modifier(s.id, { participants: v })}
                  placeholder="14 personnes du service RH"
                />
                <div className="md:col-span-2">
                  <Texte
                    label="Contenu"
                    valeur={s.contenu}
                    onChange={(v) => c.modifier(s.id, { contenu: v })}
                    lignes={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Texte
                    label="Adéquation au public et au contexte"
                    article="art. 4"
                    valeur={s.adequation}
                    onChange={(v) => c.modifier(s.id, { adequation: v })}
                    lignes={2}
                    aide="Pourquoi ce contenu est suffisant pour ces personnes, ce système et ces personnes concernées. C'est ce raisonnement que le texte demande, et non la seule tenue d'une session."
                  />
                </div>
                <Texte
                  label="Preuve conservée"
                  valeur={s.preuve}
                  onChange={(v) => c.modifier(s.id, { preuve: v })}
                  placeholder="Émargements numérisés, dossier RH partagé"
                />
                <div className="md:col-span-2">
                  <ChampsSuivi suivi={s.suivi} onChange={(v) => c.modifier(s.id, { suivi: v })} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
