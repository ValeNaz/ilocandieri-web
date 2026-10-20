import type { ReactNode } from "react";
import { Live } from "@/components/public/kit/Live";
import { C, INK as W, Person, Sun, handAt, type Fill } from "../parts";
import { Volley } from "../chi-siamo/parts";
import { Crate, Pot } from "../abes/parts";
import { Butterfly, Puffs, v } from "../abes/life";
import "./lavora.css";

const cls = "block h-full w-full";
const ROUND = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
const svg = { viewBox: "0 0 300 420", className: cls, "aria-hidden": true, focusable: "false", preserveAspectRatio: "xMidYMax meet" } as const;

/**
 * Five trades, five people, each DOING the job with the tool in the hand (`Person hold` draws the tool under the
 * fingers of the near hand, so the handle always passes through it). 300 x 420 stations, ground at y = 420, subjects at
 * least 24 units from the sides. Made for an orange room: no orange shapes against the room, no outer ink contours
 * (DESIGN.md v4); ink only for hair, trousers, shoes, iron and wood that is dark, and interior detail lines.
 * Live (kit/live.css, like the Home hero): each station builds itself once when it comes into view (ground things
 * rise, plants pop, then the person arrives at --lv-base 1.6s) and then keeps ONE or two small loops that belong to the
 * trade (digging, a ball tossed, steam, a pupil eager to answer). Reduced motion / no JS: the still frame below.
 */

/** The station frame: a Live box around the svg. */
function Station({ children }: { children: ReactNode }) {
  return <Live className={cls}><svg {...svg}>{children}</svg></Live>;
}
/** Intro wrappers: a group that rises / pops / slides in, k = order; people arrive last (base 1.6s). */
const Rise = ({ k = 0, base = 0.1, children }: { k?: number; base?: number; children: ReactNode }) => <g className="lv-rise" style={v({ "--k": k, "--lv-base": `${base}s`, "--lv-y": "40px" })}>{children}</g>;
const In = ({ k = 0, base = 0.6, children }: { k?: number; base?: number; children: ReactNode }) => <g className="lv-in" style={v({ "--k": k, "--lv-base": `${base}s` })}>{children}</g>;
const Pop = ({ x, y, k = 0, base = 0.85, children }: { x: number; y: number; k?: number; base?: number; children: ReactNode }) => (
  <g transform={`translate(${x} ${y})`}><g className="lv-pop" style={v({ "--k": k, "--lv-base": `${base}s` })}>{children}</g></g>
);

/** Scena (Orto): chi lavora l'orto affonda la vanga nella terra (soggetto); accanto una cassetta di verdura e una fila di
 * piantine. Intro: sole che sale, piantine che spuntano, cassetta, poi la persona. Vita: la vangata (dondolio sui piedi),
 * le piantine al vento, una farfalla sopra l'orto, i raggi del sole che girano piano. */
export function TradeGarden() {
  return (
    <Station>
      <g className="lv-sun" style={v({ "--lv-y": "80px" })}><Sun cx={236} cy={90} r={30} rays={8} color="yellow" className="spin-slow" /></g>
      {/* seedlings in a row, each with two leaves */}
      {[22, 54].map((x, i) => (
        <Pop key={x} x={x} y={420} k={i}>
          <g className="sway-s" style={v({ "--d": i * 1.7 })}>
            <path d="M0 0 C-14 -10 -16 -22 -12 -28 C-4 -24 0 -14 0 0 Z M0 0 C12 -12 16 -24 12 -32 C4 -26 0 -16 0 0 Z" fill={C.green} />
            <path d="M0 0 V-24" stroke={C.green} strokeWidth="3" strokeLinecap="round" />
          </g>
        </Pop>
      ))}
      <In k={0} base={1}><Crate x={234} y={420} w={84} h={38} produce="cabbage" /></In>
      <Rise base={1.6}>
        <Person x={100} y={420} s={2.2} color="green" pose="dig" item="spade" itemColor="white" hair="short" build="broad" className="lv-rock" style={v({ "--t": 1.3 })} />
      </Rise>
      <Butterfly x={40} y={330} s={1.2} dx={70} dy={-40} t={6.5} d={0.4} />
    </Station>
  );
}

/** Scena (Campo): l'allenatore accanto alla rete palleggia: lancia il pallone in alto e lo riprende sulla mano alzata.
 * Intro: la rete sale dal basso, poi arriva l'allenatore. Vita: solo il pallone (su e giu, ruotando). */
