import { useMemo, useState } from 'react'
import { Page } from './components/Cadre'
import { Case, Liste, Segments, Texte } from './components/Champs'
import { Detail, Encadre, Pastille, Stat } from './components/Blocs'
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
  ATTEINTES,
  BASES_LEGALES,
  CRITERES_RISQUE,
  DECISIONS,
  aipd,
  champsManquants,
  champsManquantsSousTraitance,
  champsManquantsViolation,
  completude,
  completudeSousTraitance,
  completudeViolation,
  retardNotification,
  sousTraitanceVide,
  traitementVide,
  violationVide,
} from './lib/registre'
import type { BaseLegale, Sous_traitance, Traitement, Violation } from './lib/registre'
import { MENTIONS_28, contratVide, verdictContrat } from './lib/contrats'
import type { Contrat } from './lib/contrats'
import { pct } from './lib/format'

type Onglet = 'responsable' | 'sous-traitant' | 'violations' | 'contrats'

/**
 * Les registres du RGPD, tous les quatre.
 *
 * La première version n'offrait que celui du responsable de traitement — le
 * plus connu, mais pas le plus souvent dû : la plupart des éditeurs de
 * logiciel sont sous-traitants de leurs clients et doivent le registre du §2,
 * qui a des mentions différentes.
 */
export default function PageRgpd() {
  const [onglet, setOnglet] = useState<Onglet>('responsable')

  const traitements = useCollection<Traitement>('laws.registre', traitementVide)
  const sousTraitances = useCollection<Sous_traitance>('laws.sousTraitance', sousTraitanceVide)
  const violations = useCollection<Violation>('laws.violations', violationVide)
  const contrats = useCollection<Contrat>('laws.contrats', contratVide)

  return (
    <Page
      chemin="/rgpd/"
      titre="Les registres du RGPD"
      chapeau="Quatre pièces écrites, pas une. Pour un architecte, le registre de l'article 30 n'est pas de la paperasse : c'est la cartographie des flux de données du système, et le seul document qui force à répondre à trois questions que la conception laisse souvent ouvertes — où part cette donnée, combien de temps la garde-t-on, et par quel mécanisme l'efface-t-on. Le remplir révèle des dépendances que le schéma d'architecture ne montre pas."
    >
      <Onglets<Onglet>
        valeur={onglet}
        onChange={setOnglet}
        options={[
          { id: 'responsable', label: 'Responsable — art. 30 §1', compte: traitements.items.length },
          { id: 'sous-traitant', label: 'Sous-traitant — art. 30 §2', compte: sousTraitances.items.length },
          { id: 'violations', label: 'Violations — art. 33 §5', compte: violations.items.length },
          { id: 'contrats', label: 'Contrats — art. 28', compte: contrats.items.length },
        ]}
      />

      <ModeEmploi
        quand="Le registre se remplit pendant la conception, pas après la mise en production. Une durée de conservation décidée après coup suppose de rétro-concevoir une purge dans les sauvegardes, les journaux et l'entrepôt analytique."
        avecQui="Le DPO tient le registre, mais c'est vous qui savez où les données vont réellement. En pratique : vous remplissez les colonnes techniques, il valide les colonnes juridiques — base légale, condition de l'article 9, garanties de transfert."
        livrable="Un registre exportable en JSON, une ligne par traitement, avec un responsable nommé et une date de revue. C'est la première pièce demandée en cas de contrôle."
      >
        <p>
          L'ordre qui fonctionne : partez de vos flux, pas des finalités. Listez les
          magasins de données et les intégrations sortantes du système, puis rattachez
          chacun à une finalité — les flux qui n'en trouvent pas sont vos vraies
          non-conformités, et ce sont presque toujours les mêmes : télémétrie, journaux
          applicatifs contenant des identifiants, jeu de données de recette copié depuis
          la production.
        </p>
        <p>
          Deux colonnes vous concernent directement. <strong>Les délais d'effacement</strong>{' '}
          ne sont tenables que si une purge existe : si vous ne pouvez pas la nommer, la
          durée n'est pas une durée. <strong>Les transferts hors EEE</strong> incluent le
          simple accès à distance — un prestataire d'astreinte qui se connecte depuis
          l'Inde transfère, même sans copie de données.
        </p>
      </ModeEmploi>

      {onglet === 'responsable' && <BlocResponsable c={traitements} />}
      {onglet === 'sous-traitant' && <BlocSousTraitant c={sousTraitances} />}
      {onglet === 'violations' && <BlocViolations c={violations} />}
      {onglet === 'contrats' && <BlocContrats c={contrats} />}
    </Page>
  )
}

