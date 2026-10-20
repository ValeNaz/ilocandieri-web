/**
 * Scene dell'hub /luoghi (v4, "lo stesso illustratore"). Ogni scena: un soggetto, due o tre gruppi secondari, spazio
 * vuoto voluto; persone che fanno davvero l'azione (mani sugli oggetti, piedi a terra), oggetti specifici, nessun
 * contorno esterno sulle masse. Al massimo 3 cose che si muovono. Nessun testo dentro i disegni.
 */
import type { CSSProperties } from "react";
import { Stage, Layer } from "@/components/public/kit/Stage";
import { Cloud, Column, Hill, OliveTree, OrangeTree, Person, Placed, Sun, handAt } from "../parts";
import { Crate } from "../home/geo";
import { BallArt, C, MapPin, Sv, TopTree, type PinMark } from "./parts";
import { BareTree, Bird, Butterfly, Lv, LvAt, Bench, Bottle, Chain, Chair, Deed, GateLeaf, House, Key, Ladder, MiniHouse, Padlock, Pillar, SportBag, Table, TableSet, TopOlive, TuffWall, Volleyball, VolleyNet, Weeds } from "./parts-b";
import { SceneFrame } from "./ui";
import { Live } from "@/components/public/kit/Live";
import "./live-b.css";

