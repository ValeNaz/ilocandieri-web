/**
 * Shared SVG parts for the illustrations. Style law (DESIGN.md): flat shapes, only the four fills
 * (--c-orange / --c-yellow / --c-green / --c-white) plus --c-ink for fine line art; no gradients, no filters, no shadows.
 * People are always drawn like the logo: a round head and an angular, house-like body. Parts take `x`,`y` (their ground point)
 * and `s` (scale, 1 = about 100 units tall) so scenes can place them in any viewBox.
 */
import type { CSSProperties, ReactNode } from "react";

export const C = { orange: "var(--c-orange)", yellow: "var(--c-yellow)", green: "var(--c-green)", white: "var(--c-white)", ink: "var(--c-ink)" } as const;
export type Fill = keyof typeof C;
type At = { x?: number; y?: number; s?: number; className?: string; style?: CSSProperties; flip?: boolean };
const place = ({ x = 0, y = 0, s = 1, flip }: At) => `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;

/**
 * Position + animation, kept on TWO nested groups. The outer <g> carries the SVG `transform` attribute (where the thing
 * stands); the inner <g> carries the animation class. A CSS animation on an element REPLACES its transform attribute, so
 * putting both on one <g> makes the object jump to the origin. Every part below uses this, and so must every scene.
 */
export function Placed({ children, ...at }: At & { children: ReactNode }) {
  return (
    <g transform={place(at)}>
      <g className={at.className} style={at.style}>{children}</g>
    </g>
  );
}

export type Pose = "stand" | "walk" | "cheer" | "carry" | "sit" | "sit-table" | "reach" | "place" | "present" | "point" | "wave" | "kick" | "bend" | "climb" | "dig";
export type Item = "crate" | "suitcase" | "basket" | "book" | "spade" | "none";
export type Hair = "short" | "bun" | "long" | "curly" | "cap" | "none";
export type Build = "slim" | "regular" | "broad";
export type Outfit = "trousers" | "dress" | "apron";
type P2 = [number, number];
type Pair<T> = [T, T];

/** Ink weights of the whole illustration system (in object units, 1 = about 100 units tall). */
export const INK = { fine: 1.8, bold: 2.6 } as const;
const ROUND = { strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

/**
 * Pose table, person drawn in three-quarter view facing +x (`flip` turns it). Points are [elbow, hand] from the
 * shoulders (±sw, -73) and [knee, ankle] from the hips (±5, -42), for the regular build; index 0 = far side (−x),
 * 1 = near side (+x). `foot` tilts each shoe (deg, toe down > 0). `lean` turns the upper body round the hips;
 * `hang` = arms given in world space for a bent body. Integrity: two arms, two legs, every hand and foot drawn.
 */
const POSES: Record<Pose, { arms: Pair<Pair<P2>>; legs: Pair<Pair<P2>>; foot?: Pair<number>; lean?: number; hang?: Pair<[P2, P2, P2]> }> = {
  stand: { arms: [[[-16, -58], [-15, -44]], [[17, -58], [18, -44]]], legs: [[[-6, -22], [-7, -3]], [[6, -22], [7, -3]]] },
  walk: { arms: [[[-17, -59], [-22, -47]], [[17, -59], [24, -49]]], legs: [[[-8, -23], [-16, -5]], [[10, -24], [13, -3]]], foot: [28, 0], lean: 4 },
  cheer: { arms: [[[-22, -85], [-26, -101]], [[22, -85], [26, -101]]], legs: [[[-9, -22], [-12, -3]], [[9, -22], [12, -3]]] },
  carry: { arms: [[[-17, -59], [-18, -50]], [[17, -59], [18, -50]]], legs: [[[-7, -22], [-9, -3]], [[7, -22], [9, -3]]], lean: -3 },
  sit: { arms: [[[-16, -58], [-14, -45]], [[18, -57], [24, -44]]], legs: [[[21, -40], [22, -3]], [[27, -40], [28, -3]]], lean: -4 },
  "sit-table": { arms: [[[-16, -58], [-14, -45]], [[24, -60], [36, -59]]], legs: [[[21, -40], [22, -3]], [[27, -40], [28, -3]]] },
  place: { arms: [[[-16, -58], [-15, -44]], [[25, -66], [37, -71]]], legs: [[[-6, -22], [-7, -3]], [[6, -22], [7, -3]]] },
  present: { arms: [[[-17, -60], [-13, -57]], [[18, -60], [15, -57]]], legs: [[[-6, -22], [-7, -3]], [[6, -22], [7, -3]]] },
  point: { arms: [[[-16, -58], [-15, -44]], [[25, -74], [38, -80]]], legs: [[[-6, -22], [-7, -3]], [[6, -22], [7, -3]]] },
  reach: { arms: [[[-16, -58], [-15, -44]], [[16, -89], [18, -105]]], legs: [[[-6, -22], [-7, -4]], [[6, -22], [8, -5]]], foot: [12, 14] },
  wave: { arms: [[[-16, -58], [-15, -44]], [[23, -78], [26, -95]]], legs: [[[-6, -22], [-7, -3]], [[6, -22], [7, -3]]] },
  kick: { arms: [[[-23, -66], [-31, -58]], [[21, -67], [29, -73]]], legs: [[[-4, -22], [-6, -3]], [[17, -31], [31, -27]]], foot: [0, -18] },
  bend: { arms: [[[0, 0], [0, 0]], [[0, 0], [0, 0]]], legs: [[[-6, -22], [-7, -3]], [[6, -22], [8, -3]]], lean: 52, hang: [[[22, -63], [24, -44], [24, -27]], [[30, -54], [35, -36], [37, -20]]] },
  climb: { arms: [[[-14, -88], [-8, -104]], [[19, -82], [16, -97]]], legs: [[[-6, -22], [-7, -3]], [[14, -36], [12, -20]]], foot: [0, 0] },
  dig: { arms: [[[3, -57], [22, -53]], [[22, -70], [16, -82]]], legs: [[[-8, -22], [-11, -3]], [[8, -22], [11, -3]]] },
};

const BUILD: Record<Build, { sw: number; hw: number }> = { slim: { sw: 10.5, hw: 8.5 }, regular: { sw: 12, hw: 9.5 }, broad: { sw: 14.5, hw: 12 } };

/** Small deterministic hash: variety without randomness, so server and client markup always match. */
function pick<T>(list: readonly T[], ...seed: number[]): T {
  let h = 2166136261;
  for (const v of seed) h = Math.imul(h ^ Math.round(v * 7), 16777619);
  return list[(h >>> 0) % list.length]!;
}
const COLORS: Fill[] = ["orange", "yellow", "green", "white"];

/** Where a hand ends, in person units (feet at 0,0, unflipped, before `kid` scaling). Used by things held in a hand. */
export function handAt(pose: Pose, side: "front" | "back", build: Build = "regular"): P2 {
  const p = POSES[pose];
  const i = side === "front" ? 1 : 0;
  if (p.hang) return p.hang[i][2];
  const dx = (BUILD[build].sw - 12) * (i ? 1 : -1);
  const [x, y] = p.arms[i][1];
  if (!p.lean) return [x + dx, y];
  const a = (p.lean * Math.PI) / 180, rx = x + dx, ry = y + 42;
  return [rx * Math.cos(a) - ry * Math.sin(a), rx * Math.sin(a) + ry * Math.cos(a) - 42];
}

/** Hair (ink), drawn for a head of radius 9 centred at 0,0, facing +x; the mass sits at the back of the head. */
function HairShape({ hair }: { hair: Hair }) {
  const f = C.ink;
  switch (hair) {
    case "short":
      return <path d="M-9.4 1 C-10.2 -6 -4.5 -10.6 1.5 -10 C6 -9.6 9 -6.5 9.2 -3.4 C6.5 -5.4 3.2 -5.8 0.6 -4.6 C-1.4 -2.2 -3.4 -0.6 -5.2 0.4 C-5.6 2.8 -5.4 4.6 -4.8 6.4 C-7.6 5.6 -9.2 3.6 -9.4 1 Z" fill={f} />;
    case "bun":
      return (
        <>
          <circle cx="-6.8" cy="-8.6" r="4.4" fill={f} />
          <path d="M-9.4 2 C-10.4 -5.8 -4.8 -10.4 1 -10 C5.8 -9.6 9 -6.6 9.3 -3 C5.6 -5.8 1.4 -5.6 -1.6 -3.4 C-3.6 -1.4 -4.6 1.4 -4.4 5 C-7.6 4.6 -9.2 3.6 -9.4 2 Z" fill={f} />
        </>
      );
    case "long":
      return <path d="M-9.4 0 C-10 -6.6 -4.6 -10.6 1.2 -10 C6.2 -9.6 9.2 -6.4 9.3 -3 C5.6 -5.6 1.8 -5.6 -0.8 -3.8 C-3.4 0 -3.8 5 -2.6 10.4 C-1.8 13 -0.6 15 0.6 16.4 C-5.4 17.4 -10.4 14.4 -11.6 9 C-12.2 5.6 -10.2 3.4 -9.4 0 Z" fill={f} />;
    case "curly":
      return <path d="M-11.4 2.2a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0M-10.6 -4.4a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0M-6.6 -8.2a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0M-0.6 -8.4a4.2 4.2 0 1 0 8.4 0a4.2 4.2 0 1 0 -8.4 0M4.2 -5a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0" fill={f} />;
    case "cap":
      return <path d="M-9.6 -1.2 C-9.8 -7.4 -5 -11 0.4 -11 C5.6 -11 9.4 -7.4 9.6 -2.6 L15.4 -2.2 C16.8 -2.1 16.8 0.4 15.4 0.5 L-8.4 1.4 C-9.2 1.4 -9.6 0.4 -9.6 -1.2 Z" fill={f} />;
    default:
      return null;
  }
}

/** One leg: two straight segments with a round knee, and a shoe at the ankle (toe towards +x). */
function leg(hip: P2, [knee, ankle]: Pair<P2>, foot: number, w: number, color: string, key: number) {
  return (
    <g key={key}>
      <path d={`M${hip[0]} ${hip[1]} L${knee[0]} ${knee[1]}`} stroke={color} strokeWidth={w * 1.22} {...ROUND} />
      <path d={`M${knee[0]} ${knee[1]} L${ankle[0]} ${ankle[1]}`} stroke={color} strokeWidth={w} {...ROUND} />
      <rect x={ankle[0] - 3.4} y={ankle[1] - 1.6} width="11" height="5.2" rx="2.6" fill={C.ink} transform={foot ? `rotate(${foot} ${ankle[0]} ${ankle[1]})` : undefined} />
    </g>
  );
}

/** Things carried in the hands, in person units. They are drawn BEFORE the hands, so fingers close over handles and edges. */
function Carried({ what, box, fruit, pose, build }: { what: Item; box: Fill; fruit: string; pose: Pose; build: Build }) {
  if (what === "crate") {
    return (
      <g>
        {/* oranges heaped above the rim, each with its stalk */}
        <path d="M-15.5 -60a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M-5.5 -62a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0M5 -60a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" fill={fruit} />
        <path d="M-10.5 -65v-1.6M0 -67.4v-1.6M10 -65v-1.6" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
        <rect x="-19" y="-61" width="38" height="20" rx="3" fill={C[box]} />
        {/* slats and the end posts of a fruit crate */}
        <path d="M-15.5 -54.4H15.5M-15.5 -47.6H15.5M-13.4 -58.6v15M13.4 -58.6v15" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      </g>
    );
  }
  if (what === "basket") {
    return (
      <g>
        <path d="M-12 -58 C-12 -71 12 -71 12 -58" stroke={C.ink} strokeWidth={INK.bold} {...ROUND} />
        <path d="M-9.5 -62a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0M0.5 -62.4a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0" fill={fruit} />
        <path d="M-18 -60 H18 C18.6 -60 18.9 -59.4 18.6 -58.8 L14.2 -43.4 C13.8 -42.2 12.9 -41.6 11.6 -41.6 H-11.6 C-12.9 -41.6 -13.8 -42.2 -14.2 -43.4 L-18.6 -58.8 C-18.9 -59.4 -18.6 -60 -18 -60 Z" fill={C[box]} />
        <path d="M-15 -54H15M-13.2 -48H13.2M-8 -58.4l1.6 15M0 -58.4v15M8 -58.4l-1.6 15" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      </g>
    );
  }
  if (what === "suitcase") {
    const [hx, hy] = handAt(pose, "front", build);
    return (
      <g transform={`translate(${hx} ${hy})`}>
        <path d="M-4.6 5.6 V2.4 C-4.6 0.6 -3.6 -0.4 -2 -0.4 H2 C3.6 -0.4 4.6 0.6 4.6 2.4 V5.6" stroke={C.ink} strokeWidth={INK.bold} {...ROUND} />
        <rect x="-12" y="5" width="24" height="31" rx="4" fill={C[box]} />
        <path d="M-12 12.4H12M-6 5v31M6 5v31" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      </g>
    );
  }
  if (what === "book") {
    const [hx, hy] = handAt(pose, "front", build);
    return (
      <g transform={`translate(${hx} ${hy}) rotate(-12)`}>
        <rect x="-6" y="-12" width="15" height="19" rx="2" fill={C[box]} />
        <path d="M-3.4 -12V7M0 -6.6H6M0 -2.8H5" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      </g>
    );
  }
  if (what === "spade") {
    const [hx, hy] = handAt(pose, "front", build);
    // T-grip at the high hand, shaft down through the low hand, blade resting on the soil
    return (
      <g>
        <path d={`M${hx + 1} ${hy - 4} L30 -12`} stroke={C.ink} strokeWidth="3.4" {...ROUND} />
        <path d={`M${hx - 4} ${hy - 5} H${hx + 6}`} stroke={C.ink} strokeWidth="3.4" {...ROUND} />
        <path d="M24 -14 H36 C37.2 -14 38 -13.2 38 -12 V-4 C38 -1.6 34.6 0 30 0 C25.4 0 22 -1.6 22 -4 V-12 C22 -13.2 22.8 -14 24 -14 Z" fill={C[box]} transform="rotate(-9 30 -7)" />
      </g>
    );
  }
  return null;
}

/**
 * A person, the only way people are drawn on the site. One body colour from head to sleeves (heads are ALWAYS the body
 * colour); ink only for hair, trousers and shoes. Three-quarter view facing +x, `flip` turns them round. Proportions:
 * about 5.5 heads, elbows and knees, hands that close over what they hold, both feet on the ground (feet at 0,0).
 * Variety comes from `hair`, `build`, `outfit`; when not given they are derived from the figure's place, so every
 * figure in a crowd is a different person. `item`: crate / basket (held in front with both hands), suitcase, book,
 * spade (in the near hand). `hold` draws any custom object at the near hand, under the fingers.
 * Choose `color` so the figure contrasts with what is directly behind it. `head` is accepted and IGNORED.
 */
export function Person({ color = "orange", pose = "stand", kid, item, itemColor = "yellow", hair, build, outfit, hold, holdBack, ...rest }: At & { color?: Fill; head?: Fill; pose?: Pose; kid?: boolean; item?: Item; itemColor?: Fill; hair?: Hair; build?: Build; outfit?: Outfit; hold?: ReactNode; holdBack?: ReactNode }) {
  const { head: _ignored, ...at } = rest as At & { head?: Fill };
  const seed = [at.x ?? 0, at.y ?? 0, COLORS.indexOf(color), at.s ?? 1];
  const b: Build = build ?? (kid ? "slim" : pick(["regular", "slim", "broad", "regular"], ...seed));
  const h: Hair = hair ?? pick(kid ? ["short", "curly", "bun", "short"] : ["short", "bun", "long", "curly", "cap", "short", "long"], ...seed, 3);
  const o: Outfit = outfit ?? (pose === "kick" || pose === "climb" || pose === "sit" || pose === "sit-table" ? "trousers" : pick(["trousers", "trousers", "dress"], ...seed, 5));
  const f = C[color];
  const p = POSES[pose];
  const { sw, hw } = BUILD[pose === "bend" ? "slim" : b];
  const what: Item = item ?? (pose === "carry" ? "crate" : pose === "dig" ? "spade" : "none");
  // carried things never melt into the body: the first logo colour that differs from it
  const box: Fill = itemColor === color ? COLORS.find((c) => c !== color)! : itemColor;
  // fruit sits above the rim, against the shirt: oranges, or lemons on an orange shirt, never the shirt's colour
  const fruit = C[(["orange", "yellow", "white"] as Fill[]).find((c) => c !== color)!];
  const headR = kid ? 11 : 9;
  const headY = kid ? -87 : -88.5;
    const legW = o === "dress" ? 5.6 : 7.4;
  const foot = p.foot ?? [0, 0];
  const shoulders: Pair<P2> = [[-sw + 1.6, -72.5], [sw - 1.6, -72.5]];
  const dx = sw - 12;

  const arm = ([[ex, ey], [hx, hy]]: Pair<P2>, i: number, root: P2) => {
    const s = i ? dx : -dx;
    return <path key={`arm${i}`} d={`M${root[0]} ${root[1]} L${ex + s} ${ey} L${hx + s} ${hy}`} stroke={f} strokeWidth="6.6" {...ROUND} />;
  };
  const hand = ([, [hx, hy]]: Pair<P2>, i: number) => <circle key={`hand${i}`} cx={hx + (i ? dx : -dx)} cy={hy} r="4" fill={f} />;

  const upper = (
    <g transform={p.lean ? `rotate(${p.lean} 0 -42)` : undefined}>
      {/* far arm first: it passes behind the body */}
      {!p.hang && arm(p.arms[0], 0, shoulders[0])}
      {!p.hang && holdBack && <g transform={`translate(${p.arms[0][1][0] - dx} ${p.arms[0][1][1]})`}>{holdBack}</g>}
      {!p.hang && hand(p.arms[0], 0)}
      <rect x="-3.2" y={headY + headR - 3} width="6.4" height="8" rx="3" fill={f} />
      {/* shirt: rounded shoulders, narrower waist */}
      <path d={`M${-sw} -67 C${-sw} -73.6 ${-sw + 3} -76.6 ${-sw + 8} -76.6 H${sw - 8} C${sw - 3} -76.6 ${sw} -73.6 ${sw} -67 L${hw} -43.4 C${hw} -41.4 ${hw - 1.4} -40.4 ${hw - 3.4} -40.4 H${-hw + 3.4} C${-hw + 1.4} -40.4 ${-hw} -41.4 ${-hw} -43.4 Z`} fill={f} />
      {o === "apron" && color !== "white" && (
        <g>
          <path d="M-5 -74 C-4 -78 4 -78 5 -74" stroke={C.white} strokeWidth={INK.bold} {...ROUND} />
          <path d={`M-7.6 -72 H7.6 C8.6 -72 9.2 -71.4 9.2 -70.4 L${hw + 1.6} -28 C${hw + 1.6} -26.6 ${hw + 0.6} -25.6 ${hw - 0.8} -25.6 H${-hw + 0.8} C${-hw - 0.6} -25.6 ${-hw - 1.6} -26.6 ${-hw - 1.6} -28 L-9.2 -70.4 C-9.2 -71.4 -8.6 -72 -7.6 -72 Z`} fill={C.white} />
        </g>
      )}
      <g transform={`translate(0 ${headY})`}>
        <circle r={headR} fill={f} />
        {/* the nose turns the head the way the body faces */}
        <circle cx={headR * 0.93} cy={headR * 0.18} r={headR * 0.24} fill={f} />
        <circle cx={headR * 0.42} cy={-headR * 0.02} r={headR * 0.12} fill={C.ink} />
        <g transform={`scale(${headR / 9})`}><HairShape hair={h} /></g>
      </g>
      {(what === "crate" || what === "basket") && <Carried what={what} box={box} fruit={fruit} pose={pose} build={b} />}
      {!p.hang && arm(p.arms[1], 1, shoulders[1])}
      {!p.hang && (what === "suitcase" || what === "book" || what === "spade") && <Carried what={what} box={box} fruit={fruit} pose={pose} build={b} />}
      {/* `present` holds the object with both hands, centred between them; every other pose holds it in the near hand */}
      {!p.hang && hold && (pose === "present" ? <g transform="translate(1 -57)">{hold}</g> : <g transform={`translate(${p.arms[1][1][0] + dx} ${p.arms[1][1][1]})`}>{hold}</g>)}
      {!p.hang && hand(p.arms[1], 1)}
      {/* in the carry pose both hands close over the crate's ends */}
      {(what === "crate" || what === "basket" || (pose === "present" && hold)) && !p.hang && <g>{hand(p.arms[0], 0)}</g>}
    </g>
  );

  const hips: Pair<P2> = [[-5, -42], [5, -42]];
  return (
    <Placed {...at} s={(at.s ?? 1) * (kid ? 0.64 : 1)}>
      {p.legs.map((l, i) => leg(hips[i]!, l, foot[i]!, legW, C.ink, i))}
      {o === "dress" ? (
        <path d={`M${-hw + 0.6} -48 H${hw - 0.6} L${hw + 5.4} -25.8 C${hw + 5.8} -24.4 ${hw + 4.8} -23.2 ${hw + 3.4} -23.2 H${-hw - 3.4} C${-hw - 4.8} -23.2 ${-hw - 5.8} -24.4 ${-hw - 5.4} -25.8 Z`} fill={f} />
      ) : (
        <rect x={-hw + 0.4} y="-46" width={hw * 2 - 0.8} height="10" rx="4" fill={C.ink} />
      )}
      {upper}
      {p.hang?.map(([sh, el, hd], i) => (
        <g key={i}>
          <path d={`M${sh[0]} ${sh[1]} L${el[0]} ${el[1]} L${hd[0]} ${hd[1]}`} stroke={f} strokeWidth="6.6" {...ROUND} />
          {i === 1 && hold && <g transform={`translate(${hd[0]} ${hd[1]})`}>{hold}</g>}
          <circle cx={hd[0]} cy={hd[1]} r="4" fill={f} />
        </g>
      ))}
    </Placed>
  );
}

/** Round sun, optional rays (thick rounded strokes). */
export function Sun({ cx = 0, cy = 0, r = 40, color = "yellow", rays = 0, className }: { cx?: number; cy?: number; r?: number; color?: Fill; rays?: number; className?: string }) {
  return (
    <g className={className}>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const f = (v: number) => Number(v.toFixed(2));
        const x1 = f(cx + Math.cos(a) * (r + r * 0.28)), y1 = f(cy + Math.sin(a) * (r + r * 0.28));
        const x2 = f(cx + Math.cos(a) * (r + r * 0.62)), y2 = f(cy + Math.sin(a) * (r + r * 0.62));
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C[color]} strokeWidth={r * 0.14} strokeLinecap="round" />;
      })}
      <circle cx={cx} cy={cy} r={r} fill={C[color]} />
    </g>
  );
}

/** A soft hill band: wavy top edge, filled to `bottom`. `seed` shifts the waves. */
export function Hill({ width = 1600, y = 0, amp = 40, bottom = 800, color = "green", seed = 0, waves = 2.2, className }: { width?: number; y?: number; amp?: number; bottom?: number; color?: Fill; seed?: number; waves?: number; className?: string }) {
  const pts: string[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push(`${(t * width).toFixed(1)} ${(y + Math.sin(t * Math.PI * 2 * waves + seed) * amp + Math.sin(t * Math.PI * 2 * waves * 2.3 + seed * 1.7) * amp * 0.35).toFixed(1)}`);
  }
  return <path className={className} d={`M0 ${bottom} L${pts.join(" L")} L${width} ${bottom} Z`} fill={C[color]} />;
}

/** Cloud made of three circles and a flat base. */
export function Cloud({ x = 0, y = 0, s = 1, color = "white", className, style }: At & { color?: Fill }) {
  return (
    <Placed x={x} y={y} s={s} className={className} style={style}>
      <circle cx="0" cy="0" r="22" fill={C[color]} /><circle cx="28" cy="-12" r="30" fill={C[color]} /><circle cx="62" cy="2" r="22" fill={C[color]} />
      <rect x="-22" y="0" width="106" height="22" rx="11" fill={C[color]} />
    </Placed>
  );
}

const disc = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/**
 * Citrus tree (orange or lemon), the one fruit tree of the whole site. Ink trunk that flares at the foot and forks into
 * the crown; the crown is a few organic masses (fine ink lines mark where they overlap); fruit hang at the edges with
 * their stalks. Ground point = foot of the trunk, about 106 units tall at s=1.
 */
export function OrangeTree({ crown = "green", fruit = "orange", ...at }: At & { crown?: Fill; fruit?: Fill }) {
  const fruits: [number, number][] = [[-27, -52], [-12, -46], [20, -50], [30, -66], [-30, -74], [6, -62], [14, -92], [-16, -86]];
  return (
    <Placed {...at}>
      <path d="M-7 0 C-4.6 -6 -4 -16 -3.6 -26 C-3.4 -32 -6 -38 -12 -46 L-8.6 -48.6 C-4.4 -43.4 -1.6 -40 0.4 -36.4 C2 -42 5.4 -47.6 10.6 -52 L13.6 -49.2 C8.4 -44 5 -36 4.2 -26 C3.8 -16 4.4 -6 7.4 0 Z" fill={C.ink} />
      {/* crown: five masses, plus three leaves breaking the outline so it never reads as a bunch of balloons */}
      <path d={disc(0, -70, 29) + disc(-24, -60, 20) + disc(24, -61, 21) + disc(-12, -88, 18) + disc(13, -90, 17) + "M-42 -66 C-48 -72 -52 -72 -55 -70 C-52 -64 -47 -62 -42 -62 Z M42 -70 C47 -77 52 -78 55 -76 C53 -70 48 -67 42 -66 Z M0 -104 C-2 -110 0 -115 4 -117 C7 -112 6 -107 3 -104 Z"} fill={C[crown]} />
      <path d={fruits.map(([x, y]) => disc(x, y, 5.6)).join("")} fill={C[fruit === crown ? "orange" : fruit]} />
      <path d={fruits.map(([x, y]) => `M${x + 0.6} ${y - 5.2}l1.4 -2.6`).join("")} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
    </Placed>
  );
}

/**
 * Olive tree: a short, twisted ink trunk that splits in three, a wide and low crown of overlapping soft masses, a few
 * leaves turned to show their silver underside (white), dark olives. Ground point = foot of the trunk.
 */
export function OliveTree({ color = "green", ...at }: At & { color?: Fill }) {
  const leaves: [number, number][] = [[-36, -62], [-18, -80], [6, -86], [28, -78], [42, -62], [-8, -58]];
  const olives: [number, number][] = [[-24, -49], [-2, -70], [20, -60], [38, -52], [-30, -70]];
  return (
    <Placed {...at}>
      <path d="M-13 0 C-7 -6 -10 -16 -7 -25 C-5 -32 -11 -38 -16 -46 L-12 -48.6 C-7 -43 -3 -39 -1.6 -34 C-1 -40 -2 -46 0 -52 L4 -51 C3 -45 3.4 -40 4.4 -35 C7 -41 12 -45 18 -50 L20.6 -46.6 C14 -41 9 -34 8 -26 C7 -16 11 -6 17 0 Z" fill={C.ink} />
      <path d={disc(-26, -60, 17) + disc(-6, -72, 20) + disc(18, -70, 19) + disc(36, -60, 14) + disc(6, -56, 16) + disc(-40, -56, 11)} fill={C[color]} />
      <path d={leaves.map(([x, y]) => `M${x - 6} ${y} C${x - 2} ${y - 3.6} ${x + 2} ${y - 3.6} ${x + 6} ${y} C${x + 2} ${y + 3.6} ${x - 2} ${y + 3.6} ${x - 6} ${y} Z`).join("")} fill={C[color === "white" ? "green" : "white"]} />
      <path d={olives.map(([x, y]) => `M${x - 2} ${y}a2 2.6 0 1 0 4 0a2 2.6 0 1 0 -4 0`).join("")} fill={C.ink} />
    </Placed>
  );
}

/** Ear of wheat on a stem; add className="sway" for wind. */
export function Wheat({ color = "yellow", h = 90, ...at }: At & { color?: Fill; h?: number }) {
  const grains = Math.round(h / 12);
  return (
    <Placed {...at}>
      <line x1="0" y1="0" x2="0" y2={-h} stroke={C.green} strokeWidth="2.5" strokeLinecap="round" />
      {Array.from({ length: grains }, (_, i) => {
        const gy = -h * 0.45 - i * ((h * 0.55) / grains);
        return <g key={i}><ellipse cx="-4.5" cy={gy} rx="3" ry="6" transform={`rotate(-24 -4.5 ${gy})`} fill={C[color]} /><ellipse cx="4.5" cy={gy - 5} rx="3" ry="6" transform={`rotate(24 4.5 ${gy - 5})`} fill={C[color]} /></g>;
      })}
      <ellipse cx="0" cy={-h - 8} rx="3" ry="7" fill={C[color]} />
    </Placed>
  );
}

/** Doric column (Selinunte): fluted shaft, echinus + abacus capital. */
export function Column({ h = 160, w = 34, color = "white", ...at }: At & { color?: Fill; h?: number; w?: number }) {
  return (
    <Placed {...at}>
      <rect x={-w / 2 - 6} y="-10" width={w + 12} height="10" rx="2" fill={C[color]} />
      <rect x={-w / 2} y={-h + 18} width={w} height={h - 28} fill={C[color]} />
      {[-0.25, 0, 0.25].map((k, i) => <line key={i} x1={k * w} y1={-h + 22} x2={k * w} y2="-12" stroke={C.ink} strokeWidth="1.6" opacity="0.5" />)}
      <path d={`M${-w / 2 - 4} ${-h + 18} Q0 ${-h + 8} ${w / 2 + 4} ${-h + 18} Z`} fill={C[color]} />
      <rect x={-w / 2 - 10} y={-h} width={w + 20} height="9" rx="2" fill={C[color]} />
    </Placed>
  );
}

/** Football: white ball with a ring of ink patches. */
export function Ball({ r = 14, ...at }: At & { r?: number }) {
  return (
    <Placed {...at}>
      <circle r={r} fill={C.white} stroke={C.ink} strokeWidth={r * 0.12} />
      <polygon points={`0,${-r * 0.42} ${r * 0.4},${-r * 0.13} ${r * 0.25},${r * 0.34} ${-r * 0.25},${r * 0.34} ${-r * 0.4},${-r * 0.13}`} fill={C.ink} />
    </Placed>
  );
}

/** Dotted route between points (dashed round stroke; animate with .march or .draw-scroll via pathLength=1 on a solid copy). */
export function Route({ d, color = "ink", width = 4, className }: { d: string; color?: Fill; width?: number; className?: string }) {
  return <path d={d} fill="none" stroke={C[color]} strokeWidth={width} strokeLinecap="round" strokeDasharray={`0.1 ${width * 2.6}`} className={className} />;
}

/** Wrapper that sets the standard responsive SVG attributes. */
export function Art({ viewBox, children, className, title, desc }: { viewBox: string; children: ReactNode; className?: string; title?: string; desc?: string }) {
  return (
    <svg viewBox={viewBox} className={className ?? "art"} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} preserveAspectRatio="xMidYMid slice" focusable="false">
      {title && <title>{title}</title>}
      {desc && <desc>{desc}</desc>}
      {children}
    </svg>
  );
}
