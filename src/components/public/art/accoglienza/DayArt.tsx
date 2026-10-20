import type { ReactNode } from "react";
import { Cloud, INK, Person, Placed, Sun, C, type Fill, type Hair } from "../parts";
import { Live } from "../../kit/Live";
import { Birds, Cottage, Crate, Enter, Holding, Puffs, lk, vars } from "../chi-siamo/parts";

const cls = "block h-full w-full";
const B = (d: number) => vars({ "--d": d });

/** A mug held by its handle: grip at (0,0). White mugs carry a fine ink contour (white is also the background). */
const Mug = ({ color }: { color: Fill }) => (
  <g>
    <path d="M1 -12 C-6 -12 -6 -2 1 -2" fill="none" stroke={color === "white" ? C.ink : C[color]} strokeWidth="2.6" strokeLinecap="round" />
    <rect x="0" y="-16" width="15" height="16" rx="3" fill={C[color]} stroke={color === "white" ? C.ink : "none"} strokeWidth={INK.fine} />
  </g>
);

/** A wooden stool whose seat top is at -40 person units (scaled by `e`, the sitter's real scale). Ground point = bottom centre. */
function Stool({ x, y, e, color = "orange" }: { x: number; y: number; e: number; color?: Fill }) {
  return (
    <Placed x={x} y={y} s={e}>
      <path d="M-11 0 L-8 -36 M11 0 L8 -36 M-9 -14 H9" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
      <rect x="-16" y="-41" width="32" height="7" rx="3" fill={C[color]} />
    </Placed>
  );
}

