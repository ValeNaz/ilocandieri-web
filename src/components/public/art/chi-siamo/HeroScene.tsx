import { Live } from "../../kit/Live";
import { Stage, Layer } from "../../kit/Stage";
import { Cloud, INK, Person, Placed, Sun, C } from "../parts";
import { Birds, Brick, Cottage, Ground, HandsOver, Holding, LayerSvg, Puffs, lk, vars } from "./parts";

/* viewBox 2:1, the page gives the box the same ratio at every width: nothing is ever cropped. */
const VB = "0 180 1200 600";
const G = 700; // ground line

/** Sky: the sun comes up (its rays turn), a cloud drifts, a flight of birds crosses. */
function Sky() {
  return (
    <LayerSvg viewBox={VB}>
      <g className="lv-sun" style={lk(0, 0.35)}><Sun cx={1060} cy={300} r={44} rays={10} className="spin-slow" /></g>
      {/* the flight leaves from behind the cloud and stays inside the scene: the sky left of the box belongs to the text */}
      <Birds x={200} y={318} x0={0} x1={1000} t={30} d={2.5} s={0.9} />
      <Cloud x={150} y={330} s={1} className="lv-cloud" style={vars({ "--d": 1 })} />
    </LayerSvg>
  );
}

/** The house on its ground: it rises once when the scene comes into view, whole; smoke from the chimney. */
function House() {
  return (
    <LayerSvg viewBox={VB} title="Persone costruiscono insieme una casa: due portano una trave, una sale sulla scala appoggiata alla gronda, una porta un mattone alla pila">
      <g className="lv-rise" style={lk(0, 0.1)}><Ground y={G} from={-2400} to={3600} /></g>
      <Cottage x={600} y={G} s={2.45} wall="white" roof="orange" door="green" shutter="yellow" pane="green" className="lv-rise" style={lk(2, 0.3, { "--lv-y": "90px" })} />
      <Puffs x={709} y={296} s={2.2} />
    </LayerSvg>
  );
}

/** A wooden ladder in person units: foot at 0,0, rails at x -16 / 24, a rung every 20 units. */
function Ladder({ h }: { h: number }) {
  const rungs = Array.from({ length: Math.floor((h - 6) / 20) }, (_, i) => -20 * (i + 1));
  return (
    <g>
      <path d={`M-16 0 V${-h} M24 0 V${-h}`} stroke={C.ink} strokeWidth="3.6" strokeLinecap="round" />
      <path d={rungs.map((y) => `M-16 ${y} H24`).join("")} stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" />
    </g>
  );
}

/**
 * The builders, each one outside the house outline so nobody is lost against the white wall.
 * Left: two carry one beam towards the house (protagonist, slow bob), all four hands closed over the beam.
 * Right: a ladder leaning on the eave and someone climbing it (feet on the rungs, hands on a rung), a pile of bricks,
 * someone bringing one more (still).
 */
function Builders() {
  const s = 1.15;
  const by = G - 50 * s; // carry hands height
  return (
    <LayerSvg viewBox={VB}>
      <g className="lv-pop" style={lk(0, 1.5)}><g className="lv-move lv-alt" style={vars({ "--x0": "-18px", "--x1": "26px", "--t": 6.5, "--d": 1 })}><g className="lv-step">
        <Person x={150} y={G} s={s} color="yellow" pose="carry" item="none" build="regular" hair="long" />
        <Person x={300} y={G} s={s} color="white" pose="carry" item="none" build="regular" hair="cap" />
        {/* the beam: a squared timber with its grain */}
        <rect x="108" y={by - 8} width="250" height="15" rx="3" fill={C.orange} />
        <path d={`M128 ${by - 1} h46 M214 ${by + 2} h30 M282 ${by - 2} h52`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.6" />
        <HandsOver x={150} y={G} s={s} pose="carry" color="yellow" />
        <HandsOver x={300} y={G} s={s} pose="carry" color="white" />
      </g></g></g>
      {/* ladder + the person on it: one object, leaning on the eave; near foot on a rung, hands on a rung */}
      <g className="lv-pop" style={lk(1, 1.5)}><Placed x={852} y={G} s={s}>
        <g transform="rotate(-8)">
          <Ladder h={198} />
          <Person x={0} y={-40} color="orange" pose="climb" build="regular" hair="short" />
        </g>
      </Placed></g>
      <Brick x={922} y={G - 18} w={36} h={18} color="orange" className="lv-pop" style={lk(1, 1.2)} />
      <Brick x={960} y={G - 18} w={36} h={18} color="yellow" className="lv-pop" style={lk(2, 1.2)} />
      <Brick x={998} y={G - 18} w={36} h={18} color="orange" className="lv-pop" style={lk(3, 1.2)} />
      <Brick x={941} y={G - 36} w={36} h={18} color="white" className="lv-pop" style={lk(4, 1.2)} />
      <Brick x={979} y={G - 36} w={36} h={18} color="orange" className="lv-pop" style={lk(5, 1.2)} />
      <Holding x={1104} y={G} s={1.05} color="yellow" pose="carry" flip hair="bun" className="lv-pop" style={lk(3, 1.5)}>
        <rect x="-19" y="-58" width="38" height="16" rx="3" fill={C.orange} />
        <path d="M0 -55 V-45" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.5" />
      </Holding>
    </LayerSvg>
  );
}

/**
 * Scena viva: la casa della cooperativa costruita da persone (soggetto: la casa).
 * Intro (una volta, quando entra in vista): il terreno sale, la casa si alza intera, il sole sorge, i mattoni spuntano,
 * arrivano le persone. Vita: i due con la trave fanno avanti e indietro per metterla in posa, fumo dal comignolo,
 * nuvola, uno stormo che attraversa il cielo, i raggi del sole girano.
 */
export function HeroScene() {
  return (
    <Live className="scene-live">
      <Stage className="scene-fill">
        <div className="relative h-full w-full [transform-style:preserve-3d]">
          <Layer z={-24}><div className="depth absolute inset-0" style={vars({ "--depth": 0.5 })}><Sky /></div></Layer>
          <Layer z={0}><House /></Layer>
          <Layer z={18}><Builders /></Layer>
        </div>
      </Stage>
    </Live>
  );
}