export function TradeField() {
  return (
    <Station>
      {/* volleyball net: two posts on round feet, top tape, mesh */}
      <g className="lv-reveal" style={v({ "--k": 0, "--lv-base": "0.3s" })}>
      <g stroke={C.white} strokeLinecap="round"><line x1="36" y1="152" x2="36" y2="414" strokeWidth="5" /><line x1="136" y1="152" x2="136" y2="414" strokeWidth="5" /></g>
      <path d="M26 418 H46 M126 418 H146" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
      <g stroke={C.white} strokeWidth="1.8" strokeLinecap="round">{[61, 86, 111].map((x) => <line key={x} x1={x} y1="170" x2={x} y2="244" />)}{[194, 219, 244].map((y) => <line key={y} x1="36" y1={y} x2="136" y2={y} />)}</g>
      <rect x="32" y="162" width="108" height="10" rx="4" fill={C.white} />
      </g>
      <Rise base={1.4}>
        <Person x={204} y={420} s={2.1} color="yellow" pose="reach" hair="cap" build="regular"
          hold={
            <g className="lv-arc-x" style={v({ "--dx": "0px", "--t": 0.9, "--d": 2.2 })}>
              <g className="lv-arc-y" style={v({ "--h": "30px", "--dy": "0px", "--t": 0.9, "--d": 2.2 })}>
                <g className="lv-spin" style={v({ "--t": 1.6 })}><Volley y={-13} r={12} /></g>
              </g>
            </g>
          } />
      </Rise>
    </Station>
  );
}

/** Scena (Cucina): chi cucina, col grembiule, gira il mestolo dentro la pentola sul bancone; dal brodo sale il vapore.
 * Intro: il bancone sale, la pentola arriva, poi il cuoco. Vita: il cuoco mescola (dondolio lento), tre sbuffi di vapore. */
export function TradeKitchen() {
  return (
    <Station>
      <Puffs x={222} y={244} r={7} rise={60} spread={12} t={3.4} d={1.6} />
      <Rise base={1.5}>
        <Person x={84} y={420} s={2.2} color="green" pose="wave" outfit="apron" hair="bun" build="regular" className="kit-stir" style={v({ "--t": 1.6 })}
          hold={<path d="M-1 -2 L30 25" stroke={C.ink} strokeWidth="2.8" strokeLinecap="round" />} />
      </Rise>
      <Rise k={0} base={0.2}>
      {/* kitchen unit: white worktop, green cupboard with two doors and ink knobs */}
      <rect x="150" y="334" width="130" height="86" rx="4" fill={C.green} />
      <path d="M215 346 V414" stroke={C.ink} strokeWidth={W.bold} strokeLinecap="round" />
      <path d="M205 362 v10 M225 362 v10" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
      <rect x="142" y="320" width="146" height="16" rx="4" fill={C.white} />
      </Rise>
      <In k={0} base={0.9}><Pot x={218} y={320} s={0.62} body="yellow" lid={false} /></In>
    </Station>
  );
}

/** Scena (Ufficio): chi lavora siede sullo sgabello e legge un foglio, alla scrivania col portatile aperto e una tazza.
 * Intro: scrivania e sgabello salgono, portatile e tazza arrivano, poi la persona. Vita: il caffe fuma nella tazza. */
