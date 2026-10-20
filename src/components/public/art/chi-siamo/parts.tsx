import "./scene.css";
/**
 * Parts shared by the /chi-siamo, /accoglienza and /lavora-con-noi scenes. Flat fills only (see DESIGN.md).
 * Every multi-part object is ONE group: position on the outer <g transform>, animation on the inner <g> (via <Placed>).
 */
import type { CSSProperties, ReactNode } from "react";
import { C, INK, Person, Placed, handAt, type Build, type Fill } from "../parts";

type Pos = { x?: number; y?: number; s?: number; className?: string; style?: CSSProperties; flip?: boolean };

/**
 * A village house that is NOT the logo, seen from its long side: whitewashed walls, a tiled roof that overhangs the
 * walls with a gutter and a downpipe, a chimney, a door with a fanlight and a step, two windows with mullions, shutters
 * and sills. Ground point = bottom centre (about 184 x 160 units at s=1). No outer contour: ink only for the roof's tile
 * rows, the mullions, the gutter (iron) and the door seams. `lights` adds a lit pane over each window (k 0, 1), the
 * fanlight (k 2) and the door (k 3), carrying `lightClass` and an order `--k`, so a scene can switch them on one by one.
 */
export function Cottage({ wall = "white", roof = "orange", door = "green", shutter = "green", pane = "yellow", lit = "yellow", lights, lightClass, ...at }: Pos & { wall?: Fill; roof?: Fill; door?: Fill; shutter?: Fill; pane?: Fill; lit?: Fill; lights?: boolean; lightClass?: string }) {
  const on = (k: number) => ({ className: lightClass, style: { "--k": k } as CSSProperties });
  const win = (cx: number, k: number) => (
    <g key={cx}>
      <rect x={cx - 25} y="-78" width="9" height="34" rx="2" fill={C[shutter]} />
      <rect x={cx + 16} y="-78" width="9" height="34" rx="2" fill={C[shutter]} />
      <path d={`M${cx - 23} -74 h5 M${cx - 23} -66 h5 M${cx - 23} -58 h5 M${cx - 23} -50 h5 M${cx + 18} -74 h5 M${cx + 18} -66 h5 M${cx + 18} -58 h5 M${cx + 18} -50 h5`} stroke={C.ink} strokeWidth={INK.fine * 0.7} strokeLinecap="round" opacity="0.55" />
      <rect x={cx - 13} y="-78" width="26" height="34" rx="2.5" fill={C[pane]} />
      {lights && <rect x={cx - 13} y="-78" width="26" height="34" rx="2.5" fill={C[lit]} {...on(k)} />}
      <path d={`M${cx} -78 V-44 M${cx - 13} -62 H${cx + 13}`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <rect x={cx - 17} y="-44" width="34" height="5" rx="2" fill={C[roof]} />
    </g>
  );
  return (
    <Placed {...at}>
      {/* chimney behind the roof, in the roof's colour: it rises from the same mass, so it never fades into a pale sky */}
      <rect x="36" y="-160" width="17" height="36" rx="2" fill={C[roof]} />
      <rect x="33" y="-164" width="23" height="7" rx="2.5" fill={C[roof]} />
      <rect x="-80" y="-98" width="160" height="98" rx="3" fill={C[wall]} />
      {/* the roof overhangs the walls; rows of coppi as fine ink lines */}
      <path d="M-93 -93 L-64 -140 H64 L93 -93 Z" fill={C[roof]} stroke={C[roof]} strokeWidth="6" strokeLinejoin="round" />
      <path d="M-82 -105 H82 M-74 -117 H74 M-67 -129 H67" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.5" />
      <path d="M-50 -93 V-104 M-20 -93 V-104 M10 -93 V-104 M40 -93 V-104 M-35 -106 V-116 M-5 -106 V-116 M25 -106 V-116 M55 -106 V-116 M-50 -118 V-128 M-20 -118 V-128 M10 -118 V-128 M40 -118 V-128" stroke={C.ink} strokeWidth={INK.fine * 0.8} strokeLinecap="round" opacity="0.4" />
      {/* gutter under the eave and the downpipe at the corner (iron) */}
      <path d="M-90 -91.5 H90 M74 -91 V-6 Q74 -2 78 -2" stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {win(-48, 0)}
      {win(46, 1)}
      {/* fanlight over the door */}
      <path d="M-14 -62 a14 12 0 0 1 28 0 Z" fill={C[pane]} />
      {lights && <path d="M-14 -62 a14 12 0 0 1 28 0 Z" fill={C[lit]} {...on(2)} />}
      <path d="M0 -62 V-72" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <rect x="-16" y="-58" width="32" height="56" rx="2" fill={C[door]} />
      {lights && <rect x="-16" y="-58" width="32" height="56" rx="2" fill={C[lit]} {...on(3)} />}
      <path d="M0 -55 V-5 M-12 -30 H-4 M4 -30 H12" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.6" />
      <circle cx="9" cy="-26" r="2" fill={C.ink} />
      {/* door step */}
      <rect x="-23" y="-4" width="46" height="7" rx="2.5" fill={C[roof]} />
    </Placed>
  );
}

/** A brick: rounded rectangle with a seam. `x`,`y` = top-left corner. */
export function Brick({ w = 34, h = 17, color = "orange", ...p }: Pos & { w?: number; h?: number; color?: Fill }) {
  return (
    <Placed {...p}>
      <rect width={w} height={h} rx="4" fill={C[color]} />
      <line x1={w * 0.5} y1="3" x2={w * 0.5} y2={h * 0.5} stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
    </Placed>
  );
}

/** Ground band: flat, extends past the viewBox so parallax never shows a gap. */
export function Ground({ y, color = "white", from = -200, to = 1400 }: { y: number; color?: Fill; from?: number; to?: number }) {
  return <rect x={from} y={y} width={to - from} height="260" fill={C[color]} />;
}

/**
 * A fruit crate, heaped with fruit (each with its stalk). `x`,`y` = top-left corner of the crate (fruit rises above it).
 * Same drawing as the crate people carry: no outline, ink only for the slat gaps, the end posts and the stalks.
 */
export function Crate({ w = 64, h = 36, fruit = "orange", box = "yellow", filled = true, ...p }: Pos & { w?: number; h?: number; fruit?: Fill; box?: Fill; filled?: boolean }) {
  const n = Math.max(2, Math.floor(w / 17));
  const r = Math.min(9, w / (n * 2) + 0.6);
  const step = (w - 2 * r - 6) / (n - 1);
  const k = h / 36;
  const heap = Array.from({ length: n }, (_, i) => [3 + r + i * step, -r * 0.45 - (i % 2) * r * 0.4] as const);
  return (
    <Placed {...p}>
      {filled && <path d={heap.map(([cx, cy]) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`).join("")} fill={C[fruit]} />}
      {filled && <path d={heap.map(([cx, cy]) => `M${cx + 1} ${cy - r}l1.6 -3`).join("")} stroke={C.ink} strokeWidth={INK.fine * k} strokeLinecap="round" />}
      <rect width={w} height={h} rx={3 * k} fill={C[box]} />
      <path d={`M${7 * k} ${h * 0.36}H${w - 7 * k}M${7 * k} ${h * 0.66}H${w - 7 * k}M${5 * k} ${4 * k}V${h - 4 * k}M${w - 5 * k} ${4 * k}V${h - 4 * k}`} stroke={C.ink} strokeWidth={INK.fine * k * 1.1} strokeLinecap="round" />
    </Placed>
  );
}

type PersonProps = Parameters<typeof Person>[0];
type Pose = NonNullable<PersonProps["pose"]>;

/** Where the hands end for each pose (person units, unflipped, feet at 0,0), from the shared pose table in ../parts.tsx. */
const hands = (pose: Exclude<Pose, "bend">) => ({ right: handAt(pose, "front"), left: handAt(pose, "back") });
export const HAND = Object.fromEntries((["stand", "walk", "cheer", "carry", "sit", "reach", "wave", "kick", "climb", "dig", "sit-table", "place", "present", "point"] as const).map((p) => [p, hands(p)])) as Record<Exclude<Pose, "bend">, { right: [number, number]; left: [number, number] }>;

/**
 * A person holding something: Person and object in the SAME group, so the object moves with the hand.
 * `grip="right"` (the near hand) hands the children to Person's `hold`: their origin is the hand and the fingers close
 * OVER them. `grip="left"` puts the origin on the far hand. Without `grip`, children are drawn in plain person units
 * (feet at 0,0), e.g. a beam or a tray held in front with both hands. In every case the hands that grip are drawn
 * again on top, so they close over the object. Animate the whole thing with `className` (never the tool alone).
 */
export function Holding({ children, pose = "stand", color = "orange", kid, item = "none", itemColor, grip, build = "regular", hair, outfit, ...at }: Pos & Pick<PersonProps, "color" | "kid" | "item" | "itemColor" | "hair" | "outfit"> & { pose?: Exclude<Pose, "bend">; grip?: "right" | "left"; build?: Build; children?: ReactNode }) {
  const k = kid ? 0.64 : 1;
  if (grip === "right") {
    return <Person {...at} pose={pose} color={color} kid={kid} item={item} itemColor={itemColor} build={build} hair={hair} outfit={outfit} hold={children} />;
  }
  const [hx, hy] = grip ? handAt(pose, "back", build) : [0, 0];
  const over = grip ? [handAt(pose, "back", build)] : [handAt(pose, "back", build), handAt(pose, "front", build)];
  return (
    <Placed {...at}>
      <Person pose={pose} color={color} kid={kid} item={item} itemColor={itemColor} build={build} hair={hair} outfit={outfit} />
      <g transform={`scale(${k})`}>
        <g transform={`translate(${hx} ${hy})`}>{children}</g>
        {over.map(([x, y]) => <circle key={`${x} ${y}`} cx={x} cy={y} r="4" fill={C[color]} />)}
      </g>
    </Placed>
  );
}

/** The hands of a placed person drawn again on top of something they hold (a beam shared by two, a rung). Person units. */
export function HandsOver({ pose, color = "orange", build = "regular", kid, sides = ["front", "back"], ...at }: Pos & { pose: Pose; color?: Fill; build?: Build; kid?: boolean; sides?: ("front" | "back")[] }) {
  return (
    <Placed {...at} s={(at.s ?? 1) * (kid ? 0.64 : 1)}>
      {sides.map((sd) => { const [x, y] = handAt(pose, sd, build); return <circle key={sd} cx={x} cy={y} r="4" fill={C[color]} />; })}
    </Placed>
  );
}

/** A volleyball (not a football): white ball, three curved seams. Centre at x,y. */
export function Volley({ r = 14, ...at }: Pos & { r?: number }) {
  return (
    <Placed {...at}>
      <circle r={r} fill={C.white} stroke={C.ink} strokeWidth={Math.max(1.6, r * 0.11)} />
      <path d={`M${-r * 0.2} ${-r * 0.98} Q${r * 0.35} 0 ${-r * 0.2} ${r * 0.98} M${-r * 0.95} ${-r * 0.3} Q0 ${r * 0.05} ${r * 0.9} ${-r * 0.45} M${-r * 0.75} ${r * 0.65} Q0 ${r * 0.25} ${r * 0.75} ${r * 0.65}`} fill="none" stroke={C.ink} strokeWidth={Math.max(1.4, r * 0.08)} strokeLinecap="round" />
    </Placed>
  );
}

/** Svg wrapper for layered stages: every layer has the same viewBox and fills its box. */
export function LayerSvg({ viewBox, children, title }: { viewBox: string; children: ReactNode; title?: string }) {
  return (
    <svg viewBox={viewBox} className="block h-full w-full overflow-visible" preserveAspectRatio="xMidYMid slice" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** Typed CSS custom properties for inline styles, e.g. style={vars({ "--d": 2 })}. */
export const vars = (o: Record<string, string | number>) => o as CSSProperties;

/* ---------- live scenes (kit Live): small helpers shared by the /chi-siamo and /accoglienza scenes ---------- */

/** Intro order for the kit Live classes: --k (order) and, optionally, --lv-base (seconds) plus extra vars. */
export const lk = (k: number, base?: number, extra: Record<string, string | number> = {}) => vars({ "--k": k, ...(base !== undefined ? { "--lv-base": `${base}s` } : {}), ...extra });

/** A small flight of birds (ink) crossing the sky from x0 to x1 (px, relative to x,y), wings beating out of step. */
export function Birds({ x, y, x0, x1, t = 30, d = 0, s = 1 }: { x: number; y: number; x0: number; x1: number; t?: number; d?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="lv-fly" style={vars({ "--x0": `${x0}px`, "--x1": `${x1}px`, "--t": t, "--d": d })}>
        {[[0, 0, 1], [30, 14, 0.8], [56, -6, 0.9]].map(([bx, by, bs], i) => (
          <g key={i} transform={`translate(${bx} ${by}) scale(${bs})`}>
            <g className="lv-flap" style={vars({ "--d": i * 0.13 })}>
              <path d="M-14 -2 Q-7 -10 0 0 Q7 -10 14 -2" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

/** Three puffs of smoke rising from a chimney top at x,y (white), staggered. */
export function Puffs({ x, y, s = 1, color = "white" }: { x: number; y: number; s?: number; color?: Fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i % 2 ? 4 : -3} ${-10 - i * 13})`}>
          <g className="lv-puff" style={vars({ "--d": i * 1.2, "--t": 3.6, "--lv-y": "34px" })}>
            <circle r={6 + i * 1.6} fill={C[color]} />
          </g>
        </g>
      ))}
    </g>
  );
}

