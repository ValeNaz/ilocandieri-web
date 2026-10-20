import { Cloud, INK, OrangeTree, Person, Sun, C, type Fill } from "../parts";
import { Live } from "../../kit/Live";
import { Birds, Cottage, Enter, Volley, lk, vars } from "./parts";

const svgCls = "block h-full w-full";

/** A lettuce: a rosette of rounded leaves with a fine midrib. Ground point = bottom centre, about 20 units tall. */
const lettuce = (x: number, y: number, k = 1) =>
  `M${x - 13 * k} ${y} C${x - 16 * k} ${y - 10 * k} ${x - 8 * k} ${y - 16 * k} ${x - 3 * k} ${y - 9 * k} C${x - 4 * k} ${y - 20 * k} ${x + 6 * k} ${y - 22 * k} ${x + 6 * k} ${y - 11 * k} C${x + 12 * k} ${y - 17 * k} ${x + 18 * k} ${y - 8 * k} ${x + 13 * k} ${y} Z`;

/**
 * Scena (Giardino delle Arance, pannello giallo): il casolare in fondo, l'agrumeto a destra, i solchi dell'orto davanti.
 * Soggetto: chi porta via dall'orto una cassetta piena (bob lento); più in là qualcuno si china a raccogliere un cespo.
 * Vita: intro (terra, sole, casolare e alberi spuntano, i solchi si aprono, arrivano le persone); poi chi porta la
 * cassetta risale dall'orto ed entra nel casolare, chi raccoglie si china e si rialza, l'albero grande oscilla, passa
 * uno stormo.
 */
export function GardenArt() {
  const G = 404;
  const rows = [440, 480];
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 640 520" className={svgCls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
      <g className="lv-sun" style={lk(0, 0.3)}><Sun cx={548} cy={100} r={38} rays={10} color="orange" className="spin-slow" /></g>
      <Birds x={60} y={160} x0={-160} x1={720} t={30} d={3} s={0.8} />
      <rect x="-20" y={G} width="680" height="140" fill={C.white} className="lv-rise" style={lk(0, 0.1)} />
      <Cottage x={160} y={G} s={1.15} wall="white" roof="orange" door="green" shutter="green" pane="orange" className="lv-pop" style={lk(0, 0.6)} />
      <g transform={`translate(530 ${G})`}><g className="lv-pop" style={lk(2, 0.85)}><OrangeTree s={1.25} /></g></g>
      <g transform={`translate(410 ${G})`}><g className="lv-pop" style={lk(1, 0.85)}><OrangeTree s={1.5} className="sway" style={vars({ "--d": 0.3 })} /></g></g>
      {/* furrows of the vegetable garden: earth ridges, lettuces in a row, a gap where the path crosses */}
      {rows.map((y, r) => {
        const xs = Array.from({ length: 8 }, (_, k) => 30 + k * 82 + r * 36).filter((x) => x < 262 || x > 384);
        return (
          <g key={y} className="lv-reveal-x" style={lk(r, 1)}>
            <path d={`M-20 ${y + 12 + r * 3} C120 ${y - 2} 220 ${y - 2} 270 ${y + 4} M376 ${y + 4} C440 ${y - 2} 560 ${y - 2} 660 ${y + 12 + r * 3}`} stroke={C.orange} strokeWidth={10 + r * 3} strokeLinecap="round" fill="none" />
            <path d={xs.map((x) => lettuce(x, y + 2, 1 + r * 0.2)).join("")} fill={C.green} />
            <path d={xs.map((x) => `M${x} ${y} l2 ${-9 - r * 2}`).join("")} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.6" />
          </g>
        );
      })}
      <g className="lv-pop" style={lk(0, 1.6)}><Person x={548} y={442} s={0.95} color="orange" pose="bend" hair="long" className="lv-rock" style={vars({ "--t": 1.8, "--d": 0.7 })} /></g>
      <Enter x={318} y={452} x0={40} y0={120} x1={-158} y1={-48} s1={0.72} t={15} d={1.4}>
        <Person s={1.05} color="green" pose="carry" itemColor="orange" hair="curly" />
      </Enter>
    </svg>
    </Live>
  );
}

