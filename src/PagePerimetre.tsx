import { useMemo } from 'react'
import { Page } from './components/Cadre'
import { Case } from './components/Champs'
import { Encadre, Pastille, Stat } from './components/Blocs'
import { ModeEmploi } from './components/Pieces'
import { PROFIL_VIDE, QUESTIONS, perimetre } from './lib/perimetre'
import type { Profil } from './lib/perimetre'
import { DOMAINES, texte } from './lib/textes'
import { aVenir, aujourdhui, joursRestants, statut } from './lib/calendrier'
import { echeanceRelative, jour } from './lib/format'
import { useStockage } from './lib/stockage'
import type { Teinte } from './lib/couleurs'
import { TEXTE } from './lib/couleurs'

/**
 * La page d'entrée répond à la seule question qu'on se pose avant toutes les
 * autres : *lesquels de ces textes me concernent ?*
 *
 * Elle ne commence donc pas par un exposé du droit européen, mais par douze
 * cases à cocher. L'exposé vient après, réduit à ce qui a été retenu.
 */
export default function PagePerimetre() {
  const [profil, setProfil] = useStockage<Profil>('laws.profil', PROFIL_VIDE)
  const today = aujourdhui()

  const applicables = useMemo(() => perimetre(profil), [profil])
  const repondu = Object.entries(profil).some(([k, v]) => k !== 'microEntreprise' && v)

  // Les échéances des seuls textes retenus : c'est là que le questionnaire
  // paie. Une liste de vingt-trois dates est du bruit ; six dates qui sont les
  // vôtres constituent un plan de charge.
  const echeances = useMemo(() => {
    const ids = new Set(applicables.map((a) => a.texte))
    return aVenir(today).filter((e) => ids.has(e.texte))
  }, [applicables, today])

  const prochaine = echeances[0]

  return (
    <Page
      chemin="/"
      titre="Cadrer le périmètre réglementaire"
      chapeau="Treize textes de l'Union encadrent aujourd'hui les données et les logiciels, et l'erreur qui coûte le plus cher en conception n'est pas d'en mal appliquer un : c'est d'en ignorer un jusqu'au gel de l'architecture. Décrivez l'activité de votre client en douze cases, la page en déduit les textes applicables, le motif de chacun et les échéances qui en découlent. Rien n'est envoyé nulle part — tout reste dans votre navigateur."
    >
      <ModeEmploi
        quand="Première demi-heure d'une mission, avant l'atelier de cadrage technique. Plus tard, les textes découverts deviennent des reprises."
        avecQui="Le sponsor métier et, s'il existe, le DPO ou le RSSI. Trois des douze questions — secteur NIS 2, entité financière, micro-entreprise — ne se répondent pas depuis la DSI."
        livrable="Une note de périmètre : les textes retenus, la raison de chacun, et la première échéance. C'est la page à imprimer et à mettre en annexe du cadrage."
      >
        <p>
          Cochez large. Un faux positif coûte une lecture de fiche ; un faux négatif
          coûte une reprise d'architecture. Les entrées marquées{' '}
          <em>à vérifier</em> sont celles qui dépendent d'un seuil national ou d'une
          qualification que vous ne pouvez pas trancher seul : notez-les comme questions
          ouvertes plutôt que comme conclusions.
        </p>
        <p>
          Une fois le périmètre posé, l'ordre de travail est celui de la navigation :
          dater les échéances, lire ce que les textes imposent à la conception, puis
          ouvrir les outils du ou des domaines retenus.
        </p>
      </ModeEmploi>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section>
          <h2 className="titre mb-4 text-lg text-ink-900">Votre activité</h2>
          <div className="card space-y-4 p-5">
            {QUESTIONS.map((q) => (
              <Case
                key={q.id}
                coche={profil[q.id]}
                onChange={(v) => setProfil({ ...profil, [q.id]: v })}
                label={q.label}
                aide={q.aide}
              />
            ))}
          </div>

          <p className="field-hint mt-3">
            En cas de doute, cochez. Un faux positif coûte une lecture ; un faux
            négatif coûte le dossier.
          </p>
        </section>

        <section>
          <h2 className="titre mb-4 text-lg text-ink-900">Votre périmètre</h2>

          {!repondu ? (
            <Encadre teinte="ink">
              Cochez au moins une réponse. Si vous hésitez sur tout : traiter des
              données de vos propres salariés suffit à déclencher le RGPD, et utiliser
              un assistant conversationnel acheté sur étagère suffit à déclencher
              l'AI Act.
            </Encadre>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat
                  valeur={String(applicables.length)}
                  libelle="textes applicables"
                  teinte="brand"
                />
                <Stat
                  valeur={String(echeances.length)}
                  libelle="échéances à venir"
                  teinte="gold"
                />
                <Stat
                  valeur={
                    prochaine
                      ? String(Math.max(0, joursRestants(prochaine.date, today)))
                      : '—'
                  }
                  libelle="jours avant la prochaine"
                  teinte={
                    prochaine && statut(prochaine.date, today) === 'imminente'
                      ? 'ember'
                      : 'ink'
                  }
                />
              </div>

              {prochaine && (
                <Encadre
                  teinte={statut(prochaine.date, today) === 'imminente' ? 'ember' : 'gold'}
                  titre={`Prochaine échéance : ${jour(prochaine.date)}`}
                >
                  <p className="font-medium">{prochaine.titre}</p>
                  <p className="mt-1.5">{prochaine.detail}</p>
                </Encadre>
              )}

              <ul className="space-y-3">
                {applicables.map((a) => {
                  const t = texte(a.texte)
                  const teinte = DOMAINES[t.domaine].couleur as Teinte
                  const suivante = echeances.find((e) => e.texte === t.id)
                  return (
                    <li key={a.texte} className="card p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <h3 className={`titre text-base ${TEXTE[teinte]}`}>
                          {t.sigle}
                          <span className="ml-2 font-sans text-xs font-normal text-ink-400">
                            {t.reference}
                          </span>
                        </h3>
                        {a.degre === 'probable' && (
                          <Pastille teinte="gold">à vérifier</Pastille>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-700">
                        {a.raison}
                      </p>

                      {/* Une pastille « à vérifier » qui ne dit pas quoi vérifier
                          n'est pas une instruction, c'est un reproche. La
                          condition est donc toujours affichée en clair, et c'est
                          elle qui devient une question ouverte du cadrage. */}
                      {a.condition && (
                        <p className="mt-2.5 rounded-lg bg-gold-50 px-3 py-2 text-sm leading-relaxed text-gold-900">
                          <span className="font-semibold">À vérifier — </span>
                          {a.condition}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                        {suivante && (
                          <span>
                            Prochaine échéance {jour(suivante.date)} —{' '}
                            {echeanceRelative(joursRestants(suivante.date, today))}
                          </span>
                        )}
                        <a
                          href={`/textes/#${t.id}`}
                          className="font-medium text-brand-700 hover:underline"
                        >
                          La fiche du texte
                        </a>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <Encadre teinte="gold" titre="Ce que veut dire « à vérifier »">
                Le questionnaire tranche seul quand la réponse est dans vos réponses.
                Il ne le peut pas dans trois cas, et il le dit alors au lieu de
                conclure : une <strong>qualification produit</strong> qu'aucune case ne
                capture, un <strong>seuil fixé par une loi nationale</strong> de
                transposition et non par la directive, ou un{' '}
                <strong>fait extérieur</strong> comme la désignation d'un contrôleur
                d'accès. Ces lignes ne sont pas des incertitudes à lever plus tard :
                ce sont les questions ouvertes à poser au cadrage, chacune à un
                interlocuteur précis.
              </Encadre>

              <Encadre teinte="brand" titre="Ce que le périmètre ne dit pas">
                Il retient des textes, pas des obligations. Un même règlement pèse
                très différemment selon que vous êtes fournisseur ou déployeur, et
                selon la catégorie de votre produit — c'est ce que tranchent{' '}
                <a href="/ia/" className="font-medium underline">
                  l'inventaire des systèmes d'IA
                </a>{' '}
                et le{' '}
                <a href="/produit/" className="font-medium underline">
                  catalogue des produits
                </a>
                . Pour les directives retenues, lisez aussi la loi nationale de
                transposition : c'est elle qui fixe les seuils et l'autorité
                compétente.
              </Encadre>
            </div>
          )}
        </section>
      </div>

      <section className="mt-14">
        <h2 className="titre mb-1 text-lg text-ink-900">L'ordre de travail</h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Elles sont dans l'ordre où l'on s'en sert : situer, dater, lire le texte,
          puis documenter — domaine par domaine, parce que c'est ainsi qu'on travaille.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              href: '/calendrier/',
              titre: 'Le calendrier',
              texte:
                "Vingt-trois échéances de 2018 à 2030, sur un axe linéaire dans le temps. C'est ce qui fait voir la grappe de l'automne 2026 — et le creux que le report de l'omnibus a ouvert derrière elle.",
            },
            {
              href: '/textes/',
              titre: 'Les textes',
              texte:
                "Huit notions pour lire un règlement seul, puis une fiche par texte — dont la rubrique qui vous concerne : ce qu'il impose à la conception, traduit en contraintes d'architecture.",
            },
            {
              href: '/rgpd/',
              titre: 'Les registres',
              texte:
                "Les quatre pièces écrites du RGPD : le registre du responsable, celui du sous-traitant — dont les mentions diffèrent —, le registre des violations, et les huit mentions de l'article 28.",
            },
            {
              href: '/analyses/',
              titre: 'Les analyses',
              texte:
                "Impact, intérêt légitime, transferts, droits fondamentaux. Quatre analyses écrites imposées avant d'agir, chacune concluant par une décision plutôt que par une note.",
            },
            {
              href: '/ia/',
              titre: "L'inventaire IA",
              texte:
                "Le livrable réel de l'AI Act : l'inventaire, avec la qualification en colonne, la documentation de l'annexe IV et le journal de maîtrise de l'article 4.",
            },
            {
              href: '/produit/',
              titre: 'Le produit',
              texte:
                "Catalogue et catégorie CRA, évaluation des risques de l'article 13 §2, déclaration UE de conformité, audit d'accessibilité. La catégorie décide du chemin critique du planning.",
            },
            {
              href: '/responsabilites/',
              titre: 'Le transfert',
              texte:
                "Ce que vous laissez derrière vous : une obligation, un nom, une date de revue. Plus le calculateur qui superpose les quatre horloges de notification d'incident.",
            },
          ].map((c) => (
            <a
              key={c.href}
              href={c.href}
              className="card block p-5 transition hover:border-brand-300 hover:shadow-md"
            >
              <h3 className="titre text-base text-ink-900">{c.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{c.texte}</p>
            </a>
          ))}
        </div>
      </section>
    </Page>
  )
}
