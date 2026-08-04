import { useState } from 'react'
import { Page } from './components/Cadre'
import { Case, Liste, Texte } from './components/Champs'
import { Detail, Encadre, Obligations, Pastille, Stat } from './components/Blocs'
import {
  Amorce,
  BarreOutils,
  ChampsSuivi,
  EnteteFiche,
  Manquants,
  Onglets,
} from './components/Pieces'
import { useCollection } from './lib/collection'
import type { Collection } from './lib/collection'
import { etatCatalogue, produitVide } from './lib/inventaire'
import type { Produit } from './lib/inventaire'
import { CATEGORIES_CRA, EXCLUSIONS_CRA, qualifierCra } from './lib/qualification'
import type { CategorieCra, ReponsesCra } from './lib/qualification'
import {
  EXIGENCES_ANNEXE_I,
  champsManquantsDeclaration,
  completudeDeclaration,
  declarationVide,
  evaluationCraVide,
  rendreDeclaration,
  verdictEvaluationCra,
} from './lib/annexes'
import type { Declaration, EvaluationCra, ExigenceCra } from './lib/annexes'
import {
  NIVEAUX_CONFORMITE,
  PRINCIPES,
  auditVide,
  verdictAudit,
} from './lib/accessibilite'
import type { Audit, NiveauConformite } from './lib/accessibilite'
import { joursRestants } from './lib/calendrier'
import { aujourdhui } from './lib/calendrier'
import { echeanceRelative, jour } from './lib/format'

type Onglet = 'catalogue' | 'evaluation' | 'declaration' | 'accessibilite'