/**
 * Scena (Campo Polivalente): la rete da pallavolo vista di fronte, la palla in aria sopra la rete (soggetto, l'unica cosa
 * che si muove). Al di là della rete chi salta a murare (si vede tra le maglie), di qua chi ha appena colpito; in
 * basso un adulto e un bambino arrivano a guardare. `ground`, `line`, `p2` e `walker` adattano i colori al pannello.
 * Vita: intro (sole, campo, la rete si tende, arrivano i giocatori); poi la palla vola di qua e di là sopra la rete, chi
 * mura salta, adulto e bambino passano in basso, la nuvola scorre, i raggi girano.
 */
export function FieldArt({ ground = "yellow", line = "white", p2 = "white", walker = "white" }: { ground?: Fill; line?: Fill | "ink"; p2?: Fill; walker?: Fill } = {}) {
  /* Made for a green panel. The blocker stands against the sky (p2, never white: the mesh is white); the hitter and
     the walkers stand on the court, so their colour must not vanish on `ground` (no same colour, no white/yellow pair). */
  const onGround = (c: Fill, alt: Fill): Fill => (c === ground || (c === "white" && ground === "yellow") || (c === "yellow" && ground === "white") ? alt : c);
  const far: Fill = p2 === "white" || p2 === "green" ? "yellow" : p2;
  const adult = onGround(walker, "green");
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 640 520" className={svgCls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
      <g className="lv-sun" style={lk(0, 0.3)}><Sun cx={108} cy={96} r={36} rays={10} color="yellow" className="spin-slow" /></g>
      <Cloud x={470} y={120} s={0.9} className="lv-cloud" style={vars({ "--d": 2 })} />
      <rect x="-20" y="392" width="680" height="150" fill={C[ground]} className="lv-rise" style={lk(0, 0.1)} />
      <path d="M40 496 H600" pathLength={1} stroke={line === "ink" ? C.ink : C[line]} strokeWidth={line === "ink" ? 3 : 6} strokeLinecap="round" className="lv-draw" style={lk(1, 0.5)} />
      {/* beyond the net: the blocker, both arms up, jumping */}
      <g className="lv-pop" style={lk(0, 1.5)}><Person x={372} y={404} s={0.92} color={far} pose="cheer" hair="short" className="lv-hop" style={vars({ "--t": 3.4, "--d": 1.2 })} /></g>
      {/* the net: iron poles on the ground, the white tape on top, the mesh */}
      <g className="lv-reveal" style={lk(0, 0.7)}>
      <g stroke={C.ink} strokeWidth="6" strokeLinecap="round"><line x1="200" y1="212" x2="200" y2="410" /><line x1="440" y1="212" x2="440" y2="410" /></g>
      <g stroke={C.white} strokeWidth="1.8" strokeLinecap="round">
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={224 + i * 24} y1="226" x2={224 + i * 24} y2="304" />)}
        {[252, 278, 304].map((y) => <line key={y} x1="200" y1={y} x2="440" y2={y} />)}
      </g>
      <rect x="196" y="220" width="248" height="10" rx="3" fill={C.white} />
      </g>
      {/* this side: who has just hit the ball */}
      <g className="lv-pop" style={lk(1, 1.5)}><Person x={150} y={466} s={1.3} color={onGround("orange", "green")} pose="reach" hair="cap" /></g>
      {/* an adult and a child cross the bottom of the court, walking to watch */}
      <g className="lv-move" style={vars({ "--x0": "150px", "--x1": "-620px", "--t": 22, "--d": 2 })}>
        <Person x={548} y={502} s={0.92} color={adult} pose="walk" flip hair="long" outfit="dress" className="lv-step" />
        <Person x={486} y={502} s={1.3} kid color={onGround("orange", "white")} pose="walk" flip hair="short" className="lv-step" style={vars({ "--d": 0.2 })} />
      </g>
      {/* the ball, just hit (still frame), flies over the net to the blocker and back */}
      <g transform="translate(180 312)"><g className="lv-pop" style={lk(2, 1.5)}>
        <g className="lv-arc-x" style={vars({ "--dx": "192px", "--t": 1.9, "--d": 2 })}>
          <g className="lv-arc-y" style={vars({ "--h": "150px", "--dy": "-6px", "--t": 1.9, "--d": 2 })}>
            <g className="lv-spin" style={vars({ "--t": 1.3 })}><Volley r={16} /></g>
          </g>
        </g>
      </g></g>
    </svg>
    </Live>
  );
}