const ink = { stroke: C.ink, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const v = (o: Record<string, string | number>) => o as CSSProperties;

/* =====================================================================
   1. APERTURA
   ===================================================================== */
export const GATE_AR = "1000 / 560";
/* the frame is a close crop around the gate (same 1000:560 ratio), so the gate and the people read big */
const GV = "170 230 660 369.6";

function GateFar() {
  return (
    <Sv vb={GV} meet align="xMidYMax">
      <Lv cls="lv-sun" vars={{ "--lv-y": "120px" }}><g className="spin-slow" style={v({ "--t": "60s" })}><Sun cx={786} cy={290} r={26} color="yellow" rays={12} /></g></Lv>
      <Cloud x={432} y={274} s={0.5} className="lv-cloud" style={v({ "--d": 0 })} />
      {/* uno stormo che attraversa il cielo, da destra verso sinistra */}
      <g transform="translate(480 262)">
        <Lv cls="lv-fly" t={30} d={1.5} vars={{ "--x0": "380px", "--x1": "-380px", "--y0": "0px", "--y1": "-14px" }}>
          <Bird /><g transform="translate(30 14)"><Bird s={0.8} /></g><g transform="translate(56 -6)"><Bird s={0.9} /></g>
        </Lv>
      </g>
    </Sv>
  );
}

const TREES: { x: number; y: number; s: number; olive?: boolean; sway?: number }[] = [
  { x: -40, y: 402, s: 1.2 }, { x: 92, y: 404, s: 1.4, sway: 0 }, { x: 214, y: 398, s: 1.15, olive: true }, { x: 326, y: 406, s: 1.5, sway: 2.4 },
  { x: 694, y: 406, s: 1.45, sway: 1.2 }, { x: 806, y: 398, s: 1.1, olive: true }, { x: 912, y: 404, s: 1.3, sway: 3.1 }, { x: 1040, y: 402, s: 1.2 },
];

function GateWall() {
  return (
    <Sv vb={GV} meet align="xMidYMax">
      {/* agrumeto e ulivi dietro il muro: spuntano uno dopo l'altro sopra la copertina, alcuni ondeggiano */}
      {TREES.map((t, i) => (
        <LvAt key={t.x} x={t.x} y={t.y} cls="lv-pop" k={[4, 0, 5, 1, 2, 6, 3, 7][i]} base={0.85}>
          <g className={t.sway !== undefined ? "sway" : undefined} style={t.sway !== undefined ? v({ "--d": t.sway }) : undefined}>
            {t.olive ? <OliveTree s={t.s} /> : <OrangeTree s={t.s} />}
          </g>
        </LvAt>
      ))}
      {/* oltre il cancello: il giardino, il vialetto che continua, un arancio giovane */}
      <Lv cls="lv-reveal" base={1}>
        <rect x="380" y="452" width="240" height="60" fill={C.green} />
        <path d="M484 452 H516 L552 500 H448 Z" fill={C.white} stroke={C.white} strokeWidth="4" strokeLinejoin="round" />
      </Lv>
      <LvAt x={468} y={458} cls="lv-pop" k={8} base={0.85}><OrangeTree s={0.62} /></LvAt>
      {/* muro di tufo che prosegue oltre il riquadro, interrotto dal varco */}
      <Lv cls="lv-rise" k={0} vars={{ "--lv-y": "50px" }}>
        <TuffWall x={-1000} y={376} w={1411} h={124} />
        <TuffWall x={589} y={376} w={1411} h={124} />
      </Lv>
      <Lv cls="lv-rise" k={2} vars={{ "--lv-y": "60px" }}>
        <Pillar x={423} y={500} h={166} />
        <Pillar x={577} y={500} h={166} />
      </Lv>
      {/* il cancello di ferro: le due ante si aprono una volta, quando la scena entra in vista (riposo = aperto) */}
      <g className="lb-leaf-l" style={v({ "--hx": "437px" })}><GateLeaf x={437} top={398} w={63} h={100} /></g>
      <g className="lb-leaf-r" style={v({ "--hx": "563px" })}><GateLeaf x={500} top={398} w={63} h={100} flip /></g>
    </Sv>
  );
}

function GateNear() {
  return (
    <Sv vb={GV} meet align="xMidYMax">
      <Lv cls="lv-rise" k={1} vars={{ "--lv-y": "40px" }}><rect x="-1000" y="496" width="3000" height="400" fill={C.green} /></Lv>
      <Lv cls="lv-reveal" base={0.9}><path d="M446 498 H554 L720 640 H280 Z" fill={C.white} stroke={C.white} strokeWidth="6" strokeLinejoin="round" /></Lv>
      {/* a destra: chi riempie la cassetta si piega e si rialza, chi vanga affonda la vanga */}
      <Lv cls="lv-in" k={2} base={1.6}>
        <Crate x={696} y={549} s={1} color="white" />
        <LvAt x={654} y={546} cls="lv-rock" t={1.9} d={0.3}><Person s={0.98} color="green" pose="bend" hair="cap" /></LvAt>
      </Lv>
      <Lv cls="lv-in" k={3} base={1.6}><LvAt x={772} y={548} cls="lv-rock" t={1.3} d={0.8}><Person color="orange" pose="dig" hair="short" build="broad" /></LvAt></Lv>
      {/* chi accoglie, sulla soglia, saluta chi arriva */}
      <Lv cls="lv-in" k={1} base={1.6}><LvAt x={398} y={536} cls="lv-rock" t={2.6} d={1.1}><Person color="green" pose="wave" flip hair="long" outfit="trousers" /></LvAt></Lv>
      {/* protagonista: chi porta la cassetta arriva, sale il vialetto e passa il cancello */}
      <Lv cls="lv-in" k={0} base={1.6}>
        <LvAt x={292} y={550} cls="lb-gate"><g className="lv-step"><Person color="orange" pose="carry" itemColor="white" s={1.02} hair="curly" /></g></LvAt>
      </Lv>
    </Sv>
  );
}

// Scena viva: il cancello del bene confiscato si apre sul giardino. Intro: muro e pilastri salgono, il sole sorge, gli
// alberi spuntano, il vialetto appare, le ante si aprono, arrivano le persone. Vita: chi porta la cassetta entra dal
// cancello, chi riempie la cassetta e chi vanga lavorano, chi accoglie saluta, nuvole e uno stormo.
export function GateScene() {
  return (
    <SceneFrame label="Un cancello di ferro tra due pilastri, in un muro di tufo, si apre su un giardino di aranci e ulivi. Una persona entra con una cassetta di arance, un'altra la saluta sulla soglia; più in là qualcuno riempie una cassetta e qualcuno vanga.">
      <Live className="h-full">
        <Stage className="lw-stage">
          <Layer z={-18}><div className="depth absolute inset-0" style={v({ "--depth": 0.5 })}><GateFar /></div></Layer>
          <Layer z={0}><div className="depth absolute inset-0" style={v({ "--depth": 0.15 })}><GateWall /></div></Layer>
          <Layer z={20}><GateNear /></Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

/* =====================================================================
   2. TRE PASSI: confiscato, assegnato, vissuto
   ===================================================================== */
// Scena viva: il terreno confiscato e chiuso (soggetto: il cancello con catena e lucchetto). Intro: terra, muri,
// pilastri e cancello salgono, l'albero secco e le erbacce spuntano. Vita: solo il vento (erbacce) e il lucchetto che
// dondola sulla catena: nessuno entra.
export function StepPlot() {
  return (
    <Live className="h-full">
      <svg viewBox="0 0 320 220" className="lw-svg" aria-hidden="true" focusable="false">
        {/* dietro il muro: un albero secco e le erbacce, nessuno se ne occupa */}
        <LvAt x={250} y={126} cls="lv-pop" k={4} base={0.7}><BareTree s={1.15} /></LvAt>
        <LvAt x={62} y={118} cls="lv-pop" k={5} base={0.7}><g className="sway-s" style={v({ "--d": 0 })}><Weeds x={0} y={0} s={1.1} color="white" /></g></LvAt>
        <LvAt x={218} y={118} cls="lv-pop" k={6} base={0.7}><g className="sway-s" style={v({ "--d": 1.7 })}><Weeds x={0} y={0} s={0.9} color="white" /></g></LvAt>
        <LvAt x={162} y={170} cls="lv-pop" k={7} base={0.7}><Weeds x={0} y={0} s={1.1} color="white" /></LvAt>
        <Lv cls="lv-rise" k={0} vars={{ "--lv-y": "30px" }}><path d="M10 222 V182 Q160 170 310 182 V222 Z" fill={C.green} stroke={C.green} strokeWidth="6" strokeLinejoin="round" /></Lv>
        <Lv cls="lv-rise" k={1} vars={{ "--lv-y": "40px" }}>
          <TuffWall x={22} y={124} w={108} h={54} row={18} brick={36} />
          <TuffWall x={190} y={124} w={108} h={54} row={18} brick={36} />
        </Lv>
        <Lv cls="lv-rise" k={2} vars={{ "--lv-y": "50px" }}>
          <Pillar x={140} y={178} w={20} h={64} />
          <Pillar x={180} y={178} w={20} h={64} />
          {/* il cancello chiuso, con catena e lucchetto */}
          <GateLeaf x={150} top={124} w={15} h={52} bars={2} />
          <GateLeaf x={165} top={124} w={15} h={52} bars={2} flip />
          <Chain x1={146} y1={142} x2={184} y2={142} sag={8} n={7} />
        </Lv>
        <Lv cls="lv-in" k={0} base={1.2}><Lv cls="lv-swing" t={3.6} d={0.5}><Padlock x={165} y={158} /></Lv></Lv>
        <LvAt x={40} y={186} cls="lv-pop" k={8} base={0.7}><g className="sway-s" style={v({ "--d": 0.9 })}><Weeds x={0} y={0} s={1} color="white" /></g></LvAt>
        <LvAt x={282} y={188} cls="lv-pop" k={9} base={0.7}><g className="sway-s" style={v({ "--d": 2.6 })}><Weeds x={0} y={0} s={1.2} color="white" /></g></LvAt>
      </svg>
    </Live>
  );
}

// Scena viva: l'assegnazione (soggetto: la chiave che passa di mano sopra l'atto timbrato). Intro: porta, tavolo e
// sedia salgono, la lampada scende, arrivano le persone. Vita: la chiave sospesa tra le due mani, la lampada che dondola.
export function StepKey() {
  // la mano di chi consegna (seduta) e quella di chi riceve (in piedi, girata) toccano la chiave
  const [sx, sy] = handAt("sit-table", "front");
  const [wx] = handAt("present", "front");
  const seat = { x: 64, s: 1.15 }, stand = { s: 1.08, y: 196 };
  const hand1 = [seat.x + sx * seat.s, 200 + sy * seat.s];
  const keyX = hand1[0] + 9, keyY = hand1[1] - 4;
  const standX = keyX + 41 + wx * stand.s;
  return (
    <Live className="h-full">
      <svg viewBox="0 0 320 220" className="lw-svg" aria-hidden="true" focusable="false">
        {/* lampada sopra il tavolo dell'ufficio */}
        <Lv cls="lv-in" k={0} base={0.9} vars={{ "--lv-y": "0px" }}>
          <Lv cls="lv-swing" t={4.2} d={0.4}>
            <path d="M180 0 V46" {...ink} strokeWidth="1.8" />
            <path d="M164 60 C164 50 170 44 180 44 C190 44 196 50 196 60 Z" fill={C.green} />
          </Lv>
        </Lv>
        {/* la porta dell'ufficio, alle spalle di chi riceve */}
        <Lv cls="lv-rise" k={0} vars={{ "--lv-y": "30px" }}>
          <rect x={standX - 30} y="64" width="58" height="136" rx="3" fill={C.orange} />
          <path d={`M${standX - 24} 72 h46 v52 h-46 Z M${standX - 24} 132 h46 v60 h-46 Z`} {...ink} strokeWidth="1.6" fill="none" />
        </Lv>
        <Lv cls="lv-in" k={1} base={1.2}><Person x={standX} y={stand.y} s={stand.s} color="white" pose="present" flip hair="short" build="regular" outfit="trousers" /></Lv>
        <Lv cls="lv-in" k={0} base={1.2}>
          <Chair x={seat.x + 3} y={200} s={seat.s} color="green" />
          <Person x={seat.x} y={200} s={seat.s} color="orange" pose="sit-table" hair="bun" build="regular" />
        </Lv>
        <Lv cls="lv-rise" k={2} vars={{ "--lv-y": "24px" }}>
          <Table x={180} y={200} s={seat.s} w={150} top={-57} color="green" />
          <Deed x={keyX + 2} y={200 - 57 * seat.s} w={48} />
        </Lv>
        <path d="M18 200 H302" {...ink} strokeWidth="2.6" />
        <Lv cls="lv-pop" k={0} base={1.7}><Placed x={keyX} y={keyY} className="bob"><Key s={0.95} /></Placed></Lv>
      </svg>
    </Live>
  );
}

// Scena viva: il bene vissuto. Intro: la terra sale, l'arancio spunta, arrivano le persone. Vita: chi porta la cassetta
// va e viene, chi coglie stacca un'arancia che cade nel cesto, il bambino palleggia, la chioma ondeggia.
export function StepAlive() {
  const [rx, ry] = handAt("reach", "front");
  // il frutto che coglie: (30, -66) dell'arancio, a scala 1.2
  const fx = 74 + 30 * 1.2, fy = 184 - 66 * 1.2;
  const pk = { x: fx - rx * 0.7, y: fy - ry * 0.7 };
  return (
    <Live className="h-full">
      <svg viewBox="0 0 320 220" className="lw-svg" aria-hidden="true" focusable="false">
        {/* il declivio dietro l'arancio: chi coglie si legge sull'arancio della terra */}
        <Lv cls="lv-rise" k={0} vars={{ "--lv-y": "40px" }}>
          <path d="M24 210 C24 150 60 120 120 118 C150 118 170 140 176 176 Z" fill={C.orange} />
          <path d="M28 210 Q30 182 84 178 Q160 168 236 178 Q290 182 292 210 Z" fill={C.orange} stroke={C.orange} strokeWidth="8" strokeLinejoin="round" />
        </Lv>
        <LvAt x={74} y={184} cls="lv-pop" k={0} base={0.7}><OrangeTree s={1.2} crown="yellow" /></LvAt>
        {/* l'arancia colta: appare nella mano, cade nel cesto ai piedi di chi coglie */}
        <g transform={`translate(${fx} ${fy + 8})`}><Lv cls="lv-drop" d={2.4} vars={{ "--dx": "-8px", "--dy": "62px" }}><circle r="5.6" fill={C.orange} /></Lv></g>
        <Lv cls="lv-in" k={0} base={1.3}>
          <Person x={pk.x} y={pk.y} s={0.7} color="green" pose="reach" flip build="regular" hair="bun" />
          <g transform={`translate(${fx - 8} ${fy + 78})`}>
            <path d="M-11 -12 H11 L8 0 H-8 Z" fill={C.yellow} stroke={C.yellow} strokeWidth="2" strokeLinejoin="round" />
            <path d="M-9 -7 H9" stroke={C.ink} strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </Lv>
        <Lv cls="lv-in" k={1} base={1.3}>
          <LvAt x={150} y={202} cls="lb-walk" t={11} d={0.6} vars={{ "--x0": "-14px", "--x1": "54px" }}><g className="lv-step"><Person color="white" pose="carry" itemColor="yellow" s={0.62} hair="cap" /></g></LvAt>
        </Lv>
        <Lv cls="lv-in" k={2} base={1.3}>
          <Person x={232} y={204} s={0.62} color="white" pose="kick" kid />
          <g transform="translate(252 197)">
            <Lv cls="lv-arc-x" t={1.4} d={0.2} vars={{ "--dx": "34px" }}><Lv cls="lv-arc-y" t={1.4} d={0.2} vars={{ "--h": "26px", "--dy": "0px" }}><g className="lv-spin" style={v({ "--t": 1.4 })}><BallArt r={7} /></g></Lv></Lv>
          </g>
        </Lv>
      </svg>
    </Live>
  );
}

/* =====================================================================
   3. LA MAPPA: Castelvetrano e dintorni, con tre segnaposto (la legenda e' nel testo)
   ===================================================================== */
export const MAP_PINS = { welcome: "house", garden: "orange", field: "field" } as const satisfies Record<string, PinMark>;
const MV = "0 0 1000 800";

const rows = (x: number, y: number, w: number, h: number, step: number, tilt = 0) =>
  Array.from({ length: Math.floor(h / step) - 1 }, (_, i) => <line key={i} x1={x} y1={y + (i + 1) * step} x2={x + w} y2={y + (i + 1) * step + tilt} {...ink} strokeWidth="2.5" opacity="0.4" />);

function MapLand() {
  return (
    <Sv vb={MV}>
      {/* il mare, con una barca a vela che va e viene dondolando; due gabbiani */}
      <Lv cls="lv-rise" k={0} vars={{ "--lv-y": "50px" }}>
      <path d="M-40 690 C140 660 320 712 520 684 S860 660 1040 690 V860 H-40 Z" fill={C.white} />
      {[[90, 740], [330, 760], [640, 736], [870, 764]].map(([x, y]) => <path key={x} d={`M${x} ${y} q18 -12 36 0 t36 0 t36 0`} fill="none" stroke={C.green} strokeWidth="4" strokeLinecap="round" />)}
      </Lv>
      <Lv cls="lv-move lv-alt" t={16} d={1} vars={{ "--x0": "-120px", "--x1": "60px" }}>
        <Lv cls="lv-rock" t={2.4}>
      <path d="M752 748 H836 C832 760 824 766 812 766 H776 C764 766 756 760 752 748 Z" fill={C.green} />
      <path d="M792 744 V694 C808 706 820 724 826 744 Z" fill={C.orange} stroke={C.orange} strokeWidth="3" strokeLinejoin="round" />
      <path d="M790 746 V690" {...ink} strokeWidth="3" />
        </Lv>
      </Lv>
      <g transform="translate(900 610)"><Lv cls="lv-fly" t={24} d={2} vars={{ "--x0": "200px", "--x1": "-1100px", "--y0": "0px", "--y1": "-30px" }}><Bird s={1.1} /><g transform="translate(34 12)"><Bird s={0.9} /></g></Lv></g>
      {/* campagna: uliveto, grano, terra arata */}
      <Lv cls="lv-reveal" k={1}>
      <path d="M80 90 Q190 56 320 76 Q344 150 326 226 Q214 250 100 232 Q66 160 80 90 Z" fill={C.white} />
      {[[124, 120], [186, 106], [250, 122], [294, 108], [146, 182], [214, 192], [280, 176]].map(([x, y], i) => <TopOlive key={i} x={x} y={y} r={18} />)}
      </Lv>
      <Lv cls="lv-reveal" k={2}>
      <path d="M700 80 Q810 52 920 84 Q940 160 916 236 Q812 254 718 230 Q690 150 700 80 Z" fill={C.white} />
      {rows(716, 84, 204, 150, 20)}
      </Lv>
      <Lv cls="lv-reveal" k={3}>
      <path d="M790 420 Q870 392 940 410 V560 Q870 586 800 560 Q780 490 790 420 Z" fill={C.orange} />
      {rows(800, 420, 140, 150, 18)}
      </Lv>
      {/* strade principali */}
      {["M500 -10 C500 90 520 160 540 230", "M-10 340 C140 360 300 338 440 312", "M640 300 C780 284 900 300 1010 270", "M300 520 C270 580 230 630 200 668"].map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke={C.white} strokeWidth="20" strokeLinecap="round" />
          <path d={d} fill="none" {...ink} strokeWidth="2.5" strokeDasharray="10 14" opacity="0.5" />
        </g>
      ))}
    </Sv>
  );
}

/** Il centro storico: case con tetto a sporto, una chiesa con cupola e campanile (sul giallo del pannello, senza contorni). */
function MapTown() {
  const houses: [number, number, number, number, "orange" | "green"][] = [
    [470, 284, 44, 34, "orange"], [504, 278, 40, 40, "green"], [674, 282, 44, 36, "green"], [482, 334, 44, 32, "green"],
    [659, 336, 46, 32, "orange"], [442, 382, 44, 30, "orange"], [614, 382, 44, 30, "green"], [717, 330, 34, 30, "orange"],
  ];
  return (
    <g>
      {/* il centro abitato: una macchia verde su cui le case bianche si leggono */}
      <path className="lv-pop" style={v({ "--lv-base": "0.45s" })} d="M428 236 C440 186 520 162 600 172 C690 182 760 214 760 290 C762 360 712 410 620 404 C540 400 470 412 430 380 C400 350 410 280 428 236 Z" fill={C.green} />
      {houses.map(([x, y, w, h, roof], i) => <MiniHouse key={i} x={x} y={y} w={w} h={h} roof={roof === "green" ? "yellow" : "orange"} door={roof === "green" ? "orange" : "yellow"} className="lv-pop" style={v({ "--k": i, "--lv-base": "0.7s" })} />)}
      {/* chiesa madre: navata, cupola, campanile con la cuspide */}
      <Lv cls="lv-pop" k={9} base={0.7}>
      <rect x="560" y="262" width="50" height="48" rx="2.5" fill={C.white} />
      <path d="M562 262 a23 23 0 0 1 46 0 Z" fill={C.yellow} />
      <path d="M585 239 v-8" {...ink} strokeWidth="2.5" />
      <path d="M578 310 v-16 a7 7 0 0 1 14 0 v16" fill={C.orange} />
      <rect x="614" y="236" width="18" height="74" rx="2" fill={C.white} />
      <path d="M612 238 L623 212 L634 238 Z" fill={C.orange} stroke={C.orange} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M619 250 h8 M619 258 h8" {...ink} strokeWidth="2" />
      </Lv>
    </g>
  );
}

function MapPlaces() {
  return (
    <Sv vb={MV}>
      <MapTown />
      {/* Selinunte: il tempio sull'altura verde della costa */}
      <Lv cls="lv-pop" base={0.9}>
      <path d="M86 700 C90 640 130 600 190 596 C250 594 286 636 290 700 Z" fill={C.green} />
      <g transform="translate(120 676) scale(0.7)">
        <rect x="-6" y="-12" width="184" height="12" rx="2" fill={C.white} />
        {[0, 1, 2, 3, 4, 5].map((i) => <Column key={i} x={14 + i * 30} y={-12} h={70} w={14} color="white" />)}
        <rect x="-4" y="-92" width="180" height="12" rx="2" fill={C.white} />
        <path d="M-2 -92 H174 L86 -124 Z" fill={C.white} stroke={C.white} strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -80 H172 M0 -94 H172" {...ink} strokeWidth="2.5" />
      </g>
      </Lv>
      {/* Giardino delle Arance: agrumeto a filari, l'orto, il casolare */}
      <Lv cls="lv-reveal" k={4}>
      <path d="M300 410 L432 400 L444 500 L306 512 Z" fill={C.white} stroke={C.white} strokeWidth="8" strokeLinejoin="round" />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <TopTree key={`${r}${c}`} x={330 + c * 30} y={428 + r * 26} r={11} />))}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={416 + i * 6} y={412} width="3.5" height="76" rx="1.75" fill={C.green} />)}
      </Lv>
      <MiniHouse x={356} y={502} w={40} h={20} roof="green" wall="orange" door="yellow" className="lv-pop" style={v({ "--k": 3, "--lv-base": "1s" })} />
      {/* Campo Unita' d'Italia */}
      <Lv cls="lv-reveal" k={5}>
      <rect x="610" y="470" width="156" height="98" rx="10" fill={C.green} />
      <path d="M688 476 V562 M634 494 H742 V544 H634 Z" fill="none" stroke={C.white} strokeWidth="3" />
      <circle cx="688" cy="519" r="15" fill="none" stroke={C.white} strokeWidth="3" />
      </Lv>
      {/* la casa dell'accoglienza: una casa a due piani in centro (non il logo) */}
      <MiniHouse x={553} y={230} w={44} h={38} roof="orange" className="lv-pop" style={v({ "--k": 10, "--lv-base": "0.7s" })} />
    </Sv>
  );
}

