/**
 * HOME HERO, "la valle viva". The most animated scene of the site, on the page's own white (the sky IS the page).
 * Four stacked layers share one viewBox (1440x760) inside a box with that exact ratio, so the HTML logo stays registered.
 * Each layer has an outer div for the scroll depth (.depth) and an inner one for the intro rise, never both on one node.
 *
 * Story, one subject: the house of I Locandieri on its hill, and the life around it.
 * Intro (once): hills rise one after the other, the sun comes up, trees pop up, the path draws itself, the house builds.
 * Life (loops, each in its own place and rhythm): someone climbs the path with a crate and goes in; a three-wheeled
 * farm truck full of oranges crosses the hill behind the trees; two kids pass a ball; a girl picks an orange and drops
 * it in the basket; a man digs; birds, clouds, a butterfly, swaying trees and flowers.
 * Reduced motion: everything still, in its final place.
 */
import type { CSSProperties, ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { C, INK, OliveTree, OrangeTree, Person, Placed, handAt } from "../parts";
import { Crate, Ridge, yAt, type Pt } from "./geo";

const W = 1440, H = 760;
const VB = `0 0 ${W} ${H}`;
const FAR: Pt[] = [[-20, 500], [220, 478], [460, 500], [700, 540], [860, 566], [1140, 566], [1290, 505], [1460, 470]];
const HILL: Pt[] = [[-20, 612], [300, 588], [600, 545], [860, 494], [1000, 480], [1140, 494], [1300, 535], [1460, 560]];
const GROUND: Pt[] = [[-20, 660], [240, 656], [430, 668], [600, 708], [800, 714], [1100, 702], [1460, 710]];
/** The logo stands on the crest: its foundation bar is the door the path leads to. */
const LOGO = { w: 230, cx: 1000, base: 484 };
const LOGO_H = (LOGO.w * 156) / 126;
/** Farm track across the hill (the truck's road) and the path up to the house. */
const TRACK = "M-60 646 C300 620 700 596 1000 590 C1300 594 1400 612 1500 630";
/** Points along TRACK, to seat the back row of trees just above it. */
const TRACK_PTS: Pt[] = [[-60, 646], [300, 624], [700, 600], [1000, 590], [1300, 596], [1500, 630]];
const tY = (x: number) => yAt(TRACK_PTS, x) - 6;
const PATH = "M915 760 C858 712 880 668 952 622 C1000 592 1004 556 986 528 C978 512 984 496 990 484 H1007 C1010 497 1015 512 1013 528 C1032 560 1036 600 1004 632 C952 676 958 716 1085 760 Z";

const v = (o: Record<string, string | number>) => o as CSSProperties;

function Layer({ depth, rise, children, className = "" }: { depth: number; rise: number; children: ReactNode; className?: string }) {
  return (
    <div className="hh-layer depth" style={v({ "--depth": depth })}>
      <div className={`hh-rise ${className}`} style={v({ "--k": rise })}>{children}</div>
    </div>
  );
}

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox={VB} className="absolute inset-0 block size-full overflow-visible" aria-hidden="true" focusable="false">{children}</svg>
);

/** A tree that pops up from its foot during the intro (`k` = order), then may sway. */
function PopTree({ x, y, s, k, sway, fruit = "orange", olive }: { x: number; y: number; s: number; k: number; sway?: number; fruit?: "orange" | "yellow"; olive?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="hh-pop" style={v({ "--k": k })}>
        <g className={sway !== undefined ? "sway" : undefined} style={sway !== undefined ? v({ "--d": sway }) : undefined}>
          {olive ? <OliveTree s={s} /> : <OrangeTree s={s} fruit={fruit} />}
        </g>
      </g>
    </g>
  );
}

/** Three-wheeled farm truck (motocarro), facing +x, ground point bottom centre, about 120 long. */
function Truck() {
  return (
    <g>
      {/* load: three crates of oranges */}
      <path d="M-40 -64a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M-26 -66a7.4 7.4 0 1 0 14.8 0a7.4 7.4 0 1 0 -14.8 0M-12 -64a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M2 -65a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" fill={C.orange} />
      <rect x="-48" y="-60" width="70" height="20" rx="3" fill={C.green} />
      <path d="M-44 -50H18M-25 -58V-42M-2 -58V-42" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      {/* bed and chassis */}
      <rect x="-56" y="-42" width="86" height="18" rx="4" fill={C.ink} />
      {/* cab, rounded nose, window */}
      <path d="M30 -24 V-62 C30 -68 34 -72 40 -72 H50 C60 -72 66 -62 68 -50 L70 -34 C71 -28 68 -24 62 -24 Z" fill={C.orange} />
      <path d="M38 -64 H50 C56 -64 60 -58 61 -50 H38 Z" fill={C.white} />
      <path d="M36 -40 H44" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      {/* wheels (they spin) */}
      {[-34, 56].map((cx) => (
        <g key={cx} transform={`translate(${cx} -12)`}>
          <g className="hh-wheel">
            <circle r="12" fill={C.ink} />
            <circle r="4.5" fill={C.white} />
            <path d="M0 -9 V-6" stroke={C.white} strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </g>
      ))}
    </g>
  );
}

