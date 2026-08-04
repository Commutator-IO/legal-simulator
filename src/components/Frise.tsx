import { instant, joursRestants } from '../lib/calendrier'
import type { Echeance } from '../lib/calendrier'
import { DOMAINES } from '../lib/textes'
import { PLEIN, REMPLISSAGE } from '../lib/couleurs'
import type { Teinte } from '../lib/couleurs'
import { jour } from '../lib/format'

/**
 * La frise.
 *
 * Tracé SVG à la main : une poignée de figures ne justifie pas soixante
 * kilo-octets de dépendance, et le contrôle exact des positions est plus
 * simple ainsi.
 *
 * Le parti pris de lecture : l'axe est **linéaire dans le temps**, pas régulier
 * par échéance. C'est ce qui fait apparaître ce qu'un tableau cache — la
 * densité de l'automne 2026, puis le vide de dix-huit mois que le report de
 * l'omnibus a créé avant décembre 2027. Une frise à pas constant donnerait
 * l'impression d'un rythme régulier, qui est faux.
 */

const HAUTEUR = 140
// `haut` doit laisser tenir l'étiquette « aujourd'hui » *au-dessus* du trait :
// calée trop haut, sa hampe sort du viewBox et le mot est tronqué.
const MARGE = { gauche: 16, droite: 16, haut: 30, bas: 30 }

export function Frise({
  echeances,
  aujourdhui,
  selection,
  onSelect,
}: {
  echeances: Echeance[]
  aujourdhui: string
  selection?: string
  onSelect: (e: Echeance) => void
}) {
  if (echeances.length === 0) return null

  const dates = echeances.map((e) => instant(e.date))
  const t0 = Math.min(...dates, instant(aujourdhui))
  const t1 = Math.max(...dates, instant(aujourdhui))
  // Une marge de 4 % de part et d'autre : sans elle, la première et la
  // dernière pastille sont coupées par le bord du cadre.
  const etendue = (t1 - t0) * 1.08 || 1
  const debut = t0 - (t1 - t0) * 0.04

  const largeur = 1000
  const utile = largeur - MARGE.gauche - MARGE.droite
  const x = (t: number) => MARGE.gauche + ((t - debut) / etendue) * utile
  const axeY = HAUTEUR - MARGE.bas

  // Une graduation par 1er janvier compris dans la plage.
  const annees: number[] = []
  for (
    let a = new Date(t0).getUTCFullYear();
    a <= new Date(t1).getUTCFullYear() + 1;
    a++
  ) {
    const t = Date.UTC(a, 0, 1)
    if (t >= debut && t <= debut + etendue) annees.push(a)
  }

  const xAujourdhui = x(instant(aujourdhui))

  // Les échéances proches se chevauchent — 11 et 12 septembre 2026 sont à deux
  // pixels l'une de l'autre. On les répartit sur trois niveaux plutôt que de
  // les superposer, en réutilisant le premier niveau libre.
  const occupe: number[] = []
  const place = echeances
    .slice()
    .sort((a, b) => instant(a.date) - instant(b.date))
    .map((e) => {
      const px = x(instant(e.date))
      let niveau = 0
      while (niveau < 3 && occupe[niveau] !== undefined && px - occupe[niveau] < 26) {
        niveau++
      }
      if (niveau === 3) niveau = 0
      occupe[niveau] = px
      return { echeance: e, px, niveau }
    })

  return (
    <figure className="card overflow-hidden p-4">
      <svg
        viewBox={`0 0 ${largeur} ${HAUTEUR}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Frise de ${echeances.length} échéances réglementaires, de ${jour(
          echeances[0].date,
        )} à ${jour(echeances[echeances.length - 1].date)}.`}
      >
        <line
          x1={MARGE.gauche}
          y1={axeY}
          x2={largeur - MARGE.droite}
          y2={axeY}
          stroke="var(--color-ink-300)"
          strokeWidth={1}
        />

        {annees.map((a) => (
          <g key={a}>
            <line
              x1={x(Date.UTC(a, 0, 1))}
              y1={axeY - 4}
              x2={x(Date.UTC(a, 0, 1))}
              y2={axeY + 4}
              stroke="var(--color-ink-300)"
              strokeWidth={1}
            />
            <text
              x={x(Date.UTC(a, 0, 1))}
              y={axeY + 20}
              textAnchor="middle"
              fontSize={12}
              fill="var(--color-ink-400)"
            >
              {a}
            </text>
          </g>
        ))}

        {/* Le repère « aujourd'hui » rattache la figure au moment de la
            lecture : sans lui, une frise réglementaire est intemporelle et
            l'on ne sait pas ce qui est déjà derrière soi. */}
        <line
          x1={xAujourdhui}
          y1={MARGE.haut - 10}
          x2={xAujourdhui}
          y2={axeY}
          stroke="var(--color-ink-900)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <text
          x={xAujourdhui}
          y={MARGE.haut - 16}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill="var(--color-ink-900)"
        >
          aujourd’hui
        </text>

        {place.map(({ echeance: e, px, niveau }) => {
          const passee = joursRestants(e.date, aujourdhui) < 0
          const actif = selection === `${e.date}-${e.titre}`
          const teinte = DOMAINES[e.domaine].couleur as Teinte
          const y = axeY - 14 - niveau * 22
          return (
            <g
              key={`${e.date}-${e.titre}`}
              className="cursor-pointer"
              onClick={() => onSelect(e)}
            >
              <line
                x1={px}
                y1={y}
                x2={px}
                y2={axeY}
                stroke="var(--color-ink-200)"
                strokeWidth={1}
              />
              <circle
                cx={px}
                cy={y}
                r={actif ? 8 : 5.5}
                className={REMPLISSAGE[teinte]}
                // Une échéance passée est creuse, une échéance à venir est
                // pleine : la distinction reste lisible en noir et blanc et
                // pour un lecteur daltonien, à qui la teinte ne dit rien.
                fillOpacity={passee ? 0.25 : 1}
                stroke={actif ? 'var(--color-ink-900)' : 'white'}
                strokeWidth={actif ? 2 : 1.5}
              />
              <title>{`${jour(e.date)} — ${e.titre}`}</title>
            </g>
          )
        })}
      </svg>

      <figcaption className="mt-3 space-y-2 border-t border-ink-100 pt-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {Object.entries(DOMAINES).map(([id, d]) => (
            <span key={id} className="flex items-center gap-1.5 text-xs text-ink-600">
              <span
                className={`h-2.5 w-2.5 rounded-full ${PLEIN[d.couleur as Teinte]}`}
              />
              {d.label}
            </span>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-ink-500">
          L'axe est linéaire dans le temps : la grappe de l'automne 2026 et le creux
          qui la suit sont réels. Ce creux est l'effet du report décidé par l'omnibus
          — il déplace la charge, il ne la supprime pas. Les pastilles creuses sont
          les échéances déjà écoulées.
        </p>
      </figcaption>
    </figure>
  )
}
