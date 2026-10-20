import "./welcome.css";
import { Live } from "../../kit/Live";
import { Stage, Layer } from "../../kit/Stage";
import { INK, Person, Placed, C } from "../parts";
import { Cottage, Enter, Ground, LayerSvg, Puffs, lk, vars } from "../chi-siamo/parts";

/* viewBox 2:1, the page gives the box the same ratio at every width: nothing is cropped. */
const VB = "0 140 1200 600";
const G = 700;

/** Evening sky: the crescent moon comes up, three stars appear one by one. */
function Night() {
  return (
    <LayerSvg viewBox={VB}>
      <g className="lv-sun" style={lk(0, 0.3)}>
        <circle cx="1010" cy="270" r="44" fill={C.yellow} />
        <circle cx="1030" cy="256" r="38" fill={C.green} />
      </g>
      {[[860, 250], [1110, 380], [180, 300]].map(([x, y], i) => <circle key={x} cx={x} cy={y} r="4.5" fill={C.yellow} className="lv-pop" style={lk(i * 3, 0.8)} />)}
    </LayerSvg>
  );
}

/** The house of the cooperative at dusk: windows, then the door, light up one at a time (once). */
function Home() {
  return (
    <LayerSvg viewBox={VB} title="Una casa di sera: le luci si accendono una finestra alla volta, qualcuno arriva con la valigia insieme a un bambino, sulla porta c'è chi saluta">
      <g className="lv-rise" style={lk(0, 0.1)}><Ground y={G} from={-2400} to={3600} /></g>
      <Cottage x={610} y={G} s={2.6} wall="white" roof="orange" door="orange" shutter="orange" pane="green" lit="yellow" lights lightClass="lv-cs-light" className="lv-rise" style={lk(2, 0.3, { "--lv-y": "90px", "--wl-start": "1.5s" })} />
      <Puffs x={726} y={272} s={2.2} />
    </LayerSvg>
  );
}

/** A street lamp: iron-grey post painted white, a curled arm, a lantern with its cap and a lit glass. Ground point = foot. */
function Lamp({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <Placed x={x} y={y} s={s}>
      <rect x="-9" y="-16" width="18" height="16" rx="3" fill={C.white} />
      <rect x="-4.5" y="-190" width="9" height="180" rx="4" fill={C.white} />
      <path d="M0 -184 C0 -204 12 -210 26 -206" fill="none" stroke={C.white} strokeWidth="7" strokeLinecap="round" />
      {/* the lantern hangs from the arm and swings a little in the evening air */}
      <g className="lv-swing" style={vars({ "--t": 3.4, "--d": 0.5 })}>
        <path d="M26 -206 V-200" stroke={C.white} strokeWidth="4" strokeLinecap="round" />
        <path d="M14 -199 H38 L34 -176 H18 Z" fill={C.yellow} stroke={C.yellow} strokeWidth="3" strokeLinejoin="round" />
        <path d="M26 -198 V-177" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.5" />
        <path d="M10 -199 Q26 -212 42 -199 Z" fill={C.white} stroke={C.white} strokeWidth="3" strokeLinejoin="round" />
        <rect x="16" y="-177" width="20" height="5" rx="2" fill={C.white} />
      </g>
    </Placed>
  );
}

/**
 * In front: an adult with a suitcase and a child arrive from the left, walk to the door and go in (then the next ones
 * come); a street lamp with its lantern swinging; someone at the door waving them in.
 */
function Arrivals() {
  return (
    <LayerSvg viewBox={VB}>
      <Enter x={270} y={G} x0={-430} x1={336} t={19} d={2.2}>
        <Person x={-90} s={1.3} kid color="white" pose="walk" hair="curly" />
        <Person s={1.15} color="yellow" pose="walk" item="suitcase" itemColor="orange" hair="long" />
      </Enter>
      <g className="lv-pop" style={lk(0, 1.6)}><Lamp x={960} y={G} /></g>
      <g className="lv-pop" style={lk(1, 1.6)}><Person x={676} y={G} s={1} color="orange" pose="wave" flip hair="short" className="bob" style={vars({ "--d": 0.6 })} /></g>
    </LayerSvg>
  );
}

/**
 * Scena viva: la casa si accende di sera (soggetto: la casa). Intro: la luna sale, le stelle si accendono, il terreno e
 * la casa salgono, finestre e porta si accendono una alla volta. Vita: adulto e bambino arrivano con la valigia ed
 * entrano in casa, uno dopo l'altro; fumo dal comignolo; la lanterna oscilla; chi è sulla porta saluta.
 */
export function WelcomeHeroScene() {
  return (
    <Live className="scene-live">
      <Stage className="scene-fill">
        <div className="relative h-full w-full [transform-style:preserve-3d]">
          <Layer z={-24}><div className="depth absolute inset-0" style={vars({ "--depth": 0.5 })}><Night /></div></Layer>
          <Layer z={0}><Home /></Layer>
          <Layer z={18}><Arrivals /></Layer>
        </div>
      </Stage>
    </Live>
  );
}

/** A paper bag of bread held by its folded top: grip at 0,0 (white with a fine ink contour), a loaf sticking out. */
const Bread = (
  <g>
    <path d="M-4 -2 C-8 -12 -4 -20 2 -22 C6 -18 7 -10 5 -2 Z" fill={C.yellow} />
    <path d="M-1 -16 l3 -2 M-2 -10 l3 -2" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
    <path d="M-8 -3 H10 L12 26 C12 28 11 29 9 29 H-7 C-9 29 -10 28 -10 26 Z" fill={C.white} stroke={C.ink} strokeWidth={INK.fine} strokeLinejoin="round" />
    <path d="M-8 3 H10" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
  </g>
);

/**
 * Scena (sera, pannello verde): la casa con le luci che si accendono (soggetto). Intro: la luna sale, le stelle si
 * accendono, terreno e casa salgono, poi finestre, lunetta e porta si accendono una alla volta. Vita: chi rientra con il
 * pane arriva da destra ed entra in casa, fumo dal comignolo.
 */
export function NightHouseArt() {
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 640 520" className="block h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
      <g className="lv-sun" style={lk(0, 0.3)}>
        <circle cx="530" cy="190" r="40" fill={C.yellow} />
        <circle cx="547" cy="177" r="36" fill={C.green} />
      </g>
      {[[150, 200], [300, 90], [430, 150]].map(([x, y], i) => <circle key={x} cx={x} cy={y} r="4" fill={C.yellow} className="lv-pop" style={lk(i * 3, 0.8)} />)}
      <rect x="-100" y="456" width="900" height="120" fill={C.white} className="lv-rise" style={lk(0, 0.1)} />
      <Cottage x={290} y={456} s={1.9} wall="white" roof="orange" door="orange" shutter="orange" pane="green" lit="yellow" lights lightClass="lv-cs-light" className="lv-rise" style={lk(2, 0.3, { "--lv-y": "70px", "--wl-start": "1.3s" })} />
      <Puffs x={375} y={142} s={1.5} />
      <Enter x={540} y={456} x0={150} x1={-250} t={14} d={2.6}>
        <Person s={1} color="yellow" pose="walk" flip hair="cap" hold={Bread} />
      </Enter>
    </svg>
    </Live>
  );
}
