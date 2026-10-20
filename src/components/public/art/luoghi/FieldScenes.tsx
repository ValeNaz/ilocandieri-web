/**
 * Scene vive del Campo Polivalente (v4 + kit Live: intro una volta, poi piccole storie in loop, "lo stesso illustratore"): linee che si tracciano, pallone, rete, porte, bambini e
 * ragazzi che giocano davvero (piede sul pallone, mani al pallone). Al massimo 3 cose in moto per scena, il pallone e'
 * quasi sempre l'unico protagonista. Nessun contorno esterno sulle masse, nessun testo nei disegni.
 */
import type { CSSProperties, ReactNode } from "react";
import { Stage, Layer } from "@/components/public/kit/Stage";
import { Hill, Person, Sun, handAt } from "../parts";
import { BallArt, C, Sv } from "./parts";
import { BallBag, Bench, Bird, Bottle, Cone, Football, Goal, Lv, LvAt, SportBag, Volleyball, VolleyNet } from "./parts-b";
import { SceneFrame } from "./ui";
import { Live } from "@/components/public/kit/Live";
import "./live-b.css";

const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Un pallone che vola da (x, y) a (x + dx, y + end) lungo un arco alto `h`, avanti e indietro, girando su se stesso. */
const Hop = ({ x, y, dx, h, t, d = 0, end = 0, r = 12, ball }: { x: number; y: number; dx: number; h: number; t: number; d?: number; end?: number; r?: number; ball?: ReactNode }) => (
  <g transform={`translate(${x} ${y})`}>
    <Lv cls="lv-arc-x" t={t} d={d} vars={{ "--dx": `${dx}px` }}>
      <Lv cls="lv-arc-y" t={t} d={d} vars={{ "--h": `${h}px`, "--dy": `${end}px` }}>
        <g className="lv-spin" style={v({ "--t": 1.2 })}>{ball ?? <BallArt r={r} />}</g>
      </Lv>
    </Lv>
  </g>
);

/* =====================================================================
   1. APERTURA: il campo in prospettiva
   ===================================================================== */
export const FIELD_AR = "1000 / 410";
const HV = "0 150 1000 410";

function HeroSky() {
  return (
    <Sv vb={HV} meet align="xMidYMax">
      <Lv cls="lv-sun" vars={{ "--lv-y": "100px" }}><g className="spin-slow" style={v({ "--t": "50s" })}><Sun cx={846} cy={226} r={28} color="yellow" rays={10} /></g></Lv>
      <g transform="translate(640 200)"><Lv cls="lv-fly" t={26} d={2} vars={{ "--x0": "460px", "--x1": "-1100px", "--y0": "0px", "--y1": "-20px" }}><Bird /><g transform="translate(28 12)"><Bird s={0.8} /></g></Lv></g>
    </Sv>
  );
}

