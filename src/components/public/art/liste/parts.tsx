/**
 * Reusable SVG parts for the list/service pages (events, news, contacts, legal, credits, 404) and the generic block
 * scenes. Illustration language v4 (DESIGN.md): flat masses WITHOUT outer contours; ink only for hair/trousers/shoes
 * (inside <Person>), for things that are dark (iron posts, table and bench legs, cords) and for interior detail lines
 * (INK.fine / INK.bold, in object units). Small WHITE objects (paper, envelope, plates) may carry a fine ink contour.
 * Objects are drawn in object units (about 100 tall at s=1) and placed with <Placed> (outer transform, inner animation).
 */
import type { CSSProperties, ReactNode } from "react";
import { C, Hill, INK, Placed, type Fill } from "../parts";

type At = { x?: number; y?: number; s?: number; className?: string; style?: CSSProperties };
const ROUND = { strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
/** Ink line of a given weight, rounded caps and joins. */
export const ink = (w: number = INK.fine) => ({ stroke: C.ink, strokeWidth: w, ...ROUND });
const ORDER: Fill[] = ["yellow", "green", "orange", "white"];
/** First logo colour that is none of `not`. */
export const other = (...not: Fill[]): Fill => ORDER.find((c) => !not.includes(c)) ?? "white";

/** Root of every scene: responsive, decorative unless `title` is given. */
export function Scene({ viewBox, title, children, className, slice = false }: { viewBox: string; title?: string; children: ReactNode; className?: string; slice?: boolean }) {
  return (
    <svg
      viewBox={viewBox}
      className={className ?? "art"}
      preserveAspectRatio={slice ? "xMidYMid slice" : "xMidYMid meet"}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {children}
    </svg>
  );
}

/** Wrapper for animation of several parts together (each part keeps its own transform inside). */
export function Mv({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  return <g className={className} style={style}>{children}</g>;
}

/**
 * A village house, ONE object, about 100 wide and 125 tall (ground point = middle of the door step). Roof with overhang
 * and two rows of tiles, gutter and downpipe, chimney, a door with panel line and knob on a stone step, two mullioned
 * windows with shutters and sills. No outer contour. Not the logo: a plain gabled house.
 */
export function House({ wall = "white", roof = "orange", door = "green", glass, chimney = true, ...p }: At & { wall?: Fill; roof?: Fill; door?: Fill; glass?: Fill; chimney?: boolean }) {
  const shutter: Fill = door === wall ? other(wall, roof) : door;
  const pane: Fill = glass ?? other(wall, shutter, "orange");
  const win = (x: number) => (
    <g key={x}>
      <rect x={x - 17} y="-62" width="7" height="22" rx="1.6" fill={C[shutter]} />
      <rect x={x + 10} y="-62" width="7" height="22" rx="1.6" fill={C[shutter]} />
      <path d={`M${x - 15.6} -55H${x - 11.4}M${x - 15.6} -48H${x - 11.4}M${x + 11.4} -55H${x + 15.6}M${x + 11.4} -48H${x + 15.6}`} {...ink(1.2)} />
      <rect x={x - 9} y="-62" width="18" height="22" rx="2" fill={C[pane]} />
      <path d={`M${x} -61V-41M${x - 8} -52H${x + 8}`} stroke={C[wall]} strokeWidth="2.2" strokeLinecap="round" />
      <rect x={x - 11} y="-40.6" width="22" height="3.4" rx="1.4" fill={C[roof]} />
    </g>
  );
  return (
    <Placed {...p}>
      {chimney && (
        <g>
          <rect x="22" y="-122" width="12" height="32" rx="2" fill={C[wall]} />
          <rect x="20" y="-125" width="16" height="5" rx="2" fill={C[roof]} />
        </g>
      )}
      <rect x="-50" y="-80" width="100" height="80" rx="3" fill={C[wall]} />
      {/* roof: overhang on both sides, soft corners from a same-colour round stroke */}
      <path d="M-62 -76 L0 -121 L62 -76 Z" fill={C[roof]} stroke={C[roof]} strokeWidth="6" strokeLinejoin="round" />
      <path d="M-34 -93H34M-15 -107H15" {...ink(INK.fine)} />
      {/* gutter and downpipe: iron, so ink */}
      <path d="M-58 -71.6H58M54 -71.6V-4" {...ink(INK.bold)} />
      {win(-28)}
      {win(28)}
      <path d="M-11 -2 V-33 a11 11 0 0 1 22 0 V-2 Z" fill={C[door]} />
      <path d="M0 -42V-6" {...ink(1.2)} />
      <circle cx="6" cy="-18" r="1.6" fill={C.ink} />
      <rect x="-16" y="-4" width="32" height="5" rx="1.6" fill={C[roof]} />
    </Placed>
  );
}

/** Bench seen from the side, in scene units: plank of seat thickness 7 with its top at `h`, two iron legs. */
export function Bench({ w = 64, h = 44, fill = "white", ...p }: At & { w?: number; h?: number; fill?: Fill }) {
  return (
    <Placed {...p}>
      <path d={`M${-w / 2 + 7} ${-h + 5} L${-w / 2 + 4} 0 M${w / 2 - 7} ${-h + 5} L${w / 2 - 4} 0 M${-w / 2 + 6} ${-h * 0.35} H${w / 2 - 6}`} {...ink(3)} />
      <rect x={-w / 2} y={-h} width={w} height="7" rx="3" fill={C[fill]} />
    </Placed>
  );
}

/**
 * Long table seen from the side, in scene units: a plank top `h` above the ground, trestle legs in ink. With `cloth` a
 * tablecloth hangs over the plank, with a soft hem and two fold lines.
 */
export function Table({ w = 200, h = 56, top = "white", cloth, ...p }: At & { w?: number; h?: number; top?: Fill; cloth?: Fill }) {
  const l = -w / 2 + 22, r = w / 2 - 22;
  return (
    <Placed {...p}>
      <path d={`M${l - 9} 0 L${l} ${-h + 6} L${l + 9} 0 M${r - 9} 0 L${r} ${-h + 6} L${r + 9} 0 M${l + 4} ${-h * 0.42} H${r - 4}`} {...ink(3.4)} />
      <rect x={-w / 2} y={-h} width={w} height="9" rx="3" fill={C[top]} />
      {cloth && (
        <g>
          <path d={`M${-w / 2 - 4} ${-h - 2} H${w / 2 + 4} V${-h + 18} Q${w / 2 - 6} ${-h + 23} ${w / 4} ${-h + 19} Q0 ${-h + 24} ${-w / 4} ${-h + 19} Q${-w / 2 + 6} ${-h + 23} ${-w / 2 - 4} ${-h + 18} Z`} fill={C[cloth]} stroke={C[cloth]} strokeWidth="3" strokeLinejoin="round" />
          <path d={`M${-w / 4} ${-h + 6} V${-h + 16} M${w / 4} ${-h + 6} V${-h + 16}`} {...ink(1.8)} />
        </g>
      )}
    </Placed>
  );
}

/** Sheet of paper with ink text lines. A white sheet keeps a fine contour (white is also the background). */
export function Paper({ w = 70, h = 90, lines = 4, fill = "white", rot = 0, ...p }: At & { w?: number; h?: number; lines?: number; fill?: Fill; rot?: number }) {
  return (
    <Placed {...p}>
      <g transform={rot ? `rotate(${rot})` : undefined}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="3" fill={C[fill]} {...(fill === "white" ? { stroke: C.ink, strokeWidth: INK.fine } : {})} />
        <path d={Array.from({ length: lines }, (_, i) => `M${-w / 2 + 9} ${-h / 2 + 14 + i * 11}H${w / 2 - (i % 3 === 2 ? 22 : 9)}`).join("")} {...ink(INK.fine)} />
      </g>
    </Placed>
  );
}

/** Closed envelope, white with a fine contour; centred on 0,0. */
export function Envelope({ w = 74, fill = "white", ...p }: At & { w?: number; fill?: Fill }) {
  const h = w * 0.66;
  return (
    <Placed {...p}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="3" fill={C[fill]} stroke={C.ink} strokeWidth={INK.fine} />
      <path d={`M${-w / 2 + 3} ${-h / 2 + 3} L0 ${h * 0.1} L${w / 2 - 3} ${-h / 2 + 3}`} {...ink(INK.fine)} />
    </Placed>
  );
}

/** Paper lantern on a short cord (hangs from y=0): ink cap, round shade with two rib lines, no outline. */
export function Lantern({ fill = "yellow", ...p }: At & { fill?: Fill }) {
  return (
    <Placed {...p}>
      <path d="M0 0V19" {...ink(2.2)} />
      <rect x="-6" y="18" width="12" height="5" rx="1.6" fill={C.ink} />
      <ellipse cx="0" cy="40" rx="16" ry="18" fill={C[fill]} />
      <path d="M-15 36 Q0 41 15 36 M-14 46 Q0 51 14 46" {...ink(1.6)} />
      <rect x="-4" y="57" width="8" height="3.6" rx="1.4" fill={C.ink} />
    </Placed>
  );
}

/** String of flags between two points, sagging in the middle: a fine ink cord and soft pennants with no outline. */
export function Bunting({ x1, y1, x2, y2, n = 7, sag = 30, colors = ["orange", "yellow", "white", "green"], className, flagClass }: { x1: number; y1: number; x2: number; y2: number; n?: number; sag?: number; colors?: Fill[]; className?: string; flagClass?: string }) {
  const pt = (t: number) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + 4 * t * (1 - t) * sag] as const;
  return (
    <g className={className}>
      <path d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag * 2} ${x2} ${y2}`} {...ink(2.4)} />
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const [px, py] = pt(t);
        const tilt = ((((y2 - y1) + 4 * (1 - 2 * t) * sag) / (x2 - x1)) * 57.3).toFixed(1);
        // each flag: position on the outer group, its own swing (from the cord) on the path inside
        return (
          <g key={i} transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${tilt})`}>
            <path className={flagClass} style={flagClass ? ({ "--d": (i * 0.37) % 1.3, "--t": 2.6 + (i % 3) * 0.5 } as CSSProperties) : undefined} d="M-12 -1 H12 C13 -1 13.4 0.4 12.8 1.6 L1.6 25 C0.9 26.4 -0.9 26.4 -1.6 25 L-12.8 1.6 C-13.4 0.4 -13 -1 -12 -1 Z" fill={C[colors[i % colors.length]!]} />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Fruit crate heaped with oranges (object units, about 56 wide): no outline, ink for slat gaps, end posts and stalks.
 * Ground point = bottom centre.
 */
export function Crate({ color = "yellow", fruit = true, fruitColor, ...p }: At & { color?: Fill; fruit?: boolean; fruitColor?: Fill }) {
  const f = C[fruitColor ?? (color === "orange" ? "yellow" : "orange")];
  return (
    <Placed {...p}>
      {fruit && (
        <g>
          <path d="M-23 -24a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M-6 -26a9.6 9.6 0 1 0 19.2 0a9.6 9.6 0 1 0 -19.2 0M7 -24a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" fill={f} />
          <path d="M-13 -33l1.6 -3M3.6 -35.6l1.6 -3M17 -33l1.6 -3" {...ink(2)} />
        </g>
      )}
      <rect x="-28" y="-26" width="56" height="26" rx="3.5" fill={C[color]} />
      <path d="M-21 -17H21M-21 -9H21M-23 -22V-4M23 -22V-4" {...ink(2)} />
    </Placed>
  );
}

/** Jar of preserves (object units, about 40 tall): body, lid band in another colour, white label with two lines. */
export function Jar({ color = "orange", lid = "green", ...p }: At & { color?: Fill; lid?: Fill }) {
  return (
    <Placed {...p}>
      <path d="M-14 -30 C-17 -30 -18 -27 -18 -24 V-4 C-18 -1.6 -16.4 0 -14 0 H14 C16.4 0 18 -1.6 18 -4 V-24 C18 -27 17 -30 14 -30 Z" fill={C[color]} />
      <rect x="-13" y="-39" width="26" height="9" rx="2.4" fill={C[lid]} />
      <path d="M-13 -34.5H13" {...ink(1.4)} />
      <rect x="-12" y="-21" width="24" height="13" rx="2" fill={C.white} />
      <path d="M-7 -16.5H7M-7 -12.5H3" {...ink(1.4)} />
    </Placed>
  );
}

/**
 * Sun with rays. Same look as parts.tsx `Sun`, but coordinates are rounded: raw Math.cos/sin digits can differ between
 * Node and the browser and trigger a hydration mismatch warning.
 */
export function Sunny({ cx = 0, cy = 0, r = 40, color = "yellow", rays = 0, className }: { cx?: number; cy?: number; r?: number; color?: Fill; rays?: number; className?: string }) {
  const f = (n: number) => Math.round(n * 100) / 100;
  return (
    <g className={className}>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const [c, s] = [Math.cos(a), Math.sin(a)];
        return <line key={i} x1={f(cx + c * r * 1.28)} y1={f(cy + s * r * 1.28)} x2={f(cx + c * r * 1.62)} y2={f(cy + s * r * 1.62)} stroke={C[color]} strokeWidth={f(r * 0.14)} strokeLinecap="round" />;
      })}
      <circle cx={cx} cy={cy} r={r} fill={C[color]} />
    </g>
  );
}