export function TradeOffice() {
  return (
    <Station>
      <Rise k={0} base={0.2}>
      {/* stool: seat top at y = 420 - 40*2.2, where `sit` sits; three ink legs and a foot ring */}
      <path d="M60 340 L52 420 M98 340 L106 420 M79 340 V420 M56 388 H102" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      <rect x="48" y="332" width="62" height="10" rx="4" fill={C.yellow} />
      </Rise>
      <Rise base={1.5}>
      <Person x={76} y={420} s={2.2} color="green" pose="sit" hair="long" build="slim"
        hold={<g transform="rotate(-14)"><rect x="-2" y="-17" width="13" height="17" rx="1.5" fill={C.white} stroke={C.ink} strokeWidth="1" /><path d="M1 -13 H8 M1 -9.5 H8 M1 -6 H6" stroke={C.ink} strokeWidth="0.9" strokeLinecap="round" /></g>} />
      </Rise>
      <Rise k={1} base={0.2}>
      {/* desk: white top, a drawer block, ink legs */}
      <path d="M150 300 V420 M262 300 V420" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      <rect x="216" y="300" width="48" height="44" rx="3" fill={C.white} />
      <path d="M232 322 H248" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <rect x="140" y="288" width="132" height="14" rx="4" fill={C.white} />
      </Rise>
      <In k={0} base={0.9}>
      {/* laptop seen from the side: base on the desk, lid open towards the sitter (ink: it is dark) */}
      <path d="M160 285 H208 L216 240" stroke={C.ink} strokeWidth="5" {...ROUND} />
      {/* mug */}
      <path d="M252 288 h-18 c-1.6 0 -2.6 -1 -2.6 -2.6 V266 h23.2 V285.4 c0 1.6 -1 2.6 -2.6 2.6 Z" fill={C.yellow} />
      <path d="M254.6 270 c8 0 8 12 0 12" stroke={C.ink} strokeWidth="2.6" {...ROUND} />
      </In>
      <Puffs x={243} y={258} r={4} rise={34} spread={5} t={4.2} d={2.4} />
    </Station>
  );
}

/** Scena (Educazione): chi insegna scrive col gesso sulla lavagna; un ragazzo alza la mano per rispondere.
 * Intro: la lavagna sale, i numeri si scrivono uno alla volta, poi arrivano insegnante e ragazzo.
 * Vita: il ragazzo saltella con la mano alzata, impaziente di rispondere. */
export function TradeTeaching() {
  return (
    <Station>
      <Placed2 x={90} y={84}>
        <Rise k={0} base={0.2}>
        <rect width="168" height="132" rx="8" fill={C.yellow} />
        <rect x="9" y="9" width="150" height="114" rx="4" fill={C.green} />
        </Rise>
        {["1", "2", "3"].map((t, i) => <text key={t} className="lv-reveal-x" style={v({ "--k": i * 3, "--lv-base": "0.8s" })} x={24 + i * 46} y={88} fontFamily="var(--font-display)" fontWeight="700" fontSize="56" fill={C.white}>{t}</text>)}
        {/* chalk tray under the board, a stub of chalk on it */}
        <rect x="4" y="132" width="160" height="7" rx="3" fill={C.white} />
        <rect x="128" y="127" width="12" height="5" rx="2" fill={C.white} />
      </Placed2>
      <Rise base={1.5}>
        <Person x={74} y={420} s={2.2} color="white" pose="reach" hair="curly" build="regular"
          hold={<rect x="-1.6" y="-7" width="3.2" height="7" rx="1.4" fill={C.yellow} />} />
      </Rise>
      <Rise k={2} base={1.5}>
        <Person x={228} y={420} s={2.1} kid color="yellow" pose="wave" hair="short" flip className="lv-hop" style={v({ "--t": 1.4, "--d": 3 })} />
      </Rise>
    </Station>
  );
}