function HeroField() {
  const l = { fill: "none", pathLength: 1, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const draw = (k: number) => ({ className: "lv-draw", style: v({ "--k": k, "--lv-base": "0.8s" }) });
  return (
    <Sv vb={HV} meet align="xMidYMax">
      <Lv cls="lv-rise" k={0} vars={{ "--lv-y": "40px" }}><g transform="translate(-1000 0)"><Hill width={3000} y={300} amp={12} bottom={1200} color="yellow" seed={2} waves={6} /></g></Lv>
      <Lv cls="lv-reveal" base={0.4}><path d="M300 330 H700 L880 540 H120 Z" fill={C.green} stroke={C.green} strokeWidth="12" strokeLinejoin="round" /></Lv>
      {/* le linee si tracciano una dopo l'altra */}
      <g stroke={C.white} strokeWidth="6" {...l}>
        <path d="M300 330 H700 L880 540 H120 Z" {...draw(0)} />
        <path d="M500 330 V540" {...draw(1)} />
        <ellipse cx="500" cy="435" rx="88" ry="34" {...draw(2)} />
        <path d="M410 330 L398 360 H602 L590 330" {...draw(3)} />
        <path d="M330 540 L352 494 H648 L670 540" {...draw(3)} />
      </g>
      <g stroke={C.yellow} strokeWidth="6" {...l}>
        <path d="M354 380 H646 L708 500 H292 Z" {...draw(5)} />
      </g>
      {/* la porta in fondo, sulla linea di fondo */}
      <LvAt x={500} y={331} cls="lv-pop" base={1.4}><Goal s={0.6} w={120} h={48} /></LvAt>
    </Sv>
  );
}

function HeroPlayers() {
  const k = { x: 372, y: 524, s: 1.15 };
  // il pallone parte dalla punta del piede che calcia e arriva ai piedi di chi lo chiama
  const foot = { x: k.x + 31 * k.s, y: k.y - 27 * k.s };
  return (
    <Sv vb={HV} meet align="xMidYMax">
      {/* a bordo campo: la panca, chi guarda, la borsa */}
      <Lv cls="lv-pop" k={0} base={1.3}>
        <Bench x={918} y={506} s={0.9} w={84} color="orange" />
        <SportBag x={872} y={512} s={0.8} color="green" />
      </Lv>
      <Lv cls="lv-in" k={3} base={1.6}><Person x={934} y={506} s={0.9} color="green" pose="sit" flip hair="bun" /></Lv>
      {/* il bambino corre avanti e indietro sulla fascia */}
      <Lv cls="lv-in" k={0} base={1.6}>
        <LvAt x={236} y={528} cls="lb-walk" t={7} d={0.3} vars={{ "--x0": "-50px", "--x1": "60px" }}><g className="lv-step"><Person s={1.05} color="yellow" pose="walk" kid hair="curly" /></g></LvAt>
      </Lv>
      <Lv cls="lv-in" k={1} base={1.6}><LvAt x={k.x} y={k.y} cls="lv-rock" t={2.6} d={1.8}><Person s={k.s} color="orange" pose="kick" hair="short" /></LvAt></Lv>
      <Lv cls="lv-in" k={2} base={1.6}><LvAt x={668} y={504} cls="lv-hop" t={2.6} d={1.8}><Person s={1.05} color="white" pose="wave" flip hair="long" /></LvAt></Lv>
      <Hop x={foot.x + 20} y={foot.y + 2} dx={220} h={110} end={8} t={2.6} d={1.8} r={13} />
    </Sv>
  );
}

// Scena viva: il campo in prospettiva. Intro: la collina sale, il sole sorge, il prato appare, le linee si tracciano una
// per una, la porta spunta, arrivano i ragazzi. Vita: il pallone passa da chi calcia a chi lo chiama e torna, il bambino
// corre sulla fascia, due uccelli attraversano il cielo, il sole gira.
export function FieldHero() {
  return (
    <SceneFrame label="Il campo visto in prospettiva, con la porta in fondo: le linee bianche del calcio e quelle gialle della pallavolo. Un ragazzo calcia il pallone verso un compagno che lo chiama, un bambino corre; a bordo campo una ragazza guarda seduta sulla panca.">
      <Live className="h-full">
        <Stage className="lw-stage">
          <Layer z={-16}><div className="depth absolute inset-0" style={v({ "--depth": 0.5 })}><HeroSky /></div></Layer>
          <Layer z={-10}><HeroField /></Layer>
          <Layer z={22}><HeroPlayers /></Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

/* =====================================================================
   2. DALL'ALTO: lo schema del campo, le linee si disegnano all'ingresso
   ===================================================================== */
// Scena viva: pianta del campo. Intro: recinzione, panchine e porte, poi le linee del calcio e della pallavolo si
// tracciano una dopo l'altra. Vita: un pallone rotola da un'area all'altra.
export function FieldPlan() {
  const base = { fill: "none", strokeWidth: 6, pathLength: 1, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const d = (k: number) => ({ ...base, stroke: C.white, className: "lv-draw", style: v({ "--k": k, "--lv-base": "0.5s" }) });
  const y = (k: number) => ({ ...base, stroke: C.yellow, className: "lv-draw", style: v({ "--k": k, "--lv-base": "0.5s" }) });
  return (
    <SceneFrame label="Il campo visto dall'alto: recinzione, panchine, porte con la rete, le linee bianche del calcio (metà campo, cerchio, aree) e il rettangolo giallo della pallavolo con i pali della rete al centro.">
      <Live className="lw-clip lw-green aspect-[1000/600]">
        <svg viewBox="0 0 1000 600" className="lw-svg" aria-hidden="true" focusable="false">
          {/* recinzione: paletti gialli, con il varco dell'ingresso in basso */}
          <Lv cls="lv-reveal-x" base={0.1}>
            <path d="M470 552 H96 a36 36 0 0 1 -36 -36 V84 a36 36 0 0 1 36 -36 H904 a36 36 0 0 1 36 36 V516 a36 36 0 0 1 -36 36 H530" fill="none" stroke={C.yellow} strokeWidth="7" strokeLinecap="round" strokeDasharray="0.1 18" />
          </Lv>
          {/* panchine viste dall'alto: due assi della seduta */}
          {[300, 620].map((x, i) => (
            <Lv key={x} cls="lv-pop" k={i} base={0.3}>
              <rect x={x} y="58" width="80" height="20" rx="5" fill={C.white} />
              <path d={`M${x + 4} 68 H${x + 76}`} stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" />
            </Lv>
          ))}
          {/* porte con la rete (fuori dalla linea di fondo) */}
          {[[92, 120], [880, 908]].map(([a, b], i) => (
            <Lv key={a} cls="lv-pop" k={i + 2} base={0.3}>
              {[0, 1, 2, 3].map((j) => <line key={j} x1={a} y1={280 + j * 13} x2={b} y2={280 + j * 13} stroke={C.white} strokeWidth="1.8" />)}
              <path d={a! < 500 ? `M${b} 266 H${a! + 4} a4 4 0 0 0 -4 4 V330 a4 4 0 0 0 4 4 H${b}` : `M${a} 266 H${b! - 4} a4 4 0 0 1 4 4 V330 a4 4 0 0 1 -4 4 H${a}`} fill="none" stroke={C.white} strokeWidth="5" strokeLinecap="round" />
            </Lv>
          ))}
          {/* linee del calcio */}
          <rect x="120" y="90" width="760" height="420" rx="4" {...d(0)} />
          <path d="M500 90 V510" {...d(2)} />
          <circle cx="500" cy="300" r="62" {...d(3)} />
          <path d="M120 190 H232 V410 H120 M880 190 H768 V410 H880" {...d(4)} />
          <path d="M120 252 H160 V348 H120 M880 252 H840 V348 H880" {...d(5)} />
          <circle cx="200" cy="300" r="5" fill={C.white} /><circle cx="800" cy="300" r="5" fill={C.white} />
          {/* linee della pallavolo e la rete tesa tra i due pali di ferro */}
          <rect x="340" y="220" width="320" height="160" rx="3" {...y(7)} />
          <path d="M447 220 V380 M553 220 V380" {...y(8)} />
          <Lv cls="lv-reveal" base={1.7}>
            <path d="M500 204 V396" stroke={C.ink} strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 7" />
            <circle cx="500" cy="200" r="8" fill={C.ink} />
            <circle cx="500" cy="400" r="8" fill={C.ink} />
          </Lv>
          {/* il pallone rotola da un'area all'altra */}
          <g transform="translate(600 300)">
            <Lv cls="lv-move lv-alt" t={6.5} d={2} vars={{ "--x0": "-300px", "--y0": "-70px", "--x1": "180px", "--y1": "60px" }}>
              <g className="lv-spin" style={v({ "--t": 1.6 })}><BallArt r={11} /></g>
            </Lv>
          </g>
        </svg>
      </Live>
    </SceneFrame>
  );
}

/* =====================================================================
   3. SI COMINCIA A TRE ANNI
   ===================================================================== */
// Scena viva: avviamento allo sport. Intro: collina e prato salgono, il sole sorge, coni e porticina spuntano, il cerchio
// si disegna, arrivano bambini e allenatore. Vita: il piccolo calciatore tira verso la porticina, la bambina salta nel
// cerchio, un'altra fa lo slalom tra i coni, l'allenatore dondola la sacca.
export function KidsScene() {
  const vb = "0 220 800 400";
  const kk = { x: 586, y: 566, s: 1.3 * 0.64 };
  return (
    <SceneFrame label="Bambini molto piccoli giocano tra i coni: uno fa lo slalom, uno salta nel cerchio, uno calcia il pallone verso una porticina; l'allenatore li guarda con la sacca dei palloni in mano.">
      <Live className="lw-clip lw-white">
        <Stage className="lw-stage aspect-[2/1]">
          <Layer z={-10}>
            <div className="depth absolute inset-0" style={v({ "--depth": 0.25 })}>
              <Sv vb={vb}>
                <Lv cls="lv-sun" vars={{ "--lv-y": "90px" }}><g className="spin-slow" style={v({ "--t": "50s" })}><Sun cx={660} cy={300} r={32} color="orange" rays={10} /></g></Lv>
                <Lv cls="lv-rise" k={0}><Hill width={800} y={392} amp={10} bottom={720} color="orange" seed={2} /></Lv>
              </Sv>
            </div>
          </Layer>
          <Layer z={16}>
            <Sv vb={vb}>
              <Lv cls="lv-rise" k={1} vars={{ "--lv-y": "40px" }}><rect x="-20" y="460" width="840" height="180" fill={C.green} /></Lv>
              <LvAt x={742} y={556} cls="lv-pop" base={0.9}><Goal w={84} h={46} /></LvAt>
              <Lv cls="lv-pop" k={0} base={0.8}><Cone x={186} y={546} s={0.9} color="yellow" /></Lv>
              <Lv cls="lv-pop" k={1} base={0.8}><Cone x={300} y={548} s={0.9} color="orange" /></Lv>
              <Lv cls="lv-pop" k={2} base={0.8}><Cone x={520} y={540} s={0.8} color="white" /></Lv>
              <ellipse cx="438" cy="574" rx="64" ry="14" fill="none" stroke={C.white} strokeWidth="7" pathLength={1} className="lv-draw" style={v({ "--lv-base": "1s" })} />
              <Lv cls="lv-in" k={0} base={1.5}><LvAt x={110} y={590} cls="lv-rock" t={3} d={0.5}><Person s={1.2} color="white" pose="stand" hair="cap" build="broad" hold={<BallBag />} /></LvAt></Lv>
              <Lv cls="lv-in" k={1} base={1.5}>
                <LvAt x={240} y={570} cls="lb-walk" t={8} d={1} vars={{ "--x0": "-40px", "--x1": "60px" }}><g className="lv-step"><Person s={1.3} color="orange" pose="walk" kid hair="bun" /></g></LvAt>
              </Lv>
              <Lv cls="lv-in" k={2} base={1.5}><LvAt x={438} y={574} cls="lv-hop" t={1.1} d={0.2}><Person s={1.3} color="yellow" pose="cheer" kid hair="curly" /></LvAt></Lv>
              <Lv cls="lv-in" k={3} base={1.5}><LvAt x={kk.x} y={kk.y} cls="lv-rock" t={2.4} d={1.9}><Person s={1.3} color="white" pose="kick" kid hair="short" /></LvAt></Lv>
              <Hop x={kk.x + 31 * kk.s + 19} y={kk.y - 27 * kk.s + 3} dx={92} h={46} end={4} t={2.4} d={1.9} r={12} />
            </Sv>
          </Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

/* =====================================================================
   4. PALLAVOLO
   ===================================================================== */
// Scena viva: la pallavolo. Intro: collina e campo salgono, il sole sorge, la rete si alza, arrivano i giocatori.
// Vita: il pallone va e viene sopra la rete, chi lo colpisce salta; due uccelli passano.
export function VolleyScene() {
  const [rx, ry] = handAt("reach", "front");
  const [cx] = handAt("cheer", "front");
  const p = { x: 220, y: 524, s: 1.3 };
  const bx = p.x + rx * p.s + 4, by = p.y + ry * p.s - 17, dx = 300;
  return (
    <SceneFrame label="Pallavolo: due ragazzi ai lati della rete, una schiaccia e l'altro alza le braccia a muro; il pallone passa sopra la rete. In fondo al campo una borsa e una borraccia.">
      <Live className="lw-clip lw-green">
        <Stage className="lw-stage aspect-[4/3]">
          <Layer z={-10}>
            <div className="depth absolute inset-0" style={v({ "--depth": 0.25 })}>
              <Sv vb="0 0 800 600">
                <Lv cls="lv-sun"><g className="spin-slow" style={v({ "--t": "50s" })}><Sun cx={144} cy={124} r={46} color="yellow" rays={10} /></g></Lv>
                <g transform="translate(560 150)"><Lv cls="lv-fly" t={22} d={3} vars={{ "--x0": "300px", "--x1": "-900px", "--y0": "0px", "--y1": "-20px" }}><Bird s={1.2} /><g transform="translate(32 14)"><Bird /></g></Lv></g>
                <Lv cls="lv-rise" k={0}><Hill width={800} y={300} amp={12} bottom={720} color="orange" seed={3} /></Lv>
              </Sv>
            </div>
          </Layer>
          <Layer z={16}>
            <Sv vb="0 0 800 600">
              {/* campo bianco: non si confonde con l'arancio della stanza intorno al pannello */}
              <Lv cls="lv-rise" k={1} vars={{ "--lv-y": "40px" }}><rect x="-20" y="478" width="840" height="150" fill={C.white} /></Lv>
              <path d="M70 520 H730" stroke={C.green} strokeWidth="6" strokeLinecap="round" pathLength={1} className="lv-draw" style={v({ "--lv-base": "0.6s" })} />
              <Lv cls="lv-rise" k={3} vars={{ "--lv-y": "120px" }}><VolleyNet x={400} y={506} w={240} h={70} post={170} /></Lv>
              <Lv cls="lv-pop" k={0} base={1}>
                <SportBag x={84} y={500} s={0.9} color="green" />
                <Bottle x={118} y={500} s={0.9} color="orange" />
              </Lv>
              <Lv cls="lv-in" k={0} base={1.5}><LvAt x={p.x} y={p.y} cls="lv-hop" t={5.2} d={0}><Person s={p.s} color="white" pose="reach" build="regular" hair="long" outfit="trousers" /></LvAt></Lv>
              <Lv cls="lv-in" k={1} base={1.5}><LvAt x={bx + dx + cx * 1.3} y={524} cls="lv-hop" t={5.2} d={2.6}><Person s={1.3} color="green" pose="cheer" flip build="regular" hair="short" /></LvAt></Lv>
              <Hop x={bx} y={by} dx={dx} h={100} end={4} t={2.6} r={14} ball={<Volleyball r={14} />} />
            </Sv>
          </Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

/* =====================================================================
   5. CIRCA 200: una fascia di bambini e ragazzi a gruppi, ognuno fa una cosa (decorativa, non un conteggio)
   ===================================================================== */
// mano nella mano: la mano davanti del bambino sulla mano dietro del genitore
const [pbx] = handAt("walk", "back");
const [kfx] = handAt("walk", "front");
const PARENT = { x: 170, s: 0.92 }, KID = 1.35 * 0.64;
const kidX = PARENT.x + pbx * PARENT.s - kfx * KID;

/** Una persona della fascia: posizione + (opzionale) un'animazione di vita sul gruppo intero. */
function Fig({ x, k, cls, t, d, vars, children }: { x: number; k: number; cls?: string; t?: number; d?: number; vars?: Record<string, string>; children: ReactNode }) {
  return (
    <Lv cls="lv-in" k={k} base={0.5}>
      <LvAt x={x} y={216} cls={cls ?? ""} t={t} d={d} vars={vars}>{children}</LvAt>
    </Lv>
  );
}

// Scena viva: bambini, ragazzi e genitori a bordo campo, a piccoli gruppi. Intro: la striscia di terra sale, le persone
// arrivano una dopo l'altra. Vita: genitore e bambino passeggiano mano nella mano, due bambini si passano il pallone,
// l'allenatore va e viene con la sacca, due bambini esultano saltando, chi palleggia da solo.
export function Crowd() {
  return (
    <div className="aspect-[600/240] sm:aspect-[1200/240]">
      <Live className="h-full">
        <svg viewBox="0 0 1200 240" className="lw-svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
          <Lv cls="lv-rise" k={0} vars={{ "--lv-y": "30px" }}><rect x="-20" y="214" width="1240" height="60" fill={C.yellow} /></Lv>
          {/* genitore e bambino, mano nella mano: un solo gruppo che cammina */}
          <Fig x={150} k={0} cls="lb-walk" t={14} d={0.5} vars={{ "--x0": "-30px", "--x1": "40px" }}>
            <g className="lv-step">
              <Person x={PARENT.x - 150} y={0} s={PARENT.s} color="green" pose="walk" hair="long" build="regular" />
              <Person x={kidX - 150} y={0} s={1.35} color="orange" pose="walk" kid hair="bun" />
            </g>
          </Fig>
          {/* la panca: due che parlano, girati l'uno verso l'altra */}
          <Lv cls="lv-pop" k={1} base={0.4}><Bench x={377} y={216} s={0.92} w={100} color="orange" /><Bottle x={448} y={216} s={0.9} color="green" /></Lv>
          <Fig x={336} k={1}><Person s={0.92} color="orange" pose="sit" hair="curly" build="regular" /></Fig>
          <Fig x={418} k={2}><Person s={0.92} color="green" pose="sit" flip hair="bun" build="regular" /></Fig>
          {/* due bambini si passano il pallone */}
          <Fig x={512} k={3} cls="lv-rock" t={1.8} d={1}><Person s={1.2} color="green" pose="kick" kid hair="short" /></Fig>
          <Fig x={626} k={4}><Person s={1.2} color="orange" pose="stand" kid flip hair="curly" /></Fig>
          <Hop x={512 + 31 * 1.2 * 0.64 + 9} y={207} dx={64} h={24} t={1.8} d={1} ball={<Football r={8.5} color="orange" />} />
          {/* l'allenatore porta la sacca dei palloni, va e viene */}
          <Fig x={724} k={5} cls="lb-walk" t={11} d={2} vars={{ "--x0": "-36px", "--x1": "40px" }}>
            <g className="lv-step"><Person s={0.94} color="green" pose="walk" hair="cap" build="regular" hold={<BallBag ball="orange" />} /></g>
          </Fig>
          {/* chi esulta, chi saluta */}
          <Fig x={818} k={6} cls="lv-hop" t={0.9} d={0}><Person color="orange" pose="cheer" kid hair="short" /></Fig>
          <Fig x={868} k={7} cls="lv-hop" t={1.3} d={0.5}><Person color="green" pose="wave" kid flip hair="long" /></Fig>
          {/* chi va via con la borsa, chi palleggia da solo */}
          <Fig x={1012} k={8}><Person s={0.92} color="orange" pose="walk" flip hair="short" build="regular" hold={<g transform="translate(0 26)"><SportBag s={0.9} color="green" /></g>} /></Fig>
          <Fig x={1128} k={9} cls="lv-rock" t={1.2} d={0.3}><Person color="green" pose="kick" kid hair="bun" /></Fig>
          <Hop x={1128 + 31 * 0.64 + 9} y={207} dx={22} h={20} t={1.2} d={0.3} ball={<Football r={8} color="orange" />} />
        </svg>
      </Live>
    </div>
  );
}