/** Small farmhouse on the far ridge: tile roof with overhang, chimney, shuttered windows, door on a step. */
function Farmhouse({ x, y }: { x: number; y: number }) {
  return (
    <Placed x={x} y={y}>
      <rect x="18" y="-58" width="9" height="16" rx="2" fill={C.white} />
      <rect x="-40" y="-40" width="80" height="40" rx="2" fill={C.white} />
      <path d="M-48 -38 L-30 -56 H30 L48 -38 Z" fill={C.orange} stroke={C.orange} strokeWidth="3" strokeLinejoin="round" />
      <path d="M-38 -44 H38 M-32 -50 H32" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.5" />
      <rect x="-30" y="-30" width="11" height="12" rx="1.5" fill={C.green} />
      <rect x="19" y="-30" width="11" height="12" rx="1.5" fill={C.green} />
      <path d="M-6 0 V-18 C-6 -24 6 -24 6 -18 V0 Z" fill={C.yellow} />
    </Placed>
  );
}

function Butterfly() {
  return (
    <g className="hh-fly">
      <g className="hh-flap">
        <path d="M0 0 C-10 -12 -16 -2 -8 2 C-14 6 -8 12 0 2 C8 12 14 6 8 2 C16 -2 10 -12 0 0 Z" fill={C.orange} />
        <path d="M0 -5 V5" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Daisy({ x, y, s = 1, d, color = "white" }: { x: number; y: number; s?: number; d: number; color?: "white" | "yellow" }) {
  return (
    <Placed x={x} y={y} s={s} className="sway-s" style={v({ "--d": d })}>
      <path d="M0 0 C1 -8 -1 -16 0 -24" stroke={C.ink} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M-7 -26a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M-1 -26a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M-4 -31a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M-4 -21a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" fill={C[color]} />
      <circle cx="0" cy="-26" r="2.6" fill={color === "white" ? C.yellow : C.orange} />
    </Placed>
  );
}

/* --- people and the things they handle, all derived from the shared pose table so hands really touch --- */
const TREE_PICK = { x: 560, y: 676, s: 0.85, fruit: [-27, -52] as Pt };
const PICKER = (() => {
  const [hx, hy] = handAt("reach", "front");
  const ps = 0.62;
  const fx = TREE_PICK.x + TREE_PICK.fruit[0] * TREE_PICK.s, fy = TREE_PICK.y + TREE_PICK.fruit[1] * TREE_PICK.s;
  return { x: fx - hx * ps, y: fy - hy * ps, s: ps, hand: [fx, fy] as Pt };
})();
const KICKER = { x: 110, y: 744 };
const CATCHER = { x: 372, y: 742 };

/** Sky: sun (rises, rays turn), two clouds, a flight of birds that leaves from behind the first cloud. Only on the right: the left sky belongs to the text. */
function Sky() {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2, f = (n: number) => n.toFixed(1);
    return `M${f(Math.cos(a) * 80)} ${f(Math.sin(a) * 80)}L${f(Math.cos(a) * (i % 2 ? 100 : 110))} ${f(Math.sin(a) * (i % 2 ? 100 : 110))}`;
  }).join("");
  return (
    <Svg>
      <g transform="translate(1250 196)">
        <g className="hh-sun">
          <g className="spin-slow" style={v({ "--t": "50s" })}><path d={rays} stroke={C.yellow} strokeWidth="9" strokeLinecap="round" /></g>
          <circle r="64" fill={C.yellow} />
        </g>
      </g>
      <g className="hh-birds">
        {[[0, 0, 1], [34, 16, 0.8], [62, -6, 0.9]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <g className="hh-wing" style={v({ "--d": i * 0.13 })}>
              <path d="M-14 -2 Q-7 -10 0 0 Q7 -10 14 -2" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </g>
        ))}
      </g>
      <g transform="translate(840 150)"><g className="hh-cloud"><path d="M0 0a22 22 0 0 1 30 -22a30 30 0 0 1 56 6a22 22 0 0 1 20 26 Z" fill={C.green} /></g></g>
      <g transform="translate(1340 330)"><g className="hh-cloud" style={v({ "--d": 3 })}><path d="M0 0a16 16 0 0 1 22 -16a22 22 0 0 1 40 4a16 16 0 0 1 14 18 Z" fill={C.orange} /></g></g>
    </Svg>
  );
}

