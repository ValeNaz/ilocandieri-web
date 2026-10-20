/**
 * Reusable SVG parts for the ABES scenes (jars, packs, sacks, crates, pots, plates, grains, bent people with tools).
 * Same law as art/parts.tsx and DESIGN.md "Illustration language (v4)": flat masses WITHOUT an outer ink contour; ink
 * only for things that are dark (handles, stalks, stems, table legs) and for interior detail lines (lid ridges, label
 * edges, slat gaps, seams). Exception: white glass and paper (jar body, sack, plate) keep a fine contour, because white is
 * also the background. Ground point = (0,0), `s` = scale. Props are a stable contract (shop, showcase, ABES page).
 */
import type { CSSProperties, ReactNode } from "react";
import { C, INK as W, Person, handAt, type Fill } from "../parts";

export type At = { x?: number; y?: number; s?: number; flip?: boolean; className?: string; style?: CSSProperties };
export const at = ({ x = 0, y = 0, s = 1, flip }: At) => `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;
const INK = C.ink;
const ROUND = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
/** Ink weights for parts about 150 units tall (jars, packs, sacks): the system's 1.8 / 2.6 scaled up by 1.5. */
const LW = { fine: W.fine * 1.5, bold: W.bold * 1.5 } as const;

/** Places a part and lets a CSS animation (sway, bob...) run on an inner group, so it never overrides the placing transform. */
function Placed({ p, rot, children }: { p: At; rot?: number; children: ReactNode }) {
  return (
    <g transform={rot ? `${at(p)} rotate(${rot})` : at(p)}>
      <g className={p.className} style={p.style}>{children}</g>
    </g>
  );
}
const text = { fontFamily: "var(--font-display)", fontWeight: 700 } as const;

/**
 * Label sprig: a stem with two leaves, the small sign on every label. Deliberately NOT the logo (the logo only ever
 * appears through <LogoMark>, see DESIGN.md "Logo law").
 */
export function Sprig({ color = "green", ...p }: At & { color?: Fill }) {
  const f = C[color];
  return (
    <Placed p={p}>
      <path d="M0 0 C0 -10 1 -18 4 -26" stroke={f} strokeWidth="3" {...ROUND} />
      <path d="M1 -12 C-9 -12 -13 -19 -13 -25 C-5 -25 0 -20 1 -12 Z M3 -19 C11 -20 15 -27 14 -33 C6 -32 2 -26 3 -19 Z" fill={f} />
    </Placed>
  );
}

/**
 * A glass jar: white glass with a fine contour (white is also the background), the preserve inside, a ribbed screw lid,
 * a wrap-around label (fine edge lines) with the sprig and the real product name (max two short lines).
 */
export function Jar({ label = "green", content = "orange", lid = "orange", name = [], ...p }: At & { label?: Fill; content?: Fill; lid?: Fill; name?: string[] }) {
  const onLabel: Fill = label === "green" ? "white" : "ink";
  return (
    <Placed p={p}>
      {/* neck, then the shouldered body over it */}
      <rect x="-37" y="-134" width="74" height="22" rx="5" fill={C.white} stroke={INK} strokeWidth={LW.fine} />
      <path d="M-36 -116 H36 C44 -116 50 -110 50 -101 V-16 C50 -7 43 0 34 0 H-34 C-43 0 -50 -7 -50 -16 V-101 C-50 -110 -44 -116 -36 -116 Z" fill={C.white} stroke={INK} strokeWidth={LW.fine} />
      <path d="M-30 -106 H30 C37 -106 42 -101 42 -94 V-18 C42 -12 38 -8 32 -8 H-32 C-38 -8 -42 -12 -42 -18 V-94 C-42 -101 -37 -106 -30 -106 Z" fill={C[content]} />
      {/* a glint of glass on the shoulder (white on the preserve) */}
      <path d="M-33 -97 V-91" stroke={C.white} strokeWidth="5" strokeLinecap="round" />
      {/* screw lid with its ribs and the band where it meets the glass */}
      <rect x="-44" y="-152" width="88" height="22" rx="6" fill={C[lid]} />
      <path d="M-30 -147 V-136 M-15 -147 V-136 M0 -147 V-136 M15 -147 V-136 M30 -147 V-136" stroke={INK} strokeWidth={LW.fine} strokeLinecap="round" opacity="0.6" />
      <path d="M-42 -131.5 H42" stroke={INK} strokeWidth={LW.fine} strokeLinecap="round" />
      {/* wrap-around label: full width of the glass, edges drawn as two fine lines */}
      <rect x="-49" y="-90" width="98" height="62" fill={C[label]} />
      <path d="M-49 -90 H49 M-49 -28 H49" stroke={INK} strokeWidth={LW.fine} strokeLinecap="round" />
      <Sprig x={-36} y={-46} s={0.6} color={onLabel} />
      {name.map((t, i) => (
        <text key={i} x={-25} y={-(name.length === 1 ? 52 : 61) + i * 14} fontSize={name.length === 1 ? 13.5 : 11.5} fill={C[onLabel]} style={text}>{t}</text>
      ))}
    </Placed>
  );
}

/** Pasta pack: a pillow bag with crimped seals (soft scallops, seal lines), a window showing the busiate, flat label colour. */
export function PastaPack({ label = "orange", name = ["Busiate"], pasta = "yellow", ...p }: At & { label?: Fill; name?: string[]; pasta?: Fill }) {
  const onLabel: Fill = label === "green" ? "white" : "ink";
  const top = "M-56 -166" + " q7 -9 14 0".repeat(8);
  const bottom = " L56 -4" + " q-7 9 -14 0".repeat(8);
  const coil: Fill = pasta !== label ? pasta : label === "orange" ? "yellow" : "orange";
  return (
    <Placed p={p}>
      <path d={`${top} ${bottom} Z`} fill={C[label]} />
      {/* the heat-seal bands at both ends, and two soft folds of the film */}
      <path d="M-52 -154 H52 M-52 -7 H52" stroke={INK} strokeWidth={LW.fine} strokeLinecap="round" />
      <path d="M-46 -140 C-48 -100 -48 -60 -46 -24 M46 -140 C48 -100 48 -60 46 -24" stroke={INK} strokeWidth={W.fine} strokeLinecap="round" opacity="0.35" fill="none" />
      {/* the window is white film: it keeps a fine contour */}
      <rect x="-36" y="-142" width="72" height="66" rx="12" fill={C.white} stroke={INK} strokeWidth={LW.fine} />
      {[-124, -108, -92].map((y, i) => (
        <path key={i} d={`M-26 ${y} q6.5 -11 13 0 t13 0 t13 0 t13 0`} stroke={C[coil]} strokeWidth="7" {...ROUND} />
      ))}
      <Sprig x={0} y={-48} s={0.5} color={onLabel} />
      {name.map((t, i) => <text key={i} x="0" y={-30 + i * 14} textAnchor="middle" fontSize={i === 0 ? 16 : 12} fill={C[onLabel]} style={text}>{t}</text>)}
    </Placed>
  );
}

/** Paper bag of flour or semolina: white kraft paper (fine contour), a folded top, a flat label without contour. */
export function Sack({ label = "yellow", name = ["Semolato"], ...p }: At & { label?: Fill; name?: string[] }) {
  const onLabel: Fill = label === "green" ? "white" : "ink";
  return (
    <Placed p={p}>
      <path d="M-44 0 C-46 0 -47 -1 -47 -3 V-118 L-39 -146 H39 L47 -118 V-3 C47 -1 46 0 44 0 Z" fill={C.white} stroke={INK} strokeWidth={LW.fine} strokeLinejoin="round" />
      {/* folded top in the label colour, the fold and a row of stitches */}
      <path d="M-39 -146 H39 L45 -124 H-45 Z" fill={C[label]} />
      <path d="M-45 -124 H45" stroke={INK} strokeWidth={LW.fine} strokeLinecap="round" />
      <path d="M-34 -135 H34" stroke={INK} strokeWidth={W.fine} strokeDasharray="0.1 7" strokeLinecap="round" />
      {/* side gusset fold */}
      <path d="M-36 -118 L-40 -8 M36 -118 L40 -8" stroke={INK} strokeWidth={W.fine} strokeLinecap="round" opacity="0.35" />
      <rect x="-32" y="-98" width="64" height="62" rx="7" fill={C[label]} />
      <Sprig x={0} y={-70} s={0.45} color={onLabel} />
      {name.map((t, i) => <text key={i} x="0" y={-54 + i * 13} textAnchor="middle" fontSize={i === 0 ? 11 : 10} fill={C[onLabel]} style={text}>{t}</text>)}
    </Placed>
  );
}

export type Produce = "tomato" | "orange" | "pepper" | "cabbage" | "onion";
/** A heap of produce, each piece with its own stalk or vein: no contours (only white onions keep a fine one). */
function Fruit({ kind, w }: { kind: Produce; w: number }) {
  const n = Math.max(3, Math.round(w / 24));
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const cx = -w / 2 + 14 + i * ((w - 28) / (n - 1));
    const lift = i % 2 ? -7 : 0;
    if (kind === "tomato") out.push(<g key={i}><circle cx={cx} cy={-14 + lift} r={12} fill={C.orange} /><path d={`M${cx - 5} ${-25 + lift} q5 3 5 -1 q0 4 5 1`} stroke={C.green} strokeWidth="3" {...ROUND} /></g>);
    if (kind === "orange") out.push(<g key={i}><circle cx={cx} cy={-14 + lift} r={12} fill={C.orange} /><path d={`M${cx + 1} ${-25 + lift} l2 -4`} stroke={INK} strokeWidth="2.4" strokeLinecap="round" /></g>);
    if (kind === "pepper") out.push(<g key={i}><path d={`M${cx - 9} ${-26 + lift} C${cx - 9} ${-32 + lift} ${cx + 9} ${-32 + lift} ${cx + 9} ${-26 + lift} V${-8 + lift} C${cx + 9} ${2 + lift} ${cx - 9} ${2 + lift} ${cx - 9} ${-8 + lift} Z`} fill={i % 2 ? C.yellow : C.green} /><path d={`M${cx} ${-30 + lift} v-6`} stroke={INK} strokeWidth="2.5" strokeLinecap="round" /></g>);
    if (kind === "cabbage") out.push(<g key={i}><circle cx={cx} cy={-16 + lift} r={14} fill={C.green} /><path d={`M${cx - 8} ${-12 + lift} q8 -14 16 0 M${cx} ${-28 + lift} v10`} stroke={C.white} strokeWidth="2.4" {...ROUND} /></g>);
    if (kind === "onion") out.push(<g key={i}><path d={`M${cx} ${-30 + lift} C${cx + 4} ${-24 + lift} ${cx + 12} ${-22 + lift} ${cx + 12} ${-13 + lift} C${cx + 12} ${-5 + lift} ${cx + 6} ${-2 + lift} ${cx} ${-2 + lift} C${cx - 6} ${-2 + lift} ${cx - 12} ${-5 + lift} ${cx - 12} ${-13 + lift} C${cx - 12} ${-22 + lift} ${cx - 4} ${-24 + lift} ${cx} ${-30 + lift} Z`} fill={C.white} stroke={INK} strokeWidth={W.fine} strokeLinejoin="round" /><path d={`M${cx} ${-30 + lift} l1.5 -6`} stroke={INK} strokeWidth="2.4" strokeLinecap="round" /></g>);
  }
  return <>{out}</>;
}

/** Fruit crate: yellow wood, no contour; slat gaps, end posts and a hand-hole in ink; produce heaped above the rim. */
export function Crate({ w = 120, h = 46, produce = "tomato", ...p }: At & { w?: number; h?: number; produce?: Produce }) {
  const k = h / 46;
  return (
    <Placed p={p}>
      <g transform={`translate(0 ${12 - h})`}><Fruit kind={produce} w={w - 8} /></g>
      <rect x={-w / 2} y={-h} width={w} height={h} rx="4" fill={C.yellow} />
      <path d={`M${-w / 2 + 10} ${-h * 0.36} H${w / 2 - 10} M${-w / 2 + 10} ${-h * 0.68} H${w / 2 - 10}`} stroke={INK} strokeWidth={W.bold * k} strokeLinecap="round" />
      <path d={`M${-w / 2 + 10} ${-h + 4} V-4 M${w / 2 - 10} ${-h + 4} V-4`} stroke={INK} strokeWidth={W.fine * k} strokeLinecap="round" opacity="0.6" />
      <rect x={-9 * k} y={-h + 6 * k} width={18 * k} height={6 * k} rx={3 * k} fill={INK} />
    </Placed>
  );
}

/** Stock pot: coloured body without contour, ink handles and knob, the lid seam as an interior line, and the cooking glint.
 * `lid={false}`: open pot, the dark inside showing at the rim (for someone stirring). */
export function Pot({ body = "yellow", lid = true, ...p }: At & { body?: Fill; lid?: boolean }) {
  return (
    <Placed p={p}>
      <path d="M-62 -76 H-80 M62 -76 H80" stroke={INK} strokeWidth="8" strokeLinecap="round" />
      <path d="M-62 -92 H62 V-14 Q62 0 48 0 H-48 Q-62 0 -62 -14 Z" fill={C[body]} />
      {lid ? (
        <g>
          <path d="M-68 -92 H68 C68 -102 60 -108 48 -108 H-48 C-60 -108 -68 -102 -68 -92 Z" fill={C[body]} />
          <path d="M-66 -92 H66" stroke={INK} strokeWidth={W.bold} strokeLinecap="round" />
          <path d="M-8 -108 C-8 -116 8 -116 8 -108" fill={INK} />
          <circle cx="0" cy="-118" r="5.5" fill={INK} />
        </g>
      ) : (
        <path d="M-60 -92 C-60 -98 -40 -101 0 -101 C40 -101 60 -98 60 -92 Z" fill={INK} />
      )}
      <path d="M-62 -20 H62" stroke={INK} strokeWidth={W.bold} strokeLinecap="round" />
      <path d="M-44 -78 V-40" stroke={body === "white" ? C.yellow : C.white} strokeWidth="5" strokeLinecap="round" />
    </Placed>
  );
}

/** Round plate (white china: fine contour) with a nest of busiate in tomato sauce and a basil leaf (or empty). */
export function Plate({ pasta = true, ...p }: At & { pasta?: boolean }) {
  return (
    <Placed p={p}>
      <ellipse cx="0" cy="0" rx="62" ry="13" fill={C.white} stroke={INK} strokeWidth={W.fine} />
      <ellipse cx="0" cy="-2" rx="40" ry="7.5" fill="none" stroke={INK} strokeWidth={W.fine} opacity="0.35" />
      {pasta && (
        <g>
          <path d="M-36 -3 C-34 -24 -14 -29 0 -29 C14 -29 34 -24 36 -3 Z" fill={C.orange} />
          <path d="M-24 -11 q6 -9 12 0 t12 0 t12 0 t12 0 M-14 -20 q6 -8 12 0 t12 0 t12 0" stroke={C.yellow} strokeWidth="4.6" {...ROUND} />
          <path d="M-4 -29 C-1 -37 10 -38 14 -31 C8 -26 1 -26 -4 -29 Z" fill={C.green} />
          <path d="M-2 -30 L11 -32" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        </g>
      )}
    </Placed>
  );
}

/** A grain of Tumminia: an elongated kernel (no contour), the crease line and a glint. */
export function Grain({ rx = 18, ry = 30, rot = 0, fill = "yellow", ...p }: At & { rx?: number; ry?: number; rot?: number; fill?: Fill }) {
  return (
    <Placed p={p} rot={rot}>
      <path d={`M0 ${-ry} C${rx * 1.15} ${-ry} ${rx * 1.1} ${ry} 0 ${ry} C${-rx * 1.1} ${ry} ${-rx * 1.15} ${-ry} 0 ${-ry} Z`} fill={C[fill]} />
      <path d={`M${rx * 0.05} ${-ry * 0.8} Q${rx * 0.5} 0 ${rx * 0.05} ${ry * 0.8}`} stroke={INK} strokeWidth={Math.max(1.6, rx * 0.1)} {...ROUND} />
      <path d={`M${-rx * 0.48} ${-ry * 0.4} V${-ry * 0.06}`} stroke={C.white} strokeWidth={Math.max(2, rx * 0.16)} strokeLinecap="round" />
    </Placed>
  );
}

const BEND_BACK = handAt("bend", "back");
const BEND_FRONT = handAt("bend", "front");

/**
 * A person bent over a task: <Person pose="bend"> plus the tool IN its hands, in ONE group so figure and tool move
 * together. The tool is drawn first so the hands close over it: the hoe shaft runs through both hands (from the pose
 * table, `handAt`) down to the blade biting the soil; the basket rim sits right under the hands. tool: "hoe" | "basket" | "none".
 */
export function Bender({ color = "orange", tool = "hoe", basket = "yellow", ...p }: At & { color?: Fill; tool?: "hoe" | "basket" | "none"; basket?: Fill }) {
  const [bx, by] = BEND_BACK, [fx, fy] = BEND_FRONT;
  const ux = (fx - bx) / Math.hypot(fx - bx, fy - by), uy = (fy - by) / Math.hypot(fx - bx, fy - by);
  const tail: [number, number] = [bx - ux * 12, by - uy * 12];
  const t = -fy / uy; // run the shaft on from the front hand to the soil line
  const tip: [number, number] = [fx + ux * (t - 4), -4];
  const fruit = basket === "yellow" ? C.orange : C.yellow; // fruit heaped above the rim: never the basket colour
  return (
    <Placed p={p}>
      {tool === "hoe" && (
        <g>
          <path d={`M${tail[0].toFixed(1)} ${tail[1].toFixed(1)} L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`} stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
          <path d={`M${(tip[0] - 2).toFixed(1)} -6 C${(tip[0] + 4).toFixed(1)} -7 ${(tip[0] + 9).toFixed(1)} -4 ${(tip[0] + 10).toFixed(1)} 1 L${(tip[0] + 3).toFixed(1)} 2 Z`} fill={INK} />
        </g>
      )}
      {tool === "basket" && (
        <g>
          {[30, 41].map((cx, i) => <circle key={cx} cx={cx} cy={-20 - i} r="5.2" fill={fruit} />)}
          <path d="M19 -18 H55 C56 -18 56.6 -17.2 56.3 -16.3 L51.6 -1.6 C51.2 -0.6 50.4 0 49.4 0 H24.6 C23.6 0 22.8 -0.6 22.4 -1.6 L17.7 -16.3 C17.4 -17.2 18 -18 19 -18 Z" fill={C[basket]} />
          <path d="M20 -12 H54 M22 -6 H52 M30 -17 l1 16 M37 -17 v16 M44 -17 l-1 16" stroke={INK} strokeWidth={W.fine} strokeLinecap="round" />
        </g>
      )}
      <Person pose="bend" color={color} />
    </Placed>
  );
}

/** Long table: top + cloth hanging with a scalloped edge + two ink legs (`legs` = floor distance from the top). No contours. */
export function Table({ x = 0, y = 0, w = 700, legs = 220, top = "green", cloth = "orange" }: { x?: number; y?: number; w?: number; legs?: number; top?: Fill; cloth?: Fill }) {
  const n = Math.round(w / 40);
  let d = `M${-w / 2 + 14} 0 H${w / 2 - 14} V56`;
  for (let i = 0; i < n; i++) d += ` q${-(w - 28) / n / 2} 18 ${-(w - 28) / n} 0`;
  d += " Z";
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-w / 2 + 50} 40 V${legs} M${w / 2 - 50} 40 V${legs}`} stroke={INK} strokeWidth="10" strokeLinecap="round" />
      <path d={d} fill={C[cloth]} />
      <path d={`M${-w / 2 + 30} 30 V50 M${w / 2 - 30} 30 V50`} stroke={INK} strokeWidth={W.fine} strokeLinecap="round" opacity="0.4" />
      <rect x={-w / 2} y="-14" width={w} height="20" rx="6" fill={C[top]} />
      <path d={`M${-w / 2 + 8} 6 H${w / 2 - 8}`} stroke={INK} strokeWidth={W.bold} strokeLinecap="round" />
    </g>
  );
}

