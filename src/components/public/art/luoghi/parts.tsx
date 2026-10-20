/**
 * Parti SVG dei luoghi. Stesse leggi di parts.tsx: forme piatte nei colori del logo, linee in inchiostro,
 * persone come nel logo (testa tonda, corpo a casetta), nessun tratto etnico, nessun volto.
 * Ogni parte si piazza col suo punto a terra (x, y) e una scala s (1 = circa 100 unita' di altezza).
 */
import type { CSSProperties, ReactNode } from "react";
import { C, type Fill } from "../parts";
import "./luoghi.css";

export { C };
export type { Fill };
type At = { x?: number; y?: number; s?: number; flip?: boolean; className?: string; style?: CSSProperties };
const at = ({ x = 0, y = 0, s = 1, flip }: At) => `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;
/** Gruppo esterno per classi/animazioni CSS (che sovrascrivono l'attributo transform), interno per la posizione. */
function P({ p, children }: { p: At; children: ReactNode }) {
  return (
    <g className={p.className} style={p.style}>
      <g transform={at(p)}>{children}</g>
    </g>
  );
}
const ink = { stroke: C.ink, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const n2 = (v: number) => Number(v.toFixed(2));
/** Cerchio come sottotracciato (per unire molte forme in un solo <path>). */
const disc = (cx: number, cy: number, r: number) => `M${n2(cx - r)} ${n2(cy)}a${n2(r)} ${n2(r)} 0 1 0 ${n2(r * 2)} 0a${n2(r)} ${n2(r)} 0 1 0 ${n2(-r * 2)} 0`;

/**
 * Contenitore che sposta avanti e indietro una persona INTERA (una <Person> di parts.tsx, mai pezzi sciolti).
 * Posizione sul gruppo esterno, spostamento e cambio di verso su gruppi interni: nessuna parte si stacca.
 */
export function Walker({ x = 0, y = 0, dx = 120, dy = 0, t = 10, d = 0, turn = true, children }: { x?: number; y?: number; dx?: number; dy?: number; t?: number; d?: number; turn?: boolean; children: ReactNode }) {
  const vars = { "--dx": `${dx}px`, "--dy": `${dy}px`, "--t": `${Math.max(t, 6)}s`, "--d": d } as CSSProperties;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lw-pace" style={vars}>
        {turn ? <g className="lw-face" style={vars}>{children}</g> : children}
      </g>
    </g>
  );
}

/**
 * Cassetta di arance (o d'altro), punto a terra in basso al centro. Linguaggio v4: nessun contorno esterno; inchiostro
 * solo per le fessure tra le doghe, i montanti di testa e i piccioli. `box` = colore della cassa (in contrasto col suolo).
 */
export function Crate({ fruit = "orange", count = 5, box = "white", ...p }: At & { fruit?: Fill; count?: number; box?: Fill }) {
  const n = Math.max(0, count);
  const f = fruit === box ? (box === "orange" ? "yellow" : "orange") : fruit;
  const fr = Array.from({ length: n }, (_, i) => [n === 1 ? 0 : -17 + i * (34 / Math.max(1, n - 1)), i % 2 ? -27 : -24.5] as const);
  return (
    <P p={p}>
      {n > 0 && <path d={fr.map(([cx, cy]) => disc(cx, cy, 7.6)).join("")} fill={C[f]} />}
      {n > 0 && <path d={fr.map(([cx, cy]) => `M${cx + 0.8} ${cy - 7}l1.6 -3`).join("")} fill="none" {...ink} strokeWidth="1.8" />}
      <rect x="-26" y="-22" width="52" height="22" rx="3" fill={C[box]} />
      <path d="M-20.5 -14.6H20.5M-20.5 -7.4H20.5M-21.6 -18.6V-3.4M21.6 -18.6V-3.4" fill="none" {...ink} strokeWidth="1.8" />
    </P>
  );
}

/** Barattolo: coperchio con la fascia filettata, vetro, etichetta con due righe. Nessun contorno esterno, salvo che il vetro sia bianco (sparirebbe sul bianco). */
export function Jar({ body = "orange", lid = "green", label = "white", ...p }: At & { body?: Fill; lid?: Fill; label?: Fill }) {
  const edge = body === "white" ? { ...ink, strokeWidth: 1.8 } : {};
  return (
    <P p={p}>
      <path d="M-15 -42 C-15 -46 -12 -47 -9 -47 H9 C12 -47 15 -46 15 -42 L17 -36 V-5 C17 -2 15 0 12 0 H-12 C-15 0 -17 -2 -17 -5 V-36 Z" fill={C[body]} {...edge} />
      <rect x="-14" y="-55" width="28" height="10" rx="3" fill={C[lid]} />
      <path d="M-10 -51.6 H10 M-10 -48.4 H10" fill="none" {...ink} strokeWidth="1.4" opacity="0.7" />
      <rect x="-17" y="-31" width="34" height="17" rx="2" fill={C[label === body ? (body === "white" ? "yellow" : "white") : label]} />
      <path d="M-10 -25.4 H10 M-7 -19.6 H7" fill="none" {...ink} strokeWidth="1.8" />
    </P>
  );
}

/** Pentolone: corpo, orlo, manici e coperchio pieni; inchiostro per i manici (ferro) e la riga dell'orlo. Il vapore (se c'e') e' UN gruppo che sale tutto insieme. */
export function Pot({ color = "white", steam = false, steamColor = "white", ...p }: At & { color?: Fill; steam?: boolean; steamColor?: Fill }) {
  return (
    <P p={p}>
      {steam && (
        <g className="lw-steam">
          {[-14, 0, 14].map((vx) => <path key={vx} d={`M${vx} -66 q-6 -8 0 -16 t0 -16`} fill="none" stroke={C[steamColor]} strokeWidth={steamColor === "ink" ? 2.6 : 4} strokeLinecap="round" />)}
        </g>
      )}
      <path d="M-30 -42 H-44 M30 -42 H44" fill="none" {...ink} strokeWidth="4.5" />
      <path d="M-30 -54 H30 L27 -4 C27 -1.6 25.4 0 23 0 H-23 C-25.4 0 -27 -1.6 -27 -4 Z" fill={C[color]} />
      <rect x="-34" y="-58" width="68" height="9" rx="4" fill={C[color]} />
      <path d="M-30 -49 H30 M-26 -12 H26" fill="none" {...ink} strokeWidth="1.8" />
    </P>
  );
}

/** Segnaposto della mappa (goccia bianca), punta a terra in (x, y). Dentro, il segno del luogo: un'arancia, un campo, una casa.
 * Nessun testo: la legenda sta fuori dal disegno. Bianco con bordo in inchiostro: si legge sul giallo della mappa e sul verde della stanza. */
export type PinMark = "orange" | "field" | "house";
export function MapPin({ mark, ...p }: At & { mark: PinMark }) {
  return (
    <P p={p}>
      <path d="M0 0 C-6 -14 -24 -28 -24 -46 a24 24 0 0 1 48 0 C24 -28 6 -14 0 0 Z" fill={C.white} {...ink} strokeWidth="3" />
      {mark === "orange" && (
        <g>
          <circle cy="-44" r="11" fill={C.orange} {...ink} strokeWidth="2" />
          <path d="M0 -55 q6 -7 12 -4 q-4 7 -12 4 Z" fill={C.green} />
        </g>
      )}
      {mark === "field" && (
        <g>
          <rect x="-14" y="-55" width="28" height="20" rx="3" fill={C.green} />
          <path d="M0 -55 V-35" stroke={C.white} strokeWidth="2.5" />
          <circle cy="-45" r="4.5" fill="none" stroke={C.white} strokeWidth="2.5" />
        </g>
      )}
      {mark === "house" && <path d="M-11 -34 V-47 L0 -57 L11 -47 V-34 Z" fill={C.orange} stroke={C.orange} strokeWidth="3" strokeLinejoin="round" />}
    </P>
  );
}

/** Rete da pallavolo vista di lato. */
export function Net({ w = 300, h = 64, post = 130, ...p }: At & { w?: number; h?: number; post?: number }) {
  const cols = Math.round(w / 14);
  return (
    <P p={p}>
      <rect x={-w / 2} y={-post} width={w} height={h} fill="none" {...ink} strokeWidth="2" opacity="0.9" />
      {Array.from({ length: cols - 1 }, (_, i) => <line key={i} x1={-w / 2 + ((i + 1) * w) / cols} y1={-post} x2={-w / 2 + ((i + 1) * w) / cols} y2={-post + h} {...ink} strokeWidth="1.4" opacity="0.6" />)}
      {Array.from({ length: 4 }, (_, i) => <line key={i} x1={-w / 2} y1={-post + ((i + 1) * h) / 5} x2={w / 2} y2={-post + ((i + 1) * h) / 5} {...ink} strokeWidth="1.4" opacity="0.6" />)}
      <rect x={-w / 2} y={-post - 4} width={w} height="9" rx="2" fill={C.white} {...ink} strokeWidth="2" />
      <rect x={-w / 2 - 6} y={-post - 6} width="9" height={post + 6} rx="2" fill={C.ink} />
      <rect x={w / 2 - 3} y={-post - 6} width="9" height={post + 6} rx="2" fill={C.ink} />
    </P>
  );
}

/**
 * Arancio visto di lato: tronco in inchiostro che si apre alla base e si biforca, chioma a masse morbide con tre foglie
 * che rompono il bordo, frutti con il picciolo (stesso disegno di OrangeTree in ../parts). `n` frutti (0 = nessuno),
 * `r` = raggio di chioma di riferimento (38 = circa 110 unita' di altezza). Punto a terra = piede del tronco.
 */
const TREE_FRUIT: [number, number][] = [[-27, -52], [20, -50], [6, -62], [-30, -74], [30, -66], [-12, -46], [14, -92], [-16, -86]];
export function Tree({ crown = "green", fruit = "orange", n = 6, r = 38, ...p }: At & { crown?: Fill; fruit?: Fill; n?: number; r?: number }) {
  const k = (r / 38) * 0.95;
  const fr = TREE_FRUIT.slice(0, Math.max(0, Math.min(8, n)));
  return (
    <P p={p}>
      <g transform={`scale(${k.toFixed(3)})`}>
        <path d="M-7 0 C-4.6 -6 -4 -16 -3.6 -26 C-3.4 -32 -6 -38 -12 -46 L-8.6 -48.6 C-4.4 -43.4 -1.6 -40 0.4 -36.4 C2 -42 5.4 -47.6 10.6 -52 L13.6 -49.2 C8.4 -44 5 -36 4.2 -26 C3.8 -16 4.4 -6 7.4 0 Z" fill={C.ink} />
        <path d={disc(0, -70, 29) + disc(-24, -60, 20) + disc(24, -61, 21) + disc(-12, -88, 18) + disc(13, -90, 17) + "M-42 -66 C-48 -72 -52 -72 -55 -70 C-52 -64 -47 -62 -42 -62 Z M42 -70 C47 -77 52 -78 55 -76 C53 -70 48 -67 42 -66 Z M0 -104 C-2 -110 0 -115 4 -117 C7 -112 6 -107 3 -104 Z"} fill={C[crown]} />
        {fr.length > 0 && <path d={fr.map(([x, y]) => disc(x, y, 5.6)).join("")} fill={C[fruit === crown ? "orange" : fruit]} />}
        {fr.length > 0 && <path d={fr.map(([x, y]) => `M${x + 0.6} ${y - 5.2}l1.4 -2.6`).join("")} fill="none" {...ink} strokeWidth="1.8" />}
      </g>
    </P>
  );
}

/** Arancio visto dall'alto: chioma a quattro masse sovrapposte, una foglia che rompe il bordo, tre frutti. */
export function TopTree({ r = 20, crown = "green", fruit = "orange", ...p }: At & { r?: number; crown?: Fill; fruit?: Fill }) {
  const q = (v: number) => v * r;
  return (
    <P p={p}>
      <path d={disc(0, 0, q(0.78)) + disc(q(-0.32), q(-0.3), q(0.6)) + disc(q(0.36), q(-0.18), q(0.58)) + disc(q(0.08), q(0.36), q(0.6)) + `M${q(0.7)} ${q(0.42)} C${q(1.02)} ${q(0.5)} ${q(1.12)} ${q(0.74)} ${q(1.1)} ${q(0.86)} C${q(0.9)} ${q(0.84)} ${q(0.72)} ${q(0.68)} ${q(0.62)} ${q(0.56)} Z`} fill={C[crown]} />
      <path d={disc(q(-0.36), q(-0.26), q(0.17)) + disc(q(0.34), q(0.08), q(0.17)) + disc(q(-0.04), q(0.48), q(0.17))} fill={C[fruit]} />
    </P>
  );
}

/** Pallone (intero: si muove solo dentro un gruppo, es. Hop). */
export function BallArt({ r = 14 }: { r?: number }) {
  return (
    <g>
      <circle r={r} fill={C.white} {...ink} strokeWidth={r * 0.13} />
      <polygon points={`0,${-r * 0.42} ${r * 0.4},${-r * 0.13} ${r * 0.25},${r * 0.34} ${-r * 0.25},${r * 0.34} ${-r * 0.4},${-r * 0.13}`} fill={C.ink} />
      <path d={`M0 ${-r * 0.42} V${-r} M${r * 0.4} ${-r * 0.13} L${r * 0.95} ${-r * 0.3} M${r * 0.25} ${r * 0.34} L${r * 0.6} ${r * 0.8} M${-r * 0.25} ${r * 0.34} L${-r * 0.6} ${r * 0.8} M${-r * 0.4} ${-r * 0.13} L${-r * 0.95} ${-r * 0.3}`} fill="none" {...ink} strokeWidth={r * 0.1} />
    </g>
  );
}

/** Cono da allenamento. */
export function Cone({ color = "orange", ...p }: At & { color?: Fill }) {
  return (
    <P p={p}>
      <path d="M-11 -2 L-4.6 -28.6 C-4.2 -30 -3.2 -31 -2 -31 H2 C3.2 -31 4.2 -30 4.6 -28.6 L11 -2 Z" fill={C[color]} />
      <path d="M-8.4 -13 H8.4 L7.2 -18 H-7.2 Z" fill={C[color === "white" ? "orange" : "white"]} />
      <rect x="-15" y="-4" width="30" height="5" rx="2.5" fill={C.ink} />
    </P>
  );
}

/** Svg di livello: tutti i livelli di una scena condividono viewBox e crop. Decorativo (aria-hidden). */
export function Sv({ vb, children, meet = false, align = "xMidYMid" }: { vb: string; children: ReactNode; meet?: boolean; align?: string }) {
  return (
    <svg viewBox={vb} className="lw-svg" aria-hidden="true" focusable="false" preserveAspectRatio={`${align} ${meet ? "meet" : "slice"}`}>
      {children}
    </svg>
  );
}

/** Mattoni/pietre di un muro: righe di rettangoli con giunti in inchiostro. */
export function Masonry({ x, y, w, h, color = "white", row = 26, brick = 54 }: { x: number; y: number; w: number; h: number; color?: Fill; row?: number; brick?: number }) {
  const rows = Math.floor(h / row);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={C[color]} />
      {Array.from({ length: rows }, (_, r) => (
        <g key={r}>
          <line x1={x} y1={y + (r + 1) * row} x2={x + w} y2={y + (r + 1) * row} {...ink} strokeWidth="1.8" opacity="0.5" />
          {Array.from({ length: Math.floor(w / brick) }, (_, b) => {
            const bx = x + (b + 1) * brick - (r % 2 ? brick / 2 : 0);
            return bx > x + 4 && bx < x + w - 4 ? <line key={b} x1={bx} y1={y + r * row} x2={bx} y2={y + (r + 1) * row} {...ink} strokeWidth="1.8" opacity="0.5" /> : null;
          })}
        </g>
      ))}
    </g>
  );
}

/** Tegole: file di coppi (semicerchi sfalsati) dentro una falda, clip con clipPath da `id`. Nessun contorno della falda: solo le righe dei coppi. */
export function Tiles({ id, d, x, y, w, h, a = "orange", b = "yellow", size = 22 }: { id: string; d: string; x: number; y: number; w: number; h: number; a?: Fill; b?: Fill; size?: number }) {
  const rows = Math.ceil(h / (size * 0.62)) + 1;
  const cols = Math.ceil(w / size) + 1;
  return (
    <g>
      <clipPath id={id}><path d={d} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={C[a]} />
        {Array.from({ length: rows }, (_, r) => {
          // una riga = due tracciati (coppi normali e coppi d'accento): poche forme anche per un tetto grande
          const cells = Array.from({ length: cols }, (_, c) => ({ c, d: `M${n2(x + c * size - (r % 2 ? size / 2 : 0))} ${n2(y + r * size * 0.62)}a${size / 2} ${size / 2} 0 0 0 ${size} 0` }));
          const acc = (c: number) => (r * 3 + c * 7) % 11 === 0;
          return (
            <g key={r}>
              <path d={cells.filter((k) => !acc(k.c)).map((k) => k.d).join("")} fill={C[a]} {...ink} strokeWidth="1.8" />
              <path d={cells.filter((k) => acc(k.c)).map((k) => k.d).join("") || "M0 0"} fill={C[b]} {...ink} strokeWidth="1.8" />
            </g>
          );
        })}
      </g>
    </g>
  );
}

/**
 * Scala a pioli in legno, appoggiata in verticale: montanti a x = -9 e x = 17, pioli ogni 22 unita' a partire da y = -20.
 * Disegnata nelle unita' della persona (s = 1 come <Person>): una persona in posa `climb` con i piedi in (0, 0) ha il
 * piede vicino sul primo piolo e le mani sui montanti (handAt("climb", ...)). Si mette PRIMA della persona.
 */
export function Ladder({ h = 150, color = "yellow", ...p }: At & { h?: number; color?: Fill }) {
  const rungs = Array.from({ length: Math.floor((h - 12) / 22) }, (_, i) => -20 - i * 22);
  return (
    <P p={p}>
      <path d={rungs.map((y) => `M-9 ${y} H17`).join(" ")} fill="none" stroke={C[color]} strokeWidth="4" strokeLinecap="round" />
      <path d={`M-9 0 V${-h} M17 0 V${-h + 4}`} fill="none" stroke={C[color]} strokeWidth="5.4" strokeLinecap="round" />
      <path d={rungs.map((y) => `M-9 ${y + 2.6} H17`).join(" ")} fill="none" {...ink} strokeWidth="1.4" opacity="0.5" />
    </P>
  );
}

/** Sgabello di legno: seduta spessa a y = -40 (la quota della posa `sit` di <Person>, in unita' persona), gambe divaricate con traversa. */
export function Stool({ color = "yellow", w = 30, ...p }: At & { color?: Fill; w?: number }) {
  return (
    <P p={p}>
      <path d={`M${-w / 2 + 4} -36 L${-w / 2} 0 M${w / 2 - 4} -36 L${w / 2} 0 M${-w / 2 + 2} -14 H${w / 2 - 2}`} fill="none" {...ink} strokeWidth="3.4" />
      <rect x={-w / 2 - 2} y="-41" width={w + 4} height="7" rx="3" fill={C[color]} />
    </P>
  );
}

/** Piantina con il pane di terra (colore `soil`), base in (0, 0): si tiene in mano dal pane di terra. */
export function Seedling({ soil = "orange", leaf = "green", ...p }: At & { soil?: Fill; leaf?: Fill }) {
  return (
    <P p={p}>
      <path d="M0 -4 V-16" fill="none" {...ink} strokeWidth="1.8" />
      <path d="M0 -10 C-9 -10 -12 -18 -11 -21 C-4 -21 0 -16 0 -10 Z M0 -13 C8 -13 12 -22 11 -25 C4 -25 0 -20 0 -13 Z" fill={C[leaf]} />
      <path d="M-6 -5 C-6 -1 -3 1 0 1 C3 1 6 -1 6 -5 Z" fill={C[soil]} />
    </P>
  );
}

/** Annaffiatoio, impugnatura in (0, 0) (sotto le dita della mano vicina), beccuccio in avanti e in basso: la punta e' in (44, 16). */
export const CAN_SPOUT = [44, 16] as const;
export function WateringCan({ color = "yellow" }: { color?: Fill }) {
  return (
    <g>
      <path d="M-6 2 C-6 -6 8 -6 8 2" fill="none" {...ink} strokeWidth="3" />
      <path d="M14 14 L44 16" fill="none" stroke={C[color]} strokeWidth="4.4" strokeLinecap="round" />
      <rect x="40" y="12" width="8" height="8" rx="2.4" fill={C[color]} transform="rotate(20 44 16)" />
      <path d="M-12 4 H14 C15.4 4 16 5 16 6.4 V22 C16 25 14 27 11 27 H-9 C-12 27 -14 25 -14 22 V6.4 C-14 5 -13.4 4 -12 4 Z" fill={C[color]} />
      <path d="M-14 10 H16" fill="none" {...ink} strokeWidth="1.8" />
    </g>
  );
}
