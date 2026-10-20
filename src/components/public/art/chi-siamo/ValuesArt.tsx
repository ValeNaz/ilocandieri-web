import { INK, OrangeTree, Person, Placed, Sun, C, type Fill } from "../parts";
import { Live } from "../../kit/Live";
import { Birds, Brick, Butterfly, Cottage, Crate, Enter, Holding, lk, vars } from "./parts";

const svgCls = "block h-full w-full";

/**
 * Scena (Legalità, arco verde): il cancello di un bene confiscato aperto. Soggetto: i due battenti di ferro spalancati
 * con il lucchetto aperto appeso; oltre, il vialetto porta al casolare, e qualcuno lo risale con una cassetta.
 * Vita: intro (il prato e il vialetto si aprono, il casolare spunta, i pilastri salgono, i battenti si spalancano);
 * poi il lucchetto oscilla, chi porta la cassetta risale il vialetto ed entra in casa, uno stormo passa.
 */
export function LegalityArt() {
  const leaf = (sd: 1 | -1) => {
    const x0 = 200 + sd * 112, x1 = 200 + sd * 160;
    const at = (t: number) => ({ x: x0 + (x1 - x0) * t, top: 286 - 18 * t, bot: 462 + 12 * t });
    return (
      <g className="lv-cs-gate" style={lk(4, 0.9, { transformOrigin: `${x0}px 0px` })}>
        {/* a wrought-iron leaf swung open toward us: frame, bars with round finials, a middle rail */}
        <path d={`M${x0} 286 L${x1} 268 L${x1} 474 L${x0} 462 Z M${x0} 372 L${x1} 368`} fill="none" stroke={C.ink} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
        {[0.25, 0.5, 0.75].map((t) => { const b = at(t); return <path key={t} d={`M${b.x} ${b.top - 10} V${b.bot}`} stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />; })}
        {[0.25, 0.5, 0.75].map((t) => { const b = at(t); return <circle key={t} cx={b.x} cy={b.top - 13} r="3.6" fill={C.ink} />; })}
      </g>
    );
  };
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 400 520" className={svgCls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
      <Birds x={60} y={150} x0={-140} x1={420} t={24} d={2} s={0.7} />
      <rect x="-20" y="410" width="440" height="130" fill={C.yellow} className="lv-rise" style={lk(0, 0.1)} />
      <path d="M184 410 H216 L276 540 H124 Z" fill={C.white} stroke={C.white} strokeWidth="6" strokeLinejoin="round" className="lv-reveal" style={lk(1, 0.3)} />
      <Cottage x={200} y={410} s={0.78} wall="white" roof="orange" door="green" shutter="green" pane="yellow" className="lv-pop" style={lk(0, 0.6)} />
      {/* someone walks up the path with a full crate and goes in: the place is used again */}
      <Enter x={232} y={466} x0={22} y0={86} x1={-32} y1={-54} s1={0.62} t={13} d={1.6}>
        <Person s={0.6} color="green" pose="carry" itemColor="orange" flip hair="cap" />
      </Enter>
      {/* stone pillars with their caps */}
      {[-1, 1].map((sd) => (
        <g key={sd} className="lv-rise" style={lk(sd > 0 ? 3 : 2, 0.5, { "--lv-y": "40px" })}>
          <rect x={200 + sd * 100 - 13} y="270" width="26" height="210" rx="3" fill={C.orange} />
          <path d={`M${200 + sd * 100 - 13} 300 h26 M${200 + sd * 100 - 13} 340 h26`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.4" />
          <rect x={200 + sd * 100 - 18} y="258" width="36" height="14" rx="3" fill={C.white} />
          <circle cx={200 + sd * 100} cy="250" r="9" fill={C.white} />
        </g>
      ))}
      {leaf(-1)}
      {leaf(1)}
      {/* the padlock, open, hanging from the middle rail of the left leaf */}
      <Placed x={66} y={366}>
        <g className="sway" style={vars({ "--d": 1 })}>
          <path d="M-7 0 V-12 a10 10 0 0 1 20 0 V-6" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
          <rect x="-14" y="0" width="28" height="24" rx="4" fill={C.yellow} />
          <path d="M0 8 V15" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="0" cy="8" r="3" fill={C.ink} />
        </g>
      </Placed>
    </svg>
    </Live>
  );
}

