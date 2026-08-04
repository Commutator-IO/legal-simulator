import { useEffect, useRef, useState } from 'react'
import { DEPOT, PAGES } from '../lib/site'

/**
 * En-tête et pied partagés par toutes les pages.
 *
 * Le site est hébergé statiquement : chaque outil est une vraie page plutôt
 * qu'une route côté client. GitHub Pages sert /rgpd/ depuis son propre
 * index.html, sans redirection, et un lien partagé vers un registre survit à
 * tout. Pour un site dont les pages servent de pièces de dossier, c'est la
 * seule architecture défendable.
 */

function estActif(chemin: string, courant: string): boolean {
  // Le chemin courant porte ou non une barre finale selon la façon dont le
  // visiteur est arrivé.
  const normalise = (c: string) => (c.endsWith('/') ? c : `${c}/`)
  return normalise(courant) === normalise(chemin)
}

export function Entete({ chemin }: { chemin: string }) {
  // Sous md, les onglets deviennent un menu plutôt qu'une rangée qui défile :
  // huit noms dans une barre de 375 pixels obligent à deviner ce qui est hors
  // écran, et personne ne devrait avoir à balayer une barre de navigation pour
  // savoir où il peut aller.
  const [ouvert, setOuvert] = useState(false)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ouvert) return
    const fermer = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e.type === 'pointerdown' && menu.current?.contains(e.target as Node)) return
      setOuvert(false)
    }
    document.addEventListener('pointerdown', fermer)
    document.addEventListener('keydown', fermer)
    return () => {
      document.removeEventListener('pointerdown', fermer)
      document.removeEventListener('keydown', fermer)
    }
  }, [ouvert])

  const actuel = PAGES.find((p) => estActif(p.chemin, chemin))

  return (
    <header className="sticky top-0 z-20 border-b border-ink-200/70 bg-white/85 backdrop-blur sans-impression">
      <div className="mx-auto flex max-w-6xl items-center gap-x-4 px-5 py-3">
        <a href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-sm font-bold text-white">
            §
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink-900">
            Conformité <span className="text-brand-700">UE</span>
          </span>
        </a>

        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PAGES.map((p) => {
            const actif = estActif(p.chemin, chemin)
            return (
              <a
                key={p.chemin}
                href={p.chemin}
                aria-current={actif ? 'page' : undefined}
                className={[
                  'shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition',
                  actif
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
                ].join(' ')}
              >
                {p.libelle}
              </a>
            )
          })}
        </nav>

        <a
          href="#sources"
          className="hidden shrink-0 text-sm whitespace-nowrap text-ink-500 transition hover:text-ink-900 md:block"
        >
          Méthode
        </a>

        <div ref={menu} className="relative ml-auto md:hidden">
          <button
            type="button"
            aria-expanded={ouvert}
            aria-haspopup="menu"
            onClick={() => setOuvert((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            {/* Le bouton nomme la page courante : il dit où l'on est autant
                qu'il propose d'en partir. */}
            <span className="max-w-[9rem] truncate">{actuel?.libelle ?? 'Menu'}</span>
            <span aria-hidden="true" className="text-ink-400">
              {ouvert ? '▴' : '▾'}
            </span>
          </button>

          {ouvert && (
            <div
              role="menu"
              className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-ink-200 bg-white p-1 shadow-lg"
            >
              {PAGES.map((p) => {
                const actif = estActif(p.chemin, chemin)
                return (
                  <a
                    key={p.chemin}
                    role="menuitem"
                    href={p.chemin}
                    aria-current={actif ? 'page' : undefined}
                    className={[
                      'block rounded-lg px-3 py-2 text-sm font-medium',
                      actif ? 'bg-brand-50 text-brand-700' : 'text-ink-600',
                    ].join(' ')}
                  >
                    {p.libelle}
                  </a>
                )
              })}
              <a
                role="menuitem"
                href="#sources"
                onClick={() => setOuvert(false)}
                className="mt-1 block border-t border-ink-100 px-3 py-2 pt-3 text-sm text-ink-500"
              >
                Méthode et sources
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/**
 * Le pied porte l'avertissement, et il le porte en toutes lettres plutôt qu'en
 * gris pâle de six pixels. Un outil qui aide à qualifier un système à haut
 * risque doit dire clairement qu'il n'est pas un conseil juridique : c'est
 * autant une question d'honnêteté que de responsabilité.
 */
export function Pied() {
  return (
    <footer id="sources" className="border-t border-ink-200/70 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-ink-500">
        <h2 className="titre mb-3 text-base text-ink-900">Méthode et sources</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 leading-relaxed">
            <p>
              Chaque obligation citée sur ce site porte le numéro d'article qui la
              fonde, et chaque texte renvoie à sa page EUR-Lex par un identifiant ELI
              — l'adresse stable, qui ne bouge pas quand un portail est refondu. Là où
              une date ou une qualification résulte d'un raisonnement plutôt que d'une
              lecture directe, le texte le dit.
            </p>
            <p>
              Les dates de l'AI Act intègrent le règlement (UE) 2026/1744, publié au
              journal officiel le 24 juillet 2026, qui a reporté au 2 décembre 2027 les
              obligations sur les systèmes à haut risque de l'annexe III. Le volet
              données de l'omnibus — RGPD, ePrivacy, NIS 2, DORA — reste en
              négociation : il n'est pas appliqué ici.
            </p>
            <p className="text-ink-400">État du droit arrêté au 4 août 2026.</p>
          </div>
          <div className="space-y-3 leading-relaxed">
            <p className="rounded-xl border border-gold-200 bg-gold-50 p-4 text-gold-900">
              <strong className="font-semibold">Ce site n'est pas un conseil
              juridique.</strong>{' '}
              Il oriente : il ne qualifie pas à votre place, et la frontière entre un
              usage listé à l'annexe III et un usage anodin se joue souvent sur une
              phrase de considérant. Faites valider par un conseil toute qualification
              qui engage une mise sur le marché.
            </p>
            <p>
              Les registres saisis ici ne quittent jamais votre navigateur : ils sont
              stockés localement et exportables en JSON. Vider le cache du navigateur
              les efface — exportez.
            </p>
          </div>
        </div>
        <p className="mt-8 flex flex-wrap gap-x-5 gap-y-1 border-t border-ink-100 pt-5 text-ink-400">
          <a
            href={DEPOT}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-ink-900"
          >
            Code source
          </a>
          <a
            href={`${DEPOT}/issues/new`}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-ink-900"
          >
            Signaler une erreur de droit
          </a>
          <a
            href="https://eur-lex.europa.eu/homepage.html?locale=fr"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-ink-900"
          >
            EUR-Lex
          </a>
        </p>
      </div>
    </footer>
  )
}

/** Le gabarit commun : en-tête, contenu centré, pied. */
export function Page({
  chemin,
  titre,
  chapeau,
  children,
}: {
  chemin: string
  titre: string
  /**
   * Deux ou trois phrases qui situent la page. Toute page doit se tenir seule :
   * quelqu'un qui arrive par un lien direct doit comprendre où il est.
   */
  chapeau: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Entete chemin={chemin} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <header className="mb-10 max-w-3xl">
          <h1 className="titre text-3xl text-ink-900 sm:text-4xl">{titre}</h1>
          <p className="mt-3 leading-relaxed text-ink-600">{chapeau}</p>
        </header>
        {children}
      </main>
      <Pied />
    </div>
  )
}
