/**
 * Scene della pagina Tradizione, linguaggio v4 ("lo stesso illustratore"): un soggetto per scena, due o tre gruppi
 * secondari, almeno un terzo di vuoto; masse senza contorno, ink solo per le cose scure e i dettagli interni.
 * Le persone FANNO qualcosa (portano il covone, mietono, colgono, siedono a tavola) con <Person> e i suoi `hold`.
 * Ogni oggetto si muove intero: animazioni solo sul gruppo interno di <Placed> (prop className delle parti).
 * Margini: i soggetti restano almeno all'8% dal bordo del riquadro; solo terreno e cielo escono.
 *
 * SCENE VIVE (kit <Live>, live.css): ogni scena si costruisce una volta quando entra in vista (terra, sole, piante,
 * oggetti, poi le persone) e poi vive con 2-5 piccole storie, ognuna nel suo posto e con il suo ritmo. Movimento ridotto
 * o niente JS: tutto fermo nella posizione finale. Le classi proprie (tradizione.css) contengono "lv-" così il kit le
 * tiene in pausa finché la scena non è in vista.
 */
import type { CSSProperties, ReactNode } from "react";
import { Live } from "@/components/public/kit/Live";
import { Art, C, Cloud, Hill, INK, OliveTree, OrangeTree, Person, Placed, Sun, handAt } from "../parts";
import { Crate } from "../home/geo";
import { dl, Barattolo, Bottiglia, Casolare, Colonna, Covone, Falcetto, Foglia, Oliva, Piattino, Sedia, Spicchio, Spiga, Spighetta, Tempio } from "./parts";