/**
 * Scena (Inclusione, cerchio bianco): una panchina con un posto libero. Soggetto: chi arriva con una cassetta e trova
 * il posto. Sulla panchina si parla: una legge, il ragazzo si gira verso di lei, l'ultima guarda chi arriva.
 * Vita: intro (il prato sale, la panchina spunta, arrivano le persone); poi chi arriva fa il suo passo lento, chi legge
 * si dondola sul libro, il ragazzo si gira a parlare, una farfalla gira sul prato.
 */
export function InclusionArt() {
  const G = 304;
  const seat = G - 40;
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 480 480" className={svgCls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect x="-20" y={G} width="520" height="220" fill={C.green} className="lv-rise" style={lk(0, 0.1)} />
      <g className="lv-pop" style={lk(0, 0.6)}>
      {/* the bench: splayed iron legs, a wooden seat with its slats */}
      <path d={`M100 ${seat + 6} L92 ${G} M100 ${seat + 6} L108 ${G} M324 ${seat + 6} L316 ${G} M324 ${seat + 6} L332 ${G}`} stroke={C.ink} strokeWidth="4.4" strokeLinecap="round" />
      <rect x="80" y={seat} width="264" height="10" rx="3" fill={C.orange} />
      <path d={`M86 ${seat + 5} H338`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.5" />
      </g>
      <g className="lv-pop" style={lk(0, 1.1)}><Person x={124} y={G} s={1} color="orange" pose="sit" item="book" itemColor="green" hair="bun" className="lv-rock" style={vars({ "--t": 3.2, "--d": 0.4 })} /></g>
      <g className="lv-pop" style={lk(1, 1.1)}><Person x={208} y={G} s={1.4} kid color="green" pose="sit" flip hair="curly" className="lv-rock" style={vars({ "--t": 1.9, "--d": 1.3 })} /></g>
      <g className="lv-pop" style={lk(2, 1.1)}><Person x={252} y={G} s={1} color="orange" pose="sit" hair="long" /></g>
      <g className="lv-pop" style={lk(3, 1.1)}><Person x={404} y={G} s={1.05} color="green" pose="carry" itemColor="orange" flip hair="short" className="bob" style={vars({ "--d": 2 })} /></g>
      <Butterfly x={410} y={380} x1={-70} y1={-18} t={6.5} d={1} />
    </svg>
    </Live>
  );
}

/**
 * Scena (Sostenibilità, pannello arancio): un albero di arance e chi coglie. Soggetto: l'albero (oscilla appena);
 * accanto una persona che allunga la mano nella chioma e stacca un frutto, e una cassetta già piena a terra.
 * Vita: intro (terra, sole che sorge, l'albero spunta dal piede, arriva chi coglie, la cassetta); poi l'albero oscilla,
 * l'arancia colta cade nella cassetta e ne spunta un'altra nella mano, passa uno stormo.
 */