function MapRoute() {
  const d = "M553 236 C536 300 532 350 500 392 C480 418 462 430 452 444 C500 500 560 536 606 522";
  return (
    <Sv vb={MV}>
      <path d={d} fill="none" stroke={C.orange} strokeWidth="12" strokeLinecap="round" pathLength={1} className="lv-draw" style={v({ "--lv-base": "1.5s" })} />
      <MapPin x={553} y={172} s={1.2} mark={MAP_PINS.welcome} className="lv-in" style={v({ "--k": 0, "--lv-base": "2.2s" })} />
      <MapPin x={372} y={404} s={1.2} mark={MAP_PINS.garden} className="lv-in" style={v({ "--k": 2, "--lv-base": "2.2s" })} />
      <MapPin x={688} y={466} s={1.2} mark={MAP_PINS.field} className="lv-in" style={v({ "--k": 4, "--lv-base": "2.2s" })} />
    </Sv>
  );
}

// Scena: mappa illustrata di Castelvetrano (soggetto: il filo arancione che unisce i tre luoghi); si muove solo il filo, che si disegna con lo scroll.
export function MapScene() {
  return (
    <SceneFrame label="Mappa illustrata di Castelvetrano e dintorni: il centro storico con la casa dell'accoglienza, il Giardino delle Arance, il Campo Unità d'Italia, la campagna, Selinunte e il mare. Un filo arancione unisce i tre luoghi, segnati da tre segnaposto bianchi: con una casetta, con un'arancia, con un campo.">
      <Live className="lw-panel lw-yellow">
        <Stage className="lw-stage aspect-[1000/800]">
          <Layer z={-14}><MapLand /></Layer>
          <Layer z={4}><MapPlaces /></Layer>
          <Layer z={22}><MapRoute /></Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

/** Piccolo segnaposto per la legenda nel testo (stesso disegno della mappa). */
export function PinGlyph({ mark }: { mark: PinMark }) {
  return (
    <svg viewBox="-28 -74 56 78" className="h-11 w-auto shrink-0" aria-hidden="true" focusable="false">
      <MapPin mark={mark} />
    </svg>
  );
}

/* =====================================================================
   4. ANTEPRIME DEI TRE LUOGHI
   ===================================================================== */
// Scena viva: la raccolta davanti al casolare. Intro: collina e prato salgono, il sole sorge, il casolare e l'arancio
// spuntano, la scala sale, arrivano le persone. Vita: chi porta la cassetta va fino alla porta del casolare ed entra;
// chi e' sulla scala stacca un'arancia che cade nella cassetta; una farfalla; il sole gira i raggi.
export function GardenTeaser() {
  // chi sale sulla scala: piede sul terzo piolo, mani sui montanti (handAt)
  const lad = { x: 236, y: 414, s: 0.95 };
  const [hx, hy] = handAt("climb", "front");
  const hand = { x: lad.x + hx * lad.s, y: lad.y - lad.s * 62 + hy * lad.s };
  return (
    <SceneFrame label="Un arancio carico di frutti con una scala appoggiata: una persona sale a cogliere, ai piedi della scala una cassetta piena. Un'altra persona porta una cassetta verso il casolare, una casa di campagna con le persiane e il tetto di coppi.">
      <Live className="lw-panel lw-white">
        <Stage className="lw-stage aspect-[5/4]">
          <Layer z={-14}>
            <div className="depth absolute inset-0" style={v({ "--depth": 0.3 })}>
              <Sv vb="0 0 600 480">
                <Lv cls="lv-sun" vars={{ "--lv-y": "120px" }}><g className="spin-slow" style={v({ "--t": "50s" })}><Sun cx={528} cy={90} r={38} color="orange" rays={10} /></g></Lv>
                <Lv cls="lv-rise" k={0}><Hill width={600} y={250} amp={14} bottom={600} color="orange" seed={2} /></Lv>
              </Sv>
            </div>
          </Layer>
          <Layer z={4}>
            <Sv vb="0 0 600 480">
              <Lv cls="lv-rise" k={1}><rect x="-20" y="372" width="640" height="130" fill={C.green} /></Lv>
              <Lv cls="lv-pop" base={0.75}><House x={448} y={376} w={206} h={112} roof="yellow" wall="white" shutter="green" door="green" glass="orange" chimney="orange" doorAt={0.2} windows={[0.6, 0.84]} /></Lv>
              <g transform="translate(470 420)"><Lv cls="lv-move lv-alt" t={9} d={0.5} vars={{ "--x0": "-60px", "--x1": "70px", "--y0": "10px", "--y1": "-30px" }}><Butterfly /></Lv></g>
            </Sv>
          </Layer>
          <Layer z={20}>
            <Sv vb="0 0 600 480">
              <LvAt x={146} y={416} cls="lv-pop" base={0.85}><OrangeTree s={2.3} /></LvAt>
              <Lv cls="lv-rise" k={0} base={1.2} vars={{ "--lv-y": "40px" }}><Ladder x={lad.x} y={lad.y} s={lad.s} h={250} /></Lv>
              <Lv cls="lv-in" k={0} base={1.6}><Person x={lad.x} y={lad.y - lad.s * 62} s={lad.s} color="yellow" pose="climb" hair="bun" /></Lv>
              <Lv cls="lv-pop" k={1} base={1.5}><Crate x={204} y={426} s={1.05} color="white" /></Lv>
              {/* l'arancia staccata: dalla mano di chi e' sulla scala alla cassetta */}
              <g transform={`translate(${hand.x + 4} ${hand.y - 4})`}><Lv cls="lv-drop" d={2.6} vars={{ "--dx": `${204 - hand.x - 4}px`, "--dy": `${400 - hand.y}px` }}><circle r="7" fill={C.orange} /></Lv></g>
              <Lv cls="lv-in" k={1} base={1.6}>
                <LvAt x={292} y={462} cls="lb-garden"><g className="lv-step"><Person color="white" pose="carry" itemColor="orange" s={0.9} hair="short" /></g></LvAt>
              </Lv>
            </Sv>
          </Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

// Scena viva: la pallavolo sul campo. Intro: collina e campo salgono, la rete si alza, arrivano i giocatori. Vita: il
// pallone passa sopra la rete da una all'altro e torna, ognuno salta quando lo colpisce; il sole gira.
export function FieldTeaser() {
  const [rx, ry] = handAt("reach", "front");
  const p1 = { x: 170, y: 436, s: 1.12 };
  const bx = p1.x + rx * p1.s + 4, by = p1.y + ry * p1.s - 15;
  const [cx] = handAt("cheer", "front");
  const dx = 214;
  return (
    <SceneFrame label="Un campo con le linee bianche: due ragazzi giocano a pallavolo ai lati della rete, uno schiaccia e l'altro alza le braccia a muro; il pallone passa sopra la rete. A bordo campo una panca con una borsa.">
      <Live className="lw-panel lw-orange">
        <Stage className="lw-stage aspect-[5/4]">
          <Layer z={-14}>
            <div className="depth absolute inset-0" style={v({ "--depth": 0.25 })}>
              <Sv vb="0 0 600 480">
                <Lv cls="lv-sun"><g className="spin-slow" style={v({ "--t": "50s" })}><Sun cx={124} cy={104} r={40} color="yellow" rays={10} /></g></Lv>
                <Lv cls="lv-rise" k={0}><Hill width={600} y={250} amp={12} bottom={600} color="green" seed={4} /></Lv>
              </Sv>
            </div>
          </Layer>
          <Layer z={4}>
            <Sv vb="0 0 600 480">
              <Lv cls="lv-draw" base={0.6}><path d="M40 440 H560" fill="none" stroke={C.white} strokeWidth="5" strokeLinecap="round" pathLength={1} /></Lv>
              <Lv cls="lv-rise" k={2} vars={{ "--lv-y": "80px" }}><VolleyNet x={300} y={424} w={150} h={46} post={140} /></Lv>
              <Lv cls="lv-pop" k={3} base={0.9}>
                <Bench x={540} y={452} s={0.8} w={80} color="white" />
                <SportBag x={530} y={420} s={0.7} color="orange" />
                <Bottle x={498} y={456} s={0.8} color="yellow" />
              </Lv>
            </Sv>
          </Layer>
          <Layer z={18}>
            <Sv vb="0 0 600 480">
              <Lv cls="lv-in" k={0} base={1.5}><LvAt x={p1.x} y={p1.y} cls="lv-hop" t={4.4} d={0}><Person s={p1.s} color="white" pose="reach" build="regular" hair="short" /></LvAt></Lv>
              <Lv cls="lv-in" k={1} base={1.5}><LvAt x={bx + dx + cx * 1.12} y={436} cls="lv-hop" t={4.4} d={2.2}><Person s={1.12} color="orange" pose="cheer" flip build="regular" hair="long" /></LvAt></Lv>
              <g transform={`translate(${bx} ${by})`}>
                <Lv cls="lv-arc-x" t={2.2} vars={{ "--dx": `${dx}px` }}>
                  <Lv cls="lv-arc-y" t={2.2} vars={{ "--h": "62px", "--dy": "4px" }}><g className="lv-spin" style={v({ "--t": 1.6 })}><Volleyball r={13} /></g></Lv>
                </Lv>
              </g>
            </Sv>
          </Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

// Scena viva: la casa dalla porta aperta. Intro: colline e casa salgono, la tavola e le sedie spuntano, arrivano le
// persone. Vita: chi arriva con la valigia attraversa e entra dalla porta aperta, chi e' sulla soglia saluta, la pianta
// sul balcone ondeggia, due rondini passano.
export function WelcomeTeaser() {
  const t = { x: 142, s: 0.8 };
  return (
    <SceneFrame label="Una casa a due piani con il balcone in ferro e la porta aperta: davanti, due persone sedute a una tavola apparecchiata, una sulla soglia che saluta e una che arriva con una valigia.">
      <Live className="lw-panel lw-yellow">
        <Stage className="lw-stage aspect-[5/4]">
          <Layer z={-12}>
            <div className="depth absolute inset-0" style={v({ "--depth": 0.25 })}>
              <Sv vb="0 0 600 480">
                <Lv cls="lv-rise" k={0}><Hill width={600} y={330} amp={12} bottom={600} color="green" seed={5} /></Lv>
                <g transform="translate(520 120)"><Lv cls="lv-fly" t={20} d={3} vars={{ "--x0": "140px", "--x1": "-760px", "--y0": "0px", "--y1": "30px" }}><Bird /><g transform="translate(26 10)"><Bird s={0.8} /></g></Lv></g>
              </Sv>
            </div>
          </Layer>
          <Layer z={4}>
            <Sv vb="0 0 600 480">
              <Lv cls="lv-rise" k={1} vars={{ "--lv-y": "80px" }}>
                <House x={300} y={388} w={300} h={226} floors={2} balcony open doorAt={0.6} windows={[0.18, 0.86]} wall="white" roof="orange" shutter="green" door="green" glass="yellow" chimney="orange" />
              </Lv>
              <Lv cls="lv-rise" k={2} vars={{ "--lv-y": "40px" }}><rect x="-20" y="384" width="640" height="110" fill={C.orange} /></Lv>
            </Sv>
          </Layer>
          <Layer z={16}>
            <Sv vb="0 0 600 480">
              <Lv cls="lv-pop" k={0} base={1}>
                <Chair x={t.x - 56 + 2} y={446} s={t.s} color="green" />
                <Chair x={t.x + 56 - 2} y={446} s={t.s} color="green" flip />
              </Lv>
              <Lv cls="lv-in" k={0} base={1.4}>
                <Person x={t.x - 56} y={446} s={t.s} color="white" pose="sit-table" hair="curly" />
                <Person x={t.x + 56} y={446} s={t.s} color="green" pose="sit-table" flip hair="bun" />
              </Lv>
              <Lv cls="lv-pop" k={1} base={1.1}>
                <Table x={t.x} y={446} s={t.s} w={110} top={-60} color="white" cloth="white" />
                <g transform={`translate(${t.x} ${446 - 60 * t.s}) scale(${t.s})`}><TableSet x={0} y={0} plate="green" jug="yellow" /></g>
              </Lv>
              <Lv cls="lv-in" k={1} base={1.6}><LvAt x={306} y={444} cls="lv-rock" t={2.4} d={0.6}><Person s={0.82} color="green" pose="wave" hair="short" /></LvAt></Lv>
              <Lv cls="lv-in" k={2} base={1.6}>
                <LvAt x={520} y={446} cls="lb-home"><g className="lv-step"><Person color="white" pose="walk" item="suitcase" itemColor="green" s={0.86} flip hair="long" /></g></LvAt>
              </Lv>
            </Sv>
          </Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}
