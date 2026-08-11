import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { PAGES } from './src/lib/site.ts'

/** Le domaine servi. Sert de préfixe aux URL absolues du plan du site. */
const SITE = 'https://legal.commutator.io'

/**
 * Date de dernière modification, prise du dernier commit.
 *
 * Une seule date pour tout le site, et c'est exact ici plutôt que commode :
 * les dix pages partagent leur en-tête, leur pied et leurs composants, si bien
 * qu'un changement de l'un les modifie toutes — l'ajout du lien de retour en
 * pied a rebâti les dix. Une date par page suggérerait une granularité que le
 * déploiement n'a pas.
 *
 * En cas d'échec — dépôt absent, git indisponible — on rend `undefined` et le
 * plan sort sans `lastmod`. C'est délibéré : une date de build serait fausse à
 * chaque reconstruction sans changement, et Google ignore un `lastmod` qu'il
 * juge peu fiable. Pas de date vaut mieux qu'une date qui ment.
 */
function dateDernierCommit(): string | undefined {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI'], {
      encoding: 'utf8',
      cwd: import.meta.dirname,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return undefined
  }
}

/**
 * Émet `sitemap.xml` et `robots.txt` à la construction.
 *
 * Le plan est **dérivé de `PAGES`**, la même liste qui construit la
 * navigation : un fichier statique écrit à la main aurait manqué les trois
 * pages ajoutées depuis la mise en ligne. Le seul endroit où déclarer une page
 * reste `src/lib/site.ts`.
 */
function planDuSite(): Plugin {
  return {
    name: 'plan-du-site',
    apply: 'build',
    // `writeBundle` plutôt que `emitFile` : l'écriture est idempotente, alors
    // qu'émettre deux fois le même nom d'asset lèverait une erreur si la
    // construction venait à produire plusieurs sorties.
    writeBundle(options, bundle) {
      const dossier = options.dir
      if (!dossier) return

      // Le plan ne liste que des pages réellement construites. On confronte
      // `PAGES` — qui sert aussi à la navigation — aux fichiers émis, et on
      // fait échouer la construction en cas d'écart. C'est le contrôle qui
      // manquait le plus : trois pages ont été ajoutées après la mise en
      // ligne, et rien n'aurait signalé qu'on annonce une URL sans point
      // d'entrée, sinon un 404 découvert par un moteur de recherche.
      const emis = new Set(Object.keys(bundle))
      const absentes = PAGES.filter(
        (p) => !emis.has(p.chemin === '/' ? 'index.html' : `${p.chemin.slice(1)}index.html`),
      )
      if (absentes.length > 0) {
        throw new Error(
          `plan-du-site : ${absentes.map((p) => p.chemin).join(', ')} ${
            absentes.length > 1 ? 'figurent' : 'figure'
          } dans PAGES sans point d'entrée construit. ` +
            'Ajoutez le index.html et son entrée dans rollupOptions.input, ' +
            'ou retirez la page de src/lib/site.ts.',
        )
      }

      const lastmod = dateDernierCommit()
      const urls = PAGES.map((p) => {
        const loc = `${SITE}${p.chemin}`
        return [
          '  <url>',
          `    <loc>${loc}</loc>`,
          ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
          '  </url>',
        ].join('\n')
      }).join('\n')

      writeFileSync(
        resolve(dossier, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
      )

      // Le plan n'est découvrable que s'il est annoncé. Aucune règle
      // d'exclusion : tout le site est public et destiné à être indexé.
      writeFileSync(
        resolve(dossier, 'robots.txt'),
        `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), planDuSite()],
  // GitHub Pages sert un site de projet sous /<dépôt>/ : le workflow de
  // déploiement renseigne BASE_PATH. En local et sur un domaine dédié, la
  // racine suffit.
  base: process.env.BASE_PATH ?? '/',
  build: {
    rollupOptions: {
      // Un point d'entrée HTML par outil. L'hébergement étant statique, chaque
      // outil est une vraie page : /rgpd/ est servi depuis son propre
      // index.html, sans redirection ni routeur côté client. Un registre
      // partagé par lien reste donc ouvrable des mois plus tard.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        calendrier: resolve(import.meta.dirname, 'calendrier/index.html'),
        textes: resolve(import.meta.dirname, 'textes/index.html'),
        rgpd: resolve(import.meta.dirname, 'rgpd/index.html'),
        analyses: resolve(import.meta.dirname, 'analyses/index.html'),
        ia: resolve(import.meta.dirname, 'ia/index.html'),
        produit: resolve(import.meta.dirname, 'produit/index.html'),
        sbom: resolve(import.meta.dirname, 'sbom/index.html'),
        lectures: resolve(import.meta.dirname, 'lectures/index.html'),
        responsabilites: resolve(import.meta.dirname, 'responsabilites/index.html'),
      },
    },
  },
  server: {
    // Respecte le port imposé par l'environnement (aperçu, conteneur, CI).
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