/** A blackboard hung on the wall, with its wooden frame and a chalk ledge with two sticks. Top-left at 0,0. */
function Board({ w, h, children }: { w: number; h: number; children?: ReactNode }) {
  return (
    <g>
      <rect width={w} height={h} rx="6" fill={C.yellow} />
      <rect x="10" y="10" width={w - 20} height={h - 20} rx="3" fill={C.green} />
      {children}
      <rect x="-6" y={h - 2} width={w + 12} height="10" rx="3" fill={C.green} />
      <path d={`M${w * 0.68} ${h - 5} h12 M${w * 0.74} ${h - 5} h8`} stroke={C.white} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/**
 * Scena (Tavola, pannello giallo): la colazione insieme. Tre persone sedute su una panca sotto la finestra, ognuna con la
 * tazza in mano; da destra arriva chi porta il vassoio (soggetto, bob lento). Nessuno è coperto da un tavolo.
 * Vita: intro (la finestra si apre, il sole sorge nei vetri, il pavimento e la panca, arrivano le persone); poi chi porta
 * il vassoio fa il passo, il bambino parla dondolandosi, la prima si sporge, fuori dalla finestra passano gli uccelli.
 */
export function TableArt() {
  const G = 470;
  const sitters: [number, Fill, Fill, boolean, Hair][] = [[150, "green", "orange", false, "long"], [238, "orange", "green", true, "curly"], [318, "green", "orange", false, "short"]];
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 640 520" className={cls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
      <defs><clipPath id="acc-table-panes"><rect x="160" y="106" width="200" height="160" /></clipPath></defs>
      {/* the window: open shutters, a painted frame, the morning outside (sky, sun, a hill), a sill */}
      <Placed x={150} y={96} className="lv-pop" style={lk(0, 0.2)}>
        <rect x="-40" y="0" width="34" height="180" rx="3" fill={C.green} />
        <rect x="226" y="0" width="34" height="180" rx="3" fill={C.green} />
        <path d="M-34 30 h22 M-34 60 h22 M-34 90 h22 M-34 120 h22 M-34 150 h22 M232 30 h22 M232 60 h22 M232 90 h22 M232 120 h22 M232 150 h22" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.5" />
        <rect width="220" height="180" rx="4" fill={C.green} />
        <rect x="10" y="10" width="94" height="160" rx="2" fill={C.white} />
        <rect x="116" y="10" width="94" height="160" rx="2" fill={C.white} />
        <g className="lv-sun" style={lk(0, 0.8, { "--lv-y": "40px" })}><Sun cx={62} cy={118} r={26} color="orange" /></g>
        <path d="M10 150 C40 130 80 128 104 138 V170 H10 Z M116 140 C150 126 186 128 210 146 V170 H116 Z" fill={C.yellow} />
        <path d="M10 90 H104 M116 90 H210" stroke={C.green} strokeWidth="6" strokeLinecap="round" />
        <rect x="-14" y="176" width="248" height="10" rx="3" fill={C.orange} />
      </Placed>
      <g clipPath="url(#acc-table-panes)"><Birds x={150} y={150} x0={-40} x1={260} t={11} d={3} s={0.45} /></g>
      <rect x="-20" y={G} width="680" height="70" fill={C.green} className="lv-rise" style={lk(0, 0.1)} />
      {/* the bench: a painted plank on iron legs, seat top at sitting height */}
      <g className="lv-pop" style={lk(1, 0.6)}>
        <path d={`M112 ${G} V${G - 32} M380 ${G} V${G - 32}`} stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
        <rect x="96" y={G - 36} width="300" height="10" rx="3" fill={C.orange} />
      </g>
      {sitters.map(([x, c, mug, kid, hair], i) => (
        <g key={x} className="lv-pop" style={lk(i, 1.4)}>
          <Holding x={x} y={G} s={kid ? 1.4 : 0.9} kid={kid} color={c} pose="sit-table" grip="right" hair={hair} className={i === 2 ? undefined : "lv-rock"} style={vars({ "--t": i ? 1.8 : 3.2, "--d": i * 0.9 })}><Mug color={mug} /></Holding>
        </g>
      ))}
      <g className="lv-pop" style={lk(3, 1.4)}><Holding x={520} y={G} s={1.15} color="orange" pose="carry" flip hair="bun" outfit="dress" className="bob" style={B(0.6)}>
        <rect x="-26" y="-53" width="52" height="6" rx="3" fill={C.green} />
        {/* two white cups standing on the tray, in front of the shirt (fine ink contour) */}
        <rect x="-11" y="-64" width="9" height="11" rx="2.5" fill={C.white} stroke={C.ink} strokeWidth={INK.fine * 0.8} />
        <rect x="2" y="-64" width="9" height="11" rx="2.5" fill={C.white} stroke={C.ink} strokeWidth={INK.fine * 0.8} />
      </Holding></g>
    </svg>
    </Live>
  );
}

/**
 * Scena (Lingua, pannello bianco): la lavagna con le prime parole. Soggetto: chi insegna, il gesso in mano sulla lavagna,
 * e sottolinea la parola (bob lento); tre persone sedute sugli sgabelli la guardano, una con il quaderno.
 * Vita: intro (la lavagna spunta, il pavimento sale, arrivano le persone, il gesso traccia la sottolineatura); poi chi
 * insegna si muove al ritmo della lezione, il ragazzo e chi ha il quaderno annuiscono, ognuno col suo tempo.
 */
export function SchoolArt() {
  const G = 456;
  const chalk = <rect x="-2" y="-9" width="4" height="10" rx="1.6" fill={C.white} />;
  const students: [number, Fill, boolean, Hair][] = [[332, "green", false, "short"], [430, "orange", true, "bun"], [528, "green", false, "long"]];
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 640 520" className={cls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
      <Placed x={190} y={104} className="lv-pop" style={lk(0, 0.2)}>
        <Board w={390} h={214}>
          <text x="36" y="96" fontFamily="var(--font-display)" fontWeight="700" fontSize="72" fill={C.white}>ciao</text>
          <text x="36" y="170" fontFamily="var(--font-display)" fontWeight="700" fontSize="48" fill={C.white}>buongiorno</text>
          <path d="M38 192 H176" pathLength={1} stroke={C.white} strokeWidth="4" strokeLinecap="round" className="lv-draw" style={lk(0, 2)} />
        </Board>
      </Placed>
      <rect x="-20" y={G} width="680" height="70" fill={C.yellow} className="lv-rise" style={lk(0, 0.1)} />
      <g className="lv-pop" style={lk(0, 1.3)}><Holding x={196} y={G} s={1.46} color="orange" pose="reach" grip="right" hair="bun" className="bob" style={B(0.6)}>{chalk}</Holding></g>
      {students.map(([x, c, kid, hair]) => {
        const e = kid ? 1.3 * 0.64 : 1.05;
        return (
          <g key={x} className="lv-pop" style={lk(x / 100 - 2, 1.3)}>
            <Stool x={x - 4 * e} y={G} e={e} />
            <Person x={x} y={G} s={kid ? 1.3 : 1.05} kid={kid} color={c} pose="sit" flip hair={hair} item={x === 528 ? "book" : undefined} itemColor="orange" className={x === 332 ? undefined : "lv-rock"} style={vars({ "--t": kid ? 1.6 : 2.8, "--d": x / 200 })} />
          </g>
        );
      })}
    </svg>
    </Live>
  );
}

