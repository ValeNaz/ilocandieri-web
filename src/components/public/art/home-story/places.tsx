/**
 * Illustrations of the two places, built in layers for the kit <Stage> (pointer / idle parallax).
 * Each layer is its own svg of the same 600x660 drawing (see Plane for how edges are kept covered).
 * v4 language: no outer contours, ink only for dark things and fine interior detail; people DO the work (DESIGN.md).
 * Things that touch (a hand on a fruit, a hand under a falling ball) are always drawn in the SAME layer, so the parallax
 * never pulls them apart.
 * Live scenes like the Home hero (kit <Live>): the land builds itself once in view (ground, trees, then people),
 * then small loops of life. Reduced motion / no JS: the still final frame.
 */
import type { CSSProperties, ReactNode } from "react";
import { Layer, Stage } from "@/components/public/kit/Stage";
import { Live } from "@/components/public/kit/Live";
import { C, INK, Ball, Birds, Chimney, Cloud, Cone, Crate, Door, Hill, Lettuce, OrangeTree, Person, Roof, Sun, Win, handAt } from "./parts";

/** Bleeds only sideways; grounds are drawn past the bottom edge (visible overflow) and the sky is the panel colour, so the parallax never opens a gap and nothing standing on the ground loses its feet. */
function Plane({ z, children }: { z: number; children: ReactNode }) {
  return (
    <Layer z={z} style={{ inset: "0 -5%" }}>
      <svg viewBox="0 0 600 660" preserveAspectRatio="xMidYMax slice" className="size-full overflow-visible" aria-hidden="true" focusable="false">{children}</svg>
    </Layer>
  );
}
const d = (n: number) => ({ "--d": n }) as CSSProperties;
const v = (o: Record<string, string | number>) => o as CSSProperties;

/* ---------------- Giardino delle Arance ---------------- */

/** The tree the picker works on (static), and the fruit in her hand: right side of the crown. */
const PICK_TREE = { x: 482, y: 560, s: 0.78 };
const PICK_FRUIT: [number, number] = [PICK_TREE.x + 30 * PICK_TREE.s, PICK_TREE.y - 66 * PICK_TREE.s];
const PICKER = (() => {
  const s = 0.96, [hx, hy] = handAt("reach", "front", "slim");
  return { s, x: PICK_FRUIT[0] + hx * s, y: PICK_FRUIT[1] - hy * s };
})();
/** The weeder (bent, facing left) and the lettuce under her near hand. */
const WEEDER = { x: 318, y: 642, s: 0.9 };
const WEED_AT = (() => {
  const [hx, hy] = handAt("bend", "front");
  return [WEEDER.x - hx * WEEDER.s, WEEDER.y + hy * WEEDER.s + 6] as const;
})();

function GardenSky() {
  return (
    <>
      <g className="lv-sun" style={v({ "--lv-base": "0.3s" })}><Sun cx={470} cy={150} r={40} color="white" rays={12} className="spin-slow" /></g>
      <Birds x={150} y={200} x0={-300} x1={520} t={23} d={2} />
      <g className="lv-rise" style={v({ "--k": 0 })}><Hill width={600} y={352} amp={26} bottom={760} color="green" seed={1.1} waves={1.4} /></g>
    </>
  );
}

function GardenFarmhouse() {
  return (
    <>
      <g className="lv-rise" style={v({ "--k": 1 })}><rect x="-60" y="440" width="720" height="320" fill={C.orange} /></g>
      {/* casolare di fine Settecento: chimney, hipped roof of coppi with gutter and downpipe, oculus, shuttered windows,
          arched door on its step, a stone bench against the wall */}
      <g className="lv-rise" style={v({ "--k": 2 })}><g transform="translate(14 0)">
        <Chimney x={292} y={262} w={24} h={36} color="orange" />
        <rect x="78" y="292" width="286" height="160" rx="3" fill={C.white} />
        <Roof x1={56} x2={386} eave={298} ridge={240} inset={58} rows={3} />
        <path d="M356 303 V448" stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" />
        <Win x={104} y={330} w={44} h={56} lit shutters />
        <Win x={294} y={330} w={44} h={56} lit shutters />
        <circle cx="222" cy="334" r="13" fill={C.yellow} />
        <path d="M209 334 H235 M222 321 V347" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
        <Door x={194} y={452} w={56} h={78} color="orange" step="yellow" />
        <rect x="270" y="426" width="58" height="8" rx="3" fill={C.yellow} />
        <path d="M276 434 V446 M322 434 V446" stroke={C.yellow} strokeWidth="5" strokeLinecap="round" />
      </g></g>
      {/* the citrus grove beside it, far row */}
      {[404, 456, 508].map((x, i) => <g key={x} className="lv-pop" style={v({ "--k": i, "--lv-base": "0.85s" })}><OrangeTree x={x} y={500} s={0.55} /></g>)}
    </>
  );
}