/** Placement group for built things (no animation): one transform, the children in local units. */
function Placed2({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <g transform={`translate(${x} ${y})`}>{children}</g>;
}

/**
 * Scena (Collaborazioni, stanza verde): quattro persone portano insieme una trave lunga, tenuta all'altezza delle mani
 * (soggetto). Intro: il pavimento si stende, poi la squadra arriva. Vita: la squadra avanza e torna a piccoli passi, tutti
 * insieme (un solo gruppo: trave e mani non si staccano mai); il bambino salta e fa il tifo. Each carrier draws its own stretch of the beam under its near hand (`hold`), from the middle
 * of the gap behind it to the middle of the gap ahead: the stretches join into one beam in front of every body, and
 * every near hand closes over it.
 */
export function TeamBeam() {
  const s = 1.2, G = 236;
  const [hx] = handAt("carry", "front", "regular");
  const crew: { x: number; color: Fill; hair: "bun" | "short" | "cap" | "long" }[] = [
    { x: 110, color: "white", hair: "bun" }, { x: 270, color: "yellow", hair: "short" }, { x: 430, color: "white", hair: "cap" }, { x: 590, color: "yellow", hair: "long" },
  ];
  const edges = [70, 190, 350, 510, 650];
  // local hold units: origin at the near hand (pre-lean), counter-rotated so the stretch stays level
  const stretch = (i: number) => {
    const hw = crew[i]!.x + hx * s;
    const a = (edges[i]! - hw) / s - (i ? 4 : 0), b = (edges[i + 1]! - hw) / s + (i < 3 ? 4 : 0);
    return (
      <g transform="rotate(3)">
        <rect x={a} y="-7.5" width={b - a} height="15" rx={i === 0 || i === 3 ? 5 : 0} fill={C.orange} />
        <path d={`M${a + (i ? 0 : 6)} 3 H${b - (i < 3 ? 0 : 6)}`} stroke={C.ink} strokeWidth={W.fine} strokeLinecap="round" opacity="0.5" />
      </g>
    );
  };
  return (
    <Live className="block h-full w-full">
    <svg viewBox="0 0 760 260" className="block h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <rect className="lv-reveal-x" x="0" y={G} width="760" height="24" rx="12" fill={C.white} />
      <In base={0.8}>
        <g className="lv-move lv-alt" style={v({ "--x0": "-22px", "--x1": "22px", "--t": 5.5, "--d": 1.6 })}>
          <g className="lv-step">
            {crew.map((p, i) => <Person key={p.x} x={p.x} y={G} s={s} color={p.color} pose="carry" item="none" hair={p.hair} build="regular" hold={stretch(i)} />)}
          </g>
        </g>
      </In>
      <Rise base={1.4}>
        <Person x={700} y={G} s={1.3} kid color="orange" pose="cheer" hair="curly" className="lv-hop" style={v({ "--t": 1.1, "--d": 2 })} />
      </Rise>
    </svg>
    </Live>
  );
}

/** Scena (nessuna posizione aperta, pannello bianco): una scrivania vuota con la sedia, accanto una porta aperta.
 * Intro: il pavimento si stende, la scrivania sale, monitor e portapenne spuntano, la porta. Vita: l'anta della porta
 * oscilla piano sui cardini, come per un filo d'aria: la porta e aperta. */
export function EmptyDesk() {
  return (
    <Live className="block h-full w-full">
    <svg viewBox="0 0 360 240" className="block h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      {/* door: green arched opening, the yellow leaf swung open with its ink knob, an orange step */}
      <Rise k={1} base={0.3}>
      <path d="M252 226 V72 a48 48 0 0 1 96 0 V226 Z" fill={C.green} />
      <g className="lav-door">
        <path d="M252 226 L298 214 V82 L252 72 Z" fill={C.yellow} stroke={C.yellow} strokeWidth="4" strokeLinejoin="round" />
        <path d="M262 100 L288 104 V142 L262 140 Z" fill="none" stroke={C.ink} strokeWidth={W.fine} strokeLinejoin="round" opacity="0.5" />
        <circle cx="290" cy="156" r="3.2" fill={C.ink} />
      </g>
      <rect x="244" y="224" width="112" height="8" rx="3" fill={C.orange} />
      </Rise>
      <Rise k={0} base={0.3}>
      {/* desk: orange top, a drawer with its pull, ink legs */}
      <path d="M34 160 V230 M176 160 V230" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
      <rect x="120" y="160" width="56" height="30" rx="3" fill={C.orange} />
      <path d="M140 175 H156" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <rect x="20" y="150" width="170" height="12" rx="4" fill={C.orange} />
      </Rise>
      {/* monitor on its ink stand, a pot of pencils */}
      <Pop x={117} y={148} k={0} base={0.9}>
        <path d="M0 -2 V-12 M-11 0 H11" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
        <rect x="-27" y="-48" width="54" height="38" rx="4" fill={C.green} />
      </Pop>
      <Pop x={50} y={150} k={2} base={0.9}>
        <path d="M-6 -18 l-3 -14 M0 -18 l1 -16 M6 -18 l4 -12" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" />
        <rect x="-10" y="-20" width="20" height="20" rx="3" fill={C.green} />
      </Pop>
      <In k={0} base={1.1}>
      {/* chair pushed in: green seat and back, ink frame */}
      <path d="M202 230 V196 M228 230 V196 M228 196 V158" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      <rect x="196" y="190" width="38" height="8" rx="3" fill={C.green} />
      <rect x="222" y="154" width="10" height="30" rx="3" fill={C.green} />
      </In>
      <rect className="lv-reveal-x" x="-10" y="230" width="380" height="10" rx="4" fill={C.yellow} />
    </svg>
    </Live>
  );
}