/**
 * Hill that runs three times wider than the scene (one scene width of overshoot on each side), so the ground reaches the
 * edges of the screen when the hero lets its scene overflow. `waves` is per scene width.
 */
export function WideHill({ span = 800, waves = 2, ...rest }: { span?: number; y?: number; amp?: number; bottom?: number; color?: Fill; seed?: number; waves?: number; className?: string }) {
  return (
    <g transform={`translate(${-span} 0)`}>
      <Hill width={span * 3} waves={waves * 3} {...rest} />
    </g>
  );
}

/** A rounded mound (a hill with both ends on the ground), for back hills that must not run under the text. */
export function Mound({ cx, y, rx, bottom = 560, color = "green", className }: { cx: number; y: number; rx: number; bottom?: number; color?: Fill; className?: string }) {
  return <path className={className} d={`M${cx - rx} ${bottom} C${cx - rx * 0.55} ${y - (bottom - y) * 0.12} ${cx - rx * 0.3} ${y} ${cx} ${y} S${cx + rx * 0.55} ${y - (bottom - y) * 0.12} ${cx + rx} ${bottom} Z`} fill={C[color]} />;
}

/** Ground as a rounded plinth (a pill) that ends inside the scene: never runs under the text beside it. Top edge = `y`. */
export function Ground({ x = 48, y, w = 704, h = 64, color = "green" }: { x?: number; y: number; w?: number; h?: number; color?: Fill }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={C[color]} />;
}