function GardenBeds() {
  return (
    <>
      <g className="lv-rise" style={v({ "--k": 3 })}>
        <path d="M-60 566 Q300 548 660 566 V760 H-60 Z" fill={C.green} />
        {/* furrows of the beds */}
        <path d="M-20 660 L170 562 M160 660 L262 560 M340 660 L352 560" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.45" />
      </g>
      {/* the near citrus row stands at the edge of the beds; one tree moves in the wind */}
      <g className="lv-pop" style={v({ "--k": 3, "--lv-base": "0.85s" })}><OrangeTree x={404} y={560} s={0.76} className="sway" style={d(1.4)} /></g>
      <g className="lv-pop" style={v({ "--k": 4, "--lv-base": "0.85s" })}><OrangeTree x={PICK_TREE.x} y={PICK_TREE.y} s={PICK_TREE.s} /></g>
      {/* lettuces in the beds, one under the weeder's hand */}
      <g className="lv-pop" style={v({ "--k": 0, "--lv-base": "1.2s" })}><Lettuce x={56} y={600} s={0.9} /></g>
      <g className="lv-pop" style={v({ "--k": 1, "--lv-base": "1.2s" })}><Lettuce x={214} y={598} s={0.8} heart="orange" /></g>
      <g className="lv-pop" style={v({ "--k": 2, "--lv-base": "1.2s" })}><Lettuce x={WEED_AT[0]} y={WEED_AT[1]} s={0.85} /></g>
      <g className="lv-pop" style={v({ "--k": 3, "--lv-base": "1.2s" })}><Lettuce x={384} y={630} s={0.95} heart="orange" /></g>
      {/* the morning's oranges, in a crate at the foot of the trees */}
      <g className="lv-pop" style={v({ "--k": 4, "--lv-base": "1.2s" })}><Crate x={418} y={598} w={56} h={30} color="yellow" produce={{ c: "orange", n: 3 }} /></g>
      {/* people at work: one picks an orange that is really at her hand, one brings a full crate, one weeds */}
      <g className="lv-in" style={v({ "--k": 0, "--lv-base": "1.6s" })}><Person x={PICKER.x} y={PICKER.y} s={PICKER.s} color="yellow" pose="reach" build="slim" hair="bun" outfit="dress" flip /></g>
      {/* life: the orange she picks drops into the crate */}
      <g transform={`translate(${PICK_FRUIT[0].toFixed(1)} ${PICK_FRUIT[1].toFixed(1)})`}>
        <g className="lv-drop" style={v({ "--dx": `${(446 - PICK_FRUIT[0]).toFixed(0)}px`, "--dy": `${(596 - PICK_FRUIT[1]).toFixed(0)}px`, "--d": 2.2 })}><circle r="4.4" fill={C.orange} /></g>
      </g>
      {/* life: the weeder works the bed */}
      <g className="lv-in" style={v({ "--k": 1, "--lv-base": "1.6s" })}><g className="lv-rock" style={v({ "--t": 1.3, "--d": 0.4 })}><Person x={WEEDER.x} y={WEEDER.y} s={WEEDER.s} color="orange" pose="bend" hair="cap" flip /></g></g>
      {/* life: a full crate carried along the front of the beds, from one side of the garden to the other */}
      <g className="lv-move" style={v({ "--x0": "-260px", "--x1": "540px", "--t": 21, "--d": -8 })}>
        <g className="lv-step"><Person x={136} y={644} s={1.1} color="white" pose="carry" itemColor="yellow" hair="curly" build="broad" /></g>
      </g>
    </>
  );
}

/** Scena: il casolare con l'agrumeto accanto e l'orto davanti. Soggetto: il casolare. Intro: collina, terreno, casa, agrumeto, orto, persone. Vita: un albero nel vento, l'arancia raccolta che cade nella cassetta, chi sarchia, chi attraversa l'orto con la cassetta, due uccelli (più la profondità del pannello). */
export function GardenArt() {
  return (
    <Live className="absolute inset-0"><Stage tilt={false} className="size-full">
      <Plane z={-26}><GardenSky /></Plane>
      <Plane z={0}><GardenFarmhouse /></Plane>
      <Plane z={26}><GardenBeds /></Plane>
    </Stage></Live>
  );
}

/* ---------------- Campo Polivalente Unità d'Italia ---------------- */

/** The lob (story.css hs-lob) starts at BALL and ends ~260 to the right: thrower's hand under the start, catcher's hands at the end. */
const BALL = { x: 120, y: 500 };
const THROWER = (() => {
  const s = 1.5 * 0.64, [hx, hy] = handAt("reach", "front", "slim");
  return { x: BALL.x - hx * s, y: BALL.y + 14 - hy * s };
})();
const CATCHER = (() => {
  const s = 1.1 * 0.64, [hx, hy] = handAt("cheer", "front", "slim");
  return { x: BALL.x + 252 + hx * s, y: BALL.y - 12 - hy * s };
})();

