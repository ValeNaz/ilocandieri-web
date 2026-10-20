/**
 * Scenes for the GENERIC block views (blocks/Hero.tsx, blocks/Sections.tsx): what a block shows when no page has a
 * dedicated view for it (for example a block the admin adds later). Illustration language v4: one subject, people only
 * through <Person> doing the action with hands on the thing, no outer contours on masses, every object moving whole,
 * at most two animated objects (vignettes: one), no logo redraw.
 * `room` is the colour of the field the scene sits on: every colour below is chosen against it and against the ground.
 */
import type { CSSProperties } from "react";
import { Live } from "@/components/public/kit/Live";
import { C, handAt, INK, OrangeTree, Person, Placed, type Fill } from "../parts";
import { Bench, Birds, Crate, Ground, House, Intro, Jar, LiveLayer, Scene, Smoke, Sunny, Table, ink, other } from "./parts";
import "./liste-live.css";

export type ArtRoom = "white" | "orange" | "yellow" | "green";
const v = (o: Record<string, string | number>) => o as CSSProperties;
/** An orange that drops from the tree at (x,y) into the crate at (x+dx, y+dy), every 6.5 s (kit .lv-drop). */
const Drop = ({ x, y, dx, dy, r, d }: { x: number; y: number; dx: number; dy: number; r: number; d: number }) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
    <g className="lv-drop" style={v({ "--dx": `${dx.toFixed(1)}px`, "--dy": `${dy.toFixed(1)}px`, "--d": d })}>
      <circle r={r} fill={C.orange} />
      <path d={`M${r * 0.1} ${-r * 0.9}l${r * 0.25} ${-r * 0.45}`} {...ink(1.8)} />
    </g>
  </g>
);
/**
 * Colours per room. ground: green, or yellow on a green room. person: orange, or yellow on an orange room (contrasts with
 * the room above the ground and with the ground under the feet). wall: white unless the room is white. crown: green,
 * white on a green room. other: a second figure / object colour.
 */
const pal = (room: ArtRoom) => {
  const ground: Fill = room === "green" ? "yellow" : "green";
  const person: Fill = room === "orange" ? "yellow" : "orange";
  const other: Fill = room === "white" ? "yellow" : "white";
  const wall: Fill = room === "white" ? "yellow" : "white";
  const roof: Fill = room === "orange" ? "yellow" : "orange";
  const crown: Fill = room === "green" ? "white" : "green";
  const second: Fill = room === "green" ? "orange" : room === "white" ? "green" : "white";
  return { ground, person, other, wall, roof, crown, second };
};

/* ------------------------------------------------------------------ opening of a generic page */
// Scena: arrivare a casa. SOGGETTO: una persona che porta una cassetta di arance verso la porta di una casa, dove
// qualcuno sul gradino la accoglie; un arancio accanto alla casa.
// Intro: sole, la casa e l'arancio crescono dal suolo, la cassetta, poi le persone. Vita: chi accoglie saluta (dondola),
// chi porta la cassetta cammina sul posto, un'arancia cade dall'albero nella cassetta, il comignolo fuma, la chioma si
// muove, due uccelli passano.
export function GatherScene({ room = "yellow" }: { room?: ArtRoom }) {
  const p = pal(room);
  // who welcomes at the door: never the colour of the wall, the door or the room
  const host: Fill = room === "orange" || room === "green" ? "yellow" : "orange";
  const VB = "0 0 800 560";
  const G = 482;
  return (
    <Live className="absolute inset-0">
      <LiveLayer depth={0.5} k={0}>
        <Scene viewBox={VB} slice className="sc">
          <Intro kind="sun" base={0.4}><Sunny cx={660} cy={106} r={34} color={room === "white" || room === "yellow" ? "orange" : "yellow"} /></Intro>
          <Birds id={`ga-sky-${room}`} x={160} y={120} x0={-240} x1={600} t={27} d={2.5} />
        </Scene>
      </LiveLayer>
      <LiveLayer depth={0.2} k={1}>
        <Scene viewBox={VB} slice className="sc">
          <Intro k={1} base={0.85}><OrangeTree x={604} y={G} s={1.7} crown={p.crown} fruit="orange" className="sway" style={v({ "--d": 0.6 })} /></Intro>
          <Intro k={0} base={0.85}><House x={392} y={G} s={1.8} wall={p.wall} roof={p.roof} door="green" glass={host === "yellow" ? "orange" : undefined} /></Intro>
          <Smoke x={442} y={252} s={1.3} color={room === "white" ? "green" : "white"} />
          {room !== "orange" && <Drop x={604 - 27 * 1.7} y={G - 52 * 1.7} dx={524 - (604 - 27 * 1.7)} dy={G - 34 - (G - 52 * 1.7)} r={5.6 * 1.7} d={2.6} />}
        </Scene>
      </LiveLayer>
      <LiveLayer depth={-0.12} k={2}>
        <Scene viewBox={VB} slice className="sc">
          <Ground y={G - 4} color={p.ground} />
          <Intro k={0} base={1.3}><Crate x={524} y={G} s={1.15} color={room === "orange" ? "white" : "orange"} fruit={room === "orange" || room === "green"} fruitColor="yellow" /></Intro>
          <Intro kind="in" k={0} base={1.6}><Person x={378} y={G - 7} s={1.15} color={host} pose="wave" hair="bun" outfit="dress" flip className="lv-rock" style={v({ "--t": 1.6, "--d": 0.9 })} /></Intro>
          <Intro kind="in" k={1} base={1.6}><Person x={226} y={G} s={1.22} color={room === "green" ? "orange" : "green"} pose="carry" itemColor={p.other} hair="cap" className="lv-step" style={v({ "--d": 0.2 })} /></Intro>
        </Scene>
      </LiveLayer>
    </Live>
  );
}