/* ------------------------------------------------------------------ living scenes (kit <Live>, live.css) */
const v = (o: Record<string, string | number>) => o as CSSProperties;

/**
 * One depth layer of a living hero scene: the outer div drifts with the scroll (kit .depth), the inner div rises in
 * once (.lv-rise, order --k). Never both on one node.
 */
export function LiveLayer({ depth = 0, k = 0, children }: { depth?: number; k?: number; children: ReactNode }) {
  return (
    <div className="depth absolute inset-0" style={v({ "--depth": depth })}>
      <div className="lv-rise absolute inset-0" style={v({ "--k": k, "--lv-y": "40px" })}>{children}</div>
    </div>
  );
}

/** Intro wrapper for one SVG group: `pop` grows from its foot, `in` slides up; --k orders it, `base` = start (s). */
export function Intro({ kind = "pop", k = 0, base, children }: { kind?: "pop" | "in" | "reveal" | "reveal-x" | "sun" | "draw"; k?: number; base?: number; children: ReactNode }) {
  return <g className={`lv-${kind}`} style={v({ "--k": k, ...(base !== undefined ? { "--lv-base": `${base}s` } : {}) })}>{children}</g>;
}

/**
 * Two birds crossing the sky (ink, wings beating), clipped to the scene so they never fly over the text beside it.
 * Rest (still frame) at x,y; they travel from x+x0 to x+x1.
 */
