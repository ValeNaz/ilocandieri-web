/**
 * The seven stations of "Dal seme al barattolo". Each one is its own scene drawn on the coloured panel of its station
 * (STATION_TONES), so nothing here paints the panel background.
 * Layers enter one after the other while the pinned scene scrolls (.rv .b1 / .b2 / .b3, scrubbed by --p in abes.css):
 * at most three layers, and at most one ambient loop per station. Every object is ONE group (Placed / Person / parts).
 * Safe area: subjects stay inside x 150..850 and y 160..800, so the phone crop (about x 115..885) and the desktop crop
 * (about y 70..830) never cut a figure. Every element is checked against what is DIRECTLY behind it (no same colours).
 * v4 language (DESIGN.md): no outer contours on masses, people DO the thing (hands on the tool, the crate, the jar, the
 * fruit; feet on the ground, sitters on a seat), objects in few specific details, one subject + quiet space.
 * Scene vive: the PinScene scroll script (the .rv layers) stays the subject and IS the intro; each station only adds
 * a few life loops (kit/live.css) inside a <Live> box, which runs them while the station is in view.
 */
import type { ReactNode } from "react";
import { Live } from "@/components/public/kit/Live";
import { C, Hill, INK as W, OrangeTree, Person, Route, Sun, Wheat, handAt } from "../parts";
import { Bird, Butterfly, Puffs, v } from "./life";
import { Bender, Crate, Grain, Jar, PastaPack, Plate, Pot, Sack, Table } from "./parts";
import "./abes-live.css";

const INK = C.ink;
const ROUND = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function StationSvg({ children }: { children: ReactNode }) {
  return (
    <Live className="abes-live">
      <svg viewBox="80 0 840 900" className="abes-svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        {children}
      </svg>
    </Live>
  );
}

/** Perspective furrows: ink lines from the horizon toward the viewer, all aimed at one vanishing point. */
function Furrows({ top, vp = [500, top - 50], bottoms }: { top: number; vp?: [number, number]; bottoms: number[] }) {
  const t = (top - vp[1]) / (900 - vp[1]);
  return (
    <g stroke={INK} strokeWidth="2.5" strokeLinecap="round" opacity="0.45">
      {bottoms.map((xb) => <path key={xb} d={`M${(vp[0] + (xb - vp[0]) * t).toFixed(1)} ${top} L${xb} 900`} />)}
    </g>
  );
}

/** Tomato plant tied to an ink cane: leafy masses (no contour), a few ripe tomatoes with their green calyx. One group. */
function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M4 0 V-66" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M-30 -4 C-40 -16 -36 -32 -22 -36 C-24 -50 -10 -58 2 -52 C10 -62 28 -56 28 -42 C40 -38 40 -18 30 -6 C20 2 -20 4 -30 -4 Z M24 -50 C30 -58 38 -58 42 -54 C38 -48 32 -46 24 -50 Z" fill={C.green} />
      <path d="M-12 -12 C-6 -24 2 -30 4 -40 M18 -16 C14 -24 8 -30 4 -36" stroke={INK} strokeWidth={W.fine} opacity="0.45" {...ROUND} />
      {[[-16, -24, 7], [14, -32, 7.5], [20, -12, 6.5]].map(([cx, cy, r], i) => (
        <g key={i}><circle cx={cx} cy={cy} r={r} fill={C.orange} /><path d={`M${cx! - 3.6} ${cy! - r! + 0.6} q3.6 2.4 3.6 -1 q0 3.4 3.6 1`} stroke={C.green} strokeWidth="2.2" {...ROUND} /></g>
      ))}
    </g>
  );
}

/* Scena: il seminatore cammina lungo i solchi e lascia cadere i chicchi dalla mano, la sacca di semente al fianco;
   un medaglione ingrandisce un chicco di Tumminia. Soggetto: il chicco nel medaglione.
   Vita: il medaglione respira (bob); il seminatore avanza e torna lungo il solco a piccoli passi e i chicchi gli cadono
   dalla mano uno alla volta; due uccelli passano nel cielo. */