/** Scena (Percorso 01, arco bianco): la lavagna delle vocali; chi insegna scrive col gesso, un ragazzo esulta (soggetto). Vita: intro (lavagna, pavimento, persone, il gesso traccia l'onda); poi chi insegna scrive, il ragazzo salta di gioia. */
export function ProcessEdu() {
  const chalk = <rect x="-2" y="-9" width="4" height="10" rx="1.6" fill={C.white} />;
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 480 480" className={cls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <Placed x={90} y={104} className="lv-pop" style={lk(0, 0.2)}>
        <Board w={300} h={186}>
          {["a", "e", "i"].map((t, i) => <text key={t} x={46 + i * 86} y={122} fontFamily="var(--font-display)" fontWeight="700" fontSize="90" fill={C.white}>{t}</text>)}
          <path d="M44 150 q10 -12 20 0 t20 0" pathLength={1} fill="none" stroke={C.white} strokeWidth="4" strokeLinecap="round" className="lv-draw" style={lk(0, 1.9)} />
        </Board>
      </Placed>
      <rect x="-20" y="430" width="520" height="70" fill={C.yellow} className="lv-rise" style={lk(0, 0.1)} />
      <g className="lv-pop" style={lk(0, 1.3)}><Holding x={110} y={430} s={1.6} color="orange" pose="reach" grip="right" hair="short" className="lv-rock" style={vars({ "--t": 1.3 })}>{chalk}</Holding></g>
      <g className="lv-pop" style={lk(1, 1.3)}><Person x={318} y={430} s={1.6} kid color="green" pose="cheer" hair="curly" className="lv-hop" style={vars({ "--t": 1.4, "--d": 0.5 })} /></g>
    </svg>
    </Live>
  );
}

/** Lettuce rosettes on a furrow, as one path. */
const lettuces = (xs: number[], y: number, k = 1) =>
  xs.map((x) => `M${x - 13 * k} ${y} C${x - 16 * k} ${y - 10 * k} ${x - 8 * k} ${y - 16 * k} ${x - 3 * k} ${y - 9 * k} C${x - 4 * k} ${y - 20 * k} ${x + 6 * k} ${y - 22 * k} ${x + 6 * k} ${y - 11 * k} C${x + 12 * k} ${y - 17 * k} ${x + 18 * k} ${y - 8 * k} ${x + 13 * k} ${y} Z`).join("");

