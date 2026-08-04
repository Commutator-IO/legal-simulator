import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages sert un site de projet sous /<dépôt>/ : le workflow de
  // déploiement renseigne BASE_PATH. En local et sur un domaine dédié, la
  // racine suffit.
  base: process.env.BASE_PATH ?? '/',
  build: {
    rollupOptions: {
      // Un point d'entrée HTML par outil. L'hébergement étant statique, chaque
      // outil est une vraie page : /registre/ est servi depuis son propre
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
        responsabilites: resolve(import.meta.dirname, 'responsabilites/index.html'),
      },
    },
  },
  server: {
    // Respecte le port imposé par l'environnement (aperçu, conteneur, CI).
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
