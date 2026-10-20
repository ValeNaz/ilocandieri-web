/**
 * The four rooms of "Cosa facciamo". Each scene is three depth layers (far / middle / near) of one 800x640 drawing.
 * Scroll progress inside a scene is --a (0..1): the .hs-* classes of story.css turn it into movement.
 * Rule of the rooms: at most three things move in each scene, and nothing moving crosses another moving thing.
 * v4 language (DESIGN.md): no outer contours on masses, ink for dark things and fine interior detail only, people that
 * really do the action (hands on handles, on another hand, under the ball; sitters on chairs; feet on the ground).
 * Life (kit <Live>, live.css): small loops that run while the room is on screen, on top of the scroll script, which
 * stays the subject (walkers bob, smoke, a swinging lamp, birds, trees in the wind, someone digging).
 */
import type { CSSProperties } from "react";
import { Live } from "@/components/public/kit/Live";
import { C, INK, Ball, Birds, Boarded, Chair, Chimney, Cloud, Cone, Crate, Depth, Door, Ear, Hill, Jar, Jug, OliveTree, OrangeTree, Person, Roof, Smoke, Sun, Table, Win, WIDE, at, handAt, type Fill } from "./parts";

/** A hill as wide as any panel (the drawing itself is 800 wide). */
function WideHill({ y, amp, color, seed, waves }: { y: number; amp: number; color: Fill; seed: number; waves: number }) {
  return <g transform={`translate(${WIDE.x} 0)`}><Hill width={WIDE.w} y={y} amp={amp} bottom={700} color={color} seed={seed} waves={waves * (WIDE.w / 800)} /></g>;
}
function Band({ y, color, h = 120 }: { y: number; color: Fill; h?: number }) {
  return <rect x={WIDE.x} y={y} width={WIDE.w} height={h} fill={C[color]} />;
}
const ROUND = { strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
const v = (o: Record<string, string | number>) => o as CSSProperties;
/** Suitcase standing on the floor (ground = bottom centre): handle and straps in ink, no outline. */
function Suitcase({ x, y, color = "green" }: { x: number; y: number; color?: Fill }) {
  return (
    <g>
      <path d={`M${x - 6} ${y - 30} V${y - 35} Q${x - 6} ${y - 38} ${x - 3} ${y - 38} H${x + 3} Q${x + 6} ${y - 38} ${x + 6} ${y - 35} V${y - 30}`} stroke={C.ink} strokeWidth={INK.bold} {...ROUND} />
      <rect x={x - 17} y={y - 31} width="34" height="31" rx="4" fill={C[color]} />
      <path d={`M${x - 8} ${y - 31}V${y - 1}M${x + 8} ${y - 31}V${y - 1}M${x - 17} ${y - 23}H${x + 17}`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
    </g>
  );
}

/* ================= 01  Accoglienza ================= */

/** The traveller walks with the suitcase in the near hand and the child by the other hand (hands really meet). */
const ADULT = { x: 150, y: 616, s: 1.2 };
const CHILD = (() => {
  const [bx, by] = handAt("walk", "back", "regular");
  const [fx, fy] = handAt("walk", "front", "slim");
  const s = 1.1 * 0.64;
  return { x: ADULT.x + bx * ADULT.s - fx * s, y: ADULT.y + by * ADULT.s - fy * s };
})();

function WelcomeFar() {
  return (
    <>
      <Sun cx={712} cy={96} r={36} color="yellow" rays={10} className="spin-slow" />
      <Cloud x={70} y={170} s={0.95} className="lv-cloud" />
      <WideHill y={430} amp={22} color="yellow" seed={1.3} waves={1.5} />
    </>
  );
}

function WelcomeHouse() {
  return (
    <>
      <Band y={560} color="white" />
      {/* the light from the open door, on the ground */}
      <path d="M262 566 L214 640 H326 L318 566 Z" fill={C.yellow} />
      {/* the house, front wall taken away so we see the lit room: chimney, tiled roof with gutter, white walls on an orange plinth */}
      <Smoke x={587} y={100} />
      <Chimney x={572} y={150} w={30} h={42} />
      <rect x="290" y="262" width="420" height="304" rx="3" fill={C.white} />
      <Roof x1={258} x2={742} eave={262} ridge={146} inset={112} rows={3} />
      <rect x="290" y="548" width="420" height="18" rx="2" fill={C.orange} />
      <rect x="316" y="288" width="368" height="252" rx="3" fill={C.yellow} />
      {/* the doorway through the left wall, the leaf swung open outside, the step */}
      <rect x="288" y="430" width="30" height="110" fill={C.yellow} />
      <path d="M290 430 L250 446 V556 L290 540 Z" fill={C.orange} />
      <path d="M256 456 L284 445 M256 500 L284 489 M256 546 L284 535" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <circle cx="279" cy="496" r="2.6" fill={C.ink} />
      <rect x="276" y="540" width="48" height="10" rx="3" fill={C.orange} />
      {/* inside: a window on the evening, the lamp over the table, a shelf of jars */}
      <Win x={352} y={310} w={78} h={88} glass="green" sill={false} />
      <path d="M346 404 H436" stroke={C.orange} strokeWidth="6" strokeLinecap="round" />
      <g className="lv-swing" style={v({ "--t": 3.6 })}>
        <path d="M500 288 V336" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
        <path d="M480 360 L488 337 Q500 331 512 337 L520 360 Z" fill={C.orange} />
      </g>
      <path d="M592 392 H676" stroke={C.orange} strokeWidth="6" strokeLinecap="round" />
      <Jar x={610} y={389} s={0.9} fill="orange" />
      <Jar x={636} y={389} s={0.9} fill="green" />
      <Jar x={662} y={389} s={0.9} fill="orange" />
      {/* the table, laid: plates, a bowl of oranges, a jug */}
      <Chair x={378} y={540} color="orange" />
      <Chair x={622} y={540} s={0.832} flip />
      <Table x1={418} x2={582} top={468} floor={540} color="orange" />
      <ellipse cx="448" cy="465" rx="17" ry="4.4" fill={C.green} />
      <ellipse cx="552" cy="465" rx="17" ry="4.4" fill={C.green} />
      <path d="M484 455a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M496 452a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" fill={C.orange} />
      <path d="M480 456 H520 Q518 468 500 468 Q482 468 480 456 Z" fill={C.green} />
      <Jug x={530} y={468} s={0.85} color="green" />
      {/* 2: the travellers are now at the table, on the chairs */}
      <g className="hs-k hs-in" style={at(0.6, 0.2)}>
        <Person x={378} y={540} color="green" pose="sit" hair="bun" build="regular" />
        <Person x={622} y={540} color="orange" pose="sit" kid s={1.3} hair="curly" flip />
      </g>
      {/* 3: their suitcase, left at the entrance */}
      <g className="hs-k hs-in" style={at(0.66, 0.2)}><Suitcase x={338} y={540} color="orange" /></g>
    </>
  );
}

function WelcomeNear() {
  return (
    <>
      {/* 1: the two travellers walk up to the door, hand in hand, and go into the light */}
      <g className="hs-k hs-out" style={at(0.48, 0.14)}>
        <g className="hs-k hs-move" style={at(0, 0.5, { "--mx": -32 } as CSSProperties)}>
          <g className="lv-step">
            <Person x={CHILD.x} y={CHILD.y} s={1.1} kid color="orange" pose="walk" build="slim" hair="curly" outfit="trousers" />
            <Person x={ADULT.x} y={ADULT.y} s={ADULT.s} color="green" pose="walk" item="suitcase" itemColor="orange" hair="bun" build="regular" outfit="trousers" />
          </g>
        </g>
      </g>
    </>
  );
}

/** Scena: una casa con la luce accesa e la tavola apparecchiata. Soggetto: la casa. Si muovono: i due viaggiatori che arrivano per mano ed entrano, poi gli stessi seduti a tavola, poi la valigia lasciata all'ingresso. */
export function SceneWelcome() {
  return (
    <Live className="absolute inset-0">
      <Depth z={-60}><WelcomeFar /></Depth>
      <Depth z={0}><WelcomeHouse /></Depth>
      <Depth z={70}><WelcomeNear /></Depth>
    </Live>
  );
}

/* ================= 02  Beni confiscati ================= */

function ConfiscatedFar() {
  return (
    <>
      <Sun cx={190} cy={104} r={36} color="white" rays={12} className="spin-slow" />
      <Birds x={430} y={150} x0={-520} x1={520} t={26} d={3} />
      <WideHill y={330} amp={30} color="green" seed={2.1} waves={1.4} />
      <WideHill y={420} amp={20} color="orange" seed={0.4} waves={1.9} />
      <Band y={486} color="green" h={200} />
    </>
  );
}

/** The house in both states shares the same drawing; only the colours and the openings change. */
function HouseShell({ roof }: { roof: Fill }) {
  return (
    <>
      <Roof x1={500} x2={692} eave={354} ridge={316} inset={36} rows={1} color={roof} gutter={roof !== "white"} />
      <Roof x1={168} x2={542} eave={298} ridge={228} inset={64} rows={3} color={roof} gutter={roof !== "white"} />
    </>
  );
}

function ConfiscatedHouse() {
  return (
    <>
      {/* closed: bare white roofs, shutters nailed shut, the door boarded up, the oculus dark */}
      <rect x="520" y="352" width="150" height="134" rx="3" fill={C.white} />
      <Chimney x={426} y={248} w={28} h={44} color="orange" />
      <rect x="190" y="290" width="330" height="196" rx="3" fill={C.white} />
      <HouseShell roof="white" />
      <Boarded x={214} y={332} />
      <Boarded x={440} y={332} />
      <Door x={326} y={486} w={58} h={66} color="green" step="orange" />
      <path d="M332 434 H378 M332 458 H378" stroke={C.yellow} strokeWidth="9" strokeLinecap="round" />
      <path d="M335 434h0M375 434h0M335 458h0M375 458h0" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="355" cy="346" r="16" fill={C.green} />
      <path d="M342 346 H368 M355 333 V359" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      {/* 2: the house wakes up, all at once and whole: tiled roofs, warm windows with shutters open, the door, flowers, ivy, a young orange tree */}
      <g className="hs-k hs-in" style={at(0.28, 0.32)}>
        <HouseShell roof="orange" />
        <Win x={214} y={332} w={56} h={64} lit shutters />
        <Win x={440} y={332} w={56} h={64} lit shutters />
        <Door x={326} y={486} w={58} h={66} color="orange" step="green" />
        <circle cx="355" cy="346" r="16" fill={C.yellow} />
        <path d="M342 346 H368 M355 333 V359" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
        {/* flower boxes under the sills */}
        <rect x="210" y="404" width="64" height="12" rx="3" fill={C.green} />
        <rect x="436" y="404" width="64" height="12" rx="3" fill={C.green} />
        <path d="M216 404a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M236 402a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M256 404a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M442 402a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M462 404a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M482 402a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" fill={C.orange} />
        {/* ivy climbing the corner */}
        <path d="M206 484 C196 450 216 424 204 392 C196 366 212 344 204 318" fill="none" stroke={C.green} strokeWidth="4" strokeLinecap="round" />
        <path d="M206 452 q-12 -4 -12 -14 q10 2 12 14 M206 420 q12 -4 12 -14 q-10 2 -12 14 M203 388 q-12 -4 -12 -14 q10 2 12 14 M206 356 q12 -4 12 -14 q-10 2 -12 14 M205 328 q-11 -4 -11 -13 q9 2 11 13" fill={C.green} />
        <OrangeTree x={606} y={490} s={0.92} className="sway" style={v({ "--d": 1.6 })} />
      </g>
    </>
  );
}

/** One leaf of the iron gate: two rails, bars with spear tips, a scroll in the middle. Drawn from `x` to `x + w`. */
function GateLeaf({ x, w }: { x: number; w: number }) {
  const bars = Array.from({ length: 5 }, (_, i) => x + 8 + (i * (w - 16)) / 4);
  return (
    <g>
      <path d={`M${x + 2} 470 H${x + w - 2} M${x + 2} 584 H${x + w - 2} M${x + 2} 466 V590 M${x + w - 2} 466 V590`} stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      <path d={bars.map((b) => `M${b} 458 V584`).join("")} stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" />
      <path d={bars.map((b) => `M${b - 3.4} 461 L${b} 452 L${b + 3.4} 461 Z`).join("")} fill={C.ink} />
      <path d={`M${x + w / 2 - 14} 528 q0 -12 14 -12 q14 0 14 12 q0 10 -9 10`} stroke={C.ink} strokeWidth={INK.fine} {...ROUND} />
    </g>
  );
}

function ConfiscatedGate() {
  return (
    <>
      {/* the low boundary wall, plastered white, with its stone joints */}
      <rect x={WIDE.x} y="542" width={260 - WIDE.x} height="70" rx="3" fill={C.white} />
      <rect x="500" y="542" width={WIDE.x + WIDE.w - 500} height="70" rx="3" fill={C.white} />
      <path d="M-200 566 H250 M500 566 H1000 M-200 590 H250 M500 590 H1000 M40 542 V566 M120 566 V590 M200 542 V566 M560 542 V566 M640 566 V590 M720 542 V566" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.4" />
      {/* 1: the gate opens (both leaves on their hinges, one gesture) */}
      <g className="hs-k hs-open-l" style={at(0.08, 0.42)}><GateLeaf x={286} w={94} /></g>
      <g className="hs-k hs-open-r" style={at(0.08, 0.42)}><GateLeaf x={380} w={94} /></g>
      {/* tufa pillars with their caps */}
      <rect x="250" y="430" width="36" height="182" rx="3" fill={C.yellow} />
      <rect x="474" y="430" width="36" height="182" rx="3" fill={C.yellow} />
      <path d="M244 432 L268 410 L292 432 Z M468 432 L492 410 L516 432 Z" fill={C.yellow} stroke={C.yellow} strokeWidth="4" strokeLinejoin="round" />
      <path d="M254 446 H282 M478 446 H506" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      {/* 3: people come through and go to work: a crate, a spade, a basket */}
      <g className="hs-k hs-in" style={at(0.5, 0.2)}>
        <g className="hs-k hs-move" style={at(0.5, 0.4, { "--my": 28 } as CSSProperties)}>
          <g className="lv-step" style={v({ "--d": 0.1 })}><Person x={168} y={630} s={0.98} color="orange" pose="walk" item="spade" itemColor="yellow" hair="cap" build="broad" /></g>
          <g className="lv-step" style={v({ "--d": 0.33 })}><Person x={382} y={632} s={1.02} color="yellow" pose="carry" itemColor="white" hair="short" /></g>
          <g className="lv-step" style={v({ "--d": 0.21 })}><Person x={606} y={628} s={0.96} color="orange" pose="carry" item="basket" itemColor="green" hair="bun" build="slim" outfit="dress" flip /></g>
        </g>
      </g>
      {[110, 720].map((x) => <path key={x} d={`M${x} 626 l-10 -24 M${x} 626 l2 -30 M${x} 626 l12 -22`} stroke={C.green} strokeWidth="5" strokeLinecap="round" fill="none" />)}
    </>
  );
}

/** Scena: il casolare confiscato dietro il cancello. Soggetto: il casolare. Si muovono: il cancello che si apre, la casa che si risveglia (tetti, finestre, porta, fiori, edera: un solo gruppo), le persone che entrano con gli attrezzi. */
export function SceneConfiscated() {
  return (
    <Live className="absolute inset-0">
      <Depth z={-60}><ConfiscatedFar /></Depth>
      <Depth z={0}><ConfiscatedHouse /></Depth>
      <Depth z={60}><ConfiscatedGate /></Depth>
    </Live>
  );
}

/* ================= 03  Sport ================= */

/** The ball's arc (story.css .hs-ball) goes from ARC_A to 470 units to the right: thrower's hand at the start, catcher's at the end. */
const ARC_A = { x: 170, y: 520 };
const THROWER = (() => {
  const s = 1.5 * 0.64, [hx, hy] = handAt("reach", "front", "slim");
  return { x: ARC_A.x - hx * s, y: ARC_A.y + 15 - hy * s };
})();
const CATCHER = (() => {
  const s = 1.6 * 0.64, [hx, hy] = handAt("cheer", "front", "slim");
  return { x: ARC_A.x + 470 + hx * s, y: ARC_A.y + 15 - hy * s };
})();

function Floodlight({ x }: { x: number }) {
  return (
    <g>
      <path d={`M${x} 420 V254`} stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${x - 16} 254 H${x + 16}`} stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" />
      <rect x={x - 28} y="214" width="56" height="36" rx="4" fill={C.white} />
      <path d={`M${x - 9} 217 V247 M${x + 9} 217 V247 M${x - 25} 232 H${x + 25}`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
    </g>
  );
}

function SportFar() {
  return (
    <>
      <Sun cx={650} cy={112} r={40} color="white" rays={12} className="spin-slow" />
      <Cloud x={60} y={120} s={0.9} className="lv-cloud" style={v({ "--d": 1 })} />
      <WideHill y={338} amp={26} color="yellow" seed={2.7} waves={1.3} />
      <Floodlight x={140} />
      <Floodlight x={660} />
    </>
  );
}

function SportCourt() {
  return (
    <>
      <Band y={420} color="yellow" h={260} />
      <path d="M170 436 H630 L780 640 H20 Z" fill={C.orange} stroke={C.white} strokeWidth="5" strokeLinejoin="round" />
      <path d="M100 538 H700" stroke={C.white} strokeWidth="5" strokeLinecap="round" />
      {/* net: far post, mesh, tape, near post (iron) */}
      <path d="M452 340 V500" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      <path d="M312 300 L452 340 V404 L312 450 Z" fill="none" stroke={C.white} strokeWidth="2.2" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${312 + i * 20} ${300 + i * 5.7} V${450 - i * 6.6}`} stroke={C.white} strokeWidth="1.6" />)}
      {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M312 ${330 + i * 40} L452 ${360 + i * 17}`} stroke={C.white} strokeWidth="1.6" />)}
      <path d="M312 300 L452 340" stroke={C.white} strokeWidth="8" strokeLinecap="round" />
      <path d="M312 270 V540" stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      {/* the arc the ball will follow */}
      <path d="M170 520 Q400 20 640 520" fill="none" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="0.1 14" opacity="0.6" />
    </>
  );
}

function SportPlayers() {
  const jump = (d: number) => ({ "--d": d }) as CSSProperties;
  return (
    <>
      {/* 1: the thrower has just let the ball go from the raised hand */}
      <Person x={THROWER.x} y={THROWER.y} s={1.5} kid color="white" pose="reach" build="slim" hair="curly" />
      {/* 2 and 3: one child jumps on each side of the net (never under the ball's arc) */}
      <g className="hs-jump" style={jump(0)}><Person x={262} y={576} s={1.3} kid color="yellow" pose="cheer" hair="bun" outfit="dress" /></g>
      <g className="hs-jump" style={jump(2.2)}><Person x={540} y={558} s={1.2} kid color="white" pose="cheer" hair="short" flip /></g>
      {/* the coach, clipboard in hand, follows the game */}
      <Person x={386} y={638} s={1.22} color="green" pose="stand" item="book" itemColor="white" hair="short" build="broad" outfit="trousers" />
      {/* the catcher waits with both hands up where the ball comes down */}
      <Person x={CATCHER.x} y={CATCHER.y} s={1.6} kid color="green" pose="cheer" build="slim" hair="long" outfit="trousers" flip />
      {/* 1: the ball follows the scroll along the arc */}
      <g className="hs-k hs-ball" style={at(0, 1)}><Ball x={ARC_A.x} y={ARC_A.y} r={16} /></g>
    </>
  );
}

function SportNear() {
  return (
    <>
      <Cone x={470} y={636} s={1} />
      <Cone x={528} y={628} s={0.78} />
      {/* spare balls: two on the ground, one resting on them */}
      <g transform="translate(196 616)">
        <Ball x={0} y={0} r={15} />
        <Ball x={30} y={0} r={15} />
        <Ball x={15} y={-26} r={15} />
      </g>
    </>
  );
}

/** Scena: il campo con la rete di pallavolo e i bambini. Soggetto: il pallone che fa il suo arco sopra la rete, dalla mano di chi lancia alle mani di chi riceve. Si muovono: il pallone (con lo scroll) e due bambini che saltano, uno per lato. */
export function SceneSport() {
  return (
    <Live className="absolute inset-0">
      <Depth z={-60}><SportFar /></Depth>
      <Depth z={0}><SportCourt /><SportPlayers /></Depth>
      <Depth z={70}><SportNear /></Depth>
    </Live>
  );
}

/* ================= 04  Agricoltura ================= */

function FarmFar() {
  return (
    <>
      <Sun cx={620} cy={120} r={56} color="yellow" rays={14} className="spin-slow" />
      {/* two birds crossing the white sky */}
      <Birds x={160} y={170} x0={-420} x1={640} t={22} d={1.5} />
      <WideHill y={330} amp={26} color="green" seed={0.9} waves={1.5} />
      <WideHill y={396} amp={14} color="yellow" seed={3.1} waves={2.2} />
      <OliveTree x={110} y={420} s={1.05} color="white" />
      <OliveTree x={700} y={428} s={0.86} color="white" />
    </>
  );
}

/** Rows of wheat, far to near. Ears stand only where nothing else will be drawn in front of them (digger, shoot, harvester, crates). */
const ROWS: { y: number; s: number; xs: number[] }[] = [
  { y: 478, s: 0.55, xs: [40, 100, 160, 220, 460, 520, 580, 640, 700, 760] },
  { y: 508, s: 0.72, xs: [30, 110, 190] },
  { y: 552, s: 0.92, xs: [36, 236] },
  { y: 606, s: 1.2, xs: [30, 246] },
];

function FarmField() {
  return (
    <>
      <Band y={446} color="orange" h={240} />
      {Array.from({ length: 12 }, (_, i) => {
        const xb = -240 + i * 110;
        return <path key={i} d={`M${400 + (xb - 400) * 0.18} 446 L${xb} 640`} stroke={C.ink} strokeWidth={INK.bold} opacity="0.35" />;
      })}
      {/* 1: the wheat comes up, the whole field at once */}
      <g className="hs-k hs-sprout" style={at(0.1, 0.35)}>
        {ROWS.flatMap((r) => r.xs.map((x, i) => <Ear key={`${r.y}-${x}`} x={x} y={r.y} s={r.s} h={76} className={r.y > 540 ? "sway-s" : undefined} style={r.y > 540 ? v({ "--d": i * 1.3 + r.y / 100 }) : undefined} />))}
      </g>
      {/* someone turns the soil between the rows, the spade's blade in the ground */}
      <g className="lv-rock" style={v({ "--t": 1.4, "--d": 0.5 })}><Person x={124} y={628} s={1.02} color="white" pose="dig" itemColor="yellow" hair="cap" build="broad" /></g>
      {/* the day's harvest, stacked: lower crates on the ground, one on top */}
      <Crate x={510} y={566} w={104} h={52} color="yellow" produce={{ c: "green", n: 4 }} />
      <Crate x={626} y={572} w={100} h={48} color="white" produce={{ c: "yellow", n: 4 }} />
      <Crate x={560} y={514} w={104} h={52} color="white" produce={{ c: "green", n: 4 }} />
      {/* 2: someone brings one more crate */}
      <g className="hs-k hs-in" style={at(0.38, 0.2)}>
        <g className="hs-k hs-move" style={at(0.38, 0.4, { "--mx": -32 } as CSSProperties)}>
          <g className="lv-step"><Person x={462} y={606} s={1.05} color="green" pose="carry" itemColor="yellow" hair="bun" outfit="dress" /></g>
        </g>
      </g>
    </>
  );
}

function FarmNear() {
  return (
    <>
      {/* the lip of the furrow the shoot comes out of */}
      <path d="M268 640 Q300 624 336 630 Q372 622 412 640" stroke={C.ink} strokeWidth={INK.bold} {...ROUND} />
      {/* 3: the shoot grows from the soil, stem, leaves and bud together */}
      <g className="hs-k hs-sprout" style={at(0.05, 0.55)}>
        <path d="M340 632 C340 594 348 564 330 520" fill="none" stroke={C.green} strokeWidth="9" strokeLinecap="round" />
        <path d="M330 540 C290 536 264 508 270 474 C308 474 334 502 330 540 Z" fill={C.green} />
        <path d="M334 532 C368 522 396 496 400 460 C362 462 336 490 334 532 Z" fill={C.green} />
        <path d="M328 536 C306 520 288 502 278 482 M336 528 C358 512 378 492 392 468" stroke={C.ink} strokeWidth={INK.fine} {...ROUND} />
        <path d="M321 512a8 9 0 1 0 16 0a8 9 0 1 0 -16 0" fill={C.yellow} />
        <path d="M329 503 v-5" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      </g>
    </>
  );
}

/** Scena: un campo di grano con un germoglio in primo piano. Soggetto: il germoglio. Si muovono: il germoglio che cresce, il grano che spunta (tutto insieme), una persona che porta l'ultima cassetta; un'altra vanga la terra. */
export function SceneFarm() {
  return (
    <Live className="absolute inset-0">
      <Depth z={-60}><FarmFar /></Depth>
      <Depth z={0}><FarmField /></Depth>
      <Depth z={70}><FarmNear /></Depth>
    </Live>
  );
}