export function SceneSeed() {
  const s = 1.5, [hx, hy] = handAt("walk", "front", "regular");
  const X = 352, G = 784;
  // grains, relative to the sower's feet: they rest in a little cascade under the hand and, alive, fall to the soil
  const fall = [0, 1, 2].map((i) => [(hx + 3 + i * 4) * s, (hy + 10 + i * 13) * s, 30 + i * 30] as const);
  return (
    <StationSvg>
      <g className="rv b1">
        <Hill width={1000} y={664} amp={8} bottom={900} color="orange" seed={3} waves={0.8} />
        <Furrows top={672} bottoms={[-500, -150, 200, 500, 800, 1150, 1500]} />
      </g>
      <g className="rv b2">
        <Sack x={228} y={800} s={0.86} label="yellow" name={["Tumminia"]} />
        <g transform={`translate(${X} ${G})`}>
          <g className="lv-move lv-alt" style={v({ "--x0": "-26px", "--x1": "30px", "--t": 6.5, "--d": 0.6 })}>
            <g className="lv-step">
              <g transform={`scale(${s})`}>
                <Person color="green" pose="walk" build="regular" hair="cap" />
                {/* the seed bag slung across the body: strap over the far shoulder, bag at the near hip */}
                <path d="M-7 -75 L9 -50" stroke={INK} strokeWidth={W.bold} strokeLinecap="round" />
                <path d="M1 -52 H17 C18.2 -52 19 -51.2 19 -50 V-38 C19 -35 17 -33 14 -33 H4 C1 -33 -1 -35 -1 -38 V-50 C-1 -51.2 -0.2 -52 1 -52 Z" fill={C.yellow} />
                <path d="M1 -46 H17" stroke={INK} strokeWidth={W.fine} strokeLinecap="round" />
              </g>
            </g>
            {fall.map(([x, y, r], i) => (
              <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                <g className="lv-drop" style={v({ "--dx": "4px", "--dy": `${(-y - 2).toFixed(1)}px`, "--d": i * 2.1 })}><Grain rx={5} ry={8.5} rot={r} /></g>
              </g>
            ))}
          </g>
        </g>
      </g>
      <Bird x={220} y={200} s={1.6} x0={-200} x1={760} y0={30} y1={-20} t={22} d={1} />
      <Bird x={250} y={236} s={1.2} x0={-200} x1={760} y0={20} y1={-30} t={22} d={1.8} />
      <g className="rv b3">
        <Route d="M598 430 Q500 600 410 760" width={4} />
        <g className="bob" style={{ ["--d" as string]: 0.8 }}>
          <circle cx="680" cy="320" r="134" fill={C.green} />
          <Grain x={680} y={320} rx={50} ry={82} rot={18} />
        </g>
      </g>
    </StationSvg>
  );
}

/* Scena: sezione del terreno confiscato: sotto, il chicco mette radici; sopra, il germoglio esce alla luce; a destra
   una persona vanga, la lama nella terra. Soggetto: il germoglio (cresce con lo scroll).
   Vita: le foglie del germoglio ondeggiano, chi vanga dondola sul colpo di vanga, un lombrico va e viene nella terra. */
