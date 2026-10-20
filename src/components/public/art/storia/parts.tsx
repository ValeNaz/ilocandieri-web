/**
 * Parti SVG della pagina Storia, linguaggio v4 (DESIGN.md "Illustration language"): masse piatte nei colori del logo SENZA
 * contorno; l'ink solo per ferro, tronchi e rami, capelli/pantaloni/scarpe e linee di dettaglio interne (INK.fine / INK.bold).
 * Eccezione voluta e dichiarata dalla pagina: i luoghi "vuoti" (tappa 1 e il "prima" del giardino) sono un disegno a sole
 * linee, bianco con contorno ink: è il testo stesso a dirlo ("fatto solo di linee, di proposito"). Lì `mode="sketch"`.
 * Ogni parte è UN oggetto: posizione sul gruppo esterno, animazione sul gruppo interno (<Placed>), mai sui pezzi.
 * Punto di appoggio = (0,0) al suolo.
 */
import type { CSSProperties } from "react";
import { C, INK, Placed } from "../parts";

export type At = { x?: number; y?: number; s?: number; className?: string; style?: CSSProperties; flip?: boolean };
/** Contorno del disegno a linee (solo scene "vuote" e oggetti bianchi tenuti in mano). */
export const ln = { stroke: "var(--c-ink)", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
/** Line props; with `draw` the stroke traces itself in the scene intro (.lv-draw, inside <Live>). */
export const L = (draw?: boolean) => (draw ? ({ ...ln, className: "lv-draw", pathLength: 1 } as const) : ln);
/** Linea di dettaglio interna (ink, senza riempimento). */
export const det = (w: number = INK.fine, draw?: boolean) => ({ fill: "none", stroke: C.ink, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round", ...(draw ? { className: "lv-draw", pathLength: 1 } : {}) }) as const;
/** Stile per lo sfasamento dei loop: --d (secondi di anticipo) e --t (durata). */
export const dl = (d: number, t?: number) => ({ "--d": d, ...(t ? { "--t": `${t}s` } : {}) }) as CSSProperties;
export const disc = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/** File di coppi: archetti tra due x a una quota. */
const tiles = (y: number, x0: number, x1: number, w = 12) => {
  let d = `M${x0} ${y}`;
  for (let x = x0; x + w <= x1 + 0.1; x += w) d += `Q${x + w / 2} ${y - 5} ${x + w} ${y}`;
  return d;
};
const WIN = [-82, -46, 46, 82];

/**
 * Il casolare di fine Settecento: corpo basso con tetto a padiglione sporgente, grondaia e pluviale, comignolo, quattro
 * finestre con davanzale, porta ad arco con cornice e gradino, annesso con portone ad arco.
 * mode="live": coppi arancio, persiane verdi aperte, vetri chiari, vaso con l'alloro; `open` = porta spalancata, vano chiaro
 * e anta verde vista di sbieco. `wall`: bianco (su cieli colorati) o giallo (su fondo bianco).
 * mode="sketch": il luogo chiuso, solo linee: persiane chiuse, porta sbarrata da assi, intonaco crepato. `draw` = si traccia scorrendo.
 * Ingombro (s=1): x -124..190, y -170..0.
 */
export function Casa({ mode = "live", open = false, wall = "white", draw = false, ...a }: At & { mode?: "live" | "sketch"; open?: boolean; wall?: "white" | "yellow"; draw?: boolean }) {
  const sk = mode === "sketch";
  const edge = sk ? L(draw) : {};
  const W = sk ? C.white : C[wall];
  const roof = sk ? C.white : C.orange;
  // il tetto ha gli angoli morbidi: un tratto dello stesso colore li arrotonda
  const soft = sk ? edge : { stroke: roof, strokeWidth: 5, strokeLinejoin: "round" as const };
  const glass = wall === "yellow" ? C.white : C.yellow;
  const mull = wall === "yellow" ? C.ink : C.white;
  const inside = wall === "yellow" ? C.orange : C.yellow;
  return (
    <Placed {...a}>
      {/* annesso, dietro al corpo */}
      <rect x="104" y="-62" width="78" height="62" rx="3" fill={W} {...edge} />
      <path d="M98 -58 L142 -88 L190 -58 Z" fill={roof} {...soft} />
      {!sk && <path d={tiles(-66, 118, 166, 12)} {...det(INK.fine)} />}
      <path d="M128 0V-24A14 14 0 0 1 156 -24V0Z" fill={sk ? C.white : C.green} {...edge} />
      <path d={sk ? "M137 -36V-2M147 -36V-2" : "M142 -38V-2"} {...det(INK.fine, draw)} />
      {/* comignolo, dietro il tetto */}
      {/* il comignolo è in cotto come il tetto: un pezzo così piccolo, bianco o giallo, sparirebbe nel cielo */}
      <rect x="40" y="-166" width="20" height="44" rx="2" fill={sk ? C.white : C.orange} {...edge} />
      {!sk && <path d="M40 -150H60" {...det(INK.fine)} />}
      <rect x="35" y="-171" width="30" height="8" rx="3" fill={roof} {...edge} />
      {/* corpo */}
      <rect x="-110" y="-98" width="220" height="98" rx="3" fill={W} {...edge} />
      <path d="M-124 -94 L-76 -146 H76 L124 -94 Z" fill={roof} {...soft} />
      <path d={[tiles(-106, -110, 110), tiles(-120, -96, 96), tiles(-134, -82, 82)].join("")} {...det(INK.fine, draw)} />
      {/* grondaia e pluviale (ferro: ink) */}
      {!sk && <path d="M-122 -93H122M110 -93V-6Q110 -2 114 -2" {...det(INK.bold)} />}
      {/* finestre */}
      {WIN.map((cx) => (
        <g key={cx}>
          {!sk && <rect x={cx - 24} y="-80" width="10" height="34" rx="2" fill={C.green} />}
          {!sk && <rect x={cx + 14} y="-80" width="10" height="34" rx="2" fill={C.green} />}
          <rect x={cx - 12} y="-80" width="24" height="34" rx="2" fill={sk ? C.white : glass} {...edge} />
          <rect x={cx - 15} y="-47" width="30" height="5" rx="2" fill={sk ? C.white : C.orange} {...edge} />
        </g>
      ))}
      {sk ? (
        // persiane chiuse: due ante a stecche
        <path d={WIN.map((cx) => `M${cx} -79V-48M${cx - 10} -72H${cx + 10}M${cx - 10} -64H${cx + 10}M${cx - 10} -56H${cx + 10}`).join("")} {...det(INK.fine, draw)} />
      ) : (
        <>
          <path d={WIN.map((cx) => `M${cx} -79V-47M${cx - 11} -63H${cx + 11}`).join("")} stroke={mull} strokeWidth="2.2" strokeLinecap="round" />
          <path d={WIN.map((cx) => `M${cx - 22} -72H${cx - 16}M${cx - 22} -64H${cx - 16}M${cx - 22} -56H${cx - 16}M${cx + 16} -72H${cx + 22}M${cx + 16} -64H${cx + 22}M${cx + 16} -56H${cx + 22}`).join("")} {...det(INK.fine)} />
        </>
      )}
      {/* porta ad arco con cornice in pietra e gradino */}
      <path d="M-23 -44A23 23 0 0 1 23 -44" {...det(INK.fine, draw)} />
      <path d="M-17 0V-44A17 17 0 0 1 17 -44V0Z" fill={sk ? C.white : open ? inside : C.green} {...edge} />
      {sk && <path d="M-16 -42L16 -8M16 -42L-16 -8M-17 -30H17M-17 -18H17" {...det(INK.bold, draw)} />}
      {!sk && !open && (
        <>
          <path d="M0 -59V-2M-11 -40H-4M4 -40H11M-11 -18H-4M4 -18H11" {...det(INK.fine)} />
          <circle cx="7" cy="-29" r="2.4" fill={C.yellow} />
        </>
      )}
      {!sk && open && <path d="M-17 -1 L-17 -60 L-28 -55 L-28 -4 Z" fill={C.green} stroke={C.green} strokeWidth="2" strokeLinejoin="round" />}
      <rect x="-26" y="-5" width="52" height="5" rx="2" fill={C.white} {...edge} />
      {!sk && <path d="M-25 -5H25" {...det(INK.fine)} />}
      {/* crepe e intonaco caduto nel vuoto; vaso con l'alloro nel vivo */}
      {sk && <path d="M-100 -24l6 -6l-2 -6l5 -5M70 -30l-5 7l3 5M90 -90l4 6M-60 -12h10M30 -16h12M-104 -86h10" {...det(INK.fine, draw)} />}
      {!sk && (
        <>
          <path d="M-103 0 L-105 -14 H-85 L-87 0 Z" fill={C.orange} stroke={C.orange} strokeWidth="2" strokeLinejoin="round" />
          <path d={disc(-99, -21, 8) + disc(-89, -19, 6.5) + disc(-94, -28, 6)} fill={C.green} />
        </>
      )}
    </Placed>
  );
}

/** Albero spoglio: lo stesso tronco biforcuto dell'arancio (ink pieno), ma solo rami e rametti. */
export function BareTree(a: At) {
  return (
    <Placed {...a}>
      <path d="M-7 0 C-4.6 -6 -4 -16 -3.6 -26 C-3.4 -32 -6 -38 -12 -46 L-8.6 -48.6 C-4.4 -43.4 -1.6 -40 0.4 -36.4 C2 -42 5.4 -47.6 10.6 -52 L13.6 -49.2 C8.4 -44 5 -36 4.2 -26 C3.8 -16 4.4 -6 7.4 0 Z" fill={C.ink} />
      <path d="M-10 -47C-18 -56 -26 -62 -36 -66M12 -50C20 -58 28 -64 38 -66M0 -38C1 -52 0 -64 -2 -80" {...det(3.2)} />
      <path d="M-20 -57C-22 -66 -21 -72 -25 -80M-28 -63C-34 -60 -40 -60 -45 -62M22 -59C22 -68 25 -74 28 -82M30 -64C36 -61 42 -61 46 -64M-1 -62C4 -68 8 -72 13 -74M-1 -70C-6 -76 -9 -80 -14 -82" {...det(2)} />
    </Placed>
  );
}

/** Erbacce del campo abbandonato: steli ink (finocchietto, cardo) con le teste dei semi. */
export function Weeds(a: At) {
  return (
    <Placed {...a}>
      <path d="M0 0C-2 -12 -8 -18 -14 -24M0 0C1 -14 0 -24 3 -34M0 0C4 -10 9 -17 16 -20M-4 0C-8 -6 -14 -8 -20 -8M3 -34l-4 -5M3 -34l5 -4" {...det(2)} />
      <path d={disc(-14, -25, 2.6) + disc(16.5, -21, 2.2)} fill={C.ink} />
    </Placed>
  );
}

/** Nuvola a linee (solo nelle scene "vuote"). */
export function CloudLine(a: At) {
  return (
    <Placed {...a}>
      <path d="M0 22H84A12 12 0 0 0 84 0A24 24 0 0 0 40 -8A22 22 0 0 0 0 4A9 9 0 0 0 0 22Z" fill={C.white} {...ln} strokeWidth="2.2" />
    </Placed>
  );
}

/**
 * Il cancello chiuso (ferro: ink): due ante a sbarre con le punte a lancia, traverse, catena e lucchetto; pilastri in
 * pietra con il pomo, nel disegno a linee. Larghezza ±84, alto 100.
 */
export function Gate({ draw, swing, ...a }: At & { draw?: boolean; swing?: boolean }) {
  const bars = [-52, -40, -28, -16, 16, 28, 40, 52];
  const top = (x: number) => -64 - 8 * Math.cos((x / 56) * (Math.PI / 2));
  return (
    <Placed {...a}>
      {/* pilastri */}
      {[-70, 70].map((x) => (
        <g key={x}>
          <rect x={x - 10} y="-84" width="20" height="84" rx="2" fill={C.white} {...L(draw)} />
          <rect x={x - 14} y="-91" width="28" height="8" rx="3" fill={C.white} {...L(draw)} />
          <path d={disc(x, -97, 6)} fill={C.white} {...ln} />
          <path d={`M${x - 10} -60h8M${x + 2} -36h8M${x - 10} -14h7`} {...det(INK.fine, draw)} />
        </g>
      ))}
      {/* sbarre e traverse */}
      <path d={bars.map((x) => `M${x} -2V${top(x).toFixed(1)}`).join("") + "M-60 -14H-4M4 -14H60M-60 -52H-4M4 -52H60M-4 -4V-70M4 -4V-70"} {...det(3)} />
      <path d={bars.map((x) => { const t = top(x); return `M${x} ${(t - 7).toFixed(1)}l3 5l-3 3l-3 -3Z`; }).join("")} fill={C.ink} stroke={C.ink} strokeWidth="1.4" strokeLinejoin="round" />
      {/* catena e lucchetto: un solo gruppo che può dondolare dalla catena (.lv-swing) */}
      <g className={swing ? "lv-swing" : undefined} style={swing ? ({ "--t": 3.6, "--d": 0.4 } as CSSProperties) : undefined}>
        <path d="M-14 -40c3 -3 6 -3 8 0M-8 -36c3 -3 6 -3 8 0M0 -36c3 -3 6 -3 8 0M6 -40c3 -3 6 -3 8 0" {...det(2.2)} />
        <path d="M-5 -32V-37A5 5 0 0 1 5 -37V-32" {...det(2.6)} />
        <rect x="-9" y="-33" width="18" height="15" rx="4" fill={C.white} {...ln} strokeWidth="2.2" />
        <path d="M0 -28v4" {...det(2.2)} />
      </g>
    </Placed>
  );
}

/** Muretto a secco: pietre bianche a linee (scena "vuota"). Dal punto (0,0) verso +x per `w`. */
export function DryWall({ w = 140, draw, ...a }: At & { w?: number; draw?: boolean }) {
  const joints: string[] = [];
  for (let x = 10, i = 0; x < w - 8; x += 22, i++) joints.push(`M${x + (i % 2 ? 6 : 0)} -${i % 2 ? 30 : 14}v8`);
  return (
    <Placed {...a}>
      <path d={`M0 0V-34Q0 -38 4 -38H${w - 4}Q${w} -38 ${w} -34V0`} fill={C.white} {...L(draw)} />
      <path d={`M2 -19H${w - 2}` + joints.join("")} {...det(INK.fine, draw)} />
    </Placed>
  );
}

/** La chiave di ferro (ink): anello con l'occhio, collarino, fusto, ingegno a denti; un cartellino arancio legato all'anello. */
export function Key(a: At) {
  return (
    <Placed {...a}>
      <path d="M0 20 C-2 32 -8 38 -14 42" {...det(INK.fine)} />
      <g transform="rotate(-14 -22 50)">
        <rect x="-36" y="40" width="28" height="18" rx="4" fill={C.orange} />
        <path d={disc(-12, 45, 2.4)} fill={C.white} />
        <path d="M-31 47H-19M-31 52H-23" stroke={C.white} strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d={disc(0, 0, 22) + disc(0, 0, 9)} fill={C.ink} fillRule="evenodd" />
      <rect x="19" y="-7.5" width="9" height="15" rx="3" fill={C.ink} />
      <rect x="26" y="-4" width="84" height="8" rx="4" fill={C.ink} />
      <path d="M86 0H110V22Q110 26 106 26H102V14H96V22Q96 26 92 26H86Z" fill={C.ink} stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
    </Placed>
  );
}

/** Barattolo ABES: vetro bianco (oggetto bianco: contorno sottile ammesso), coperchio a fascia, contenuto, etichetta. */
export function Jar({ fill = "orange", label = "green", ...a }: At & { fill?: "orange" | "yellow" | "green"; label?: "orange" | "yellow" | "green" }) {
  return (
    <Placed {...a}>
      <path d="M-24 -76H24V-8A8 8 0 0 1 16 0H-16A8 8 0 0 1 -24 -8Z" fill={C.white} {...ln} strokeWidth="2" />
      <path d="M-19 -60H19V-10A5 5 0 0 1 14 -5H-14A5 5 0 0 1 -19 -10Z" fill={C[fill]} />
      <rect x="-27" y="-90" width="54" height="15" rx="4" fill={C.yellow} />
      <path d="M-25 -82H25" {...det(INK.fine)} />
      <rect x="-20" y="-46" width="40" height="26" rx="3" fill={C[label]} />
      <path d="M-12 -37H12M-8 -29H8" stroke={C.white} strokeWidth="2.4" strokeLinecap="round" />
    </Placed>
  );
}

/** Pianta di pomodoro legata alla canna (ink): fusto, foglie in masse, grappoli di frutti col picciolo. */
export function Tomato({ h = 90, fruit = "orange", ...a }: At & { h?: number; fruit?: "orange" | "yellow" }) {
  const k = h / 90;
  const f: [number, number][] = [[-16, -32], [-7, -26], [14, -44], [21, -50], [-12, -62], [9, -76]];
  return (
    <Placed {...a}>
      <path d={`M3 2V${-h - 6}`} {...det(INK.bold)} />
      <path d={`M0 0C-3 ${-h * 0.3} 4 ${-h * 0.55} 0 ${-h}`} stroke={C.green} strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <path d={disc(-9 * k, -38 * k, 15 * k) + disc(11 * k, -52 * k, 15 * k) + disc(-7 * k, -66 * k, 14 * k) + disc(6 * k, -80 * k, 12 * k) + disc(2 * k, -30 * k, 10 * k) + `M-20 ${-46 * k}C-30 ${-50 * k} -34 ${-46 * k} -36 ${-40 * k}C-30 ${-38 * k} -24 ${-40 * k} -20 ${-42 * k}ZM22 ${-60 * k}C30 ${-66 * k} 35 ${-64 * k} 37 ${-58 * k}C31 ${-55 * k} 26 ${-56 * k} 22 ${-56 * k}ZM0 ${-88 * k}C-4 ${-96 * k} -2 ${-102 * k} 3 ${-104 * k}C6 ${-98 * k} 5 ${-93 * k} 1 ${-87 * k}Z`} fill={C.green} />
      <path d={f.map(([x, y]) => disc(x * k, y * k, 5.8 * k)).join("")} fill={C[fruit]} />
      <path d={f.map(([x, y]) => `M${x * k} ${(y - 5.4) * k}l1 -3`).join("")} {...det(INK.fine)} />
    </Placed>
  );
}

/** Sacco di farina: tela (bianca o verde, a seconda del fondo), collo legato con lo spago (ink), spiga stampata. */
export function Sack({ color = "white", ...a }: At & { color?: "white" | "green" }) {
  const print = color === "green" ? C.white : C.green;
  return (
    <Placed {...a}>
      <path d="M-30 0C-35 -28 -32 -50 -20 -60C-24 -66 -20 -74 -12 -72C-6 -78 6 -78 12 -72C20 -74 24 -66 20 -60C32 -50 35 -28 30 0Q0 4 -30 0Z" fill={C[color]} />
      <path d="M-19 -61Q0 -56 19 -61M-6 -60l-4 8M8 -60l5 7" {...det(INK.bold)} />
      <path d="M0 -12V-40M0 -26C-7 -26 -9 -32 -9 -36M0 -26C7 -26 9 -32 9 -36M0 -34C-6 -34 -7 -38 -7 -42M0 -34C6 -34 7 -38 7 -42" fill="none" stroke={print} strokeWidth="2.6" strokeLinecap="round" />
    </Placed>
  );
}

/** Panca: seduta bianca con spessore, gambe; la seduta è a −40 unità persona (Person pose="sit" sopra, stessa x/scala). */
export function Bench({ w = 30, seat = "orange", ...a }: At & { w?: number; seat?: "orange" | "yellow" | "green" | "white" }) {
  return (
    <Placed {...a}>
      <rect x={-w / 2 - 2} y="-37" width="5" height="37" rx="2" fill={C.white} />
      <rect x={w / 2 - 6} y="-37" width="5" height="37" rx="2" fill={C.white} />
      <rect x={-w / 2 - 6} y="-42" width={w + 6} height="7" rx="3" fill={C[seat]} />
    </Placed>
  );
}

/* ---------- Usati dall'area Tradizione (art/tradizione/scenes.tsx): disegno e API invariati, li ridisegna quell'area ---------- */

/** Cassetta di legno con frutti: doghe arrotondate, maniglia, frutti appoggiati sopra. */
export function Crate({ fruit = "orange", ...a }: At & { fruit?: "orange" | "yellow" | "green" }) {
  return (
    <Placed {...a}>
      {[-16, 0, 16].map((x, i) => <circle key={i} cx={x} cy={-24 - (i === 1 ? 4 : 0)} r="8.5" fill={C[fruit]} {...ln} strokeWidth="1.8" />)}
      <path d="M-4 -36Q0 -42 5 -40" fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round" />
      <rect x="-28" y="-24" width="56" height="24" rx="5" fill={C.white} {...ln} />
      <path d="M-27 -12H27" fill="none" {...ln} strokeWidth="1.8" />
      <rect x="-8" y="-20" width="16" height="5" rx="2.5" fill={C.yellow} {...ln} strokeWidth="1.6" />
    </Placed>
  );
}

/** Sgabello sotto una persona seduta (Person pose="sit" nello stesso punto e alla stessa scala): seduta sotto le cosce, gambe al suolo. */
export function Sgabello(a: At) {
  return (
    <Placed {...a}>
      <path d="M-10 -28V0M6 -28V0" fill="none" {...ln} />
      <rect x="-16" y="-35" width="26" height="7" rx="3.5" fill={C.white} {...ln} strokeWidth="2" />
    </Placed>
  );
}

/* ---------- Piccole vite delle scene (si muovono dentro <Live>) ---------- */

/** Uno stormo di tre uccelli (ink) che attraversa il cielo: .lv-fly sul gruppo, ali che battono (.lv-flap). */
export function Birds({ x, y, s = 1, t = 26, d = 0, x0, x1 }: { x: number; y: number; s?: number; t?: number; d?: number; x0: number; x1: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="lv-fly" style={{ "--t": t, "--d": d, "--x0": `${x0}px`, "--x1": `${x1}px`, "--y0": "6px", "--y1": "-10px" } as CSSProperties}>
        {[[0, 0, 1], [26, 12, 0.8], [48, -5, 0.9]].map(([bx, by, bs], i) => (
          <g key={i} transform={`translate(${bx} ${by}) scale(${bs})`}>
            <g className="lv-flap" style={{ "--d": i * 0.13 } as CSSProperties}>
              <path d="M-11 -2 Q-5.5 -8 0 0 Q5.5 -8 11 -2" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

/** Farfalla: va e viene in una piccola zona (.lv-move .lv-alt) battendo le ali (.lv-flutter). */
export function Butterfly({ x, y, s = 1, color = "orange", t = 7, d = 0, dx = 40, dy = -14 }: { x: number; y: number; s?: number; color?: "orange" | "yellow" | "white"; t?: number; d?: number; dx?: number; dy?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="lv-move lv-alt" style={{ "--t": t, "--d": d, "--x0": `${-dx}px`, "--x1": `${dx}px`, "--y0": "0px", "--y1": `${dy}px` } as CSSProperties}>
        <g className="lv-flutter">
          <path d="M0 0 C-10 -12 -16 -2 -8 2 C-14 6 -8 12 0 2 C8 12 14 6 8 2 C16 -2 10 -12 0 0 Z" fill={C[color]} />
          <path d="M0 -5 V5" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}
