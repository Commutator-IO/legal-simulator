import { useMemo } from 'react'
import { Page } from './components/Cadre'
import { Case } from './components/Champs'
import { Encadre, Pastille, Stat } from './components/Blocs'
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
      titre="Ce qui vous concerne"
      chapeau="Treize textes de l'Union encadrent aujourd'hui les données et les logiciels, et ils ne s'appliquent pas tous à tout le monde. Répondez à ce qui suit : la page en déduit votre périmètre, puis les échéances qui en découlent. Rien n'est envoyé nulle part — les réponses restent dans votre navigateur."
    >
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

              <Encadre teinte="brand" titre="Ce que le périmètre ne dit pas">
                Il retient des textes, pas des obligations. Un même règlement pèse
                très différemment selon que vous êtes fournisseur ou déployeur, et
                selon la catégorie de votre produit — c'est ce que tranche la{' '}
                <a href="/qualification/" className="font-medium underline">
                  page de qualification
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
        <h2 className="titre mb-1 text-lg text-ink-900">Par où commencer</h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Les quatre pages qui suivent sont dans l'ordre où l'on s'en sert : situer,
          dater, qualifier, documenter.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                "Une fiche par règlement : objet, qui est visé, plafond de sanction, articles qu'on ouvre en pratique, et le lien EUR-Lex.",
            },
            {
              href: '/qualification/',
              titre: 'La qualification',
              texte:
                "Deux arbres de décision : le niveau de risque d'un système d'IA, et la catégorie d'un produit sous le CRA. Ils rendent leur raisonnement, article par article.",
            },
            {
              href: '/registre/',
              titre: 'Les registres',
              texte:
                "Le registre de l'article 30, le criblage d'analyse d'impact, le registre de responsabilité et le calculateur de délais de notification.",
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