export function SceneSoil() {
  return (
    <StationSvg>
      <g className="rv b1">
        <Hill width={1000} y={404} amp={10} bottom={900} color="yellow" seed={2} waves={1.3} />
        {[540, 660, 780].map((y, i) => (
          <path key={y} d={`M-10 ${y} q80 -20 170 0 t170 0 t170 0 t170 0 t170 0 t170 0`} fill="none" stroke={INK} strokeWidth="2.5" opacity="0.3" transform={`translate(${i * -40} 0)`} />
        ))}
        {/* stones in the soil: soft orange pebbles on the yellow soil, a fine crack on the larger ones */}
        {[[200, 500, 18], [790, 560, 20], [290, 730, 22], [740, 760, 16]].map(([x, y, r], i) => (
          <g key={i}>
            <path d={`M${x! - r!} ${y! + 2} C${x! - r!} ${y! - r! * 0.8} ${x! + r! * 0.6} ${y! - r! * 0.9} ${x! + r!} ${y! - 2} C${x! + r! * 1.1} ${y! + r! * 0.6} ${x! - r! * 0.8} ${y! + r! * 0.8} ${x! - r!} ${y! + 2} Z`} fill={C.orange} />
            {r! >= 20 && <path d={`M${x! - 4} ${y! - r! * 0.5} l4 6 l-2 6`} stroke={INK} strokeWidth={W.fine} opacity="0.5" {...ROUND} />}
          </g>
        ))}
      </g>
      <g className="rv b2">
        <path d="M500 628 C480 680 452 712 424 784 M500 628 C510 700 520 740 540 800 M498 620 C468 650 404 652 356 700 M502 620 C540 660 600 668 640 650" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M470 676 l-12 4 M520 708 l12 2 M410 668 l-4 -10 M600 664 l4 10" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <Grain x={500} y={600} rx={22} ry={32} rot={-14} fill="orange" />
        <Person x={696} y={410} s={1.4} color="green" pose="dig" item="spade" itemColor="white" hair="long" className="lv-rock" style={v({ "--t": 1.4 })} />
        {/* an earthworm in the living soil (orange on the yellow soil) */}
        <g transform="translate(640 600)">
          <g className="lv-move lv-alt" style={v({ "--x0": "-40px", "--x1": "40px", "--t": 9, "--d": 1 })}>
            <path d="M-18 0 c4 -6 8 -6 12 0 s8 6 12 0 s8 -6 12 0" stroke={C.orange} strokeWidth="6" {...ROUND} />
          </g>
        </g>
        <path d="M748 408 q10 -10 22 -2" stroke={INK} strokeWidth="2.4" opacity="0.6" {...ROUND} />
      </g>
      <g className="rv b3">
        <g className="abes-sprout">
          <g className="sway-s" style={v({ "--d": 0.7 })}>
          <path d="M500 572 C500 470 494 360 500 246" fill="none" stroke={C.green} strokeWidth="13" strokeLinecap="round" />
          <path d="M500 340 C430 340 396 290 392 246 C452 246 492 286 500 340 Z" fill={C.green} />
          <path d="M500 300 C570 300 604 250 608 206 C548 206 508 246 500 300 Z" fill={C.green} />
          <path d="M406 258 C440 280 470 304 494 336 M594 218 C560 240 530 266 506 296" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
          <path d="M500 246 C492 236 494 222 500 214 C506 222 508 236 500 246 Z" fill={C.green} />
          </g>
        </g>
      </g>
    </StationSvg>
  );
}

/* Scena: il campo del Giardino in tre parti: grano Tumminia a sinistra, file dell'orto al centro (in prospettiva),
   un arancio a destra e una persona che coglie un'arancia, la mano sul frutto. Soggetto: il campo intero.
   Vita: il grano ondeggia, una farfalla bianca gira sopra le file dell'orto, due uccelli attraversano il cielo. */