export function Birds({ id, x, y, x0, x1, t = 26, d = 0, w = 800, h = 560 }: { id: string; x: number; y: number; x0: number; x1: number; t?: number; d?: number; w?: number; h?: number }) {
  return (
    <g clipPath={`url(#${id})`}>
      <clipPath id={id}><rect width={w} height={h} /></clipPath>
      <g transform={`translate(${x} ${y})`}>
        <g className="lv-fly" style={v({ "--x0": `${x0}px`, "--x1": `${x1}px`, "--y0": "6px", "--y1": "-10px", "--t": t, "--d": d })}>
          {([[0, 0, 1, 0], [24, 10, 0.78, 0.17]] as const).map(([bx, by, k, dd]) => (
            <g key={bx} transform={`translate(${bx} ${by}) scale(${k})`}>
              <g className="lv-flap" style={v({ "--d": dd })}>
                <path d="M-11 0 C-8 -6 -3 -7 0 0 C3 -7 8 -6 11 0" {...ink(2.6)} />
              </g>
            </g>
          ))}
        </g>
      </g>
    </g>
  );
}

/** Three puffs of smoke over a chimney (x,y = chimney top), white, staggered. Still frame: a small trail. */
export function Smoke({ x, y, s = 1, color = "white" }: { x: number; y: number; s?: number; color?: Fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {([[0, -6, 5, 0], [3, -18, 7, 1.2], [-1, -33, 9, 2.4]] as const).map(([cx, cy, r, dd]) => (
        <g key={dd} className="lv-puff" style={v({ "--d": dd, "--t": 3.6, "--lv-y": "30px" })}>
          <circle cx={cx} cy={cy} r={r} fill={C[color]} />
        </g>
      ))}
    </g>
  );
}
