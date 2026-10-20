import { Live } from "../../kit/Live";
import { C, INK, type Fill } from "../parts";
import { Butterfly, lk, vars } from "./parts";

const VB = "0 0 720 720";
const G = 598; // the shelf top
const K = 1.3; // ink scale of the objects (about 130 units tall)

/**
 * A preserve jar, full: the shape of the glass with its shoulder in the colour of what it holds (no contour), a screw
 * lid with its ridges, a paper label with two written lines. One object.
 */
function Jar({ x, w, h, fill, lid, label = true, k }: { x: number; w: number; h: number; fill: Fill; lid: Fill; label?: boolean; k: number }) {
  const n = w * 0.12, r = w * 0.14;
  const body = `M${n} 0 H${w - n} C${w} ${h * 0.03} ${w} ${h * 0.09} ${w} ${h * 0.17} V${h - r} Q${w} ${h} ${w - r} ${h} H${r} Q0 ${h} 0 ${h - r} V${h * 0.17} C0 ${h * 0.09} 0 ${h * 0.03} ${n} 0 Z`;
  const lw = w - 2 * n + 8, lh = h * 0.13;
  return (
    <g transform={`translate(${x} ${G - h})`}>
      <g className="lv-pop" style={lk(k, 1.3)}>
      <path d={body} fill={C[fill]} />
      <rect x={n - 4} y={-lh + 2} width={lw} height={lh} rx="4" fill={C[lid]} />
      <path d={Array.from({ length: Math.floor(lw / 11) }, (_, i) => `M${n + 4 + i * 11} ${-lh + 6} V${-2}`).join("")} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.45" />
      {label && (
        <g>
          <rect x={w * 0.16} y={h * 0.44} width={w * 0.68} height={h * 0.28} rx="4" fill={C.white} />
          <path d={`M${w * 0.26} ${h * 0.54} H${w * 0.74} M${w * 0.3} ${h * 0.63} H${w * 0.6}`} stroke={C.ink} strokeWidth={INK.fine * K} strokeLinecap="round" />
        </g>
      )}
      </g>
    </g>
  );
}

/** A tomato plant: a stem with side shoots, toothed leaves, two ripe tomatoes and a green one. Base at 0,0. */
function TomatoPlant() {
  const leaf = (x: number, y: number, a: number, k = 1) => (
    <path key={`${x} ${y}`} transform={`translate(${x} ${y}) rotate(${a}) scale(${k})`} d="M0 0 C6 -8 18 -12 30 -10 C27 -6 31 -2 26 1 C29 5 22 9 17 7 C14 12 6 9 0 0 Z" fill={C.green} />
  );
  return (
    <g>
      <path d="M0 0 C-2 -60 4 -110 -2 -176 M-1 -64 C12 -78 26 -86 40 -90 M1 -116 C-12 -128 -24 -134 -38 -136" stroke={C.green} strokeWidth="7" strokeLinecap="round" fill="none" />
      {leaf(0, -40, 160, 1.1)}
      {leaf(2, -92, -20, 1.2)}
      {leaf(-2, -150, 200, 1)}
      {leaf(-2, -172, -50, 0.8)}
      {/* tomatoes hang from the side shoots, each with its green calyx */}
      <path d="M24 -64 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0 M10 -76 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0" fill={C.orange} />
      <path d="M-50 -116 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0" fill={C.green} />
      <path d="M33 -80 l6 4 l6 -4 M16 -88 l5 3 l5 -3 M-44 -128 l5 3 l5 -3" stroke={C.green} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
}

/**
 * Scena: dal seme al vasetto. Soggetto: la piantina di pomodoro che cresce dal suo vaso di terracotta (cresce con lo
 * scroll, una volta) e accanto il suo punto d'arrivo, tre vasetti sulla mensola: sugo, confettura, verdure sott'olio.
 * Vita: intro (il disco del sole sale, la mensola si stende, il vaso spunta, la piantina cresce, i vasetti spuntano uno
 * dopo l'altro); poi la piantina ondeggia al vento e una farfalla le gira intorno.
 */
export function AbesScene() {
  return (
    <Live className="scene-live">
    <svg viewBox={VB} className="block h-full w-full" role="img" aria-label="Una piantina di pomodoro che cresce in un vaso di terracotta e, accanto, tre vasetti di conserve sulla mensola" preserveAspectRatio="xMidYMid meet" focusable="false">
      <circle cx="360" cy="380" r="262" fill={C.yellow} className="lv-sun" style={lk(0, 0.1, { "--lv-y": "80px" })} />
      {/* the shelf: a plank with its thickness */}
      <g className="lv-reveal-x" style={lk(0, 0.4)}>
        <rect x="70" y={G} width="580" height="22" rx="4" fill={C.orange} />
        <path d={`M78 ${G + 7} H642`} stroke={C.ink} strokeWidth={INK.fine * K} strokeLinecap="round" opacity="0.5" />
      </g>
      {/* the plant grows on scroll, out of the soil of its pot */}
      <g transform="translate(218 528) scale(1.45)">
        <g className="lv-pop" style={lk(0, 0.95, { "--lv-step": "0s" })}><g className="sway" style={vars({ "--d": 0.8 })}><TomatoPlant /></g></g>
      </g>
      {/* terracotta pot: rim band, tapered body */}
      <g className="lv-pop" style={lk(0, 0.7)}>
      <path d="M170 540 H266 L254 594 Q253 598 249 598 H187 Q183 598 182 594 Z" fill={C.orange} />
      <rect x="164" y="522" width="108" height="22" rx="4" fill={C.orange} />
      <path d="M170 544 H266" stroke={C.ink} strokeWidth={INK.fine * K} strokeLinecap="round" opacity="0.6" />
      </g>
      <Jar x={312} w={90} h={126} fill="orange" lid="green" k={0} />
      <Jar x={420} w={112} h={160} fill="green" lid="orange" k={1} />
      <Jar x={550} w={82} h={112} fill="orange" lid="green" k={2} />
      <Butterfly x={300} y={330} x1={-150} y1={60} t={7.5} d={1.5} color="orange" />
    </svg>
    </Live>
  );
}