/** Scena (Percorso 02, pannello arancio): l'orto. Soggetto: chi impara a vangare, la vanga nella terra; un compagno porta la cassetta. Vita: intro (sole, terra, solchi, cassetta, persone); poi chi impara vanga, il compagno fa il passo, i raggi girano, passa uno stormo. */
export function ProcessWork() {
  const G = 380;
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 480 480" className={cls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <g className="lv-sun" style={lk(0, 0.3)}><Sun cx={380} cy={100} r={38} rays={10} color="yellow" className="spin-slow" /></g>
      <Birds x={40} y={200} x0={-120} x1={560} t={24} d={3} s={0.75} />
      <rect x="-20" y={G} width="520" height="120" fill={C.white} className="lv-rise" style={lk(0, 0.1)} />
      {[410, 448].map((y, r) => {
        const xs = Array.from({ length: 6 }, (_, k) => 40 + k * 84 + r * 40);
        return (
          <g key={y} className="lv-reveal-x" style={lk(r, 0.8)}>
            <path d={`M-20 ${y + 6} C140 ${y - 4} 340 ${y - 4} 500 ${y + 6}`} stroke={C.orange} strokeWidth={10 + r * 3} strokeLinecap="round" fill="none" />
            <path d={lettuces(xs, y + 1, 1 + r * 0.2)} fill={C.green} />
            <path d={xs.map((x) => `M${x} ${y - 1} l2 ${-9 - r * 2}`).join("")} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.6" />
          </g>
        );
      })}
      {/* a crate of lemons, white box (fruit and crate must stand out on the green shirt and the orange sky) */}
      <g className="lv-pop" style={lk(0, 1.5)}><Holding x={124} y={G} s={1.3} color="green" pose="carry" hair="long" className="lv-step" style={vars({ "--d": 0.3 })}>
        <path d="M-15.5 -60a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M-5.5 -62a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0M5 -60a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" fill={C.yellow} />
        <path d="M-10.5 -65v-1.6M0 -67.4v-1.6M10 -65v-1.6" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
        <rect x="-19" y="-61" width="38" height="20" rx="3" fill={C.white} />
        <path d="M-15.5 -54.4H15.5M-15.5 -47.6H15.5M-13.4 -58.6v15M13.4 -58.6v15" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      </Holding></g>
      <g className="lv-pop" style={lk(1, 1.5)}><Person x={280} y={G} s={1.3} color="white" pose="dig" itemColor="green" hair="cap" className="lv-rock" style={vars({ "--t": 1.5, "--d": 0.2 })} /></g>
      <Crate x={372} y={G - 32} w={56} h={32} fruit="yellow" box="green" className="lv-pop" style={lk(2, 1)} />
    </svg>
    </Live>
  );
}

/** Scena (Percorso 03, pannello verde): la porta di casa. Soggetto: chi arriva con la valigia; sulla soglia chi saluta. Vita: intro (terra, la casa spunta, arriva chi saluta); poi chi ha la valigia arriva da sinistra ed entra, fumo dal comignolo, la nuvola scorre, chi è sulla soglia saluta. */
export function ProcessDoor() {
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 480 480" className={cls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <Cloud x={70} y={84} s={0.9} color="white" className="lv-cloud" style={vars({ "--d": 1 })} />
      <rect x="-20" y="430" width="520" height="70" fill={C.yellow} className="lv-rise" style={lk(0, 0.1)} />
      <Cottage x={240} y={430} s={2.1} wall="white" roof="orange" door="orange" shutter="yellow" pane="green" className="lv-pop" style={lk(0, 0.5)} />
      <Puffs x={333} y={84} s={1.1} />
      <Enter x={140} y={432} x0={-270} x1={100} y1={-2} t={12} d={1.8}>
        <Person s={1.05} color="green" pose="walk" item="suitcase" itemColor="orange" hair="cap" />
      </Enter>
      <g className="lv-pop" style={lk(0, 1.4)}><Person x={300} y={432} s={1} color="orange" pose="wave" flip hair="long" className="bob" style={B(0.8)} /></g>
    </svg>
    </Live>
  );
}