/** A butterfly fluttering back and forth around x,y. */
export function Butterfly({ x, y, x1 = 60, y1 = -24, t = 7, d = 0, color = "orange" }: { x: number; y: number; x1?: number; y1?: number; t?: number; d?: number; color?: Fill }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lv-move lv-alt" style={vars({ "--x1": `${x1}px`, "--y1": `${y1}px`, "--t": t, "--d": d })}>
        <g className="lv-flutter">
          <path d="M0 0 C-10 -12 -16 -2 -8 2 C-14 6 -8 12 0 2 C8 12 14 6 8 2 C16 -2 10 -12 0 0 Z" fill={C[color]} />
          <path d="M0 -5 V5" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/**
 * Someone who walks in from (x0,y0) to a door at (x1,y1) and goes in (shrinks to nothing on the threshold), forever.
 * Everything is relative to the REST spot (x,y: where the still frame shows them). Children are drawn with feet at 0,0.
 * `k` = intro order (they arrive with the people, after the land).
 */
export function Enter({ x, y, x0, x1, y0 = 0, y1 = 0, s1 = 1, t = 16, d = 0, children }: { x: number; y: number; x0: number; x1: number; y0?: number; y1?: number; s1?: number; t?: number; d?: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lv-cs-enter" style={vars({ "--x0": `${x0}px`, "--y0": `${y0}px`, "--x1": `${x1}px`, "--y1": `${y1}px`, "--s1": s1, "--t": t, "--d": d })}>
        <g className="lv-step">{children}</g>
      </g>
    </g>
  );
}