export function SceneField() {
  const rows = [{ y: 650, r: 11, n: 6, gap: 34 }, { y: 702, r: 14, n: 6, gap: 42 }, { y: 766, r: 18, n: 5, gap: 56 }];
  // the picker's raised hand lands on the tree's lower-left fruit (OrangeTree fruit at [-27,-52] in tree units)
  const T = { x: 772, y: 652, s: 1.9 }, P = 1.43, [rx, ry] = handAt("reach", "front", "regular");
  const px = T.x - 27 * T.s - rx * P, py = T.y - 52 * T.s - ry * P;
  return (
    <StationSvg>
      <Bird x={300} y={180} s={1.6} x0={-260} x1={700} y0={20} y1={-20} t={24} d={2} />
      <Bird x={330} y={214} s={1.2} x0={-260} x1={700} y0={10} y1={-26} t={24} d={2.9} />
      <g className="rv b1">
        <Hill width={1000} y={470} amp={10} bottom={900} color="orange" seed={0.6} waves={1.1} />
        {rows.map(({ y, r, n, gap }) => {
          const x0 = 520 - ((n - 1) * gap) / 2;
          return (
            <g key={y}>
              <path d={`M${x0 - r - 6} ${y + r * 0.9} H${x0 + (n - 1) * gap + r + 6}`} stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
              {Array.from({ length: n }, (_, i) => {
                const cx = x0 + i * gap;
                return (
                  <g key={i}>
                    {/* a lettuce: an outer rosette and the heart, with one white rib */}
                    <path d={`M${cx - r} ${y + r * 0.5} C${cx - r * 1.2} ${y - r * 0.6} ${cx - r * 0.3} ${y - r * 1.1} ${cx} ${y - r * 0.9} C${cx + r * 0.3} ${y - r * 1.1} ${cx + r * 1.2} ${y - r * 0.6} ${cx + r} ${y + r * 0.5} Z`} fill={C.green} />
                    <path d={`M${cx - r * 0.45} ${y + r * 0.3} q${r * 0.45} ${-r * 0.8} ${r * 0.9} 0`} stroke={C.white} strokeWidth="2.2" {...ROUND} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
      <g className="rv b2">
        <g className="sway" style={{ ["--d" as string]: 0.9 }}>
          {Array.from({ length: 8 }, (_, i) => <Wheat key={i} x={176 + i * 20} y={700 + (i % 2) * 14} h={168 + ((i * 37) % 44)} color="yellow" />)}
        </g>
      </g>
      <g className="rv b3">
        <OrangeTree x={T.x} y={T.y} s={T.s} />
        <Butterfly x={420} y={610} s={1.6} dx={120} dy={-50} t={8} d={0.5} />
        <Person x={px} y={py} s={P} color="white" pose="reach" build="regular" hair="bun" outfit="trousers" />
      </g>
    </StationSvg>
  );
}

/* Scena: la raccolta: una persona piegata riempie il cesto tra le piante di pomodoro, un'altra porta una cassetta
   piena verso il bancale dove aspettano le altre. Soggetto: la persona con la cassetta.
   Vita: chi porta la cassetta fa avanti e indietro verso il bancale a piccoli passi, chi raccoglie si china sul cesto,
   le piante si muovono al vento, i raggi del sole girano piano. */
export function SceneHarvest() {
  return (
    <StationSvg>
      <g className="rv b1">
        <Sun cx={230} cy={210} r={52} rays={10} color="yellow" className="spin-slow" />
        <Hill width={1000} y={540} amp={14} bottom={900} color="orange" seed={2} waves={1.2} />
        <g className="sway-s" style={v({ "--d": 0.4 })}><Bush x={190} y={786} s={1.3} /></g>
        <g className="sway-s" style={v({ "--d": 2.1 })}><Bush x={410} y={786} s={1.2} /></g>
      </g>
      <g className="rv b2">
        {/* a wooden pallet: deck boards on three ink blocks */}
        <rect x="604" y="776" width="254" height="12" rx="3" fill={C.yellow} />
        <path d="M618 788 v12 M731 788 v12 M844 788 v12" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <path d="M612 800 H850" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <Crate x={649} y={776} w={74} h={44} produce="cabbage" />
        <Crate x={731} y={776} w={74} h={44} produce="onion" />
        <Crate x={813} y={776} w={74} h={44} produce="cabbage" />
      </g>
      <g className="rv b3">
        <Bender x={262} y={786} s={1.45} color="white" tool="basket" basket="green" className="lv-rock" style={v({ "--t": 1.8, "--d": 0.5 })} />
        <g transform="translate(538 790)">
          <g className="lv-move lv-alt" style={v({ "--x0": "-30px", "--x1": "22px", "--t": 4.6, "--d": 1.2 })}>
            <g className="lv-step"><Person s={1.5} color="green" pose="carry" item="crate" itemColor="yellow" hair="curly" build="broad" /></g>
          </g>
        </g>
      </g>
    </StationSvg>
  );
}

/* Scena: dentro il laboratorio del Giardino: la pentola sul fornello, una persona porta dentro una cassetta di
   pomodori dall'orto, i vasetti appena riempiti sul banco; dalla finestra si vede l'arancio (si trasforma sul posto).
   Soggetto: il banco con i vasetti. Vita: il vapore sale dalla pentola, chi porta la cassetta va e viene tra banco e
   fornello, l'arancio fuori dalla finestra si muove al vento. */
export function SceneLab() {
  // The wall is yellow: the white glass jars, the white pot and its steam stand in front of orange tiles (shelf and
  // stove wall, bench splashback), so no orange lids or labels here.
  const shelf = [{ label: "green", content: "orange", lid: "white" }, { label: "white", content: "green", lid: "green" }, { label: "green", content: "yellow", lid: "white" }, { label: "white", content: "orange", lid: "green" }, { label: "green", content: "orange", lid: "white" }] as const;
  return (
    <StationSvg>
      <g className="rv b1">
        <rect x="130" y="216" width="740" height="566" rx="30" fill={C.yellow} />
        <path d="M130 712 H870 V752 Q870 782 840 782 H160 Q130 782 130 752 Z" fill={C.white} />
        <path d="M150 712 H850" stroke={INK} strokeWidth={W.bold} strokeLinecap="round" />
        {/* window: white light, the orange tree outside, mullions, a green sill */}
        <rect x="604" y="272" width="214" height="172" rx="12" fill={C.white} />
        <g className="sway-s" style={v({ "--d": 1.5 })}><OrangeTree x={711} y={440} s={1.15} /></g>
        <path d="M711 278 V438 M610 304 H812" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <rect x="592" y="440" width="238" height="14" rx="5" fill={C.green} />
        {/* wall shelf on two ink brackets, five filled jars */}
        {/* orange tiles from the shelf down to the stove: the jars' glass and the white steam both read on them */}
        <rect x="170" y="300" width="360" height="300" rx="6" fill={C.orange} />
        <path d="M170 460 H530 M170 530 H530 M260 412 V600 M350 412 V600 M440 412 V600" stroke={INK} strokeWidth={W.fine} opacity="0.3" />
        <rect x="170" y="400" width="360" height="12" rx="4" fill={C.green} />
        <path d="M200 412 l14 18 M500 412 l-14 18" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        {shelf.map((j, i) => <Jar key={i} x={208 + i * 71} y={400} s={0.5} {...j} />)}
      </g>
      <g className="rv b2">
        {/* the stove: oven door with its handle, four white knobs, the pot on the hob */}
        <rect x="186" y="600" width="246" height="112" rx="8" fill={C.green} />
        <path d="M206 626 H412 M226 640 H392" stroke={INK} strokeWidth={W.bold} strokeLinecap="round" />
        {[226, 286, 346, 406].map((x) => <circle key={x} cx={x} cy="690" r="7.5" fill={C.white} />)}
        <Pot x={309} y={600} s={0.92} body="white" />
        <Puffs x={309} y={486} r={11} rise={70} spread={18} t={3.8} d={0.3} />
      </g>
      <g className="rv b3">
        <g transform="translate(508 748)">
          <g className="lv-move lv-alt" style={v({ "--x0": "-20px", "--x1": "22px", "--t": 5.2, "--d": 2 })}>
            <g className="lv-step"><Person s={1.35} color="green" pose="carry" item="crate" itemColor="orange" outfit="trousers" hair="bun" flip /></g>
          </g>
        </g>
        {/* work bench: an orange tiled splashback, top, apron rail, ink legs, three fresh jars */}
        <rect x="596" y="532" width="236" height="110" rx="6" fill={C.orange} />
        <path d="M596 568 H832 M596 604 H832 M655 532 V642 M714 532 V642 M773 532 V642" stroke={INK} strokeWidth={W.fine} opacity="0.35" />
        <rect x="586" y="640" width="256" height="14" rx="5" fill={C.green} />
        <path d="M600 662 H828" stroke={INK} strokeWidth={W.bold} strokeLinecap="round" />
        <path d="M612 654 V744 M816 654 V744" stroke={INK} strokeWidth="8" strokeLinecap="round" />
        <Jar x={642} y={640} s={0.6} label="green" content="orange" lid="white" name={["Caponata"]} />
        <Jar x={714} y={640} s={0.6} label="green" content="white" lid="green" name={["Cipollata"]} />
        <Jar x={786} y={640} s={0.6} label="white" content="orange" lid="green" name={["Sugo"]} />
      </g>
    </StationSvg>
  );
}

/* Scena: lo scaffale dei prodotti ABES veri (vasetti in alto, pasta e farine al centro, cassette in basso); una persona
   salita sullo sgabello, appoggia l'ultimo vasetto nel posto libero del ripiano. Soggetto: lo scaffale pieno. Nessun loop. */
export function SceneShelf() {
  // `place`: the near hand is forward at shoulder height. The figure stands on a step stool (top at G) so that hand,
  // gripping the jar low on its side, sets it down on the middle shelf (top at y 600) in the free slot near x 640.
  const S = 1.75, js = 0.42 / S, [hx, hy] = handAt("place", "front", "regular");
  const grip = 7; // how far above the jar bottom the hand holds it (person units)
  const G = 600 - (hy + grip) * S, X = 650 + hx * S;
  return (
    <StationSvg>
      <g className="rv b1">
        <rect x="0" y="790" width="1000" height="130" fill={C.white} />
        <path d="M150 790 H860" stroke={INK} strokeWidth={W.fine} strokeLinecap="round" opacity="0.4" />
        {/* shop shelving: orange case with a crown board and feet, green shelves */}
        <rect x="150" y="214" width="552" height="576" rx="10" fill={C.orange} />
        <rect x="140" y="196" width="572" height="22" rx="6" fill={C.orange} />
        <path d="M150 220 H702" stroke={INK} strokeWidth={W.bold} strokeLinecap="round" />
        {[400, 600, 776].map((y) => <rect key={y} x="162" y={y} width="528" height="14" rx="4" fill={C.green} />)}
      </g>
      <g className="rv b2">
        <Jar x={222} y={400} s={0.95} label="green" content="orange" lid="yellow" name={["Caponata", "siciliana"]} />
        <Jar x={337} y={400} s={0.95} label="yellow" content="white" lid="green" name={["Cipollata", "agrodolce"]} />
        <Jar x={452} y={400} s={0.95} label="white" content="green" lid="yellow" name={["Sugo", "al basilico"]} />
        <Jar x={567} y={400} s={0.95} label="green" content="yellow" lid="white" name={["Ceci"]} />
        <PastaPack x={224} y={600} s={0.88} label="green" name={["Busiate", "Tumminia"]} />
        <PastaPack x={336} y={600} s={0.88} label="white" name={["Abbracci", "Tumminia"]} />
        <Sack x={448} y={600} s={0.92} label="yellow" name={["Semolato", "Tumminia"]} />
        <Sack x={552} y={600} s={0.92} label="green" name={["Farina", "di ceci"]} />
        <Crate x={300} y={776} w={110} h={46} s={1.2} produce="onion" />
        <Crate x={520} y={776} w={110} h={46} s={1.2} produce="cabbage" />
      </g>
      <g className="rv b3">
        {/* two-tread step stool: green treads, ink frame, standing on the floor */}
        <path d={`M${X - 34} 790 L${X - 26} ${G} M${X + 34} 790 L${X + 26} ${G} M${X - 30} ${(G + 790) / 2} H${X + 30}`} stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <rect x={X - 34} y={G - 2} width="68" height="10" rx="3" fill={C.green} />
        <rect x={X - 38} y={(G + 790) / 2 - 5} width="76" height="10" rx="3" fill={C.green} />
        <Person x={X} y={G} s={S} color="green" pose="place" build="regular" hair="short" outfit="trousers" flip
          hold={<Jar x={5} y={grip} s={js} label="green" content="orange" lid="white" />} />
      </g>
    </StationSvg>
  );
}

/* Scena: la tavola all'aperto: due persone sedute ai capi del tavolo (la mano sul piatto), piatti di busiate e
   il vasetto di caponata al centro. Soggetto: la tavola. Vita, quieta: i raggi del sole girano piano, un uccello passa
   (niente vapore dai piatti: sul cielo bianco e sulla collina gialla non si leggerebbe). */
export function SceneTable() {
  return (
    <StationSvg>
      <g className="rv b1">
        <Sun cx={720} cy={250} r={58} rays={10} color="orange" className="spin-slow" />
        <Hill width={1000} y={652} amp={12} bottom={900} color="yellow" seed={1.4} waves={1.1} />
        <Bird x={260} y={260} s={1.5} x0={-240} x1={720} y0={20} y1={-30} t={26} d={3} />
        {/* White paving, not green: the figures' shoes must not melt into the ground */}
        <rect x="0" y="800" width="1000" height="120" fill={C.white} />
        <path d="M120 800 H880" stroke={INK} strokeWidth={W.fine} strokeLinecap="round" opacity="0.4" />
      </g>
      <g className="rv b2">
        <Table x={500} y={694} w={380} legs={106} top="green" cloth="orange" />
        <Plate x={374} y={682} s={0.9} />
        <Plate x={626} y={682} s={0.9} />
        {/* the jar stands against the white sky: its glass keeps the fine ink contour (white object rule), the caponata inside is orange */}
        <Jar x={500} y={680} s={0.6} label="green" content="orange" lid="orange" name={["Caponata"]} />
        {/* the diners sit at the two ends (`sit-table`): knees stop at the cloth, the near hand rests on the plate's rim */}
        {[{ x: 268, color: "orange" as const, flip: false, hair: "curly" as const }, { x: 732, color: "green" as const, flip: true, hair: "long" as const }].map((p) => (
          <g key={p.x} transform={`translate(${p.x} 800) scale(${p.flip ? -1.9 : 1.9} 1.9)`}>
            {/* dark wooden chair (ink, it reads on both hill and sky): seat at y -40, back post, legs */}
            <path d="M-20 -36 V-2 M8 -36 V-2 M-20 -40 V-74" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
            <rect x="-24" y="-42" width="36" height="7" rx="3" fill={INK} />
            <Person color={p.color} pose="sit-table" hair={p.hair} />
          </g>
        ))}
      </g>
    </StationSvg>
  );
}

export const STATIONS = [SceneSeed, SceneSoil, SceneField, SceneHarvest, SceneLab, SceneShelf, SceneTable] as const;

/**
 * Room colour around each station and colour of the scene panel inside it. The room differs from the panel AND from
 * every shape that touches the panel edge (ground, hills), so the rounded panel never melts into its room; neighbouring
 * rooms never share a tone (the band before is green, the photo room after is orange).
 */
export const STATION_TONES = [
  { room: "yellow", panel: "white" }, // edges: white sky, orange ground
  { room: "green", panel: "orange" }, // edges: orange sky, yellow soil
  { room: "white", panel: "yellow" }, // edges: yellow sky, orange ground
  { room: "yellow", panel: "green" }, // edges: green sky, orange ground
  { room: "green", panel: "orange" }, // the lab sits inside the orange panel
  { room: "orange", panel: "yellow" }, // edges: yellow wall, white floor
  { room: "green", panel: "white" }, // edges: white sky, yellow hill, white paving
] as const;
