/**
 * Hero scenes of the list and service pages (events, news, contacts, 404, legal, credits), illustration language v4:
 * one subject (largest, nearest), two or three secondary groups, a quiet third of the frame; people only through
 * <Person>, doing the action with hands on the thing (handAt); no outer contours on masses, ink only for dark things and
 * interior detail. All decorative (aria-hidden): the text beside them tells the story.
 *
 * Living scenes, like the Home hero (kit <Live> + live.css, special paths in liste-live.css): once in view the land
 * rises layer by layer, the sun comes up, trees and objects pop from their foot, then the people arrive; after that a
 * few small loops tell the scene's story, each in its own place and rhythm. Layers drift with the scroll (.depth).
 * Rest position of every moving group = the still frame (reduced motion, no JS).
 */
import type { CSSProperties } from "react";
import { Live } from "@/components/public/kit/Live";
import { C, Cloud, handAt, INK, OrangeTree, Person, Placed, type Pose } from "../parts";
import { Bench, Birds, Bunting, Envelope, Ground, House, Intro, Jar, Lantern, LiveLayer, Mound, Paper, Scene, Smoke, Sunny, Table, ink } from "./parts";
import "./liste-live.css";

const v = (o: Record<string, string | number>) => o as CSSProperties;
const VB = "0 0 800 560";
const G = 482; // ground line of the 800x560 scenes
/** World point of a hand: person at x (feet on G), scale s, optionally flipped. */
const hand = (pose: Pose, side: "front" | "back", x: number, s: number, flip = false, g = G) => {
  const [hx, hy] = handAt(pose, side);
  return [x + (flip ? -hx : hx) * s, g + hy * s] as const;
};

/* ------------------------------------------------------------------ Eventi (orange room) */
// Scena: la festa nel giardino. SOGGETTO: la tavola lunga apparecchiata (tovaglia, piatti, la brocca) sotto la fila di
// bandierine; due persone sedute che si parlano, una che arriva con la cassetta di arance; dietro, un arancio.
// Intro: sole, arancio, pali e filo delle bandierine, la tavola, poi le persone. Vita: le bandierine e la lanterna
// ondeggiano nel vento (ognuna col suo ritmo), un bambino salta di gioia, chi porta la cassetta cammina sul posto,
// due uccelli attraversano il cielo, la chioma si muove.
export function EventsScene() {
  const cup = <path d="M-5 -12 H5 L4 1 C4 2 3.4 2.6 2.4 2.6 H-2.4 C-3.4 2.6 -4 2 -4 1 Z" fill={C.green} />;
  return (
    <Live className="absolute inset-0">
      <LiveLayer depth={0.5} k={0}>
        <Scene viewBox={VB} slice className="sc">
          <Intro kind="sun" base={0.4}><Sunny cx={640} cy={104} r={34} color="yellow" /></Intro>
          <Birds id="ev-sky" x={300} y={92} x0={-380} x1={560} t={24} d={2} />
        </Scene>
      </LiveLayer>
      <LiveLayer depth={0.2} k={1}>
        <Scene viewBox={VB} slice className="sc">
          <Intro k={0} base={0.85}><OrangeTree x={122} y={G} s={1.6} crown="green" fruit="yellow" className="sway" style={v({ "--d": 1.3 })} /></Intro>
          <Intro kind="reveal" k={1} base={0.7}><path d={`M96 ${G} V146 M704 ${G} V146`} {...ink(6)} /></Intro>
          <Intro kind="reveal-x" k={3} base={0.9}>
            <Bunting x1={96} y1={156} x2={704} y2={156} n={8} sag={30} colors={["white", "yellow", "green"]} flagClass="lv-swing" />
          </Intro>
          <Intro kind="in" k={5} base={1}><Lantern x={400} y={186} fill="white" className="lv-swing" style={v({ "--t": 4.2, "--d": 0.6 })} /></Intro>
          <Intro k={2} base={0.9}>
            <Table x={400} y={G} w={300} h={64} top="yellow" cloth="white" />
            {/* laid table: plates, a jug of water, a bread loaf */}
            {[300, 362, 486].map((cx) => <ellipse key={cx} cx={cx} cy={414} rx="19" ry="3.6" fill={C.yellow} />)}
            <Jar x={428} y={417} s={1.05} color="green" lid="yellow" />
            <path d="M498 416 C498 404 512 398 526 398 C540 398 552 404 552 416 Z" fill={C.yellow} />
            <path d="M512 404 l4 6 M524 401 l4 6 M536 403 l4 6" {...ink(1.8)} />
          </Intro>
        </Scene>
      </LiveLayer>
      <LiveLayer depth={-0.12} k={2}>
        <Scene viewBox={VB} slice className="sc">
          <Ground y={G - 4} color="green" />
          <Intro kind="in" k={0} base={1.6}>
            <Bench x={212} y={G} w={58} h={44} fill="green" />
            <Person x={214} y={G} s={1.1} color="yellow" pose="sit" hair="bun" hold={cup} />
          </Intro>
          <Intro kind="in" k={1} base={1.6}>
            <Bench x={572} y={G} w={58} h={44} fill="yellow" />
            <Person x={570} y={G} s={1.1} color="green" pose="sit" hair="curly" build="broad" flip />
          </Intro>
          <Intro kind="in" k={2} base={1.6}><Person x={300} y={G} s={1.1} kid color="green" pose="cheer" hair="short" className="lv-hop" style={v({ "--t": 1.9, "--d": 0.8 })} /></Intro>
          <Intro kind="in" k={3} base={1.6}><Person x={662} y={G} s={1.14} color="white" pose="carry" itemColor="yellow" hair="cap" flip className="lv-step" style={v({ "--d": 0.4 })} /></Intro>
        </Scene>
      </LiveLayer>
    </Live>
  );
}