export function HeroLive() {
  return (
    <div className="hh-scene">
      <Layer depth={0.9} rise={0}><Sky /></Layer>

      <Layer depth={0.6} rise={1}>
        <Svg>
          <Ridge pts={FAR} bottom={H} color="green" />
          <Farmhouse x={1372} y={yAt(HILL, 1372) + 2} />
          <PopTree x={130} y={yAt(FAR, 130) + 8} s={0.5} k={0} olive sway={2} />
          <PopTree x={300} y={yAt(FAR, 300) + 10} s={0.42} k={1} olive />
        </Svg>
      </Layer>

      <Layer depth={0.3} rise={2}>
        <Svg>
          <Ridge pts={HILL} bottom={H} color="yellow" />
          {/* terraces following the hill */}
          <path d="M40 676 Q240 650 430 640 M1180 626 Q1320 640 1440 662 M120 600 Q260 584 380 578" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" opacity="0.22" />
          <path d={TRACK} fill="none" stroke={C.white} strokeWidth="13" strokeLinecap="round" />
          {/* back row of the orchard: behind the truck */}
          {[[430, 0.56, 4], [1230, 0.56, 5], [1390, 0.5, 6]].map(([x, s, k]) => <PopTree key={x} x={x!} y={tY(x!)} s={s!} k={k!} fruit={x! > 1300 ? "yellow" : "orange"} sway={x === 430 ? 1.4 : undefined} />)}
          {/* the truck crosses the hill on the farm track */}
          <g className="hh-truck"><g className="bob" style={v({ "--d": 0.6 })}><g transform="scale(0.78)"><Truck /></g></g></g>
          <path d={PATH} fill={C.white} className="hh-path" />
          {/* front row: in front of the truck */}
          <PopTree x={TREE_PICK.x} y={TREE_PICK.y} s={TREE_PICK.s} k={7} />
          <PopTree x={196} y={652} s={0.72} k={8} sway={0.4} />
          <PopTree x={1190} y={680} s={0.82} k={9} sway={2.6} />
          <PopTree x={1380} y={688} s={0.7} k={10} fruit="yellow" />
          {/* picker: her hand on a real orange; another one falls into the basket at her feet */}
          <Person color="orange" pose="reach" x={PICKER.x} y={PICKER.y} s={PICKER.s} hair="long" outfit="dress" />
          <g transform="translate(490 700)"><path d="M-17 -18 H17 L13 -2 C12.6 -0.6 11.6 0 10 0 H-10 C-11.6 0 -12.6 -0.6 -13 -2 Z" fill={C.white} /><path d="M-14 -11H14" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" /><path d="M-9 -20a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M1 -21a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" fill={C.orange} /></g>
          <g transform={`translate(${PICKER.hand[0]} ${PICKER.hand[1]})`}><g className="hh-drop"><circle r="5.2" fill={C.orange} /><path d="M0.6 -4.8l1.4 -2.6" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" /></g></g>

          <Ridge pts={GROUND} bottom={H} color="green" />
          <path d="M940 760 C900 736 902 722 918 712 L1052 708 C1060 724 1066 740 1085 760 Z" fill={C.white} />
          {/* someone climbs the path with the day's crate and goes into the house */}
          <g transform="translate(962 640)">
            <g className="hh-walk"><g className="bob" style={v({ "--d": 0.2 })}><Person color="green" pose="carry" itemColor="orange" hair="short" build="broad" s={0.75} /></g></g>
          </g>
          {/* two kids pass a ball */}
          <Person color="yellow" pose="kick" kid x={KICKER.x} y={KICKER.y} s={1.05} hair="curly" />
          <Person color="white" pose="cheer" kid x={CATCHER.x} y={CATCHER.y} s={1.05} flip hair="bun" />
          <g transform={`translate(${KICKER.x + 26} ${KICKER.y - 17})`}>
            <g className="hh-ball-x"><g className="hh-ball-y"><g className="hh-spin">
              <circle r="9" fill={C.white} />
              <path d="M-3.6 -3.2 L0 -5.6 L3.6 -3.2 L2.4 1.6 H-2.4 Z" fill={C.ink} />
            </g></g></g>
          </g>
          {/* a man digs beside the produce of the day */}
          <g transform="translate(1290 690) scale(0.9)"><g className="hh-dig"><Person color="orange" pose="dig" hair="cap" itemColor="green" /></g></g>
          <Crate x={1374} y={744} s={0.9} color="white" />
        </Svg>
        {/* the real logo, whole and flat, standing on the crest; it builds once */}
        <div className="hh-logo absolute" style={{ left: `${((LOGO.cx - LOGO.w / 2) / W) * 100}%`, top: `${((LOGO.base - LOGO_H) / H) * 100}%`, width: `${(LOGO.w / W) * 100}%` }}>
          <LogoMark build className="block h-auto w-full" />
        </div>
      </Layer>

      <Layer depth={-0.25} rise={3}>
        <Svg>
          {[[640, 752, 1, 0.2, "white"], [672, 756, 0.8, 1.6, "yellow"], [1088, 750, 1.1, 0.9, "white"], [1124, 756, 0.85, 2.3, "white"], [1160, 752, 0.95, 1.2, "yellow"], [24, 754, 0.9, 2.8, "white"], [1424, 754, 1, 0.5, "white"]].map(([x, y, s, d, c]) => (
            <Daisy key={x as number} x={x as number} y={y as number} s={s as number} d={d as number} color={c as "white" | "yellow"} />
          ))}
          <g transform="translate(1110 680)"><Butterfly /></g>
        </Svg>
      </Layer>
    </div>
  );
}