export default function PageProduit() {
  const [onglet, setOnglet] = useState<Onglet>('catalogue')

  const produits = useCollection<Produit>('laws.produits', produitVide)
  const evaluations = useCollection<EvaluationCra>('laws.evaluationsCra', evaluationCraVide)
  const declarations = useCollection<Declaration>('laws.declarations', declarationVide)
  const audits = useCollection<Audit>('laws.audits', auditVide)

  return (
    <Page
      chemin="/produit/"
      titre="Produit et conformité"
      chapeau="Un fabricant a un catalogue, pas un produit : la conformité au règlement cyberrésilience s'apprécie version par version, et les trois pièces qu'il exige — évaluation des risques, documentation, déclaration UE de conformité — se rattachent chacune à une version mise sur le marché. S'y ajoute l'accessibilité, seul texte de ce site dont le respect se vérifie de l'extérieur, par n'importe qui, en quelques minutes."
    >
      <Onglets<Onglet>
        valeur={onglet}
        onChange={setOnglet}
        options={[
          { id: 'catalogue', label: 'Catalogue et qualification', compte: produits.items.length },
          { id: 'evaluation', label: 'Risques — art. 13 §2', compte: evaluations.items.length },
          { id: 'declaration', label: 'Déclaration UE — annexe V', compte: declarations.items.length },
          { id: 'accessibilite', label: 'Accessibilité — EN 301 549', compte: audits.items.length },
        ]}
      />

      {onglet === 'catalogue' && <BlocCatalogue c={produits} />}
      {onglet === 'evaluation' && <BlocEvaluation c={evaluations} />}
      {onglet === 'declaration' && <BlocDeclaration c={declarations} produits={produits.items} />}
      {onglet === 'accessibilite' && <BlocAccessibilite c={audits} />}
    </Page>
  )
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

function BlocCatalogue({ c }: { c: Collection<Produit> }) {
  const etat = etatCatalogue(c.items)
  const today = aujourdhui()
  const joursSignalement = joursRestants('2026-09-11', today)

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat valeur={String(etat.dansLeChamp)} libelle="produits dans le champ" teinte="brand" />
        <Stat
          valeur={String(etat.organismeNotifie)}
          libelle="exigeant un organisme notifié"
          teinte={etat.organismeNotifie > 0 ? 'gold' : 'ink'}
        />
        <Stat
          valeur={String(etat.supportInsuffisant)}
          libelle="support sous le plancher légal"
          teinte={etat.supportInsuffisant > 0 ? 'ember' : 'jade'}
        />
        <Stat
          valeur={String(etat.orphelins)}
          libelle="fiches sans responsable"
          teinte={etat.orphelins > 0 ? 'ember' : 'jade'}
        />
      </div>

      {etat.dansLeChamp > 0 && joursSignalement >= 0 && (
        <div className="mb-6 max-w-3xl">
          <Encadre teinte="ember" titre={`Signalement exigible le 11 septembre 2026 — ${echeanceRelative(joursSignalement)}`}>
            L'article 14 mord quinze mois avant le reste du règlement, et il vise les
            produits <strong>déjà sur le marché</strong>. Il faut donc une chaîne
            d'astreinte capable de tenir vingt-quatre heures un week-end, des points de
            contact enregistrés et un accès à la plateforme de dépôt — pour des produits
            qui, eux, n'ont pas encore à être conformes.
          </Encadre>
        </div>
      )}

      {etat.organismeNotifie > 0 && (
        <div className="mb-6 max-w-3xl">
          <Encadre teinte="gold" titre="Le chemin critique passe par un tiers">
            {etat.organismeNotifie} produit(s) relèvent d'une catégorie fermant
            l'auto-évaluation. Les organismes ne sont notifiables que depuis le 11 juin
            2026 : leur capacité sera le facteur limitant du calendrier, pas votre
            documentation. Prenez rang tôt.
          </Encadre>
        </div>
      )}

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Inscrire un produit"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="catalogue-produits"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Un produit, une version, une conformité">
          <p>
            Le CRA s'applique au produit tel qu'il est mis sur le marché. Deux versions
            majeures d'un même logiciel sont deux objets de conformité : chacune a sa
            documentation, sa déclaration et sa période de support. Inscrivez-les
            séparément dès que leurs dates de mise sur le marché diffèrent.
          </p>
          <p>
            Rappel de périmètre : le logiciel vendu seul est un produit. Un service en
            ligne pur ne l'est pas — sauf pour ses solutions de traitement à distance
            intégrées au produit (art. 3 §2) —, et relève plutôt de NIS 2.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((p, i) => (
            <FicheProduit
              key={p.id}
              p={p}
              index={i + 1}
              onChange={(x) => c.modifier(p.id, x)}
              onDupliquer={() => c.dupliquer(p.id)}
              onSupprimer={() => c.supprimer(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FicheProduit({
  p,
  index,
  onChange,
  onDupliquer,
  onSupprimer,
}: {
  p: Produit
  index: number
  onChange: (x: Partial<Produit>) => void
  onDupliquer: () => void
  onSupprimer: () => void
}) {
  const r = qualifierCra(p.reponses)
  const majR = (x: Partial<ReponsesCra>) => onChange({ reponses: { ...p.reponses, ...x } })
  const categorie = CATEGORIES_CRA.find((x) => x.id === p.reponses.categorie)

  return (
    <article className="card p-6">
      <EnteteFiche
        index={index}
        titre={p.nom ? `${p.nom}${p.version ? ` — ${p.version}` : ''}` : ''}
        vide="Produit sans nom"
        suivi={p.suivi}
        onDupliquer={onDupliquer}
        onSupprimer={onSupprimer}
      >
        <Pastille teinte={r.dansLeChamp ? 'gold' : 'ink'}>
          {r.dansLeChamp ? (categorie?.label ?? 'dans le champ') : 'hors champ'}
        </Pastille>
        {r.alerteSupport && <Pastille teinte="ember">support insuffisant</Pastille>}
      </EnteteFiche>

      <div className="grid gap-5 md:grid-cols-3">
        <Texte
          label="Nom du produit"
          valeur={p.nom}
          onChange={(v) => onChange({ nom: v })}
          placeholder="Passerelle de supervision"
        />
        <Texte
          label="Version ou gamme"
          valeur={p.version}
          onChange={(v) => onChange({ version: v })}
          placeholder="v4.x"
        />
        <div>
          <label className="field-label" htmlFor={`msm-${p.id}`}>
            Mise sur le marché
          </label>
          <input
            id={`msm-${p.id}`}
            type="date"
            className="champ-texte tabular"
            value={p.miseSurLeMarche}
            onChange={(e) => onChange({ miseSurLeMarche: e.target.value })}
          />
          <p className="field-hint">
            Prévue ou effective. C'est elle qui décide du régime : un produit mis sur le
            marché après le 11 décembre 2027 doit être conforme dès le premier jour.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-ink-100 pt-5">
        <Detail resume="Qualification" defaut={!p.reponses.produitNumerique}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Case
                coche={p.reponses.produitNumerique}
                onChange={(v) => majR({ produitNumerique: v })}
                label="C'est un produit comportant des éléments numériques"
                aide="Produit matériel ou logiciel dont l'usage prévu comporte une connexion, directe ou indirecte, à un appareil ou à un réseau."
              />
              <Case
                coche={p.reponses.marcheUnion}
                onChange={(v) => majR({ marcheUnion: v })}
                label="Mis à disposition sur le marché de l'Union, à titre commercial"
                aide="La distribution gratuite mais commerciale — un palier gratuit d'une offre payante — reste dans le champ."
              />
              <div>
                <span className="field-label">Exclusion invoquée</span>
                <select
                  className="champ-texte"
                  value={p.reponses.exclusion}
                  onChange={(e) => majR({ exclusion: e.target.value })}
                >
                  <option value="">Aucune</option>
                  {EXCLUSIONS_CRA.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.label}
                    </option>
                  ))}
                </select>
                <p className="field-hint">
                  {EXCLUSIONS_CRA.find((e) => e.id === p.reponses.exclusion)?.note ??
                    "Les exclusions de l'article 2 renvoient à un régime sectoriel, en général plus exigeant — jamais à l'absence d'obligation."}
                </p>
              </div>
              <div>
                <label className="field-label" htmlFor={`sup-${p.id}`}>
                  Période de support annoncée
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`sup-${p.id}`}
                    type="number"
                    min={1}
                    max={20}
                    value={p.reponses.periodeSupportAnnee}
                    onChange={(e) => majR({ periodeSupportAnnee: Number(e.target.value) })}
                    className="champ-texte tabular w-24"
                  />
                  <span className="text-sm text-ink-500">ans</span>
                </div>
                <p className="field-hint">
                  Plancher de cinq ans (art. 13 §8), sauf durée de vie attendue plus
                  courte — qu'il revient au fabricant de démontrer.
                </p>
              </div>
            </div>

            <div>
              <span className="field-label">Catégorie</span>
              <div className="space-y-3">
                {CATEGORIES_CRA.map((cat) => (
                  <label
                    key={cat.id}
                    className={[
                      'block cursor-pointer rounded-xl border p-4 transition',
                      p.reponses.categorie === cat.id
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-ink-200 hover:border-ink-300',
                    ].join(' ')}
                  >
                    <div className="flex items-baseline gap-2.5">
                      <input
                        type="radio"
                        name={`cat-${p.id}`}
                        checked={p.reponses.categorie === cat.id}
                        onChange={() => majR({ categorie: cat.id as CategorieCra })}
                        className="accent-brand-600"
                      />
                      <span className="text-sm font-medium text-ink-900">{cat.label}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-ink-600">{cat.exemples}</p>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-ink-200 p-5">
            <p className="leading-relaxed text-ink-800">{r.verdict}</p>
            {r.alerteSupport && (
              <div className="mt-3">
                <Encadre teinte="ember">{r.alerteSupport}</Encadre>
              </div>
            )}
            {r.echeances.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-ink-100 pt-4">
                {r.echeances.map((e) => (
                  <li key={e.date} className="text-sm leading-relaxed text-ink-600">
                    <span className="tabular font-semibold text-ink-900">{jour(e.date)}</span> —{' '}
                    {e.quoi}
                  </li>
                ))}
              </ul>
            )}
            {r.obligations.length > 0 && (
              <div className="mt-4 border-t border-ink-100 pt-4">
                <Detail resume={`Ce qu'il faut produire (${r.obligations.length})`}>
                  <Obligations items={r.obligations} />
                </Detail>
              </div>
            )}
          </div>
        </Detail>
      </div>

      <div className="mt-5">
        <ChampsSuivi suivi={p.suivi} onChange={(v) => onChange({ suivi: v })} />
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Évaluation des risques
// ---------------------------------------------------------------------------

function BlocEvaluation({ c }: { c: Collection<EvaluationCra> }) {
  const lacunes = c.items.filter(
    (e) => verdictEvaluationCra(e).ecarteesSansMotif.length > 0,
  ).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="évaluations ouvertes" teinte="brand" />
        <Stat
          valeur={String(c.items.filter((e) => verdictEvaluationCra(e).tranchees === EXIGENCES_ANNEXE_I.length).length)}
          libelle="complètement tranchées"
          teinte="jade"
        />
        <Stat
          valeur={String(lacunes)}
          libelle="avec exigences écartées sans motif"
          teinte={lacunes > 0 ? 'ember' : 'jade'}
        />
      </div>

      <div className="mb-6 max-w-3xl">
        <Encadre teinte="brand" titre="La moitié qu'on oublie">
          L'article 13 §2 demande que l'évaluation identifie les exigences applicables{' '}
          <strong>et justifie celles qui ne le sont pas</strong>. C'est cette seconde
          moitié qui manque presque toujours : une exigence écartée sans motif écrit est
          une non-conformité, pas une exigence écartée. Et l'évaluation se tient à jour
          pendant toute la période de support, pas seulement à la mise sur le marché.
        </Encadre>
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Ouvrir une évaluation"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="evaluations-risques-cra"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Le document qui porte tous les autres">
          <p>
            L'évaluation des risques est jointe à la documentation technique et fonde la
            déclaration UE de conformité : sans elle, les deux autres pièces sont des
            affirmations sans base. C'est aussi la première que demandera une autorité de
            surveillance du marché.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((e, i) => (
            <FicheEvaluation
              key={e.id}
              e={e}
              index={i + 1}
              onChange={(x) => c.modifier(e.id, x)}
              onDupliquer={() => c.dupliquer(e.id)}
              onSupprimer={() => c.supprimer(e.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FicheEvaluation({
  e,
  index,
  onChange,
  onDupliquer,
  onSupprimer,
}: {
  e: EvaluationCra
  index: number
  onChange: (x: Partial<EvaluationCra>) => void
  onDupliquer: () => void
  onSupprimer: () => void
}) {
  const verdict = verdictEvaluationCra(e)
  const majEx = (id: string, x: Partial<ExigenceCra>) =>
    onChange({
      exigences: {
        ...e.exigences,
        [id]: { ...(e.exigences[id] ?? { applicable: 'non-tranchee', justification: '' }), ...x },
      },
    })

  return (
    <article className="card p-6">
      <EnteteFiche
        index={index}
        titre={e.produit ? `${e.produit}${e.version ? ` — ${e.version}` : ''}` : ''}
        vide="Évaluation sans produit rattaché"
        suivi={e.suivi}
        revueMois={6}
        completude={verdict.tranchees / EXIGENCES_ANNEXE_I.length}
        onDupliquer={onDupliquer}
        onSupprimer={onSupprimer}
      >
        <Pastille teinte={verdict.ecarteesSansMotif.length > 0 ? 'ember' : 'jade'}>
          {verdict.tranchees}/{EXIGENCES_ANNEXE_I.length} exigences tranchées
        </Pastille>
      </EnteteFiche>

      <div className="grid gap-5 md:grid-cols-2">
        <Texte
          label="Produit"
          valeur={e.produit}
          onChange={(v) => onChange({ produit: v })}
          aide="Reprenez le nom porté au catalogue."
        />
        <Texte
          label="Version"
          valeur={e.version}
          onChange={(v) => onChange({ version: v })}
        />
        <div className="md:col-span-2">
          <Texte
            label="Usage prévu et usage raisonnablement prévisible"
            article="art. 13 §2"
            valeur={e.usagePrevu}
            onChange={(v) => onChange({ usagePrevu: v })}
            lignes={2}
            aide="Le périmètre de l'analyse. L'usage « raisonnablement prévisible » inclut le détournement banal — l'installation sur un réseau ouvert, la configuration laissée par défaut."
          />
        </div>
        <div className="md:col-span-2">
          <Texte
            label="Analyse des menaces"
            valeur={e.analyse}
            onChange={(v) => onChange({ analyse: v })}
            lignes={3}
            aide="Actifs à protéger, sources de menace, scénarios d'attaque retenus et écartés."
          />
        </div>
        <Texte
          label="Nomenclature logicielle (SBOM)"
          article="annexe I, partie II §1"
          valeur={e.sbom}
          onChange={(v) => onChange({ sbom: v })}
          placeholder="CycloneDX 1.6, publiée avec chaque version, dépôt interne /sbom"
          aide="Aucun formulaire ne produit une SBOM : elle sort de la chaîne de construction. Indiquez ici où elle vit, dans quel format, et à quelle version elle se rattache."
        />
        <Texte
          label="Composants tiers et libres"
          article="art. 13 §5"
          valeur={e.composants}
          onChange={(v) => onChange({ composants: v })}
          lignes={2}
          aide="La diligence exercée avant intégration. Leur sécurité devient la vôtre au moment où vous les distribuez."
        />
      </div>

      <div className="mt-6 border-t border-ink-100 pt-5">
        <p className="mb-1 text-sm font-medium text-ink-700">
          Les exigences essentielles de l'annexe I, partie I
        </p>
        <p className="mb-4 text-xs text-ink-500">
          Pour chacune : applicable, avec la mesure retenue — ou écartée, avec son motif.
        </p>
        <div className="space-y-3">
          {EXIGENCES_ANNEXE_I.map((x) => {
            const v = e.exigences[x.id] ?? { applicable: 'non-tranchee', justification: '' }
            return (
              <div
                key={x.id}
                className="grid items-start gap-3 rounded-xl border border-ink-200 p-3 sm:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1.2fr)]"
              >
                <p className="text-sm leading-snug text-ink-800">{x.label}</p>
                <select
                  className="champ-texte"
                  value={v.applicable}
                  onChange={(ev) =>
                    majEx(x.id, { applicable: ev.target.value as ExigenceCra['applicable'] })
                  }
                >
                  <option value="non-tranchee">Non tranchée</option>
                  <option value="applicable">Applicable</option>
                  <option value="ecartee">Écartée</option>
                </select>
                <input
                  type="text"
                  className="champ-texte"
                  placeholder={
                    v.applicable === 'ecartee'
                      ? 'Motif de la mise à l’écart'
                      : 'Mesure retenue'
                  }
                  value={v.justification}
                  onChange={(ev) => majEx(x.id, { justification: ev.target.value })}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5">
        <ChampsSuivi suivi={e.suivi} onChange={(v) => onChange({ suivi: v })} />
      </div>

      <div className="mt-5">
        <Encadre
          teinte={
            verdict.ecarteesSansMotif.length > 0
              ? 'ember'
              : verdict.tranchees === EXIGENCES_ANNEXE_I.length
                ? 'jade'
                : 'gold'
          }
        >
          {verdict.motif}
        </Encadre>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Déclaration UE de conformité
// ---------------------------------------------------------------------------

function BlocDeclaration({
  c,
  produits,
}: {
  c: Collection<Declaration>
  produits: Produit[]
}) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="déclarations rédigées" teinte="brand" />
        <Stat
          valeur={String(c.items.filter((d) => d.signataire.trim() && d.date).length)}
          libelle="signées"
          teinte="jade"
        />
        <Stat
          valeur={String(produits.filter((p) => qualifierCra(p.reponses).dansLeChamp).length)}
          libelle="produits en attendant une"
          teinte="gold"
        />
      </div>

      <div className="mb-6 max-w-3xl">
        <Encadre teinte="brand" titre="« Sous la seule responsabilité du fabricant »">
          Le point 3 de l'annexe V mérite d'être lu deux fois. Aucun organisme notifié,
          aucun consultant, aucun outil ne partage cette responsabilité — ce site pas
          davantage. Le texte ci-dessous est un gabarit à relire, pas une pièce signée.
        </Encadre>
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Rédiger une déclaration"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="declarations-conformite"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Le document le plus court du règlement">
          <p>
            Huit points, une page. Et pourtant celui sans lequel le marquage CE ne peut
            pas être apposé, donc sans lequel le produit ne peut pas être mis sur le
            marché de l'Union à compter du 11 décembre 2027.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((d, i) => (
            <FicheDeclaration
              key={d.id}
              d={d}
              index={i + 1}
              produits={produits}
              onChange={(x) => c.modifier(d.id, x)}
              onDupliquer={() => c.dupliquer(d.id)}
              onSupprimer={() => c.supprimer(d.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FicheDeclaration({
  d,
  index,
  produits,
  onChange,
  onDupliquer,
  onSupprimer,
}: {
  d: Declaration
  index: number
  produits: Produit[]
  onChange: (x: Partial<Declaration>) => void
  onDupliquer: () => void
  onSupprimer: () => void
}) {
  // La catégorie du produit décide si un organisme notifié doit figurer : on
  // la retrouve depuis le catalogue plutôt que de la redemander, pour qu'une
  // requalification se propage sans ressaisie.
  const produit = produits.find((p) => p.nom && d.produit.includes(p.nom))
  const organismeRequis =
    produit?.reponses.categorie === 'important-ii' || produit?.reponses.categorie === 'critique'

  const texte = rendreDeclaration(d, organismeRequis)

  return (
    <article className="card p-6">
      <EnteteFiche
        index={index}
        titre={d.produit}
        vide="Déclaration sans produit"
        suivi={d.suivi}
        completude={completudeDeclaration(d, organismeRequis)}
        onDupliquer={onDupliquer}
        onSupprimer={onSupprimer}
      >
        <Pastille teinte={organismeRequis ? 'gold' : 'ink'}>
          {organismeRequis ? 'organisme notifié requis' : 'contrôle interne — module A'}
        </Pastille>
      </EnteteFiche>

      <div className="grid gap-5 md:grid-cols-2">
        <Texte
          label="Nom et type du produit"
          article="annexe V §1"
          valeur={d.produit}
          onChange={(v) => onChange({ produit: v })}
          aide="Reprenez exactement le nom porté au catalogue : c'est ce qui permet de retrouver sa catégorie."
        />
        <Texte
          label="Lot ou numéro de série"
          article="annexe V §1"
          valeur={d.typeLot}
          onChange={(v) => onChange({ typeLot: v })}
        />
        <Texte
          label="Fabricant"
          article="annexe V §2"
          valeur={d.fabricant}
          onChange={(v) => onChange({ fabricant: v })}
        />
        <Texte
          label="Adresse"
          article="annexe V §2"
          valeur={d.adresse}
          onChange={(v) => onChange({ adresse: v })}
        />
        <Texte
          label="Mandataire dans l'Union"
          valeur={d.mandataire}
          onChange={(v) => onChange({ mandataire: v })}
          aide="Obligatoire pour un fabricant établi hors Union (art. 18)."
        />
        <Texte
          label="Objet de la déclaration"
          article="annexe V §4"
          valeur={d.objet}
          onChange={(v) => onChange({ objet: v })}
          aide="Identification permettant la traçabilité : référence commerciale, version logicielle, empreinte."
        />
        <div className="md:col-span-2">
          <Texte
            label="Normes harmonisées ou spécifications appliquées"
            article="annexe V §6"
            valeur={d.normes}
            onChange={(v) => onChange({ normes: v })}
            lignes={2}
            aide="Références complètes avec date. À défaut de norme harmonisée disponible, citez les spécifications communes ou décrivez les solutions retenues."
          />
        </div>
        <div className="md:col-span-2">
          <Texte
            label="Autres actes d'harmonisation couverts"
            valeur={d.autresActes}
            onChange={(v) => onChange({ autresActes: v })}
            placeholder="Directive 2014/53/UE (équipements radio), règlement (UE) 2023/1230 (machines)"
            aide="Une déclaration unique peut couvrir plusieurs actes ; elle doit alors tous les citer."
          />
        </div>

        {organismeRequis && (
          <div className="grid gap-5 rounded-xl bg-gold-50 p-4 md:col-span-2 md:grid-cols-2">
            <Texte
              label="Organisme notifié"
              article="annexe V §7"
              valeur={d.organismeNotifie}
              onChange={(v) => onChange({ organismeNotifie: v })}
            />
            <Texte
              label="Numéro de l'organisme"
              article="annexe V §7"
              valeur={d.numeroOrganisme}
              onChange={(v) => onChange({ numeroOrganisme: v })}
              placeholder="0123"
            />
            <Texte
              label="Procédure suivie"
              article="annexe V §7"
              valeur={d.procedure}
              onChange={(v) => onChange({ procedure: v })}
              placeholder="Examen UE de type (module B) et conformité au type (module C)"
            />
            <Texte
              label="Référence du certificat"
              article="annexe V §7"
              valeur={d.certificat}
              onChange={(v) => onChange({ certificat: v })}
            />
          </div>
        )}

        <Texte
          label="Lieu de signature"
          article="annexe V §8"
          valeur={d.lieu}
          onChange={(v) => onChange({ lieu: v })}
        />
        <div>
          <label className="field-label" htmlFor={`sig-${d.id}`}>
            Date de signature
          </label>
          <input
            id={`sig-${d.id}`}
            type="date"
            className="champ-texte tabular"
            value={d.date}
            onChange={(e) => onChange({ date: e.target.value })}
          />
        </div>
        <Texte
          label="Nom du signataire"
          article="annexe V §8"
          valeur={d.signataire}
          onChange={(v) => onChange({ signataire: v })}
        />
        <Texte
          label="Fonction"
          article="annexe V §8"
          valeur={d.fonction}
          onChange={(v) => onChange({ fonction: v })}
        />

        <div className="md:col-span-2">
          <ChampsSuivi suivi={d.suivi} onChange={(v) => onChange({ suivi: v })} />
        </div>
      </div>

      <div className="mt-6 border-t border-ink-100 pt-5">
        <Detail resume="Le texte de la déclaration">
          <pre className="overflow-x-auto rounded-xl bg-ink-50 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-800">
            {texte}
          </pre>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(texte)}
            className="sans-impression mt-3 rounded-xl bg-white px-4 py-2 text-sm font-medium text-ink-700 ring-1 ring-ink-200 transition hover:text-ink-900"
          >
            Copier le texte
          </button>
        </Detail>
      </div>

      <Manquants items={champsManquantsDeclaration(d, organismeRequis)} />
    </article>
  )
}

// ---------------------------------------------------------------------------
// Accessibilité
// ---------------------------------------------------------------------------

function BlocAccessibilite({ c }: { c: Collection<Audit> }) {
  const conformes = c.items.filter((a) => verdictAudit(a).niveau === 'conforme').length

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="services audités" teinte="brand" />
        <Stat
          valeur={String(conformes)}
          libelle="conformes aux quatre principes"
          teinte={conformes === c.items.length && c.items.length > 0 ? 'jade' : 'gold'}
        />
        <Stat
          valeur={String(c.items.filter((a) => !a.planCorrection.trim() && verdictAudit(a).niveau !== 'conforme').length)}
          libelle="écarts sans plan de correction"
          teinte="ember"
        />
      </div>

      <div className="mb-6 max-w-3xl">
        <Encadre teinte="gold" titre="Applicable depuis le 28 juin 2025">
          C'est le seul texte de ce site dont le respect se vérifie de l'extérieur, par
          n'importe qui, en quelques minutes — d'où le risque contentieux le plus
          immédiat. La norme EN 301 549 donne la présomption de conformité et renvoie,
          pour le web, aux WCAG 2.1 niveau AA. Les contrats de service conclus avant le
          28 juin 2025 bénéficient d'une transition jusqu'au 28 juin 2030.
        </Encadre>
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Ouvrir un audit"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="audits-accessibilite"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Le niveau global est celui du maillon le plus faible">
          <p>
            Un service parfaitement perceptible mais inutilisable au clavier est
            inaccessible : la personne concernée ne peut pas s'en servir, et le fait que
            trois principes sur quatre soient tenus ne lui rend aucun service. Cet outil
            ne calcule donc pas de moyenne — il retient le pire des quatre.
          </p>
          <p>
            Une non-conformité reste défendable si elle est constatée, publiée dans la
            déclaration d'accessibilité, et assortie d'un plan de correction daté. C'est
            le silence qui ne l'est pas.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((a, i) => {
            const verdict = verdictAudit(a)
            return (
              <article key={a.id} className="card p-6">
                <EnteteFiche
                  index={i + 1}
                  titre={a.service}
                  vide="Service non nommé"
                  suivi={a.suivi}
                  onDupliquer={() => c.dupliquer(a.id)}
                  onSupprimer={() => c.supprimer(a.id)}
                >
                  <Pastille
                    teinte={
                      verdict.niveau === 'conforme'
                        ? 'jade'
                        : verdict.niveau === 'non-evalue'
                          ? 'ink'
                          : verdict.niveau === 'partiel'
                            ? 'gold'
                            : 'ember'
                    }
                  >
                    {NIVEAUX_CONFORMITE.find((n) => n.id === verdict.niveau)?.label}
                  </Pastille>
                </EnteteFiche>

                <div className="grid gap-5 md:grid-cols-2">
                  <Texte
                    label="Service audité"
                    valeur={a.service}
                    onChange={(v) => c.modifier(a.id, { service: v })}
                    placeholder="Site de vente en ligne"
                  />
                  <Texte
                    label="Auditeur"
                    valeur={a.auditeur}
                    onChange={(v) => c.modifier(a.id, { auditeur: v })}
                    placeholder="Interne, ou cabinet"
                    aide="La directive n'impose pas de tiers : un audit interne outillé et documenté suffit."
                  />
                  <div className="md:col-span-2">
                    <Texte
                      label="Périmètre testé"
                      valeur={a.perimetre}
                      onChange={(v) => c.modifier(a.id, { perimetre: v })}
                      lignes={2}
                      placeholder="Parcours d'achat complet, création de compte, consultation des commandes"
                      aide="Un audit dont le périmètre n'est pas écrit ne prouve rien : nommez les parcours réellement parcourus."
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`da-${a.id}`}>
                      Date de l'audit
                    </label>
                    <input
                      id={`da-${a.id}`}
                      type="date"
                      className="champ-texte tabular"
                      value={a.dateAudit}
                      onChange={(e) => c.modifier(a.id, { dateAudit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 border-t border-ink-100 pt-5 sm:grid-cols-2">
                  {PRINCIPES.map((pr) => (
                    <Liste<NiveauConformite>
                      key={pr.id}
                      label={pr.titre}
                      article="EN 301 549"
                      valeur={a.principes[pr.id] ?? 'non-evalue'}
                      options={NIVEAUX_CONFORMITE.filter((n) => n.id !== 'non-evalue').map((n) => ({
                        id: n.id,
                        label: n.label,
                      }))}
                      onChange={(v) =>
                        c.modifier(a.id, {
                          principes: { ...a.principes, [pr.id]: (v || 'non-evalue') as NiveauConformite },
                        })
                      }
                      aide={pr.note}
                    />
                  ))}
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Texte
                    label="Écarts constatés"
                    valeur={a.ecarts}
                    onChange={(v) => c.modifier(a.id, { ecarts: v })}
                    lignes={3}
                    placeholder="Un écart par ligne, avec le critère WCAG correspondant"
                  />
                  <Texte
                    label="Plan de correction"
                    valeur={a.planCorrection}
                    onChange={(v) => c.modifier(a.id, { planCorrection: v })}
                    lignes={3}
                    aide="Daté. C'est lui qui rend une non-conformité défendable en attendant sa résolution."
                  />
                  <div className="md:col-span-2">
                    <Texte
                      label="Charge disproportionnée invoquée"
                      article="art. 14"
                      valeur={a.chargeDisproportionnee}
                      onChange={(v) => c.modifier(a.id, { chargeDisproportionnee: v })}
                      lignes={2}
                      aide="L'évaluation doit être documentée, conservée cinq ans et communiquée à l'autorité sur demande. Elle ne peut jamais être invoquée en bloc pour un service entier."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ChampsSuivi suivi={a.suivi} onChange={(v) => c.modifier(a.id, { suivi: v })} />
                  </div>
                </div>

                <div className="mt-5">
                  <Encadre
                    teinte={
                      verdict.niveau === 'conforme'
                        ? 'jade'
                        : verdict.niveau === 'non-evalue'
                          ? 'ink'
                          : verdict.niveau === 'partiel'
                            ? 'gold'
                            : 'ember'
                    }
                  >
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
