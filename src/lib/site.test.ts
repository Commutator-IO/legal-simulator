import { describe, expect, it } from 'vitest'
import { COMMUTATOR, DEPOT, PAGES } from './site'

/**
 * `PAGES` est la source unique : elle construit la navigation *et* le plan du
 * site émis à la construction. Une erreur ici se propage donc au
 * `sitemap.xml`, où elle devient une URL annoncée aux moteurs — c'est-à-dire
 * un 404 promis.
 *
 * Ce fichier ne vérifie que ce qui se vérifie sans toucher au disque : le
 * code de `src/` est compilé sans les types Node, à dessein, pour qu'une API
 * serveur ne puisse pas s'y glisser. La correspondance entre `PAGES` et les
 * pages réellement construites est contrôlée par le greffon `plan-du-site` de
 * `vite.config.ts`, qui la confronte au bundle émis et fait échouer la
 * construction en cas d'écart — un contrôle plus fort que celui-ci, puisqu'il
 * porte sur la sortie et non sur l'arborescence source.
 */

describe('les pages du site', () => {
  it('portent un chemin absolu terminé par une barre', () => {
    // Le plan concatène `SITE + chemin` : sans barre initiale l'URL serait
    // collée au domaine, sans barre finale GitHub Pages redirigerait — et une
    // redirection annoncée dans un sitemap est un signal négatif.
    for (const p of PAGES) {
      expect(p.chemin.startsWith('/'), `${p.chemin} ne commence pas par /`).toBe(true)
      expect(p.chemin.endsWith('/'), `${p.chemin} ne finit pas par /`).toBe(true)
    }
  })

  it('n’en déclarent pas deux fois la même', () => {
    const chemins = PAGES.map((p) => p.chemin)
    expect(new Set(chemins).size).toBe(chemins.length)
  })

  it('portent toutes un libellé de navigation', () => {
    for (const p of PAGES) expect(p.libelle.trim().length).toBeGreaterThan(0)
  })
})

describe('les liens sortants du pied', () => {
  it('sont absolus et en HTTPS', () => {
    for (const url of [DEPOT, COMMUTATOR]) {
      expect(url.startsWith('https://')).toBe(true)
    }
  })
})