/* ------------------------------------------------------------------ small vignettes for sections and places */
export type VignetteKind = "garden" | "field" | "sport" | "home" | "table";
/** Pick a vignette from the words of a title (falls back to a rotation by index). */
export function vignetteFor(title: string, i: number): VignetteKind {
  if (/arance|agrum|giardin|frutt|alber/i.test(title)) return "garden";
  if (/sport|campo|calcio|pallon|gioc/i.test(title)) return "sport";
  if (/agric|terr|semin|grano|uliv|orto|coltiv|abes/i.test(title)) return "field";
  if (/accogl|casa|ospit|abit|bene|confisc/i.test(title)) return "home";
  if (/cucin|pranzo|cena|tavol|comunit|insieme|incontr/i.test(title)) return "table";
  return (["home", "garden", "field", "table", "sport"] as const)[i % 5]!;
}

/*
 * Scena (per tipo). Intro breve (il terreno, la cosa del luogo che cresce, la persona che arriva), poi una o due
 * piccole storie:
 * garden = una persona coglie un'arancia, la mano sul frutto; un'altra arancia cade nella cassetta, la chioma si muove;
 * field = una persona vanga tra le file dell'orto (dondola col colpo di vanga), le piantine si muovono al vento;
 * sport = un calcio al pallone, che vola verso la porta e torna, girando;
 * home = una persona con la valigia arriva alla casa ed entra, il comignolo fuma;
 * table = due persone sedute alla tavola apparecchiata che si parlano (dondolano, ognuna col suo ritmo).
 */