function FieldSky() {
  return (
    <>
      <g className="lv-sun" style={v({ "--lv-base": "0.3s" })}><Sun cx={130} cy={160} r={40} color="yellow" rays={12} className="spin-slow" /></g>
      <Cloud x={300} y={140} s={0.8} className="lv-cloud" style={d(1.5)} />
      <g className="lv-rise" style={v({ "--k": 0 })}><Hill width={600} y={346} amp={22} bottom={760} color="yellow" seed={2.2} waves={1.2} /></g>
      {/* floodlight: iron mast, a white lamp head with its grid */}
      <g className="lv-pop" style={v({ "--lv-base": "0.85s" })}>
      <path d="M500 364 V222" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      <path d="M486 222 H514" stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" />
      <rect x="474" y="186" width="52" height="32" rx="4" fill={C.white} />
      <path d="M491 189 V215 M509 189 V215 M477 202 H523" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      </g>
    </>
  );
}

function FieldCourt() {
  return (
    <>
      <g className="lv-rise" style={v({ "--k": 1 })}><rect x="-60" y="400" width="720" height="360" fill={C.green} /></g>
      <path className="lv-draw" pathLength={1} style={v({ "--k": 3 })} d="M120 420 H500 L610 660 H-10 Z" fill="none" stroke={C.white} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
      <path className="lv-draw" pathLength={1} style={v({ "--k": 5 })} d="M20 560 H580" stroke={C.white} strokeWidth="5" strokeLinecap="round" />
      <g className="lv-reveal" style={v({ "--k": 4, "--lv-base": "0.6s" })}>
      {/* the net: far post, mesh, top tape, near post (iron) */}
      <path d="M390 330 V480" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      <path d="M200 296 L390 330 V398 L200 450 Z" fill="none" stroke={C.white} strokeWidth="2.2" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${200 + i * 21.1} ${296 + i * 3.8} V${450 - i * 5.8}`} stroke={C.white} strokeWidth="1.6" />)}
      {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M200 ${330 + i * 40} L390 ${356 + i * 14}`} stroke={C.white} strokeWidth="1.6" />)}
      <path d="M200 296 L390 330" stroke={C.white} strokeWidth="8" strokeLinecap="round" />
      <path d="M200 262 V520" stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      </g>
    </>
  );
}

function FieldKids() {
  return (
    <>
      {/* 1: the ball leaves the thrower's raised hand and drops into the catcher's hands, over the net */}
      <g className="lv-in" style={v({ "--k": 0, "--lv-base": "1.6s" })}><Person x={THROWER.x} y={THROWER.y} s={1.5} kid color="yellow" pose="reach" build="slim" hair="curly" /></g>
      <g className="hs-lob"><Ball x={BALL.x} y={BALL.y} r={15} /></g>
      {/* 2: the child waiting for the ball, arms up, jumps */}
      <g className="hs-jump" style={d(1.2)}><Person x={CATCHER.x} y={CATCHER.y} s={1.1} kid color="white" pose="cheer" build="slim" hair="bun" flip /></g>
      {/* life: a child runs across the court to join the game */}
      <g className="lv-move" style={v({ "--x0": "-320px", "--x1": "420px", "--t": 14, "--d": -5 })}>
        <g className="lv-step"><Person x={250} y={572} s={1.2} kid color="white" pose="walk" hair="short" outfit="trousers" /></g>
      </g>
      {/* the coach watches with the clipboard */}
      <g className="lv-in" style={v({ "--k": 2, "--lv-base": "1.6s" })}><Person x={318} y={640} s={1.04} color="orange" pose="stand" item="book" itemColor="white" hair="long" outfit="trousers" flip /></g>
      {/* a child dribbles a ball towards the cones */}
      <g className="lv-move lv-alt" style={v({ "--x0": "26px", "--x1": "-26px", "--t": 2.6, "--d": 0.3 })}>
        <Person x={520} y={612} s={1.3} kid color="yellow" pose="kick" hair="short" flip />
        <g transform={`translate(${(520 - 31 * 1.3 * 0.64 - 9).toFixed(1)} ${612 - 14})`}><g className="lv-spin" style={v({ "--t": 0.8 })}><Ball r={11} /></g></g>
      </g>
    </>
  );
}

function FieldFront() {
  return (
    <>
      <g className="lv-pop" style={v({ "--k": 0, "--lv-base": "1.3s" })}><Cone x={426} y={648} s={0.9} /></g>
      <g className="lv-pop" style={v({ "--k": 1, "--lv-base": "1.3s" })}><Cone x={466} y={638} s={0.7} /></g>
      {/* spare balls, two on the ground and one resting on them */}
      <g transform="translate(140 640)"><Ball x={0} y={0} r={14} /><Ball x={28} y={0} r={14} /><Ball x={14} y={-24} r={14} /></g>
    </>
  );
}

/** Scena: il campo con la rete e i bambini. Soggetto: la rete con il pallone lanciato sopra. Intro: sole, collina, campo, linee che si disegnano, rete, bambini. Vita: il pallone lanciato e il bambino che salta per prenderlo, un bambino che corre ad aggiungersi, uno che palleggia col piede verso i coni, la nuvola (più la profondità del pannello). */
export function FieldArt() {
  return (
    <Live className="absolute inset-0"><Stage tilt={false} className="size-full">
      <Plane z={-26}><FieldSky /></Plane>
      <Plane z={0}><FieldCourt /><FieldKids /></Plane>
      <Plane z={30}><FieldFront /></Plane>
    </Stage></Live>
  );
}