const ART = "scene-svg";
const fine = { stroke: C.ink, strokeWidth: INK.fine, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
const bold = { ...fine, strokeWidth: INK.bold } as const;
const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Contenitore vivo di una scena: riempie il riquadro come lo faceva l'SVG da solo. `depth`: profondità allo scroll. */
function Scene({ children, depth }: { children: ReactNode; depth?: number }) {
  return <Live className={depth !== undefined ? "tr-live depth" : "tr-live"} style={depth !== undefined ? v({ "--depth": depth }) : undefined}>{children}</Live>;
}

/** Uno stormo che attraversa il cielo (lv-fly) battendo le ali (lv-flap). A riposo resta in (x, y). */
function Birds({ x, y, s = 1, x0, x1, y1 = 0, t, d }: { x: number; y: number; s?: number; x0: number; x1: number; y1?: number; t: number; d: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lv-fly" style={v({ "--x0": `${x0}px`, "--x1": `${x1}px`, "--y1": `${y1}px`, "--t": t, "--d": d })}>
        {[[0, 0, 1], [30 * s, 14 * s, 0.8], [56 * s, -6 * s, 0.9]].map(([bx, by, k], i) => (
          <g key={i} transform={`translate(${bx} ${by}) scale(${k! * s})`}>
            <g className="lv-flap" style={v({ "--d": i * 0.13 })}>
              <path d="M-14 -2Q-7 -10 0 0Q7 -10 14 -2" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

/** Qualcosa che cresce dal piede durante l'intro (lv-pop): posizione fuori, animazione dentro. */
function Pop({ x, y, k, base, children }: { x: number; y: number; k: number; base?: string; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lv-pop" style={v(base ? { "--k": k, "--lv-base": base } : { "--k": k })}>{children}</g>
    </g>
  );
}

/* ---------- Apertura (viewBox 1600x610; il nucleo x 461-1139 resta sempre visibile, telefono: cornice 10/9) ---------- */
const HV = "0 90 1600 610";

// Scena (apertura, cielo): il sole sorge e i raggi girano piano; una nuvola scivola; uno stormo attraversa il cielo sopra la valle.
export function TradSky() {
  return (
    <Scene depth={0.6}>
      <Art viewBox={HV} className={ART}>
        <g className="lv-sun" style={v({ "--lv-base": "0.4s" })}><Sun cx={1210} cy={240} r={56} color="yellow" rays={12} className="spin-slow" /></g>
        <Cloud x={300} y={226} s={1.15} color="white" className="lv-cloud" />
        <Birds x={900} y={180} x0={760} x1={-1060} y1={-30} t={34} d={2.2} />
      </Art>
    </Scene>
  );
}

// Scena (apertura, terra): il tempio dorico di Selinunte è il SOGGETTO, sulla collina bianca. Intro: salgono le colline, il
// basamento, crescono le colonne una dopo l'altra, si posa la trabeazione; l'ulivo di sinistra spunta e poi ondeggia.
export function TradLand() {
  return (
    <Scene depth={0.25}>
      <Art viewBox={HV} className={ART}>
        <Hill width={1600} y={438} amp={22} bottom={700} color="white" seed={0.6} className="lv-rise" />
        <g className="lv-rise" style={v({ "--k": 1 })}><Hill width={1600} y={548} amp={14} bottom={700} color="green" seed={2.4} /></g>
        <Tempio x={800} y={470} cols={6} colH={150} gap={74} live />
        <Pop x={540} y={596} k={0} base="0.9s"><OliveTree s={1.6} className="sway" style={dl(2)} /></Pop>
      </Art>
    </Scene>
  );
}

/* L'ulivo di destra sta nel livello delle persone: la mano di chi coglie tocca davvero un'oliva anche con la parallasse. */
const TREE_R = { x: 1040, y: 600, s: 1.7 };
const PICK = (() => {
  const [hx, hy] = handAt("reach", "front", "regular");
  const s = 1.05, ox = TREE_R.x + 38 * TREE_R.s, oy = TREE_R.y - 52 * TREE_R.s; // oliva [38,-52] di OliveTree
  return { x: ox + hx * s, y: oy - hy * s, s, ox, oy };
})();

// Scena (apertura, persone): chi porta il covone di grano (protagonista, si assesta il carico); a destra chi coglie le olive e le
// lascia cadere nel cesto ai piedi; davanti passa chi torna dalla raccolta con il cestino in mano.
export function TradPeople() {
  return (
    <Scene>
      <Art viewBox={HV} className={ART}>
        <Pop x={TREE_R.x} y={TREE_R.y} k={1} base="0.9s"><OliveTree s={TREE_R.s} /></Pop>
        <g className="lv-in" style={v({ "--k": 1, "--lv-base": "1.5s" })}><Cesto x={1090} y={PICK.y} s={1.05} /></g>
        <g className="lv-rise" style={v({ "--k": 2, "--lv-base": "1.6s", "--lv-y": "40px" })}>
          <Person x={PICK.x} y={PICK.y} s={PICK.s} color="orange" pose="reach" build="regular" hair="bun" outfit="dress" flip />
          {/* un'oliva nella mano: cade nel cesto */}
          <g transform={`translate(${PICK.ox} ${PICK.oy})`}>
            <g className="lv-drop" style={v({ "--dx": "-14px", "--dy": `${(PICK.y - 21 - PICK.oy).toFixed(1)}px`, "--d": 2.4 })}><ellipse rx="3.4" ry="4.4" fill={C.ink} /></g>
          </g>
        </g>
        <g className="lv-rise" style={v({ "--k": 0, "--lv-base": "1.6s", "--lv-y": "40px" })}>
          <Person x={660} y={652} s={1.08} color="orange" pose="present" hair="cap" build="broad" hold={<Covone ears="orange" stems="yellow" size={1.4} tilt={34} />} className="lv-rock" style={v({ "--t": 2.6, "--d": 0.4 })} />
        </g>
        {/* chi torna dalla raccolta attraversa il prato davanti (giallo sul verde), da fuori a fuori */}
        <g transform="translate(880 656)">
          <g className="lv-move" style={v({ "--x0": "-1060px", "--x1": "900px", "--t": 38, "--d": 1.2 })}>
            <g className="lv-step"><Person s={0.98} color="yellow" pose="walk" hair="short" build="slim" hold={<CestoMano />} /></g>
          </g>
        </g>
      </Art>
    </Scene>
  );
}

/** Cestino tenuto per il manico (oggetto `hold`): manico ink sotto le dita, cesto bianco con olive scure. */
function CestoMano() {
  return (
    <g>
      <path d="M-6 9C-6 2 -3 -1 0 -1S6 2 6 9" {...bold} />
      <path d="M-6 6.5a2.4 2.8 0 1 0 4.8 0a2.4 2.8 0 1 0 -4.8 0M-1 5.5a2.4 2.8 0 1 0 4.8 0a2.4 2.8 0 1 0 -4.8 0" fill={C.ink} />
      <path d="M-9 8H9L7.4 18.4A1.8 1.8 0 0 1 5.6 20H-5.6A1.8 1.8 0 0 1 -7.4 18.4Z" fill={C.white} />
      <path d="M-8.4 13H8.4M-3 8.5V19.5M3 8.5V19.5" {...fine} strokeWidth="1.1" />
    </g>
  );
}

/** Cesto di vimini con le olive raccolte: bianco con la trama ink fine, olive verdi sopra il bordo. */
function Cesto({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <Placed x={x} y={y} s={s}>
      <path d="M-9 -20a3.4 4 0 1 0 6.8 0a3.4 4 0 1 0 -6.8 0M-2 -21.5a3.4 4 0 1 0 6.8 0a3.4 4 0 1 0 -6.8 0M4 -19.5a3.4 4 0 1 0 6.8 0a3.4 4 0 1 0 -6.8 0" fill={C.ink} />
      <path d="M-15 -19H15L12 -2A2.4 2.4 0 0 1 9.6 0H-9.6A2.4 2.4 0 0 1 -12 -2Z" fill={C.white} />
      <path d="M-13.5 -12.5H13.5M-12.6 -6.5H12.6M-6 -18.5L-5 -1M0 -18.5V-1M6 -18.5L5 -1" {...fine} strokeWidth="1.3" />
    </Placed>
  );
}

/* ---------- Selinunte e Cave di Cusa ---------- */
// Scena: la colonna dorica finita (SOGGETTO, le scanalature si disegnano scorrendo) sul suo stilobate; accanto, sulla roccia
// della cava, il cerchio di un rocchio appena inciso: il lavoro fermato a metà. Una visitatrice con la guida dà la scala.
// Vita: il sole sorge e i raggi girano piano; due rondini passano alte; una farfalla gira intorno al blocco; la visitatrice
// si sposta da un piede all'altro mentre legge.
export function ScenaSelinunte() {
  return (
    <Scene>
    <Art viewBox="0 0 560 600" className={ART} title="Una colonna dorica in piedi su due gradini, accanto a un blocco di cava con il cerchio di un rocchio appena inciso; una persona con un libro la guarda" desc="Selinunte e le Cave di Cusa.">
      <g className="lv-sun" style={v({ "--lv-base": "0.4s" })}><Sun cx={440} cy={118} r={40} color="orange" rays={10} className="spin-slow" /></g>
      <Birds x={330} y={70} s={0.8} x0={300} x1={-420} y1={20} t={22} d={3} />
      <path d="M232 540C268 452 346 384 436 376C496 371 540 384 590 404V540Z" fill={C.green} className="lv-rise" style={v({ "--k": 1 })} />
      <path d="M10 548Q8 518 44 514Q280 494 520 506Q556 508 556 540V570Q556 598 524 600H40Q10 598 10 570Z" fill={C.yellow} stroke={C.yellow} strokeWidth="6" strokeLinejoin="round" className="lv-rise" style={v({ "--k": 0 })} />
      {/* stilobate a due gradini: giunti come linee interne */}
      <g className="lv-rise" style={v({ "--k": 2, "--lv-y": "30px" })}>
        <rect x="52" y="496" width="232" height="16" rx="3" fill={C.orange} />
        <rect x="70" y="484" width="196" height="14" rx="3" fill={C.orange} />
        <path d="M70 497H266M110 498V511M206 498V511M150 485V496M232 485V496" {...fine} />
      </g>
      {/* la colonna si alza dal basamento, poi le scanalature si disegnano */}
      <g className="lv-reveal" style={v({ "--k": 3, "--lv-base": "0.35s" })}>
        <Colonna draw={v({ "--k": 0, "--lv-base": "1.3s" })} x={168} y={485} h={410} w={96} color="yellow" />
      </g>
      {/* blocco di roccia della cava: faccia alta bianca con il solco del rocchio, fianchi pieni, colpi di scalpello */}
      <g className="lv-rise" style={v({ "--k": 5, "--lv-y": "40px" })}>
        <path d="M290 424L450 402L512 432L352 458Z" fill={C.white} stroke={C.white} strokeWidth="4" strokeLinejoin="round" />
        <path d="M290 424L352 458V548L290 512Z" fill={C.orange} stroke={C.orange} strokeWidth="4" strokeLinejoin="round" />
        <path d="M352 458L512 432V518L352 548Z" fill={C.white} stroke={C.white} strokeWidth="4" strokeLinejoin="round" />
        <path d="M352 458L512 432" {...bold} />
        <ellipse cx="404" cy="430" rx="54" ry="17" fill="none" stroke={C.ink} strokeWidth="3.4" pathLength={1} className="lv-draw" style={v({ "--k": 0, "--lv-base": "1.6s" })} />
        <ellipse cx="404" cy="430" rx="44" ry="13" {...fine} opacity="0.55" />
        <path d="M378 478Q380 504 377 528M414 472Q417 500 414 524M450 466Q453 494 450 518M486 460Q488 486 486 510" {...fine} opacity="0.45" />
        <path d="M304 452L314 468M318 482L328 498" {...fine} opacity="0.45" />
      </g>
      <g className="lv-in" style={v({ "--lv-base": "1.8s" })}>
        <Person x={248} y={484} s={0.92} color="green" pose="stand" item="book" itemColor="orange" hair="long" outfit="dress" flip className="lv-rock" style={v({ "--t": 3.4, "--d": 1 })} />
      </g>
      <g transform="translate(470 380)"><Butterfly d={0.6} /></g>
    </Art>
    </Scene>
  );
}

/** Farfalla gialla che gira in un piccolo ovale (tr-lv-flit) battendo le ali (lv-flutter). */
function Butterfly({ d, color = "yellow" }: { d: number; color?: "yellow" | "orange" | "white" }) {
  return (
    <g className="tr-lv-flit" style={v({ "--d": d })}>
      <g className="lv-flutter">
        <path d="M0 0C-10 -12 -16 -2 -8 2C-14 6 -8 12 0 2C8 12 14 6 8 2C16 -2 10 -12 0 0Z" fill={C[color]} />
        <path d="M0 -5V5" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ---------- Tumminia ---------- */
const FIELD = [312, 330, 348, 366, 384, 402, 420, 438, 456, 474, 492, 510, 528, 546];
// Scena: una spiga di Tumminia gigante (SOGGETTO, ondeggia) davanti al campo; nel campo chi miete con il falcetto,
// davanti chi ha mietuto porta via il covone. Intro: sale la terra, spuntano il campo e la spiga, arrivano le persone.
// Vita: la spiga e metà del campo ondeggiano (sfasati), chi miete taglia con il falcetto, chi porta il covone si assesta il
// carico, due rondini passano sopra il campo.
export function ScenaTumminia() {
  return (
    <Scene>
    <Art viewBox="0 0 560 640" className={ART} title="Una spiga di grano molto grande; dietro un campo di spighe dove una persona miete col falcetto e un'altra porta via un covone" desc="La Tumminia, antico grano duro siciliano.">
      <path d="M0 560Q0 540 28 538Q280 528 532 536Q560 538 560 560V614Q560 640 532 640H28Q0 640 0 614Z" fill={C.green} className="lv-rise" />
      <path d="M262 560C284 488 344 452 424 446C484 442 530 448 570 456V560Z" fill={C.green} className="lv-rise" style={v({ "--k": 1 })} />
      <Birds x={420} y={250} s={0.8} x0={220} x1={-560} y1={-40} t={20} d={1.5} />
      {FIELD.map((x, i) => (
        <g key={x} transform={`translate(${x} ${546 - (i % 2) * 3})`}>
          <g className="lv-pop" style={v({ "--k": i * 0.5, "--lv-base": "0.7s" })}>
            <g className={i % 2 ? "sway-s" : undefined} style={i % 2 ? v({ "--d": (i * 0.37) % 4 }) : undefined}>
              <Spighetta h={70 + ((i * 7) % 4) * 6} lean={((i * 5) % 7) - 3} />
            </g>
          </g>
        </g>
      ))}
      <g className="lv-in" style={v({ "--lv-base": "1.6s" })}>
        <Person x={496} y={566} s={1} color="white" pose="bend" hair="cap" flip hold={<Falcetto />} className="lv-rock" style={v({ "--t": 1.1 })} />
      </g>
      <Pop x={170} y={584} k={0} base="0.5s"><Spiga h={440} pairs={9} grain="orange" className="sway" style={dl(1)} /></Pop>
      <g className="lv-in" style={v({ "--k": 2, "--lv-base": "1.6s" })}>
        <Person x={352} y={596} s={1.18} color="orange" pose="present" hair="curly" build="regular" hold={<Covone ears="white" stems="yellow" size={1.4} tilt={34} />} className="lv-rock" style={v({ "--t": 2.8, "--d": 0.7 })} />
      </g>
    </Art>
    </Scene>
  );
}

/* ---------- Pane nero ---------- */
const sesame = [[150, 210], [196, 182], [246, 168], [318, 166], [368, 180], [420, 210], [118, 268], [168, 300], [236, 286], [330, 292], [396, 300], [452, 270], [140, 352], [214, 340], [290, 346], [360, 344], [428, 356], [262, 210], [300, 250], [200, 236], [380, 238]];
const CUTS: [number, number, number][] = [[186, 248, -26], [280, 222, -4], [374, 246, 22]];

// Scena: la pagnotta di pane nero sul tagliere (SOGGETTO), la fetta appoggiata, il coltello e la ciotola d'olio sul tavolo,
// una spiga di Tumminia da cui viene la farina. Intro: il tavolo sale, il tagliere arriva, la pagnotta cresce come impasto,
// poi fetta, coltello, ciotola e spiga. Vita: tre fili di vapore salgono a turno dal pane caldo (natura morta: solo il
// vapore si muove, nient'altro avrebbe un motivo).
export function ScenaPane() {
  const loaf = "M64 384C52 248 160 152 280 152S508 248 496 384Q494 412 470 414H90Q66 412 64 384Z";
  return (
    <Scene>
    <Art viewBox="0 0 560 560" className={ART} title="Una grande pagnotta con i tagli sulla crosta e i semi su un tagliere, una fetta appoggiata, un coltello, una ciotola d'olio e una spiga; il vapore sale" desc="Il pane nero di Castelvetrano.">
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${170 + i * 50} 196C${160 + i * 50} 178 ${184 + i * 50} 162 ${174 + i * 50} 140`} fill="none" stroke={C.white} strokeWidth="6" strokeLinecap="round" className="lv-puff" style={v({ "--t": 4.2 + i * 0.5, "--d": 1.8 + i * 1.4, "--lv-y": "46px" })} />
      ))}
      {/* il tavolo */}
      <g className="lv-rise" style={v({ "--lv-y": "40px" })}>
        <rect x="18" y="432" width="524" height="112" rx="16" fill={C.orange} />
        <path d="M40 520H520" {...fine} opacity="0.35" />
      </g>
      {/* tagliere con il manico forato */}
      <g className="lv-in" style={v({ "--k": 2 })}>
        <path d="M52 412H404Q410 412 414 416H492A10 10 0 0 1 492 436H62A12 12 0 0 1 50 424V414Q50 412 52 412ZM482 426a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z" fill={C.white} fillRule="evenodd" />
        <path d="M60 431H400" {...fine} opacity="0.4" />
      </g>
      {/* pagnotta: crosta, tagli, semi; cresce dal tagliere come l'impasto */}
      <g className="lv-pop" style={v({ "--lv-base": "0.6s" })}>
      <g transform="translate(14 117) scale(0.72)">
        <path d={loaf} fill={C.orange} />
        {CUTS.map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            <path d="M-48 0C-28 -15 28 -15 48 0C28 11 -28 11 -48 0Z" fill={C.yellow} stroke={C.yellow} strokeWidth="3" strokeLinejoin="round" />
            <path d="M-44 -1C-24 -12 24 -12 44 -1" {...bold} strokeWidth="3.4" />
          </g>
        ))}
        {sesame.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="3" ry="4.8" transform={`rotate(${(i * 47) % 180} ${x} ${y})`} fill={C.white} />)}
      </g>
      </g>
      {/* fetta appoggiata alla pagnotta, coltello, ciotola, spiga: arrivano dopo il pane */}
      <g className="lv-in" style={v({ "--k": 0, "--lv-base": "1.3s" })}>
      <g transform="translate(404 412) rotate(-9) scale(0.8)">
        <path d="M-44 0C-50 -48 -34 -84 0 -88C34 -84 50 -48 44 0Q0 6 -44 0Z" fill={C.orange} stroke={C.orange} strokeWidth="3" strokeLinejoin="round" />
        <path d="M-34 -6C-38 -42 -26 -70 0 -74C26 -70 38 -42 34 -6Q0 -2 -34 -6Z" fill={C.yellow} />
        {[[-12, -52, 4], [8, -40, 3], [-2, -62, 2.6], [16, -58, 3], [-16, -26, 3.4], [12, -18, 2.6], [-4, -34, 2.2]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={C.white} />)}
      </g>
      </g>
      <g className="lv-in" style={v({ "--k": 1, "--lv-base": "1.3s" })}>
      {/* coltello da pane: lama di ferro, manico giallo */}
      <g transform="translate(244 476) rotate(-4)">
        <path d="M-96 0C-96 -8 -90 -12 -82 -12H40V4H-84C-91 4 -96 3 -96 0Z" fill={C.ink} />
        <rect x="40" y="-10" width="56" height="13" rx="6" fill={C.yellow} />
        <path d="M54 -3.5H82" {...fine} />
      </g>
      </g>
      <g className="lv-in" style={v({ "--k": 2, "--lv-base": "1.3s" })}>
      {/* ciotola d'olio (bianca, contorno fine) */}
      <g transform="translate(462 500)">
        <path d="M-40 -24Q-36 0 -14 0H14Q36 0 40 -24Z" {...fine} fill={C.white} />
        <ellipse cx="0" cy="-24" rx="40" ry="7" {...fine} fill={C.yellow} />
      </g>
      {/* spiga di Tumminia coricata sul tavolo */}
      <g transform="translate(46 524) rotate(86)">
        <Spighetta h={88} />
      </g>
      </g>
    </Art>
    </Scene>
  );
}

/* ---------- Olive e olio ---------- */
type Pt = { x: number; y: number; a: number };
const BR = [[466, 128], [360, 140], [190, 260], [124, 440]] as const;
function branchAt(t: number): Pt {
  const P = BR;
  const u = 1 - t;
  const x = u ** 3 * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t ** 3 * P[3][0];
  const y = u ** 3 * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t ** 3 * P[3][1];
  const dx = 3 * u * u * (P[1][0] - P[0][0]) + 6 * u * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]);
  const dy = 3 * u * u * (P[1][1] - P[0][1]) + 6 * u * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1]);
  return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
}
const leafTs = [0.04, 0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84, 0.92];
const oliveTs = [0.18, 0.34, 0.5, 0.66, 0.82];
const f1 = (v: number) => v.toFixed(1);

// Scena: il ramo di Nocellara (SOGGETTO, ondeggia intero): legno ink, foglie piene, olive grandi appese sotto, nel bianco;
// sotto, sul tavolo, la bottiglia d'olio e il piattino di olive. Intro: il tavolo sale, il ramo si disegna, le foglie
// spuntano, le olive crescono, arrivano bottiglia e piattino. Vita: il ramo ondeggia; un'oliva matura si stacca e cade nel
// piattino, poi ricresce; un'ape gira vicino alle foglie.
export function ScenaOlive() {
  const fall = branchAt(oliveTs[2]!);
  return (
    <Scene>
    <Art viewBox="0 0 560 640" className={ART} title="Un ramo d'ulivo con foglie e grosse olive verdi, una bottiglia d'olio e un piattino di olive su un tavolo" desc="La Nocellara del Belice e l'olio della Valle del Belice.">
      <g style={{ transformOrigin: "466px 128px" }} className="tr-lv-branch">
        <path d={`M${BR[0].join(" ")}C${BR[1].join(" ")} ${BR[2].join(" ")} ${BR[3].join(" ")}`} fill="none" stroke={C.ink} strokeWidth="8" strokeLinecap="round" pathLength={1} className="lv-draw" style={v({ "--lv-base": "0.3s" })} />
        <g className="lv-reveal" style={v({ "--lv-base": "0.8s" })}>
        {leafTs.flatMap((t, i) => {
          const p = branchAt(t);
          return [-34, -78].map((off) => (
            <g key={`${i}${off}`} transform={`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.a + 180 + off)})`}>
              <Foglia len={54 + (i % 3) * 7} fill="green" />
            </g>
          ));
        })}
        </g>
        {oliveTs.map((t, i) => {
          const p = branchAt(t);
          const rx = 21 + (i % 2) * 3, ry = 28 + (i % 2) * 3;
          const ox = p.x + (i % 2 ? 8 : -6), oy = p.y + ry + 24;
          return (
            <g key={i} transform={`translate(${f1(ox)} ${f1(oy)})`}>
              <g className="lv-pop" style={v({ "--k": i, "--lv-base": "1.3s" })}>
                {/* la terza oliva è matura: si stacca e cade nel piattino (cicli di 6.5 s), poi ricresce sul ramo */}
                {i === 2 ? <g className="tr-lv-olive" style={v({ "--dx": `${f1(300 - ox)}px`, "--dy": `${f1(556 - oy)}px`, "--d": 3 })}><Oliva rx={rx} ry={ry} /></g> : <Oliva rx={rx} ry={ry} />}
              </g>
            </g>
          );
        })}
      </g>
      <g transform={`translate(${f1(fall.x + 70)} ${f1(fall.y - 40)})`}><Bee /></g>
      {/* tavolo: piano verde con lo spessore e una gamba */}
      <g className="lv-rise" style={v({ "--lv-y": "40px" })}>
        <rect x="228" y="586" width="14" height="70" rx="4" fill={C.green} />
        <rect x="196" y="570" width="380" height="20" rx="5" fill={C.green} />
        <path d="M200 578H576" stroke={C.white} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.6" />
      </g>
      <g className="lv-in" style={v({ "--k": 1, "--lv-base": "1.5s" })}><Piattino x={296} y={570} w={56} /></g>
      <g className="lv-rise" style={v({ "--k": 0, "--lv-base": "1.4s", "--lv-y": "30px" })}><Bottiglia x={456} y={570} s={1.3} /></g>
    </Art>
    </Scene>
  );
}

/** Ape: corpo arancio a righe ink (si legge sul bianco), ali solo a tratto fine, gira in un ovale. */
function Bee() {
  return (
    <g className="tr-lv-flit" style={v({ "--d": 1.7 })}>
      <g className="lv-flutter"><path d="M-3 -4C-9 -14 -1 -16 0 -6M3 -4C9 -14 1 -16 0 -6" {...fine} strokeWidth="1.2" /></g>
      <ellipse rx="8" ry="5.5" fill={C.orange} />
      <path d="M-2 -5V5M2.6 -4.6V4.6" {...fine} strokeWidth="1.6" />
      <circle cx="8.6" cy="-0.6" r="2.6" fill={C.ink} />
    </g>
  );
}

/* ---------- Agrumi ---------- */
const TREE_A = { x: 200, y: 520, s: 2.5 };
const PICK_A = (() => {
  const [hx, hy] = handAt("reach", "front", "regular");
  const fx = TREE_A.x - 27 * TREE_A.s, fy = TREE_A.y - 52 * TREE_A.s; // arancia [-27,-52] di OrangeTree
  const s = (TREE_A.y - fy) / -hy;
  return { x: fx - hx * s, y: TREE_A.y, s, fx, fy };
})();

// Scena: l'agrumeto del Giardino delle Arance. Un arancio grande (SOGGETTO) da cui una persona coglie un frutto; un'altra
// porta la cassetta piena verso la pila davanti al casolare di fine Settecento. In cielo una fetta d'arancia fa da sole.
// Intro: la fetta sorge, il prato sale, il casolare, l'arancio cresce, le cassette, poi le persone. Vita: la fetta ruota
// lenta; chi coglie lascia cadere l'arancia nella cassetta ai suoi piedi; chi porta la cassetta fa avanti e indietro
// tra l'albero e la pila; due uccelli passano alti.
export function ScenaAgrumi() {
  return (
    <Scene>
    <Art viewBox="0 0 560 560" className={ART} title="Un arancio carico di frutti: una persona coglie un'arancia, un'altra porta una cassetta verso le cassette impilate davanti a un casolare; in alto una fetta d'arancia" desc="Gli agrumi del Giardino delle Arance.">
      <Birds x={160} y={110} s={0.75} x0={-260} x1={520} y1={-30} t={26} d={4} />
      <g transform="translate(452 128)">
        <g className="lv-sun" style={v({ "--lv-base": "0.3s" })}>
        <g className="spin-slow" style={dl(0, 120)}>
          <circle r="74" fill={C.orange} />
          <circle r="65" fill={C.white} />
          {Array.from({ length: 9 }, (_, i) => <Spicchio key={i} r={57} inner={9} from={i * 40 + 5} to={i * 40 + 35} />)}
          <circle r="6" fill={C.white} />
        </g>
        </g>
      </g>
      <g className="lv-rise" style={v({ "--k": 1, "--lv-y": "40px" })}><Casolare x={448} y={474} s={1} /></g>
      <path d="M-10 410Q120 404 230 440T570 470V570H-10Z" fill={C.green} className="lv-rise" />
      <Pop x={TREE_A.x} y={TREE_A.y} k={0} base="0.85s"><OrangeTree s={TREE_A.s} /></Pop>
      <Pop x={58} y={520} k={3} base="0.85s"><Crate w={44} s={1} color="white" /></Pop>
      <Pop x={472} y={534} k={4} base="0.85s"><Crate w={64} s={1.15} color="yellow" fruit={false} /></Pop>
      <Pop x={476} y={506} k={5} base="0.85s"><Crate w={64} s={1.15} color="yellow" /></Pop>
      <g className="lv-in" style={v({ "--lv-base": "1.6s" })}>
        <Person x={PICK_A.x} y={PICK_A.y} s={PICK_A.s} color="white" pose="reach" build="regular" hair="long" outfit="dress" />
        <g transform={`translate(${PICK_A.fx} ${PICK_A.fy})`}>
          <g className="lv-drop" style={v({ "--dx": `${(62 - PICK_A.fx).toFixed(1)}px`, "--dy": `${(490 - PICK_A.fy).toFixed(1)}px`, "--d": 2.6 })}>
            <circle r="14" fill={C.orange} />
            <path d="M1.5 -13l3.5 -6.5" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>
      </g>
      {/* chi porta la cassetta: avanti e indietro tra l'albero e la pila (a riposo vicino alla pila) */}
      <g className="lv-in" style={v({ "--k": 2, "--lv-base": "1.6s" })}>
        <g transform="translate(350 546)">
          <g className="tr-lv-carry" style={v({ "--d": 2 })}>
            <g className="lv-step"><Person s={1.22} color="orange" pose="carry" item="crate" itemColor="white" hair="cap" build="broad" /></g>
          </g>
        </g>
      </g>
    </Art>
    </Scene>
  );
}

/* ---------- Cretto di Burri ---------- */
const COLS = [-1, -0.7, -0.4, -0.08, 0.26, 0.58, 1];
const ROWS = 9;
const jit = (r: number, c: number) => Math.sin(r * 12.9898 + c * 78.233) * 0.5;
// Scena: i blocchi bianchi del Cretto in prospettiva (SOGGETTO, astratto), ognuno con la sua faccia alta e il fronte; dietro la
// cresta dei monti. In una fenditura vicina cammina una persona: l'unica cosa che si muove, dà la scala.
export function ScenaCretto() {
  const ytop = 120, hh = 350;
  const rowY = (r: number) => ytop + hh * (r / ROWS) ** 1.55;
  const half = (y: number) => 70 + 240 * ((y - ytop) / hh);
  const blocks: { pts: string; k: string; sw: number; edge: string }[] = [];
  for (let r = 0; r < ROWS; r++) {
    const y0 = rowY(r), y1 = rowY(r + 1), g = (y1 - y0) * 0.11;
    const sw = Math.max(1.5, Math.min(9, (y1 - y0) * 0.16));
    for (let c = 0; c < COLS.length - 1; c++) {
      const pad = 0.025 + sw / 2 / half(y0 + g) / 1.2;
      const ua = COLS[c]! + (c ? jit(r, c) * 0.05 : 0) + pad, ub = COLS[c + 1]! + (c < COLS.length - 2 ? jit(r, c + 1) * 0.05 : 0) - pad;
      const ya = y0 + g + sw / 2, yb = y1 - g - sw / 2, ye = yb - (yb - ya) * 0.18;
      const X = (u: number, y: number) => (300 + u * half(y)).toFixed(1);
      blocks.push({
        k: `${r}-${c}`, sw,
        pts: `${X(ua, ya)},${ya.toFixed(1)} ${X(ub, ya)},${ya.toFixed(1)} ${X(ub, yb)},${yb.toFixed(1)} ${X(ua, yb)},${yb.toFixed(1)}`,
        edge: `M${X(ua, ye)} ${ye.toFixed(1)}H${X(ub, ye)}`,
      });
    }
  }
  const py = rowY(8);
  const px = 300 + ((0.26 + 0.58) / 2) * half(py);
  const rows = Array.from({ length: ROWS }, (_, r) => blocks.filter((b) => b.k.startsWith(`${r}-`)));
  // Intro: la cresta sale, poi i blocchi si stendono fila per fila dal fondo verso di noi (il cemento copre le macerie).
  // Vita: la persona percorre la fenditura da un bordo all'altro, lenta; una nuvola bianca scivola sopra i monti.
  return (
    <Scene>
    <Art viewBox="0 0 600 520" className={ART} title="Blocchi bianchi in prospettiva, separati da stretti passaggi; in uno di essi cammina una persona" desc="Il Cretto di Burri a Gibellina, rappresentato in modo astratto.">
      <path d="M-10 112Q60 70 130 88T260 74Q330 66 400 86T610 80V116H-10Z" fill={C.yellow} className="lv-rise" style={v({ "--lv-y": "30px" })} />
      <Cloud x={120} y={50} s={0.7} color="white" className="lv-cloud" style={v({ "--d": 1 })} />
      {rows.map((row, r) => (
        <g key={r} className="lv-reveal-x" style={v({ "--k": r, "--lv-base": "0.4s" })}>
          {row.map((b) => <polygon key={b.k} points={b.pts} fill={C.white} stroke={C.white} strokeWidth={b.sw.toFixed(1)} strokeLinejoin="round" />)}
          <path d={row.map((b) => b.edge).join("")} {...fine} strokeWidth="1.2" opacity="0.35" />
        </g>
      ))}
      <g transform={`translate(${px.toFixed(1)} ${(py + 1).toFixed(1)})`}>
        <g className="lv-move" style={v({ "--x0": `${(-px - 30).toFixed(0)}px`, "--x1": `${(630 - px).toFixed(0)}px`, "--t": 30, "--d": 1.4 })}>
          <g className="lv-step"><Person s={0.56} color="orange" pose="walk" hair="short" /></g>
        </g>
      </g>
    </Art>
    </Scene>
  );
}

/* ---------- La tavola ---------- */
// Scena: la tavola apparecchiata con pane, olive, olio e un barattolo ABES (SOGGETTO); due persone siedono sulle sedie, una
// con la mano sulla fetta di pane, l'altra sul bicchiere; una terza arriva con il cesto (protagonista). Una animazione.
// Intro: il pavimento sale, arrivano tavolo e sedie, il cibo spunta sulla tavola, si siedono; chi porta il cesto entra da
// destra. Vita: il pane caldo fuma; chi è arrivato si dondola sul cesto; tre uccelli passano nel cielo arancio. Chi è
// seduto resta fermo: le mani sono sul pane e sul bicchiere.
export function ScenaTavola() {
  return (
    <Scene>
    <Art viewBox="0 250 600 250" className={ART} title="Una tavola con pane, olive, olio e un barattolo; due persone sedute, una con una fetta di pane e una con un'arancia, e una terza che arriva con un cesto" desc="Quello che la terra dà finisce a tavola.">
      <Birds x={300} y={290} s={0.6} x0={340} x1={-360} y1={-10} t={18} d={3.5} />
      <g className="lv-rise" style={v({ "--lv-y": "30px" })}>
        <rect x="-10" y="446" width="620" height="70" fill={C.yellow} />
        <path d="M-10 446.5H610" {...fine} opacity="0.35" />
      </g>
      <g className="lv-in" style={v({ "--k": 2 })}>
        <Sedia x={110} y={446} s={1.05} color="green" />
        <Sedia x={410} y={446} s={1.05} color="green" flip />
      </g>
      <g className="lv-in" style={v({ "--k": 0, "--lv-base": "1.5s" })}>
        <Person x={110} y={446} s={1.05} color="white" pose="sit-table" hair="short" build="broad" hold={<Fetta />} />
      </g>
      <g className="lv-in" style={v({ "--k": 1, "--lv-base": "1.5s" })}>
        <Person x={410} y={446} s={1.05} color="yellow" pose="sit-table" hair="bun" flip hold={<Bicchiere />} />
      </g>
      <g className="lv-in" style={v({ "--k": 3 })}>
      {/* tavolo: piano con lo spessore, gambe */}
      <rect x="161" y="394" width="7" height="52" rx="3" fill={C.green} />
      <rect x="352" y="394" width="7" height="52" rx="3" fill={C.green} />
      <rect x="150" y="384" width="220" height="12" rx="3" fill={C.green} />
      <path d="M154 391H366" stroke={C.white} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.6" />
      </g>
      {/* pane caldo (con il suo vapore), olive, olio, barattolo: spuntano uno dopo l'altro */}
      <Pop x={208} y={384} k={0} base="1s">
        <path d="M-42 0C-42 -28 -22 -42 0 -42S42 -28 42 0Z" fill={C.yellow} />
        {[[-18, -22, -18], [2, -28, 0], [22, -22, 18]].map(([x, y, r], i) => (
          <path key={i} d="M-9 0C-5 -3.4 5 -3.4 9 0" transform={`translate(${x} ${y}) rotate(${r})`} {...fine} />
        ))}
      </Pop>
      {[0, 1].map((i) => (
        <path key={i} d={`M${196 + i * 22} 334C${190 + i * 22} 324 ${202 + i * 22} 316 ${196 + i * 22} 304`} fill="none" stroke={C.white} strokeWidth="3.6" strokeLinecap="round" className="lv-puff" style={v({ "--t": 4 + i * 0.6, "--d": 2.2 + i * 1.7, "--lv-y": "26px" })} />
      ))}
      <Pop x={282} y={384} k={1} base="1s"><Piattino w={20} /></Pop>
      <Pop x={318} y={384} k={2} base="1s"><Bottiglia s={0.5} cap="green" /></Pop>
      <Pop x={348} y={384} k={3} base="1s"><Barattolo s={0.9} /></Pop>
      {/* chi porta il cesto entra da destra (una volta), poi si dondola piano */}
      <g transform="translate(492 446)">
        <g className="tr-lv-arrive">
          <Person s={1.05} color="green" pose="carry" item="basket" itemColor="yellow" hair="curly" flip className="lv-rock" style={v({ "--t": 2.4, "--d": 0.3 })} />
        </g>
      </g>
    </Art>
    </Scene>
  );
}

/** Bicchiere d'acqua (oggetto bianco da mano: contorno ink fine). */
function Bicchiere() {
  return <path d="M-4 -15H6L5 -1A1.6 1.6 0 0 1 3.4 0.4H-1.4A1.6 1.6 0 0 1 -3 -1Z" {...fine} fill={C.white} strokeWidth="1.2" />;
}

/** Fetta di pane tenuta in mano (oggetto `hold`): crosta gialla, mollica bianca. */
function Fetta() {
  return (
    <g transform="translate(2 -8) rotate(-70)">
      <path d="M-7 8C-8 -2 -6 -9 0 -10C6 -9 8 -2 7 8Z" fill={C.yellow} />
      <path d="M-5 7C-6 -1 -4 -7 0 -8C4 -7 6 -1 5 7Z" fill={C.white} />
    </g>
  );
}
