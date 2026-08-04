/**
 * Les classes de couleur, écrites en toutes lettres.
 *
 * Tailwind analyse le source statiquement : une classe composée à l'exécution
 * — `bg-${teinte}-50` — n'est jamais générée, et l'élément se retrouve sans
 * fond, sans erreur ni avertissement. Le prix à payer est cette table
 * verbeuse ; le prix de l'autre approche est une page qui perd sa mise en
 * forme un jour sur deux sans qu'on comprenne pourquoi.
 */

export type Teinte = 'brand' | 'gold' | 'ember' | 'jade' | 'ink'

export const FOND: Record<Teinte, string> = {
  brand: 'bg-brand-50 border-brand-200 text-brand-900',
  gold: 'bg-gold-50 border-gold-200 text-gold-900',
  ember: 'bg-ember-50 border-ember-200 text-ember-900',
  jade: 'bg-jade-50 border-jade-200 text-jade-900',
  ink: 'bg-ink-100 border-ink-200 text-ink-800',
}

export const PASTILLE: Record<Teinte, string> = {
  brand: 'bg-brand-100 text-brand-800',
  gold: 'bg-gold-100 text-gold-800',
  ember: 'bg-ember-100 text-ember-800',
  jade: 'bg-jade-100 text-jade-800',
  ink: 'bg-ink-100 text-ink-700',
}

export const PLEIN: Record<Teinte, string> = {
  brand: 'bg-brand-600',
  gold: 'bg-gold-500',
  ember: 'bg-ember-600',
  jade: 'bg-jade-600',
  ink: 'bg-ink-400',
}

/**
 * Pour le SVG. `bg-*` ne colore pas une forme vectorielle : il faut `fill-*`,
 * qui est une utilitaire distincte. Les confondre donne des pastilles noires.
 */
export const REMPLISSAGE: Record<Teinte, string> = {
  brand: 'fill-brand-600',
  gold: 'fill-gold-500',
  ember: 'fill-ember-600',
  jade: 'fill-jade-600',
  ink: 'fill-ink-400',
}

export const TEXTE: Record<Teinte, string> = {
  brand: 'text-brand-700',
  gold: 'text-gold-700',
  ember: 'text-ember-700',
  jade: 'text-jade-700',
  ink: 'text-ink-600',
}

export const BORDURE_GAUCHE: Record<Teinte, string> = {
  brand: 'border-l-brand-500',
  gold: 'border-l-gold-500',
  ember: 'border-l-ember-500',
  jade: 'border-l-jade-500',
  ink: 'border-l-ink-300',
}