/* ------------------------------------------------------------------ News (yellow room) */
// Scena: la bacheca del giardino. SOGGETTO: la bacheca col tettuccio e tre avvisi appesi; una persona davanti appoggia
// il dito sull'avviso arancio; a destra, sotto l'arancio, qualcuno seduto legge il foglio appena staccato.
// Intro: sole, la bacheca cresce dal suolo, gli avvisi si appendono uno dopo l'altro, l'albero, poi le persone.
// Vita: l'avviso più nuovo oscilla dal suo spillo, chi legge sulla panchina gira il foglio (dondola appena), la chioma
// si muove, due uccelli passano.
export function NewsScene() {
  const sheet = (
    <g transform="rotate(-14)">
      <rect x="-3" y="-21" width="17" height="22" rx="1.6" fill={C.green} />
      <path d="M1 -15H10M1 -10.5H10M1 -6H7" stroke={C.white} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
  const px = 290 - handAt("reach", "front")[0] * 1.3;
  return (
    <Live className="absolute inset-0">
      <LiveLayer depth={0.5} k={0}>
        <Scene viewBox={VB} slice className="sc">
          <Intro kind="sun" base={0.4}><Sunny cx={694} cy={92} r={30} color="orange" /></Intro>
          <Birds id="nw-sky" x={120} y={70} x0={-200} x1={700} t={28} d={3} />
        </Scene>
      </LiveLayer>
      <LiveLayer depth={0.2} k={1}>
        <Scene viewBox={VB} slice className="sc">
          <Intro k={4} base={0.85}><OrangeTree x={700} y={G} s={1.25} crown="green" fruit="yellow" className="sway" style={v({ "--d": 1.1 })} /></Intro>
          {/* the board: iron posts, an orange frame round a white cork panel, a small tiled roof */}
          <Intro k={0} base={0.6}>
            <path d={`M296 ${G} V380 M524 ${G} V380`} {...ink(9)} />
            <rect x="220" y="150" width="380" height="240" rx="10" fill={C.orange} />
            <rect x="233" y="162" width="354" height="216" rx="6" fill={C.white} />
            <path d="M202 152 L410 106 L618 152 Z" fill={C.orange} stroke={C.orange} strokeWidth="6" strokeLinejoin="round" />
            <path d="M296 138 H524" {...ink(INK.bold)} />
          </Intro>
          <Intro kind="in" k={1} base={1.1}>
            <Paper x={292} y={296} w={100} h={126} lines={7} fill="orange" rot={-3} />
            <circle cx={289} cy={239} r="6" fill={C.yellow} />
          </Intro>
          <Intro kind="in" k={2} base={1.1}>
            <Paper x={410} y={250} w={94} h={100} lines={5} fill="green" rot={2} />
            <circle cx={410} cy={206} r="6" fill={C.orange} />
          </Intro>
          {/* the newest sheet and its pin are one object, swinging from the pin */}
          <Intro kind="in" k={3} base={1.1}>
            <g className="lv-swing" style={v({ "--t": 3.8, "--d": 0.2 })}>
              <Paper x={528} y={252} w={82} h={104} lines={5} fill="orange" rot={-2} />
              <circle cx={527} cy={205} r="6" fill={C.green} />
            </g>
          </Intro>
        </Scene>
      </LiveLayer>
      <LiveLayer depth={-0.12} k={2}>
        <Scene viewBox={VB} slice className="sc">
          <Ground y={G - 4} color="white" />
          <Intro kind="in" k={0} base={1.6}><Person x={px} y={G} s={1.3} color="green" pose="reach" hair="long" /></Intro>
          <Intro kind="in" k={1} base={1.6}>
            <Bench x={620} y={G} w={60} h={44} fill="green" />
            <Person x={622} y={G} s={1.1} color="orange" pose="sit" hair="short" flip hold={sheet} className="lv-rock" style={v({ "--t": 2.6, "--d": 1 })} />
          </Intro>
        </Scene>
      </LiveLayer>
    </Live>
  );
}

/* ------------------------------------------------------------------ Contatti (green room) */
// Scena: scrivere a casa. SOGGETTO: una persona che imbuca una lettera nella cassetta delle lettere; dietro, la casa con
// la porta sul gradino e un arancio che spunta di lato.
// Intro: sole, arancio e casa crescono dal suolo, la cassetta, poi la persona. Vita: la lettera scivola nella fessura e
// in mano ne compare un'altra, il comignolo fuma, la chioma si muove, due uccelli passano.
export function ContactScene() {
  const letter = <g className="lv-ls-post" style={v({ "--d": 2.2 })}><Envelope x={10} y={-2} w={22} /></g>;
  const s = 1.2;
  const px = 562 + handAt("reach", "front")[0] * s; // the hand rests at the slot's right end
  return (
    <Live className="absolute inset-0">
      <LiveLayer depth={0.5} k={0}>
        <Scene viewBox={VB} slice className="sc">
          <Intro kind="sun" base={0.4}><Sunny cx={656} cy={108} r={36} color="yellow" /></Intro>
          <Birds id="ct-sky" x={140} y={150} x0={-220} x1={680} t={26} d={2.5} />
        </Scene>
      </LiveLayer>
      <LiveLayer depth={0.2} k={1}>
        <Scene viewBox={VB} slice className="sc">
          <Intro k={0} base={0.85}><OrangeTree x={146} y={G} s={1.55} crown="white" fruit="orange" className="sway" style={v({ "--d": 0.7 })} /></Intro>
          <Intro k={1} base={0.85}><House x={296} y={G} s={1.75} wall="yellow" roof="orange" door="green" glass="white" /></Intro>
          <Smoke x={345} y={258} s={1.3} />
          {/* letterbox on an iron post: rounded lid, slot, door seam, name tag */}
          <Intro k={3} base={0.85}>
            <path d={`M530 ${G} V396`} {...ink(8)} />
            <path d="M494 400 V352 C494 334 508 326 530 326 C552 326 566 334 566 352 V400 C566 403 564 405 561 405 H499 C496 405 494 403 494 400 Z" fill={C.orange} />
            <rect x="504" y={hand("reach", "front", px, s, true)[1] - 3} width="52" height="6" rx="3" fill={C.ink} />
            <path d="M500 376 H560" {...ink(INK.fine)} />
            <rect x="516" y="383" width="28" height="12" rx="2" fill={C.white} />
          </Intro>
        </Scene>
      </LiveLayer>
      <LiveLayer depth={-0.12} k={2}>
        <Scene viewBox={VB} slice className="sc">
          <Ground y={G - 4} color="white" />
          <Intro kind="in" base={1.6}><Person x={px} y={G} s={s} color="yellow" pose="reach" hair="short" build="broad" flip hold={letter} /></Intro>
        </Scene>
      </LiveLayer>
    </Live>
  );
}

/* ------------------------------------------------------------------ 404 (orange room) */
// Scena: un bivio. SOGGETTO: una persona appena arrivata (la valigia ai piedi) che legge la mappa aperta tra le mani;
// a destra il cartello con tre frecce, in fondo la casa sul colle e il sentiero che ci porta.
// Intro: il colle sale, la casa, il sentiero si svela dal basso, il cartello e le frecce, poi valigia e persona.
// Vita: qualcuno sale il sentiero e rientra in casa (rimpicciolendo con la distanza), chi legge la mappa si gira appena,
// una nuvola passa.
export function LostScene() {
  const s = 1.3, x = 392;
  // the open map, centred between the two hands (pose "present"): folds, the route to the house, the house marked
  const map = (
    <g transform="rotate(-4)">
      <rect x="-19" y="-12" width="38" height="25" rx="1.6" fill={C.white} stroke={C.ink} strokeWidth={INK.fine * 0.8} />
      <path d="M-6.3 -12 V13 M6.3 -12 V13" {...ink(1)} />
      <path d="M-14 7 C-8 2 -3 8 2 2 S10 -4 13 -7" fill="none" stroke={C.orange} strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 3.4" />
      <circle cx="13" cy="-7" r="2.4" fill={C.green} />
    </g>
  );
  const arrow = (y: number, dir: 1 | -1, fill: "white" | "yellow" | "green") => (
    <g>
      <path d={`M600 ${y} H${600 + dir * 72} C${600 + dir * 76} ${y} ${600 + dir * 78} ${y + 1.5} ${600 + dir * 81} ${y + 4} L${600 + dir * 96} ${y + 19} C${600 + dir * 98} ${y + 21} ${600 + dir * 98} ${y + 23} ${600 + dir * 96} ${y + 25} L${600 + dir * 81} ${y + 40} C${600 + dir * 78} ${y + 42.5} ${600 + dir * 76} ${y + 44} ${600 + dir * 72} ${y + 44} H600 Z`} fill={C[fill]} />
      <circle cx={600 + dir * 10} cy={y + 22} r="2.4" fill={C.ink} />
      <path d={`M${600 + dir * 22} ${y + 17} H${600 + dir * 60} M${600 + dir * 22} ${y + 27} H${600 + dir * 48}`} {...ink(INK.fine)} stroke={fill === "green" ? C.white : C.ink} />
    </g>
  );
  return (
    <Live className="absolute inset-0">
      <LiveLayer depth={0.5} k={0}>
        <Scene viewBox={VB} slice className="sc">
          <Cloud x={560} y={120} s={0.9} color="white" className="lv-cloud" style={v({ "--d": 1 })} />
        </Scene>
      </LiveLayer>
      <LiveLayer depth={0.2} k={1}>
        <Scene viewBox={VB} slice className="sc">
          <Mound cx={232} y={300} rx={190} bottom={G + 4} color="green" />
          <Intro k={0} base={0.8}><House x={232} y={316} s={0.5} wall="white" roof="yellow" door="orange" /></Intro>
          <Smoke x={246} y={254} s={0.55} />
          <Ground y={G - 4} color="green" />
          {/* the path leaves the house door, runs down the hill and across the ground */}
          <Intro kind="reveal" base={1}><path d={`M232 318 C 218 368, 282 398, 244 440 C 218 468, 170 476, 140 ${G + 30}`} fill="none" stroke={C.white} strokeWidth="14" strokeLinecap="round" /></Intro>
          {/* someone walks up the path and goes home: rest halfway up, on the path */}
          <g transform="translate(244 440)">
            <g className="lv-ls-climb" style={v({ "--d": 2.4 })}>
              <g className="lv-step"><Person s={0.5} color="orange" pose="walk" hair="bun" outfit="dress" flip /></g>
            </g>
          </g>
          <Intro k={2} base={0.9}>
            <path d={`M600 ${G} V226`} {...ink(9)} />
            <circle cx="600" cy="224" r="6" fill={C.ink} />
          </Intro>
          <Intro kind="in" k={4} base={1}>{arrow(244, -1, "white")}</Intro>
          <Intro kind="in" k={5} base={1}>{arrow(300, 1, "yellow")}</Intro>
          <Intro kind="in" k={6} base={1}>{arrow(356, -1, "green")}</Intro>
        </Scene>
      </LiveLayer>
      <LiveLayer depth={-0.12} k={2}>
        <Scene viewBox={VB} slice className="sc">
          {/* the suitcase rests on the ground beside the traveller */}
          <Intro k={0} base={1.5}>
            <Placed x={462} y={G}>
              <path d="M-8 -50 V-55 C-8 -58 -6 -60 -3 -60 H3 C6 -60 8 -58 8 -55 V-50" {...ink(3.2)} />
              <rect x="-22" y="-51" width="44" height="49" rx="5" fill={C.white} />
              <path d="M-11 -50 V-3 M11 -50 V-3" {...ink(INK.fine)} />
              <path d="M-17 0 V2 M17 0 V2" {...ink(4)} />
            </Placed>
          </Intro>
          <Intro kind="in" base={1.6}><Person x={x} y={G} s={s} color="yellow" pose="present" hair="cap" hold={map} className="lv-rock" style={v({ "--t": 2.8, "--d": 0.3 })} /></Intro>
        </Scene>
      </LiveLayer>
    </Live>
  );
}

/* ------------------------------------------------------------------ Privacy / cookie (white room, compact) */
// Scena: privacy = l'archivio dei dati: un mobile a cassetti chiuso col lucchetto, una persona che lo chiude con la mano
// sul lucchetto; cookie = una biscottiera sul tavolo e una persona con un biscotto in mano.
// Intro: il terreno, il mobile (o il tavolo), i raccoglitori o il barattolo, poi la persona. Vita leggera:
// privacy = il lucchetto dondola sotto la mano e un raccoglitore si assesta; cookie = chi ha il biscotto saltella e ne
// cadono le briciole.
export function ReadingScene({ kind }: { kind: "privacy" | "cookie" }) {
  const g = 318;
  const s = 1.05;
  if (kind === "cookie") {
    const cookie = (
      <g transform="translate(4 -6)">
        <path d="M5.6 -6.4 A9 9 0 1 0 8.6 2.4 A4 4 0 0 1 5.6 -6.4 Z" fill={C.orange} />
        <path d="M-3 -2.5a1.4 1.4 0 1 0 0.1 0M1.5 3.5a1.4 1.4 0 1 0 0.1 0M-4 4a1.2 1.2 0 1 0 0.1 0" fill={C.ink} />
      </g>
    );
    const [hx, hy] = hand("reach", "front", 196, s, false, g);
    return (
      <Live className="absolute inset-0">
        <LiveLayer k={0}>
          <Scene viewBox="0 0 520 380" slice className="sc">
            <Ground x={40} y={g - 4} w={440} h={48} color="green" />
            <Intro k={0} base={0.6}><Table x={320} y={g} w={170} h={74} top="orange" /></Intro>
            <Intro k={1} base={0.8}><Jar x={290} y={g - 74} s={2.2} color="green" lid="orange" /></Intro>
            {/* green plate with three cookies */}
            <Intro kind="in" k={2} base={0.9}>
              <path d={`M354 ${g - 76} H404 C404 ${g - 80} 400 ${g - 82} 396 ${g - 82} H362 C358 ${g - 82} 354 ${g - 80} 354 ${g - 76} Z`} fill={C.green} />
              {[[366, g - 88], [379, g - 89], [392, g - 88]].map(([cx, cy]) => <ellipse key={cx} cx={cx} cy={cy} rx="7.6" ry="6" fill={C.orange} />)}
              <path d={`M364 ${g - 89}h0.1M378 ${g - 91}h0.1M381 ${g - 87}h0.1M394 ${g - 90}h0.1`} {...ink(2.4)} />
            </Intro>
            <Intro kind="in" base={1.3}><Person x={196} y={g} s={s} color="green" pose="reach" hair="curly" hold={cookie} className="lv-hop" style={v({ "--t": 2.4, "--d": 0.4 })} /></Intro>
            {/* crumbs fall from the cookie to the ground */}
            {[[0, 1.2], [5, 4.4]].map(([o, dd]) => (
              <g key={dd} transform={`translate(${hx + 8 + o} ${hy + 4})`}>
                <g className="lv-drop" style={v({ "--dx": `${6 - o}px`, "--dy": `${g - hy - 8}px`, "--d": dd! })}><circle r="2.2" fill={C.orange} /></g>
              </g>
            ))}
          </Scene>
        </LiveLayer>
      </Live>
    );
  }
  const [lx, ly] = hand("reach", "front", 0, s, false, g);
  const lock = { x: 286, y: ly + 3 };
  return (
    <Live className="absolute inset-0">
      <LiveLayer k={0}>
        <Scene viewBox="0 0 520 380" slice className="sc">
          <Ground x={40} y={g - 4} w={440} h={48} color="green" />
          {/* filing cabinet: two drawers with handles, two binders on top (spines with labels) */}
          <Intro k={2} base={0.9}>
            <g className="lv-rock" style={v({ "--t": 3.4, "--d": 1.4 })}>
              <rect x="300" y={g - 236} width="22" height="72" rx="3" fill={C.orange} />
              <path d={`M311 ${g - 216}V${g - 196}`} {...ink(INK.bold)} />
              <rect x="304" y={g - 186} width="14" height="9" rx="1.6" fill={C.white} />
            </g>
          </Intro>
          <Intro k={3} base={0.9}>
            <rect x="324" y={g - 226} width="22" height="62" rx="3" fill={C.green} />
            <path d={`M335 ${g - 206}V${g - 190}`} {...ink(INK.bold)} />
          </Intro>
          <Intro k={0} base={0.6}>
            <rect x="270" y={g - 164} width="130" height="166" rx="4" fill={C.yellow} />
            <path d={`M278 ${g - 82} H392`} {...ink(INK.fine)} />
            <path d={`M318 ${g - 124} H352 M318 ${g - 42} H352`} {...ink(4)} />
            <rect x="324" y={g - 70} width="22" height="13" rx="2" fill={C.green} />
            <rect x={lock.x - 3} y={lock.y - 16} width="22" height="6" rx="2" fill={C.ink} />
          </Intro>
          {/* the padlock hangs from the top drawer's hasp and swings a little under the hand */}
          <Intro kind="in" k={4} base={1}>
            <g className="lv-swing" style={v({ "--t": 2.2, "--d": 0.5 })}>
              <path d={`M${lock.x - 5} ${lock.y} V${lock.y - 6} a5 5 0 0 1 10 0 V${lock.y}`} {...ink(2.6)} />
              <rect x={lock.x - 9} y={lock.y - 1} width="18" height="15" rx="3" fill={C.orange} />
              <circle cx={lock.x} cy={lock.y + 6} r="2" fill={C.ink} />
            </g>
          </Intro>
          <Intro kind="in" base={1.3}><Person x={lock.x - lx - 7} y={g} s={s} color="green" pose="reach" hair="long" /></Intro>
        </Scene>
      </LiveLayer>
    </Live>
  );
}

/* ------------------------------------------------------------------ Crediti (yellow room) */
// Scena: chi disegna. SOGGETTO: una persona al cavalletto, pennello in mano e tavolozza nell'altra; sulla tela un colle,
// il sole e una casa. A terra il barattolo dei pennelli; a destra un arancio.
// Intro: sole, arancio, il cavalletto, la tela si dipinge dal basso, poi la casa si disegna sulla tela, la persona
// arriva. Vita: chi dipinge muove il pennello sulla tela (dondola sui piedi, la tavolozza con sé), la chioma si muove,
// due uccelli passano.
export function CreditsScene() {
  const s = 1.3;
  const px = 292;
  const brush = (
    <g transform="rotate(-48)">
      <path d="M-6 0 H20" {...ink(2.6)} />
      <path d="M20 -2.4 H24 C27 -2.4 29 -1 30 0 C29 1 27 2.4 24 2.4 H20 Z" fill={C.orange} />
    </g>
  );
  const [bx, by] = hand("reach", "back", px, s);
  return (
    <Live className="absolute inset-0">
      <LiveLayer depth={0.5} k={0}>
        <Scene viewBox={VB} slice className="sc">
          <Intro kind="sun" base={0.4}><Sunny cx={686} cy={100} r={30} color="orange" /></Intro>
          <Birds id="cr-sky" x={160} y={110} x0={-240} x1={640} t={27} d={3} />
        </Scene>
      </LiveLayer>
      <LiveLayer depth={0.2} k={1}>
        <Scene viewBox={VB} slice className="sc">
          <Intro k={3} base={0.85}><OrangeTree x={670} y={G} s={1.35} crown="green" fruit="orange" className="sway" style={v({ "--d": 1.7 })} /></Intro>
          {/* easel: three wooden legs, the canvas on its ledge, a clamp on top */}
          <Intro k={0} base={0.7}>
            <path d={`M350 ${G} L420 134 M490 ${G} L420 134 M420 300 L432 ${G}`} {...ink(7)} />
            <rect x="320" y="150" width="200" height="206" rx="4" fill={C.white} />
            <rect x="308" y="356" width="224" height="11" rx="3" fill={C.orange} />
            <rect x="410" y="140" width="20" height="14" rx="3" fill={C.ink} />
          </Intro>
          <clipPath id="cr-canvas"><rect x="320" y="150" width="200" height="206" rx="4" /></clipPath>
          <Intro kind="reveal" k={1} base={1}>
            <g clipPath="url(#cr-canvas)">
              <circle cx="472" cy="198" r="20" fill={C.orange} />
              <path d="M300 326 C 360 268, 440 278, 540 316 V380 H300 Z" fill={C.green} />
            </g>
          </Intro>
          <path className="lv-draw" style={v({ "--lv-base": "1.4s" })} pathLength="1" d="M364 300 V268 M352 272 L402 236 L452 272 M440 268 V300 M394 300 V280 H410 V300 M420 270 H434 V284 H420 Z M426 252 V238 H436 V258" {...ink(3.4)} />
          {/* jar of brushes on the ground */}
          <Intro k={4} base={0.85}>
            <path d="M548 444 L540 408 M556 444 L558 404 M564 444 L574 410" {...ink(2.6)} />
            <path d="M538 406 l3 -6 M556 402 l2 -6 M574 408 l3 -5" stroke={C.orange} strokeWidth="5" strokeLinecap="round" />
            <Jar x={556} y={G} s={1.05} color="green" lid="green" />
          </Intro>
        </Scene>
      </LiveLayer>
      <LiveLayer depth={-0.12} k={2}>
        <Scene viewBox={VB} slice className="sc">
          <Ground y={G - 4} color="white" />
          <Intro kind="in" base={1.6}>
            {/* painter and palette rock together: the brush strokes the canvas, the hand never leaves the palette */}
            <g className="lv-rock" style={v({ "--t": 1.3, "--d": 0.2 })}>
              {/* palette in the far hand: drawn first, so the hand closes over its edge */}
              <path d={`M${bx - 26} ${by - 2} C${bx - 28} ${by - 14} ${bx - 6} ${by - 18} ${bx + 4} ${by - 10} C${bx + 8} ${by - 6} ${bx + 2} ${by - 2} ${bx + 4} ${by + 3} C${bx + 6} ${by + 10} ${bx - 4} ${by + 12} ${bx - 14} ${by + 10} C${bx - 22} ${by + 8} ${bx - 25} ${by + 4} ${bx - 26} ${by - 2} Z`} fill={C.orange} />
              <circle cx={bx - 18} cy={by - 4} r="3.6" fill={C.white} />
              <circle cx={bx - 9} cy={by - 10} r="3.6" fill={C.green} />
              <circle cx={bx - 14} cy={by + 5} r="3.6" fill={C.yellow} />
              <Person x={px} y={G} s={s} color="green" pose="reach" hair="short" hold={brush} />
            </g>
          </Intro>
        </Scene>
      </LiveLayer>
    </Live>
  );
}
