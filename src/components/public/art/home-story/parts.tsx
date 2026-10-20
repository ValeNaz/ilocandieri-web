/**
 * Reusable pieces for the HOME-B scenes ("Cosa facciamo" story and the places teaser), in the v4 language (DESIGN.md
 * "Illustration language"): flat masses with NO outer contour, ink only for dark things (iron, trunks, hair, trousers)
 * and for interior detail at two weights (INK.fine / INK.bold). Units: a person at s=1 is about 100 tall, so the ink
 * weights apply as they are. Every object is ONE group placed with <Placed> (outer transform, inner animation class).
 * Scroll-scripted groups use the .hs-* classes of story.css (they read --a, 0..1).
 */
import type { CSSProperties, ReactNode } from "react";
import { C, INK, Placed, type Fill } from "../parts";

export { C, INK, Person, Placed, Sun, Hill, Cloud, OrangeTree, OliveTree, Ball, handAt } from "../parts";
export type { Fill };

type At = { x?: number; y?: number; s?: number; className?: string; style?: CSSProperties };
const ROUND = { strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
const disc = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/**
 * One depth layer of a story scene: a div that shifts sideways with the scroll (by --z) holding one full-size svg.
 * `meet` + visible overflow: the 800x640 drawing is never cropped (subjects stay whole in any panel shape); grounds and
 * skies are drawn wider than the viewBox (see WIDE) so a wider or taller panel shows more land or sky, never a gap.
 */
export function Depth({ z = 0, children }: { z?: number; children: ReactNode }) {
  return (
    <div className="hs-d" style={{ "--z": z } as CSSProperties}>
      <svg viewBox="0 0 800 640" preserveAspectRatio="xMidYMax meet" className="size-full overflow-visible" aria-hidden="true" focusable="false">{children}</svg>
    </div>
  );
}

/** Horizontal extent for grounds and hills that must fill a panel wider than the drawing. */
export const WIDE = { x: -600, w: 2000 } as const;

/** Timing helper: t0 / dt = when (0..1 of the scene) a scripted group starts and how long it takes. */
export const at = (t0: number, dt = 0.25, extra?: CSSProperties) => ({ "--t0": t0, "--dt": dt, ...extra }) as CSSProperties;

/**
 * Fruit crate (open top), the same drawing as the crate people carry: no outline, slat gaps and end posts in fine ink,
 * fruit heaped above the rim with their stalks. Origin = top-left corner of the box.
 */
export function Crate({ x = 0, y = 0, w = 110, h = 60, color = "yellow", produce, className, style }: At & { w?: number; h?: number; color?: Fill; produce?: { c: Fill; n?: number } }) {
  const n = produce?.n ?? 4;
  const r = Math.min(w / (n * 2 - 0.6), h * 0.22);
  const fruit = Array.from({ length: n }, (_, i) => [w * 0.16 + ((w * 0.68) * i) / Math.max(1, n - 1), -r * 0.35 - (i % 2) * r * 0.45] as const);
  return (
    <Placed x={x} y={y} className={className} style={style}>
      {produce && <path d={fruit.map(([cx, cy]) => disc(cx, cy, r)).join("")} fill={C[produce.c]} />}
      {produce && <path d={fruit.map(([cx, cy]) => `M${cx + 0.6} ${cy - r}l1.4 -${(r * 0.45).toFixed(1)}`).join("")} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />}
      <rect x="0" y="0" width={w} height={h} rx="3.5" fill={C[color]} />
      <path d={`M${w * 0.1} ${h * 0.36}H${w * 0.9}M${w * 0.1} ${h * 0.68}H${w * 0.9}M${w * 0.1} 4V${h - 4}M${w * 0.9} 4V${h - 4}`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      {/* the hand-hole in the end board */}
      <rect x={w * 0.42} y={h * 0.12} width={w * 0.16} height={h * 0.13} rx={h * 0.06} fill={C.ink} />
    </Placed>
  );
}

/** Ear of wheat: green stem, grains in pairs (no outline), fine ink awns. Ground point = foot of the stem. */
export function Ear({ x = 0, y = 0, s = 1, h = 80, color = "yellow", className, style }: At & { h?: number; color?: Fill }) {
  const g: string[] = [];
  for (let i = 0; i < 6; i++) {
    const gy = -h + 8 + i * 9;
    g.push(`M0 ${gy} q-9 -3 -9 -11 q9 1 9 11 M0 ${gy} q9 -3 9 -11 q-9 1 -9 11`);
  }
  return (
    <Placed x={x} y={y} s={s} className={className} style={style}>
      <path d={`M0 0 Q2 ${-h / 2} 0 ${-h + 6}`} fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round" />
      <path d={`M2 ${-h * 0.38} q8 -6 12 -18`} fill="none" stroke={C.green} strokeWidth="2.4" strokeLinecap="round" />
      <path d={g.join(" ")} fill={C[color]} />
      <path d={`M0 ${-h - 2} v-16 M-7 ${-h + 2} l-5 -12 M7 ${-h + 2} l5 -12`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
    </Placed>
  );
}

/** Training cone: soft cone on a square base, one white reflective band. No outline. */
export function Cone({ x = 0, y = 0, s = 1, color = "yellow" }: At & { color?: Fill }) {
  return (
    <Placed x={x} y={y} s={s}>
      <rect x="-17" y="-5" width="34" height="6" rx="3" fill={C[color]} />
      <path d="M-12 -4 L-4.6 -35 C-3.6 -39 3.6 -39 4.6 -35 L12 -4 Z" fill={C[color]} />
      <path d="M-8.4 -17 H8.4" stroke={C.white} strokeWidth="4.4" strokeLinecap="round" />
    </Placed>
  );
}

/**
 * Farmhouse window: deep glass (yellow = light on, green = dark), mullion cross in fine ink, a stone sill marked by one
 * bold ink line, optional louvred shutters (green) folded open beside it. No outer contour.
 */
export function Win({ x, y, w = 56, h = 64, lit, shutters, glass, sill = true }: { x: number; y: number; w?: number; h?: number; lit?: boolean; shutters?: boolean; glass?: Fill; sill?: boolean }) {
  const sw = w * 0.32;
  const sh = (sx: number) => (
    <g>
      <rect x={sx} y={y - 2} width={sw} height={h + 2} rx="3" fill={C.green} />
      <path d={Array.from({ length: 5 }, (_, i) => `M${sx + 3} ${y + 6 + i * ((h - 10) / 4)}h${sw - 6}`).join("")} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      {shutters && <>{sh(x - sw)}{sh(x + w)}</>}
      <rect x={x} y={y} width={w} height={h} rx="3" fill={C[glass ?? (lit ? "yellow" : "green")]} />
      <path d={`M${x + w / 2} ${y + 1.5} V${y + h - 1.5} M${x + 1.5} ${y + h * 0.42} H${x + w - 1.5}`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      {sill && <path d={`M${x - 6} ${y + h + 3} H${x + w + 6}`} stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" />}
    </g>
  );
}

/** A window shut and boarded up: closed shutters (seam + louvres) under two crossed planks nailed on. */
export function Boarded({ x, y, w = 56, h = 64, color = "green", plank = "yellow" }: { x: number; y: number; w?: number; h?: number; color?: Fill; plank?: Fill }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={C[color]} />
      <path d={`M${x + w / 2} ${y + 2}V${y + h - 2}` + Array.from({ length: 5 }, (_, i) => `M${x + 5} ${y + 8 + i * ((h - 14) / 4)}h${w / 2 - 9}M${x + w / 2 + 4} ${y + 8 + i * ((h - 14) / 4)}h${w / 2 - 9}`).join("")} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <path d={`M${x - 6} ${y + 8} L${x + w + 6} ${y + h - 8} M${x - 6} ${y + h - 8} L${x + w + 6} ${y + 8}`} stroke={C[plank]} strokeWidth="9" strokeLinecap="round" />
      <path d={`M${x - 1} ${y + 10.5}h0M${x + w + 1} ${y + h - 10.5}h0M${x - 1} ${y + h - 10.5}h0M${x + w + 1} ${y + 10.5}h0`} stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
    </g>
  );
}

/**
 * Tiled roof seen from the front: eaves overhanging the walls (`x1..x2` = eave ends), hipped or gabled ridge, rows of
 * coppi as fine ink lines parallel to the eave, an ink gutter (iron) along the eave. No outline.
 */
export function Roof({ x1, x2, eave, ridge, inset = 60, color = "orange", rows = 3, gutter = true }: { x1: number; x2: number; eave: number; ridge: number; inset?: number; color?: Fill; rows?: number; gutter?: boolean }) {
  const h = eave - ridge;
  const lines = Array.from({ length: rows }, (_, i) => {
    const t = (i + 1) / (rows + 1);
    const yy = eave - h * t, dx = inset * t;
    return `M${x1 + dx + 6} ${yy}H${x2 - dx - 6}`;
  }).join("");
  return (
    <g>
      <path d={`M${x1 + 2} ${eave} L${x1 + inset} ${ridge + 2} Q${x1 + inset + 1} ${ridge} ${x1 + inset + 4} ${ridge} H${x2 - inset - 4} Q${x2 - inset - 1} ${ridge} ${x2 - inset} ${ridge + 2} L${x2 - 2} ${eave} Q${x2} ${eave + 4} ${x2 - 4} ${eave + 4} H${x1 + 4} Q${x1} ${eave + 4} ${x1 + 2} ${eave} Z`} fill={C[color]} />
      <path d={lines} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      {gutter && <path d={`M${x1 + 6} ${eave + 4.5} H${x2 - 6}`} stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" />}
    </g>
  );
}

/** Chimney: stack with a wider cap. Ground = where it leaves the roof (`y`). */
export function Chimney({ x, y, w = 26, h = 46, color = "white" }: { x: number; y: number; w?: number; h?: number; color?: Fill }) {
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h + 8} rx="2" fill={C[color]} />
      <rect x={x - 4} y={y - h - 7} width={w + 8} height="9" rx="3" fill={C[color]} />
      <path d={`M${x + 3} ${y - h + 6}H${x + w - 3}`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
    </g>
  );
}

/** Door with an arched head, two panels in fine ink, a knob, and a stone step in front. `y` = ground (top of the step's base). */
export function Door({ x, y, w = 58, h = 90, color = "orange", step = "yellow", arch = true }: { x: number; y: number; w?: number; h?: number; color?: Fill; step?: Fill; arch?: boolean }) {
  const top = y - 8 - h;
  const head = arch ? `V${top + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0` : `V${top + 3} Q${x} ${top} ${x + 3} ${top} H${x + w - 3} Q${x + w} ${top} ${x + w} ${top + 3}`;
  return (
    <g>
      <path d={`M${x} ${y - 8} ${head} V${y - 8} Z`} fill={C[color]} />
      <path d={`M${x + w / 2} ${top + (arch ? 4 : 3)} V${y - 10} M${x + 7} ${y - 8 - h * 0.42} H${x + w / 2 - 5} M${x + w / 2 + 5} ${y - 8 - h * 0.42} H${x + w - 7}`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <circle cx={x + w / 2 + 7} cy={y - 8 - h * 0.34} r="2.6" fill={C.ink} />
      <rect x={x - 8} y={y - 9} width={w + 16} height="10" rx="3" fill={C[step]} />
    </g>
  );
}

/** Chair seen from the side, for a seated <Person>: seat top at 40 units above the ground (person units), back behind them. */
export function Chair({ x = 0, y = 0, s = 1, flip, color = "green" }: { x?: number; y?: number; s?: number; flip?: boolean; color?: Fill }) {
  return (
    <Placed x={x} y={y} s={s} flip={flip}>
      <path d="M-11 -40 V-1 M21 -38 V-1 M-12 -40 V-84" stroke={C[color]} strokeWidth="4.6" strokeLinecap="round" />
      <rect x="-15" y="-43" width="40" height="7" rx="3" fill={C[color]} />
      <path d="M-12 -66 H-4" stroke={C[color]} strokeWidth="4" strokeLinecap="round" />
    </Placed>
  );
}

/** Table with a thick top and an apron, two legs. `top` = y of the top surface; legs reach `floor`. */
export function Table({ x1, x2, top, floor, color = "orange" }: { x1: number; x2: number; top: number; floor: number; color?: Fill }) {
  return (
    <g>
      <path d={`M${x1 + 12} ${top + 6} V${floor} M${x2 - 12} ${top + 6} V${floor}`} stroke={C[color]} strokeWidth="7" strokeLinecap="round" />
      <rect x={x1} y={top} width={x2 - x1} height="9" rx="3" fill={C[color]} />
      <path d={`M${x1 + 10} ${top + 15} H${x2 - 10}`} stroke={C[color]} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${x1 + 3} ${top + 9.5} H${x2 - 3}`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
    </g>
  );
}

/** Jar of preserve: lid band (ink), body in the colour of what is inside (no outline), fill level in fine ink, white label. Ground = bottom. */
export function Jar({ x = 0, y = 0, s = 1, fill = "orange" }: { x?: number; y?: number; s?: number; fill?: Fill }) {
  return (
    <Placed x={x} y={y} s={s}>
      <path d="M-9 -26 H9 C11.6 -26 13 -24 13 -21 V-3 C13 -1.2 11.8 0 10 0 H-10 C-11.8 0 -13 -1.2 -13 -3 V-21 C-13 -24 -11.6 -26 -9 -26 Z" fill={C[fill]} />
      <path d="M-9 -19 H9" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <rect x="-10" y="-33" width="20" height="8" rx="2" fill={C.ink} />
      <rect x="-7" y="-14" width="14" height="8" rx="1.6" fill={C.white} />
    </Placed>
  );
}

/** Lettuce: a rosette of white leaves with a yellow heart and fine veins. Ground = base. */
export function Lettuce({ x = 0, y = 0, s = 1, heart = "yellow" }: { x?: number; y?: number; s?: number; heart?: Fill }) {
  return (
    <Placed x={x} y={y} s={s}>
      <path d="M-20 -2 C-24 -12 -18 -20 -10 -18 C-10 -27 2 -30 6 -22 C13 -26 22 -20 19 -11 C24 -8 22 -1 17 0 H-17 C-19 0 -20 -1 -20 -2 Z" fill={C.white} />
      <path d={disc(0, -11, 6.5)} fill={C[heart]} />
      <path d="M-3 -1 L-11 -11 M3 -1 L11 -11" stroke={C.ink} strokeWidth={INK.fine} {...ROUND} />
    </Placed>
  );
}

/** Water jug (a white jug keeps a fine contour as a white handheld object; a coloured one has none): body, spout, handle. Ground = bottom centre. */
export function Jug({ x = 0, y = 0, s = 1, color = "white" }: { x?: number; y?: number; s?: number; color?: Fill }) {
  return (
    <Placed x={x} y={y} s={s}>
      <path d="M7 -19 Q14 -19 14 -12 Q14 -6 7 -6" stroke={C.ink} strokeWidth={INK.fine} {...ROUND} />
      <path d="M-7 -1 V-21 L-10 -27 H5 Q8 -27 8 -23 V-1 Q8 0 7 0 H-6 Q-7 0 -7 -1 Z" fill={C[color]} stroke={color === "white" ? C.ink : "none"} strokeWidth={INK.fine} strokeLinejoin="round" />
    </Placed>
  );
}

const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Two ink birds crossing the sky (life loop): rest position = where they are drawn. */
export function Birds({ x, y, x0, x1, t, d = 0 }: { x: number; y: number; x0: number; x1: number; t: number; d?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lv-fly" style={v({ "--x0": `${x0}px`, "--x1": `${x1}px`, "--y0": "14px", "--y1": "-16px", "--t": t, "--d": d })}>
        {[[0, 0], [34, -28]].map(([bx, by], i) => (
          <g key={i} transform={`translate(${bx} ${by})`}>
            <g className="lv-flap" style={v({ "--d": i * 0.16 })}><path d="M-9 0 q4.5 -8 9 0 q4.5 -8 9 0" stroke={C.ink} strokeWidth={INK.bold} {...ROUND} /></g>
          </g>
        ))}
      </g>
    </g>
  );
}
/** Smoke from a chimney: three puffs, staggered (life loop). */
export function Smoke({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1.2, 2.4].map((d, i) => <g key={i} className="lv-puff" style={v({ "--d": d, "--lv-y": "46px" })}><circle cx={i % 2 ? 4 : -3} r={7 - i} fill={C.white} /></g>)}
    </g>
  );
}