// ---------------------------------------------------------------------------
// Article 30 §1
// ---------------------------------------------------------------------------

function BlocResponsable({ c }: { c: Collection<Traitement> }) {
  const global = useMemo(
    () =>
      c.items.length === 0
        ? 0
        : c.items.reduce((s, t) => s + completude(t), 0) / c.items.length,
    [c.items],
  )
  const aipdRequises = c.items.filter((t) => aipd(t).requise).length
  const transferts = c.items.filter((t) => t.transfert.horsEee).length
  const orphelins = c.items.filter((t) => !t.suivi.responsable.trim()).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat valeur={String(c.items.length)} libelle="traitements inscrits" teinte="brand" />
        <Stat
          valeur={c.items.length ? pct(global) : '—'}
          libelle="mentions renseignées"
          teinte={global > 0.85 ? 'jade' : global > 0.5 ? 'gold' : 'ember'}
        />
        <Stat
          valeur={String(aipdRequises)}
          libelle="analyses d'impact à mener"
          teinte={aipdRequises > 0 ? 'gold' : 'ink'}
        />
        <Stat
          valeur={String(orphelins)}
          libelle="fiches sans responsable"
          teinte={orphelins > 0 ? 'ember' : 'jade'}
        />
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Ajouter un traitement"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="registre-traitements"
        vide={c.items.length === 0}
      />

      {transferts > 0 && (
        <div className="mb-6 max-w-3xl">
          <Encadre teinte="gold" titre={`${transferts} traitement(s) avec transfert hors EEE`}>
            Les clauses contractuelles types ne suffisent plus seules depuis Schrems II :
            chacun de ces transferts appelle une analyse d'impact, qui se tient dans{' '}
            <a href="/analyses/" className="font-medium underline">
              l'onglet Transferts des analyses
            </a>
            .
          </Encadre>
        </div>
      )}

      {c.items.length === 0 ? (
        <Amorce titre="Commencez par les trois que tout le monde a">
          <p>
            La paie et la gestion du personnel, le fichier client et la prospection, la
            gestion des accès informatiques. Ces trois-là existent dans toute
            organisation, sont régulièrement traités — donc hors de l'exemption étroite
            de l'article 30 §5 — et suffisent à faire apparaître les questions que le
            reste du registre posera.
          </p>
          <p>
            L'exemption des moins de 250 salariés ne joue que si le traitement n'est pas
            régulier, ne risque pas de porter atteinte aux droits des personnes, et ne
            porte ni sur des données sensibles ni sur des condamnations. La paie étant
            mensuelle, la condition de régularité tombe : en pratique, l'exemption ne
            dispense presque jamais de registre.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((t, i) => (
            <FicheTraitement
              key={t.id}
              t={t}
              index={i + 1}
              onChange={(p) => c.modifier(t.id, p)}
              onDupliquer={() => c.dupliquer(t.id)}
              onSupprimer={() => c.supprimer(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FicheTraitement({
  t,
  index,
  onChange,
  onDupliquer,
  onSupprimer,
}: {
  t: Traitement
  index: number
  onChange: (p: Partial<Traitement>) => void
  onDupliquer: () => void
  onSupprimer: () => void
}) {
  const analyse = aipd(t)
  const bascule = (id: string) =>
    onChange({
      criteresRisque: t.criteresRisque.includes(id)
        ? t.criteresRisque.filter((x) => x !== id)
        : [...t.criteresRisque, id],
    })

  return (
    <article className="card p-6">
      <EnteteFiche
        index={index}
        titre={t.nom}
        vide="Traitement sans nom"
        suivi={t.suivi}
        revueMois={6}
        completude={completude(t)}
        onDupliquer={onDupliquer}
        onSupprimer={onSupprimer}
      >
        {analyse.requise && (
          <Pastille teinte={analyse.certitude === 'certaine' ? 'ember' : 'gold'}>
            analyse d'impact {analyse.certitude === 'certaine' ? 'obligatoire' : 'probable'}
          </Pastille>
        )}
        {t.transfert.horsEee && <Pastille teinte="gold">transfert hors EEE</Pastille>}
        {t.donneesSensibles && <Pastille teinte="gold">données sensibles</Pastille>}
      </EnteteFiche>

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
              aide="Résumé ici, test complet dans les analyses. Le raisonnement écrit est la condition même de la base légale."
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
          aide="Chacun doit être couvert par un contrat vérifié dans l'onglet « Contrats »."
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

        <div className="space-y-4 rounded-xl bg-ink-50 p-4 md:col-span-2">
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
                onChange={(v) => onChange({ transfert: { ...t.transfert, garantie: v } })}
                placeholder="Clauses contractuelles types + analyse du transfert"
              />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <ChampsSuivi suivi={t.suivi} onChange={(s) => onChange({ suivi: s })} />
        </div>
      </div>

      <div className="mt-6 border-t border-ink-100 pt-5">
        <Detail resume="Criblage d'analyse d'impact — article 35">
          <p className="mb-4 text-sm leading-relaxed text-ink-600">
            Cochez les critères réunis. Le seuil retenu par le Comité européen de la
            protection des données est de deux sur neuf ; trois situations du §3 rendent
            l'analyse obligatoire à elles seules.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CRITERES_RISQUE.map((cr) => (
              <Case
                key={cr.id}
                coche={t.criteresRisque.includes(cr.id)}
                onChange={() => bascule(cr.id)}
                label={cr.label}
                aide={cr.note}
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
                analyse.certitude === 'certaine' ? 'ember' : analyse.requise ? 'gold' : 'jade'
              }
              titre={
                analyse.requise
                  ? analyse.certitude === 'certaine'
                    ? "Analyse d'impact obligatoire"
                    : "Analyse d'impact probablement requise"
                  : "Analyse d'impact non requise"
              }
            >
              <p>{analyse.motif}</p>
              {analyse.requise && (
                <p className="mt-2">
                  <a href="/analyses/" className="font-medium underline">
                    Ouvrir une analyse d'impact
                  </a>{' '}
                  — description, nécessité, appréciation des trois événements redoutés,
                  et la question qui décide de tout : faut-il consulter l'autorité avant
                  de commencer ?
                </p>
              )}
            </Encadre>
          </div>
        </Detail>
      </div>

      <Manquants items={champsManquants(t)} />
    </article>
  )
}

// ---------------------------------------------------------------------------
// Article 30 §2
// ---------------------------------------------------------------------------

function BlocSousTraitant({ c }: { c: Collection<Sous_traitance> }) {
  const orphelins = c.items.filter((s) => !s.suivi.responsable.trim()).length
  const sansContrat = c.items.filter((s) => !s.contrat.trim()).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="clients inscrits" teinte="brand" />
        <Stat
          valeur={String(sansContrat)}
          libelle="sans référence de contrat"
          teinte={sansContrat > 0 ? 'ember' : 'jade'}
        />
        <Stat
          valeur={String(orphelins)}
          libelle="fiches sans responsable"
          teinte={orphelins > 0 ? 'ember' : 'jade'}
        />
      </div>

      <div className="mb-6 max-w-3xl">
        <Encadre teinte="brand" titre="Pourquoi ce registre n'est pas le précédent">
          Le registre du sous-traitant s'organise <strong>par client</strong>, et non par
          finalité. Un sous-traitant ne détermine ni les finalités ni les durées de
          conservation : il ne peut donc pas les inscrire. Il inscrit les catégories de
          traitements qu'il effectue <em>pour le compte de</em> chaque responsable.
          Recopier le modèle du §1 en changeant le titre produit un registre faux, qui
          prétend décider de ce qu'on ne décide pas.
        </Encadre>
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Ajouter un client"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="registre-sous-traitance"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Êtes-vous sous-traitant ?">
          <p>
            Si vous éditez un logiciel hébergé, si vous exploitez l'infrastructure d'un
            client, si vous traitez ses données pour son compte sans en décider les
            finalités — oui, et ce registre vous est dû. La plupart des sociétés de
            services le doivent et ne le tiennent pas, parce que le registre de
            l'article 30 est presque toujours présenté sous son seul §1.
          </p>
          <p>
            Une même organisation peut d'ailleurs devoir les deux : responsable pour sa
            paie, sous-traitante pour ses clients.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((s, i) => (
            <article key={s.id} className="card p-6">
              <EnteteFiche
                index={i + 1}
                titre={s.client}
                vide="Client sans nom"
                suivi={s.suivi}
                completude={completudeSousTraitance(s)}
                onDupliquer={() => c.dupliquer(s.id)}
                onSupprimer={() => c.supprimer(s.id)}
              >
                {s.transfert.horsEee && <Pastille teinte="gold">transfert hors EEE</Pastille>}
                {s.sousTraitantsUlterieurs.trim() && (
                  <Pastille teinte="brand">sous-traitance ultérieure</Pastille>
                )}
              </EnteteFiche>

              <div className="grid gap-5 md:grid-cols-2">
                <Texte
                  label="Responsable de traitement (client)"
                  article="art. 30 §2 a"
                  valeur={s.client}
                  onChange={(v) => c.modifier(s.id, { client: v })}
                  placeholder="Raison sociale"
                />
                <Texte
                  label="Coordonnées du client"
                  article="art. 30 §2 a"
                  valeur={s.contactClient}
                  onChange={(v) => c.modifier(s.id, { contactClient: v })}
                  placeholder="Contact et adresse, DPO le cas échéant"
                />
                <div className="md:col-span-2">
                  <Texte
                    label="Catégories de traitements effectués pour ce client"
                    article="art. 30 §2 b"
                    valeur={s.categoriesTraitements}
                    onChange={(v) => c.modifier(s.id, { categoriesTraitements: v })}
                    lignes={2}
                    placeholder="Hébergement et sauvegarde des données de facturation ; support technique avec accès aux dossiers clients"
                    aide="Décrivez ce que vous faites, pas pourquoi le client le fait : la finalité lui appartient."
                  />
                </div>
                <Texte
                  label="Mesures de sécurité"
                  article="art. 30 §2 d"
                  valeur={s.mesuresSecurite}
                  onChange={(v) => c.modifier(s.id, { mesuresSecurite: v })}
                  placeholder="Chiffrement, cloisonnement par client, habilitations"
                />
                <Texte
                  label="Référence du contrat"
                  article="art. 28 §3"
                  valeur={s.contrat}
                  onChange={(v) => c.modifier(s.id, { contrat: v })}
                  placeholder="Annexe RGPD au contrat-cadre du 12/03/2026"
                  aide="Vérifiez ses huit mentions dans l'onglet « Contrats »."
                />
                <div className="md:col-span-2">
                  <Texte
                    label="Sous-traitants ultérieurs"
                    article="art. 28 §2 et §4"
                    valeur={s.sousTraitantsUlterieurs}
                    onChange={(v) => c.modifier(s.id, { sousTraitantsUlterieurs: v })}
                    placeholder="Hébergeur, service de courriel transactionnel, prestataire d'astreinte"
                  />
                </div>
                {s.sousTraitantsUlterieurs.trim() && (
                  <div className="md:col-span-2">
                    <Texte
                      label="Autorisation du client"
                      article="art. 28 §2"
                      valeur={s.autorisationUlterieurs}
                      onChange={(v) => c.modifier(s.id, { autorisationUlterieurs: v })}
                      aide="Autorisation écrite, spécifique ou générale. Dans le second cas, vous devez informer le client de tout changement et lui laisser la possibilité de s'y opposer."
                    />
                  </div>
                )}

                <div className="space-y-4 rounded-xl bg-ink-50 p-4 md:col-span-2">
                  <Case
                    coche={s.transfert.horsEee}
                    onChange={(v) =>
                      c.modifier(s.id, { transfert: { ...s.transfert, horsEee: v } })
                    }
                    label="Des données de ce client sont transférées hors EEE"
                  />
                  {s.transfert.horsEee && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Texte
                        label="Pays de destination"
                        article="art. 30 §2 c"
                        valeur={s.transfert.pays}
                        onChange={(v) =>
                          c.modifier(s.id, { transfert: { ...s.transfert, pays: v } })
                        }
                      />
                      <Texte
                        label="Garantie encadrant le transfert"
                        article="art. 46"
                        valeur={s.transfert.garantie}
                        onChange={(v) =>
                          c.modifier(s.id, { transfert: { ...s.transfert, garantie: v } })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <ChampsSuivi
                    suivi={s.suivi}
                    onChange={(v) => c.modifier(s.id, { suivi: v })}
                  />
                </div>
              </div>

              <Manquants items={champsManquantsSousTraitance(s)} />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Article 33 §5
// ---------------------------------------------------------------------------

function BlocViolations({ c }: { c: Collection<Violation> }) {
  const notifiees = c.items.filter((v) => v.notifieeAutorite === 'oui').length
  const nonNotifiees = c.items.filter((v) => v.notifieeAutorite === 'non').length
  const aDecider = c.items.filter((v) => v.notifieeAutorite === 'a-decider').length
  const horsDelai = c.items.filter((v) => (retardNotification(v) ?? -1) > 0).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat valeur={String(c.items.length)} libelle="violations consignées" teinte="brand" />
        <Stat valeur={String(notifiees)} libelle="notifiées à l'autorité" teinte="ink" />
        <Stat
          valeur={String(nonNotifiees)}
          libelle="non notifiées, motivées"
          teinte={nonNotifiees > 0 ? 'gold' : 'ink'}
        />
        <Stat
          valeur={String(horsDelai + aDecider)}
          libelle="hors délai ou en attente"
          teinte={horsDelai + aDecider > 0 ? 'ember' : 'jade'}
        />
      </div>

      <div className="mb-6 max-w-3xl">
        <Encadre teinte="brand" titre="Toutes les violations, pas seulement les notifiées">
          L'article 33 §5 impose de documenter <strong>toute</strong> violation, y
          compris celles qu'on a choisi de ne pas notifier — avec le motif de ce choix.
          C'est précisément ce registre que l'autorité demande : il lui permet de
          vérifier que l'absence de notification était réfléchie et non subie. Un
          registre ne contenant que les violations notifiées prouve l'inverse de ce
          qu'il prétend.
        </Encadre>
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Consigner une violation"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="registre-violations"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Un registre vide n'est pas une bonne nouvelle">
          <p>
            Une organisation qui n'a consigné aucune violation en trois ans n'est
            généralement pas épargnée : elle ne détecte pas. Le courriel envoyé au
            mauvais destinataire, l'ordinateur portable perdu, la sauvegarde devenue
            illisible, le compte prestataire resté actif après la fin de mission sont
            des violations au sens de l'article 4 §12.
          </p>
          <p>
            La perte d'accès à des données — un rançongiciel, une sauvegarde corrompue —
            en est une aussi : le règlement vise l'atteinte à la disponibilité au même
            titre qu'à la confidentialité.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((v, i) => (
            <FicheViolation
              key={v.id}
              v={v}
              index={i + 1}
              onChange={(p) => c.modifier(v.id, p)}
              onSupprimer={() => c.supprimer(v.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FicheViolation({
  v,
  index,
  onChange,
  onSupprimer,
}: {
  v: Violation
  index: number
  onChange: (p: Partial<Violation>) => void
  onSupprimer: () => void
}) {
  const retard = retardNotification(v)
  const bascule = (id: string) =>
    onChange({
      atteintes: v.atteintes.includes(id)
        ? v.atteintes.filter((x) => x !== id)
        : [...v.atteintes, id],
    })

  return (
    <article className="card p-6">
      <EnteteFiche
        index={index}
        titre={v.reference}
        vide="Violation sans référence"
        suivi={v.suivi}
        completude={completudeViolation(v)}
        onSupprimer={onSupprimer}
      >
        {v.notifieeAutorite === 'a-decider' && (
          <Pastille teinte="ember">décision de notification en attente</Pastille>
        )}
        {retard !== undefined && (
          <Pastille teinte={retard > 0 ? 'ember' : 'jade'}>
            {retard > 0
              ? `notifiée hors délai (+${Math.round(retard / 3_600_000)} h)`
              : 'notifiée dans les 72 heures'}
          </Pastille>
        )}
      </EnteteFiche>

      <div className="grid gap-5 md:grid-cols-2">
        <Texte
          label="Référence interne"
          valeur={v.reference}
          onChange={(x) => onChange({ reference: x })}
          placeholder="VIO-2026-003"
        />
        <div>
          <label className="field-label" htmlFor={`conn-${v.id}`}>
            Prise de connaissance
          </label>
          <input
            id={`conn-${v.id}`}
            type="datetime-local"
            className="champ-texte tabular"
            value={v.connaissance}
            onChange={(e) => onChange({ connaissance: e.target.value })}
          />
          <p className="field-hint">
            Le moment où vous avez su. Les 72 heures de l'article 33 courent depuis cet
            instant — pas depuis le début de l'incident, ni depuis sa résolution.
          </p>
        </div>

        <div className="md:col-span-2">
          <span className="field-label">Nature de l'atteinte</span>
          <div className="grid gap-3 sm:grid-cols-3">
            {ATTEINTES.map((a) => (
              <Case
                key={a.id}
                coche={v.atteintes.includes(a.id)}
                onChange={() => bascule(a.id)}
                label={a.label}
                aide={a.note}
              />
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <Texte
            label="Description de la violation"
            article="art. 33 §3 a"
            valeur={v.nature}
            onChange={(x) => onChange({ nature: x })}
            lignes={2}
            placeholder="Envoi d'un fichier de paie à une liste de diffusion externe…"
          />
        </div>

        <Texte
          label="Catégories de personnes concernées"
          article="art. 33 §3 a"
          valeur={v.categoriesPersonnes}
          onChange={(x) => onChange({ categoriesPersonnes: x })}
          placeholder="Salariés du site de Lyon"
        />
        <Texte
          label="Nombre approximatif de personnes"
          article="art. 33 §3 a"
          valeur={v.nombrePersonnes}
          onChange={(x) => onChange({ nombrePersonnes: x })}
          placeholder="environ 140"
          aide="Le texte dit « approximatif » : ne retardez pas la notification pour obtenir un chiffre exact."
        />
        <div className="md:col-span-2">
          <Texte
            label="Catégories de données"
            valeur={v.categoriesDonnees}
            onChange={(x) => onChange({ categoriesDonnees: x })}
            placeholder="Identité, salaire, RIB"
          />
        </div>
        <Texte
          label="Conséquences probables"
          article="art. 33 §3 c"
          valeur={v.consequences}
          onChange={(x) => onChange({ consequences: x })}
          lignes={2}
          placeholder="Risque d'hameçonnage ciblé, atteinte à la vie privée"
        />
        <Texte
          label="Mesures prises ou proposées"
          article="art. 33 §3 d"
          valeur={v.mesures}
          onChange={(x) => onChange({ mesures: x })}
          lignes={2}
          placeholder="Rappel du message, demande de suppression, information des personnes"
        />

        <div className="space-y-4 rounded-xl bg-ink-50 p-4 md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Segments
                label="Notification à l'autorité"
                valeur={v.notifieeAutorite}
                onChange={(x) => onChange({ notifieeAutorite: x })}
                options={DECISIONS.map((d) => ({ id: d.id, label: d.label }))}
              />
            </div>
            <div>
              <Segments
                label="Information des personnes (art. 34)"
                valeur={v.notifieePersonnes}
                onChange={(x) => onChange({ notifieePersonnes: x })}
                options={DECISIONS.map((d) => ({ id: d.id, label: d.label }))}
              />
            </div>
          </div>

          {v.notifieeAutorite === 'oui' && (
            <div>
              <label className="field-label" htmlFor={`envoi-${v.id}`}>
                Date et heure d'envoi à l'autorité
              </label>
              <input
                id={`envoi-${v.id}`}
                type="datetime-local"
                className="champ-texte tabular"
                value={v.dateNotification}
                onChange={(e) => onChange({ dateNotification: e.target.value })}
              />
            </div>
          )}

          {v.notifieeAutorite === 'non' && (
            <Texte
              label="Motif de non-notification"
              article="art. 33 §1"
              valeur={v.motifNonNotification}
              onChange={(x) => onChange({ motifNonNotification: x })}
              lignes={2}
              placeholder="Données chiffrées par un moyen rendant l'accès impossible ; aucun risque pour les droits et libertés des personnes"
              aide="C'est la ligne la plus importante du registre : elle transforme une absence de notification en décision documentée."
            />
          )}

          {v.notifieePersonnes === 'non' && (
            <Texte
              label="Motif de non-information des personnes"
              article="art. 34 §3"
              valeur={v.motifNonInformation}
              onChange={(x) => onChange({ motifNonInformation: x })}
              lignes={2}
              aide="L'une des trois exceptions du §3 : données rendues incompréhensibles, mesures ultérieures écartant le risque élevé, ou effort disproportionné justifiant une communication publique."
            />
          )}
        </div>

        <div className="md:col-span-2">
          <ChampsSuivi
            suivi={v.suivi}
            onChange={(s) => onChange({ suivi: s })}
            roleValidateur="Avis du DPO"
          />
        </div>
      </div>

      {retard !== undefined && retard > 0 && (
        <div className="mt-5">
          <Encadre teinte="ember" titre="Notification hors délai">
            La notification est partie {Math.round(retard / 3_600_000)} heures après
            l'expiration des 72 heures. L'article 33 §1 l'admet, mais exige qu'elle soit{' '}
            <strong>accompagnée des motifs du retard</strong>. Consignez-les ici même :
            ils feront partie du dossier.
          </Encadre>
        </div>
      )}

      <Manquants items={champsManquantsViolation(v)} />
    </article>
  )
}

// ---------------------------------------------------------------------------
// Article 28
// ---------------------------------------------------------------------------

function BlocContrats({ c }: { c: Collection<Contrat> }) {
  const conformes = c.items.filter((x) => verdictContrat(x).conforme).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat valeur={String(c.items.length)} libelle="contrats vérifiés" teinte="brand" />
        <Stat
          valeur={`${conformes}/${c.items.length || 0}`}
          libelle="portant les huit mentions"
          teinte={c.items.length > 0 && conformes === c.items.length ? 'jade' : 'ember'}
        />
        <Stat
          valeur={String(c.items.length - conformes)}
          libelle="à renégocier"
          teinte={c.items.length - conformes > 0 ? 'ember' : 'jade'}
        />
      </div>

      <BarreOutils
        onAjouter={c.ajouter}
        libelleAjout="Vérifier un contrat"
        donnees={c.items}
        onImporter={c.remplacer}
        nomFichier="contrats-article-28"
        vide={c.items.length === 0}
      />

      {c.items.length === 0 ? (
        <Amorce titre="Les deux mentions qui manquent presque toujours">
          <p>
            Les conditions générales d'un fournisseur contiennent en général six mentions
            sur huit. Les deux absentes sont presque invariablement les mêmes :
            l'assistance à l'exercice des droits des personnes (e), et le choix entre
            suppression et restitution des données en fin de contrat (g) — souvent
            rédigé au choix du sous-traitant, ce qui ne satisfait pas l'article.
          </p>
          <p>
            Commencez par votre hébergeur et votre outil de messagerie : ce sont les deux
            contrats qui couvrent le plus de données.
          </p>
        </Amorce>
      ) : (
        <div className="space-y-6">
          {c.items.map((x, i) => {
            const verdict = verdictContrat(x)
            return (
              <article key={x.id} className="card p-6">
                <EnteteFiche
                  index={i + 1}
                  titre={x.partie}
                  vide="Partie non nommée"
                  suivi={x.suivi}
                  onSupprimer={() => c.supprimer(x.id)}
                >
                  <Pastille teinte={verdict.conforme ? 'jade' : 'ember'}>
                    {verdict.conforme
                      ? '8 mentions sur 8'
                      : `${8 - verdict.manquantes.length} mentions sur 8`}
                  </Pastille>
                </EnteteFiche>

                <div className="grid gap-5 md:grid-cols-2">
                  <Texte
                    label="Partie au contrat"
                    valeur={x.partie}
                    onChange={(v) => c.modifier(x.id, { partie: v })}
                    placeholder="Raison sociale du fournisseur ou du client"
                  />
                  <Segments
                    label="Notre position"
                    valeur={x.position}
                    onChange={(v) => c.modifier(x.id, { position: v })}
                    options={[
                      { id: 'nous-responsable', label: 'Nous sommes responsable' },
                      { id: 'nous-sous-traitant', label: 'Nous sommes sous-traitant' },
                    ]}
                    aide="Les huit mentions sont dues dans les deux cas — mais c'est le responsable qui doit les exiger, et qui répond de leur absence."
                  />
                  <Texte
                    label="Objet de la sous-traitance"
                    valeur={x.objet}
                    onChange={(v) => c.modifier(x.id, { objet: v })}
                    placeholder="Hébergement de l'application de gestion commerciale"
                  />
                  <Texte
                    label="Référence et date"
                    valeur={x.reference}
                    onChange={(v) => c.modifier(x.id, { reference: v })}
                    placeholder="DPA v3 annexé au contrat-cadre, 12/03/2026"
                  />
                </div>

                <div className="mt-6 border-t border-ink-100 pt-5">
                  <p className="mb-4 text-sm font-medium text-ink-700">
                    Les huit mentions de l'article 28 §3
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {MENTIONS_28.map((m) => (
                      <Case
                        key={m.id}
                        coche={x.mentionsPresentes.includes(m.id)}
                        onChange={() =>
                          c.modifier(x.id, {
                            mentionsPresentes: x.mentionsPresentes.includes(m.id)
                              ? x.mentionsPresentes.filter((y) => y !== m.id)
                              : [...x.mentionsPresentes, m.id],
                          })
                        }
                        label={`${m.lettre}) ${m.titre}`}
                        aide={m.note}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Texte
                    label="Localisation des clauses"
                    valeur={x.localisation}
                    onChange={(v) => c.modifier(x.id, { localisation: v })}
                    placeholder="Annexe 4, § 2 à 9"
                    aide="Utile quand les mentions sont éparpillées entre contrat-cadre, annexe et politique de sécurité."
                  />
                  <Texte
                    label="Réserves et actions"
                    valeur={x.reserves}
                    onChange={(v) => c.modifier(x.id, { reserves: v })}
                    placeholder="Avenant demandé le 04/08/2026 sur les points e) et g)"
                  />
                  <div className="md:col-span-2">
                    <ChampsSuivi
                      suivi={x.suivi}
                      onChange={(v) => c.modifier(x.id, { suivi: v })}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <Encadre teinte={verdict.conforme ? 'jade' : 'ember'}>
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