export function Vignette({ kind, room = "white", title }: { kind: VignetteKind; room?: ArtRoom; title?: string }) {
  const p = pal(room);
  const G = 214;
  // garden: the tree is scaled so that one of its fruit (-30,-74) sits exactly in the picker's raised hand
  const [rx, ry] = handAt("reach", "front");
  const ts = (-ry * 0.82) / 74, tx = 214;
  const pickerX = tx - 30 * ts - rx * 0.82;
  const leaf: Fill = room === "green" ? "white" : "green";
  // a colour that differs from the room (and is not white-on-yellow / yellow-on-white) and from `not`
  const weak: Fill[] = room === "yellow" ? ["white"] : room === "white" ? ["yellow"] : [];
  const pk = (...not: Fill[]) => other(room, ...weak, ...not);
  const crate: Fill = room === "orange" ? "white" : "orange";
  const crateFruit = room === "orange" || room === "green";
  const top = pk(p.ground);
  const jar = pk(top);
  const plates: Fill = room === "white" ? jar : "white";
  const ball: Fill = room === "white" ? "orange" : "white";
  const digger: Fill = room === "white" ? "green" : p.person;
  const smoke: Fill = p.wall === "white" ? (room === "green" ? "white" : "green") : "green";
  return (
    <Live className="absolute inset-0">
      <Scene viewBox="0 0 400 260" slice className="sc" title={title}>
        <Ground x={24} y={G - 3} w={352} h={34} color={p.ground} />
        {kind === "garden" && (
          <>
            <Intro base={0.3}><OrangeTree x={tx} y={G} s={ts} crown={p.crown} fruit="orange" className="sway" style={v({ "--d": 0.4 })} /></Intro>
            <Intro k={1} base={0.5}><Crate x={300} y={G} s={0.8} color={crate} fruit={crateFruit} fruitColor="yellow" /></Intro>
            {room !== "orange" && <Drop x={tx + 20 * ts} y={G - 50 * ts} dx={300 - (tx + 20 * ts)} dy={G - 24 - (G - 50 * ts)} r={5.6 * ts} d={1.6} />}
            <Intro kind="in" base={0.9}><Person x={pickerX} y={G} s={0.82} color={p.person} pose="reach" hair="long" /></Intro>
          </>
        )}
        {kind === "field" && (
          <>
            {/* the vegetable rows: seedlings with two leaves each, standing on the soil */}
            {[[84, 1], [112, 1.15], [244, 1.1], [276, 1.2], [308, 1.05], [340, 1.15]].map(([cx, k], i) => (
              <g key={cx} transform={`translate(${cx} ${G}) scale(${k})`}>
                <Intro k={i} base={0.3}>
                  <path className="sway-s" style={v({ "--d": i * 0.7 })} d="M0 0 C-2 -6 -10 -8 -13 -16 C-6 -17 -1 -12 0 -4 C1 -13 6 -20 13 -20 C11 -11 4 -6 0 0 Z" fill={C[leaf]} />
                </Intro>
              </g>
            ))}
            <Intro kind="in" base={0.9}><Person x={186} y={G} s={0.82} color={digger} pose="dig" itemColor={pk(digger)} hair="cap" className="lv-rock" style={v({ "--t": 1.5 })} /></Intro>
          </>
        )}
        {kind === "sport" && (
          <>
            {/* goal: iron frame and net */}
            <Intro base={0.3}>
              <Placed x={300} y={G}>
                <path d="M-38 -54 H38 M-34 -42 H34 M-34 -26 H34 M-34 -12 H34 M-22 -58 V-2 M0 -58 V-2 M22 -58 V-2" {...ink(1.4)} />
                <path d="M-46 0 V-62 Q-46 -66 -42 -66 H42 Q46 -66 46 -62 V0" {...ink(5)} />
              </Placed>
            </Intro>
            <Intro kind="in" base={0.7}><Person x={118} y={G} s={0.82} color={p.person} pose="kick" hair="short" /></Intro>
            {/* the ball flies from the kicker's foot into the net and back, turning */}
            <g transform={`translate(170 ${G - 10})`}>
              <g className="lv-arc-x" style={v({ "--dx": "112px", "--t": 1.8, "--d": 1 })}>
                <g className="lv-arc-y" style={v({ "--dy": "-14px", "--h": "46px", "--t": 1.8, "--d": 1 })}>
                  <g className="lv-spin" style={v({ "--t": 0.9 })}>
                    <circle r="10" fill={C[ball]} {...(ball === "white" ? { stroke: C.ink, strokeWidth: 1.4 } : {})} />
                    <path d="M0 -4.2 L4 -1.3 L2.5 3.4 H-2.5 L-4 -1.3 Z" fill={C.ink} />
                  </g>
                </g>
              </g>
            </g>
          </>
        )}
        {kind === "home" && (
          <>
            <Intro base={0.3}><House x={250} y={G} s={1.05} wall={p.wall} roof={p.roof} door="green" /></Intro>
            <Smoke x={279} y={G - 128} s={0.75} color={smoke} />
            {/* the traveller walks to the door and goes in; rest = on the way */}
            <g transform={`translate(120 ${G})`}>
              <g className="lv-ls-walk-in" style={v({ "--x0": "-110px", "--x1": "130px", "--d": 1 })}>
                <g className="lv-step"><Person s={0.82} color={p.person} pose="walk" item="suitcase" itemColor={pk(p.person)} hair="bun" /></g>
              </g>
            </g>
          </>
        )}
        {kind === "table" && (
          <>
            <Intro base={0.3}>
              <Table x={200} y={G} w={150} h={44} top={top} />
              {[166, 236].map((cx) => <ellipse key={cx} cx={cx} cy={G - 46} rx="12" ry="2.6" fill={C[plates]} {...(plates === "white" ? { stroke: C.ink, strokeWidth: INK.fine * 0.7 } : {})} />)}
              <Jar x={201} y={G - 44} s={0.62} color={jar} lid={other(jar, top, room)} />
            </Intro>
            <Intro kind="in" k={0} base={0.7}>
              <Bench x={108} y={G} w={44} h={33} fill={pk(p.person)} />
              <Person x={110} y={G} s={0.82} color={p.person} pose="sit" hair="curly" className="lv-rock" style={v({ "--t": 2.2, "--d": 0.3 })} />
            </Intro>
            <Intro kind="in" k={1} base={0.7}>
              <Bench x={292} y={G} w={44} h={33} fill={pk(p.second)} />
              <Person x={290} y={G} s={0.82} color={p.second} pose="sit" hair="long" flip className="lv-rock" style={v({ "--t": 2.9, "--d": 1.4 })} />
            </Intro>
          </>
        )}
      </Scene>
    </Live>
  );
}