/** Small round tag for scene labels (decorative, the captions say the same). Flat pill, no contour. */
export function Tag({ x = 0, y = 0, label, fill = "white", size = 26 }: { x?: number; y?: number; label: string; fill?: Fill; size?: number }) {
  const w = label.length * size * 0.6 + 34;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-size} width={w} height={size * 1.7} rx={size * 0.85} fill={C[fill]} />
      <text x="0" y={size * 0.22} textAnchor="middle" fontSize={size} fill={fill === "green" ? C.white : INK} style={text}>{label}</text>
    </g>
  );
}

/** Ear of Tumminia with an INK stem (the shared Wheat has a green stem, which vanishes on a green hill). One group. */
export function Ear({ color = "orange", h = 90, ...p }: At & { color?: Fill; h?: number }) {
  const grains = Math.round(h / 12);
  return (
    <Placed p={p}>
      <line x1="0" y1="0" x2="0" y2={-h} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {Array.from({ length: grains }, (_, i) => {
        const gy = -h * 0.45 - i * ((h * 0.55) / grains);
        return <g key={i}><ellipse cx="-4.5" cy={gy} rx="3" ry="6" transform={`rotate(-24 -4.5 ${gy})`} fill={C[color]} /><ellipse cx="4.5" cy={gy - 5} rx="3" ry="6" transform={`rotate(24 4.5 ${gy - 5})`} fill={C[color]} /></g>;
      })}
      <ellipse cx="0" cy={-h - 8} rx="3" ry="7" fill={C[color]} />
    </Placed>
  );
}