/** Scena (CAS Locanda, striscia su arancio): la porta aperta, con chi saluta sulla soglia e un bambino; da destra arriva chi ha la valigia (soggetto). Vita: intro (la facciata sale, arrivano le persone); poi chi ha la valigia arriva ed entra, il bambino saltella, chi è sulla soglia saluta. */
export function ServiceCas() {
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 400 220" className={cls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <g className="lv-rise" style={lk(0, 0.1, { "--lv-y": "40px" })}>
      {/* a stretch of facade: wall, a shuttered window, the arched doorway open on a lit hall, the leaf swung in */}
      <rect x="26" y="34" width="244" height="182" rx="3" fill={C.white} />
      <rect x="20" y="28" width="256" height="10" rx="3" fill={C.white} />
      <rect x="44" y="84" width="10" height="44" rx="2" fill={C.orange} />
      <rect x="86" y="84" width="10" height="44" rx="2" fill={C.orange} />
      <rect x="56" y="84" width="28" height="44" rx="2" fill={C.green} />
      <path d="M70 84 V128 M56 104 H84" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <path d="M118 214 V112 a52 52 0 0 1 104 0 V214 Z" fill={C.yellow} />
      <path d="M118 214 V112 a52 52 0 0 1 14 -36 V206 Z" fill={C.green} />
      <path d="M126 112 V200" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.5" />
      </g>
      <g className="lv-pop" style={lk(0, 1)}><Person x={176} y={212} s={0.95} color="green" pose="wave" hair="curly" className="bob" style={B(0.4)} /></g>
      <g className="lv-pop" style={lk(1, 1)}><Person x={146} y={212} s={1.1} kid color="orange" pose="stand" hair="short" className="lv-hop" style={vars({ "--t": 2.6, "--d": 1 })} /></g>
      <rect x="110" y="208" width="120" height="7" rx="3" fill={C.green} />
      <Enter x={334} y={214} x0={100} x1={-160} y1={-2} s1={0.9} t={11} d={1.6}>
        <Person s={1} color="white" pose="walk" item="suitcase" itemColor="yellow" flip hair="bun" />
      </Enter>
      <rect x="-20" y="214" width="440" height="12" rx="6" fill={C.white} />
    </svg>
    </Live>
  );
}

/** Scena (Comunità per minori, striscia su giallo): un adulto e un ragazzo vanno al campo, il ragazzo calcia il pallone verso la porta (soggetto). Vita: intro (sole, campo, porta, persone); poi il pallone vola verso la porta e torna, il ragazzo carica il tiro, l'adulto fa il passo. */
export function ServiceMinors() {
  const G = 214, e = 1.25 * 0.64;
  return (
    <Live className="scene-live">
    <svg viewBox="0 0 400 220" className={cls} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <circle cx="300" cy="62" r="32" fill={C.orange} className="lv-sun" style={lk(0, 0.2, { "--lv-y": "80px" })} />
      <g className="lv-pop" style={lk(0, 0.6)}>
      {/* the goal: iron posts and crossbar, a white net behind */}
      <path d="M352 214 V128 L388 140 V214 M352 150 L388 160 M352 172 L388 180 M352 194 L388 200 M364 132 V214 M376 136 V214" stroke={C.white} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M346 214 V122 H394 V214" stroke={C.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      <g className="lv-pop" style={lk(0, 1.2)}><Person x={110} y={G} s={1.2} color="orange" pose="walk" hair="cap" className="lv-step" style={B(0.3)} /></g>
      <g className="lv-pop" style={lk(1, 1.2)}><Person x={196} y={G} s={1.25} kid color="green" pose="kick" hair="curly" className="lv-rock" style={vars({ "--t": 0.85, "--d": 1.6 })} /></g>
      {/* the ball: at the foot in the still frame, then kicked toward the goal and back */}
      <g transform={`translate(${196 + 31 * e + 12} ${G - 13})`}><g className="lv-pop" style={lk(2, 1.2)}>
        <g className="lv-arc-x" style={vars({ "--dx": "128px", "--t": 1.7, "--d": 1.6 })}><g className="lv-arc-y" style={vars({ "--h": "46px", "--dy": "-30px", "--t": 1.7, "--d": 1.6 })}>
        <g className="lv-spin" style={vars({ "--t": 0.8 })}>
          {/* the football, orange with ink patches: a white ball would fade on the yellow strip */}
          <circle r="13" fill={C.orange} />
          <path d="M0 -5.5 L5.2 -1.7 L3.2 4.4 H-3.2 L-5.2 -1.7 Z" fill={C.ink} />
          <path d="M0 -5.5 V-12.5 M5.2 -1.7 L11.8 -4 M3.2 4.4 L7.4 10.4 M-3.2 4.4 L-7.4 10.4 M-5.2 -1.7 L-11.8 -4" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
        </g>
        </g></g>
      </g></g>
      <rect x="-20" y="214" width="440" height="12" rx="6" fill={C.green} />
    </svg>
    </Live>
  );
}