export function SustainArt() {
  const picked = (
    <g>
      {/* the orange in the hand: every few seconds it is picked and dropped into the crate */}
      <g className="lv-drop" style={vars({ "--dx": "-64px", "--dy": "96px", "--d": 2.4 })}>
        <path d="M-11 -9 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0" fill={C.orange} />
        <path d="M1 -20 l2 -5" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      </g>
    </g>
  );
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 480 480" className={svgCls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <g className="lv-sun" style={lk(0, 0.3)}><Sun cx={384} cy={104} r={38} color="yellow" /></g>
      <Birds x={40} y={190} x0={-120} x1={560} t={26} d={4} s={0.75} />
      <rect x="-20" y="380" width="520" height="120" fill={C.white} className="lv-rise" style={lk(0, 0.1)} />
      <g transform="translate(196 404)"><g className="lv-pop" style={lk(0, 0.85)}><OrangeTree s={2.6} className="sway" style={vars({ "--d": 0.4 })} /></g></g>
      <g className="lv-pop" style={lk(0, 1.6)}><Person x={324} y={412} s={1.3} color="yellow" pose="reach" flip hair="cap" build="regular" hold={picked} /></g>
      <Crate x={352} y={402} w={64} h={34} fruit="orange" box="green" className="lv-pop" style={lk(2, 1.2)} />
    </svg>
    </Live>
  );
}

/**
 * Scena (Cooperazione, pillola verde): mattoni passati di mano in mano fino a un muro che cresce. Soggetto: la catena.
 * Il primo si china sulla pila e ne prende uno, due li portano davanti a sé con due mani, l'ultimo posa il mattone nel
 * posto libero in cima al muro.
 * Vita: intro (il terreno si apre, il muro cresce fila dopo fila, arrivano le persone); poi chi si china solleva il
 * mattone, i due della catena fanno il passo, chi posa il mattone lo accompagna su e giù.
 */
export function CoopArt() {
  const G = 296, s = 1.25;
  const brick = (c: Fill) => (
    <g>
      <rect x="-19" y="-58" width="38" height="16" rx="3" fill={C[c]} />
      <path d="M0 -55 V-45" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.5" />
    </g>
  );
  const ROWS = 5;
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 900 330" className={svgCls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
      <rect x="-900" y={G} width="2400" height="40" fill={C.white} className="lv-reveal-x" style={lk(0, 0.1)} />
      {/* the pile the chain starts from, and the one bending over it to lift the top brick */}
      <Brick x={118} y={G - 18} w={36} h={18} color="orange" />
      <Brick x={156} y={G - 18} w={36} h={18} color="yellow" />
      <g className="lv-pop" style={lk(0, 1.6)}><Person x={232} y={G} s={s} color="white" pose="bend" flip hair="bun" hold={<rect x="-15" y="-9" width="30" height="14" rx="3" fill={C.orange} />} className="lv-rock" style={vars({ "--t": 1.4 })} /></g>
      <g className="lv-pop" style={lk(1, 1.6)}><Holding x={348} y={G} s={s} color="yellow" pose="carry" hair="short" className="lv-step" style={vars({ "--d": 0.2 })}>{brick("white")}</Holding></g>
      <g className="lv-pop" style={lk(2, 1.6)}><Holding x={468} y={G} s={s} color="orange" pose="carry" hair="curly" className="lv-step" style={vars({ "--d": 0.5 })}>{brick("yellow")}</Holding></g>
      <g className="lv-pop" style={lk(3, 1.6)}><Holding x={620} y={G} s={s} color="white" pose="place" grip="right" hair="cap" className="bob" style={vars({ "--d": 1 })}>
        <rect x="-14.4" y="-4.8" width="28.8" height="14.4" rx="3" fill={C.orange} />
      </Holding></g>
      {/* the wall, in running bond; one place still free at the top, where the next brick goes */}
      {Array.from({ length: ROWS }, (_, r) => Array.from({ length: 5 }, (_, k) => {
        if (r === ROWS - 1 && k === 0) return null;
        const x = 648 + k * 38 + (r % 2) * 19;
        return <Brick key={`${r}-${k}`} x={x} y={G - 19 * (r + 1)} w={36} h={18} color={(["orange", "yellow", "white"] as const)[(r * 2 + k) % 3]} className="lv-pop" style={lk(r * 2 + k * 0.4, 0.4, { "--lv-step": "0.1s" })} />;
      }))}
    </svg>
    </Live>
  );
}
