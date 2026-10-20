/**
 * Parti v4 per le scene dell'hub /luoghi e del Campo Polivalente. Regola dei contorni (DESIGN.md, "Illustration
 * language v4"): nessun contorno esterno sulle masse; l'inchiostro solo per ferro, tronchi, capelli/pantaloni e per i
 * dettagli interni (INK.fine / INK.bold). Ogni parte si piazza col suo punto a terra (x, y) e una scala s.
 * Le parti "a misura di persona" (panca, sedia, tavolo, scala) usano le unita' di <Person> (persona = circa 100 alta).
 */
import type { CSSProperties, ReactNode } from "react";
import { C, INK, Placed, type Fill } from "../parts";

type At = { x?: number; y?: number; s?: number; flip?: boolean; className?: string; style?: CSSProperties };
const R = { strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
const fine = (w: number = INK.fine) => ({ stroke: C.ink, strokeWidth: w, ...R });
const disc = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/* ------------------------------------------------------------------ case */

/** Finestra con croce dei vetri, persiane aperte ai lati e davanzale. (cx, top) = centro in alto. */
function Window({ cx, top, w = 22, h = 28, glass, shutter }: { cx: number; top: number; w?: number; h?: number; glass: Fill; shutter: Fill }) {
  const sw = w * 0.42;
  return (
    <g>
      <rect x={cx - w / 2 - sw - 1.5} y={top} width={sw} height={h} rx="1.6" fill={C[shutter]} />
      <rect x={cx + w / 2 + 1.5} y={top} width={sw} height={h} rx="1.6" fill={C[shutter]} />
      <rect x={cx - w / 2} y={top} width={w} height={h} rx="2" fill={C[glass]} />
      <path d={`M${cx} ${top + 1}V${top + h - 1}M${cx - w / 2 + 1} ${top + h * 0.42}H${cx + w / 2 - 1}`} {...fine()} />
      <path d={[0.25, 0.5, 0.75].map((k) => `M${cx - w / 2 - sw + 0.4} ${top + h * k}h${sw - 2.2}M${cx + w / 2 + 3.2} ${top + h * k}h${sw - 2.2}`).join("")} {...fine(1.2)} />
      <path d={`M${cx - w / 2 - 2} ${top + h + 2.2}H${cx + w / 2 + 2}`} {...fine(INK.bold)} />
    </g>
  );
}

/**
 * Casa vera: muri, tetto a falda con sporto e file di coppi, grondaia e pluviale, comignolo, porta con gradino,
 * finestre con persiane; con `floors=2` una fascia marcapiano e un balcone in ferro. Punto a terra = centro della base.
 * Non imita il logo (nessuna figura arancio/gialla con un punto verde dentro).
 */
export function House({ w = 200, h = 110, floors = 1, wall = "white", roof = "orange", shutter = "green", door = "green", glass = "yellow", chimney = "orange", open = false, balcony = false, doorAt = 0.22, windows, ...at }: At & { w?: number; h?: number; floors?: 1 | 2; wall?: Fill; roof?: Fill; shutter?: Fill; door?: Fill; glass?: Fill; chimney?: Fill; open?: boolean; balcony?: boolean; doorAt?: number; windows?: number[] }) {
  const o = 14, rh = Math.max(26, w * 0.16), inset = w * 0.12;
  const L = -w / 2, Rr = w / 2;
  const top = -h, rt = -h - rh;
  const dx = L + w * doorAt, dw = 32, dh = 54;
  const roofD = `M${L - o} ${top + 3} L${L + inset} ${rt} H${Rr - inset} L${Rr + o} ${top + 3} Z`;
  // file di coppi: righe verticali dentro la falda, accorciate lungo i lati obliqui
  const tiles: string[] = [];
  for (let tx = L - o + 9; tx < Rr + o - 6; tx += 11) {
    const k = tx < L + inset ? (tx - (L - o)) / (inset + o) : tx > Rr - inset ? (Rr + o - tx) / (inset + o) : 1;
    const y0 = top + 3 - k * (rh + 3) + 3.5;
    if (top - 1 - y0 > 4) tiles.push(`M${tx.toFixed(1)} ${y0.toFixed(1)}V${top - 1}`);
  }
  const winsGround = windows ?? [0.6, 0.84];
  const upper = floors === 2;
  return (
    <Placed {...at}>
      {/* comignolo, dietro la falda */}
      <rect x={Rr - inset - 34} y={rt - 24} width="17" height="34" rx="2" fill={C[chimney]} />
      <rect x={Rr - inset - 37} y={rt - 28} width="23" height="7" rx="2" fill={C[chimney]} />
      <path d={`M${Rr - inset - 34} ${rt - 20.5}h17`} {...fine()} />
      <rect x={L} y={top} width={w} height={h} rx="3" fill={C[wall]} />
      <path d={roofD} fill={C[roof]} stroke={C[roof]} strokeWidth="4" strokeLinejoin="round" />
      <path d={tiles.join("")} {...fine()} />
      {/* grondaia e pluviale (ferro) */}
      <path d={`M${L - o + 3} ${top + 4}H${Rr + o - 3}M${Rr - 5} ${top + 4}V-4l4 4`} {...fine(INK.bold)} />
      {upper && <path d={`M${L + 2} ${-h / 2 + 2}H${Rr - 8}`} {...fine()} />}
      {/* porta: chiusa (pannelli) o aperta (anta girata, dentro la luce) */}
      {open ? (
        <g>
          <path d={`M${dx} 0 V${-dh + dw / 2} a${dw / 2} ${dw / 2} 0 0 1 ${dw} 0 V0 Z`} fill={C[glass]} />
          <path d={`M${dx + dw} 0 V${-dh + 10} L${dx + dw + 9} ${-dh + 16} V4 Z`} fill={C[door]} stroke={C[door]} strokeWidth="2" strokeLinejoin="round" />
        </g>
      ) : (
        <g>
          <path d={`M${dx} 0 V${-dh + dw / 2} a${dw / 2} ${dw / 2} 0 0 1 ${dw} 0 V0 Z`} fill={C[door]} />
          <path d={`M${dx + dw / 2} ${-dh + 2}V-2M${dx + 5} ${-dh * 0.45}h${dw / 2 - 8}M${dx + dw / 2 + 3} ${-dh * 0.45}h${dw / 2 - 8}`} {...fine()} />
        </g>
      )}
      <path d={`M${dx - 4} ${-dh + dw / 2} a${dw / 2 + 4} ${dw / 2 + 4} 0 0 1 ${dw + 8} 0`} {...fine()} />
      {/* gradino davanti alla porta */}
      <rect x={dx - 7} y="-4" width={dw + 14} height="7" rx="2" fill={C[wall === "white" ? "white" : wall]} />
      <path d={`M${dx - 6} -4H${dx + dw + 6}`} {...fine()} />
      {winsGround.map((k) => <Window key={`g${k}`} cx={L + w * k} top={upper ? -h / 2 + 18 : top + 24} glass={glass} shutter={shutter} />)}
      {upper && (
        <g>
          {balcony ? (
            <g>
              <Window cx={L + w * doorAt + dw / 2} top={-h / 2 - 6 - Math.min(56, h / 2 - 34)} w={24} h={Math.min(56, h / 2 - 34)} glass={glass} shutter={shutter} />
              {/* balcone: soletta e ringhiera in ferro, un vaso con la pianta */}
              <rect x={dx - 16} y={-h / 2 - 6} width={dw + 32} height="6" rx="2" fill={C[wall]} />
              <path d={`M${dx - 14} ${-h / 2 - 6}H${dx + dw + 14}`} {...fine()} />
              <path d={`M${dx - 14} ${-h / 2 - 30}H${dx + dw + 14}`} {...fine(INK.bold)} />
              <path d={Array.from({ length: 9 }, (_, i) => `M${dx - 12 + i * ((dw + 24) / 8)} ${-h / 2 - 29}V${-h / 2 - 7}`).join("")} {...fine(1.4)} />
              <path d={`M${dx + dw + 2} ${-h / 2 - 7} h9 l-1.6 -10 h-5.8 Z`} fill={C.orange} />
              <path d={`M${dx + dw + 6.5} ${-h / 2 - 17} c-7 -3 -8 -11 -3 -14 c1 6 3 9 3 14 c1 -6 4 -10 9 -12 c1 6 -3 10 -9 12 Z`} fill={C.green} />
            </g>
          ) : (
            <Window cx={L + w * doorAt + dw / 2} top={top + 22} glass={glass} shutter={shutter} />
          )}
          {winsGround.map((k) => <Window key={`u${k}`} cx={L + w * k} top={top + 22} glass={glass} shutter={shutter} />)}
        </g>
      )}
    </Placed>
  );
}

/** Casetta per la mappa (piccola, senza contorni): muro, tetto con sporto, porta. Punto a terra = centro della base. */
export function MiniHouse({ w = 40, h = 30, wall = "white", roof = "orange", door = "green", ...at }: At & { w?: number; h?: number; wall?: Fill; roof?: Fill; door?: Fill }) {
  return (
    <Placed {...at}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx="2.5" fill={C[wall]} />
      <path d={`M${-w / 2 - 5} ${-h + 2} L${-w / 2 + 6} ${-h - 13} H${w / 2 - 6} L${w / 2 + 5} ${-h + 2} Z`} fill={C[roof]} stroke={C[roof]} strokeWidth="3" strokeLinejoin="round" />
      <path d={`M${-w / 2 - 3} ${-h + 2.5}H${w / 2 + 3}`} {...fine()} />
      <rect x={-w / 2 + w * 0.2} y={-h * 0.55} width={w * 0.22} height={h * 0.55} rx="1.6" fill={C[door]} />
      <rect x={w * 0.12} y={-h * 0.68} width={w * 0.2} height={h * 0.26} rx="1.2" fill={C.ink} opacity="0.85" />
    </Placed>
  );
}

/* ---------------------------------------------------- muro, pilastri, cancello */

/** Muro di tufo: blocchi a giunti sfalsati (linee interne sottili), copertina in cima. (x, y) = angolo in alto a sinistra del muro. */
export function TuffWall({ x, y, w, h, color = "yellow", row = 24, brick = 52 }: { x: number; y: number; w: number; h: number; color?: Fill; row?: number; brick?: number }) {
  const rows = Math.floor(h / row);
  const d: string[] = [];
  for (let r = 0; r < rows; r++) {
    const ry = y + 14 + r * row;
    if (r > 0) d.push(`M${x} ${ry}H${x + w}`);
    for (let bx = x + (r % 2 ? brick / 2 : brick); bx < x + w - 4; bx += brick) d.push(`M${bx} ${ry + 3}V${ry + row - 3}`);
  }
  return (
    <g>
      <rect x={x} y={y + 6} width={w} height={h - 6} fill={C[color]} />
      <path d={d.join("")} {...fine()} opacity="0.55" />
      <rect x={x - 6} y={y - 6} width={w + 12} height="14" rx="5" fill={C[color]} />
      <path d={`M${x} ${y + 9}H${x + w}`} {...fine(INK.bold)} />
    </g>
  );
}

/** Pilastro in muratura con lastra di coronamento e palla di pietra. (x, y) = centro della base. */
export function Pillar({ x, y, w = 28, h = 170, color = "white", ball = "green" }: { x: number; y: number; w?: number; h?: number; color?: Fill; ball?: Fill }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h - 12} rx="3" fill={C[color]} />
      <rect x={x - w / 2 - 6} y={y - h - 12} width={w + 12} height="14" rx="4" fill={C[color]} />
      <rect x={x - w / 2 - 3} y={y - 12} width={w + 6} height="12" rx="3" fill={C[color]} />
      <path d={`M${x - w / 2 + 2} ${y - h + 4}H${x + w / 2 - 2}M${x - w / 2 + 1} ${y - 12}H${x + w / 2 - 1}`} {...fine()} />
      <circle cx={x} cy={y - h - 12 - w * 0.46} r={w * 0.46} fill={C[ball]} />
    </g>
  );
}

/** Anta di cancello in ferro battuto: telaio, sbarre con le punte a lancia, traverso e una voluta. (x, top) = angolo in alto a sinistra. */
export function GateLeaf({ x, top, w = 64, h = 100, bars = 4, flip = false }: { x: number; top: number; w?: number; h?: number; bars?: number; flip?: boolean }) {
  const step = w / bars;
  const xs = Array.from({ length: bars - 1 }, (_, i) => x + (i + 1) * step);
  const hinge = flip ? x + w : x;
  return (
    <g>
      <path d={`M${x} ${top}H${x + w}V${top + h}H${x}Z M${x} ${top + h * 0.55}H${x + w}`} stroke={C.ink} strokeWidth="5" {...R} />
      <path d={xs.map((bx) => `M${bx} ${top - 12}V${top + h}`).join("")} stroke={C.ink} strokeWidth="4" {...R} />
      <path d={xs.map((bx) => `M${bx - 4} ${top - 9} L${bx} ${top - 17} L${bx + 4} ${top - 9} Z`).join("")} fill={C.ink} stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={`M${hinge} ${top + 14} c${flip ? -14 : 14} 0 ${flip ? -16 : 16} 14 ${flip ? -6 : 6} 18`} stroke={C.ink} strokeWidth="3" {...R} />
    </g>
  );
}

/** Catena (anelli in ferro) lungo una curva da (x1, y1) a (x2, y2) che pende di `sag`. */
export function Chain({ x1, y1, x2, y2, sag = 12, n = 9 }: { x1: number; y1: number; x2: number; y2: number; sag?: number; n?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const cx = x1 + (x2 - x1) * t, cy = y1 + (y2 - y1) * t + sag * 4 * t * (1 - t);
        return <ellipse key={i} cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx={i % 2 ? 2.6 : 4.4} ry={i % 2 ? 4.2 : 2.6} stroke={C.ink} strokeWidth="2.4" fill="none" />;
      })}
    </g>
  );
}

/** Lucchetto: arco in ferro, corpo pieno, buco della chiave. Punto = centro del corpo. */
export function Padlock({ x, y, color = "yellow" }: { x: number; y: number; color?: Fill }) {
  return (
    <g>
      <path d={`M${x - 6} ${y - 6} V${y - 12} a6 6 0 0 1 12 0 V${y - 6}`} stroke={C.ink} strokeWidth="3.4" {...R} />
      <rect x={x - 10} y={y - 7} width="20" height="17" rx="4" fill={C[color]} />
      <path d={`M${x} ${y - 1}v5`} {...fine(INK.bold)} />
    </g>
  );
}

/* ------------------------------------------------ mobili a misura di persona */

/** Panca: seduta spessa con il bordo superiore a y = -40 (dove siede <Person pose="sit">), gambe in ferro. */
export function Bench({ w = 70, color = "white", back = false, ...at }: At & { w?: number; color?: Fill; back?: boolean }) {
  return (
    <Placed {...at}>
      <path d={`M${-w / 2 + 6} -34 V0 M${w / 2 - 6} -34 V0`} stroke={C.ink} strokeWidth="3" {...R} />
      {back && <path d={`M${-w / 2 + 6} -40 V-70`} stroke={C.ink} strokeWidth="3" {...R} />}
      {back && <rect x={-w / 2} y="-74" width={w} height="9" rx="3" fill={C[color]} />}
      <rect x={-w / 2} y="-40" width={w} height="8" rx="3" fill={C[color]} />
      <path d={`M${-w / 2 + 3} -36H${w / 2 - 3}`} {...fine(1.2)} />
    </Placed>
  );
}

/** Sedia vista di lato (schienale verso -x): seduta a y = -40. */
export function Chair({ color = "green", ...at }: At & { color?: Fill }) {
  return (
    <Placed {...at}>
      <path d="M-12 -36 V0 M12 -36 V0 M-12 -40 V-80" stroke={C.ink} strokeWidth="3" {...R} />
      <rect x="-15" y="-80" width="7" height="26" rx="3" fill={C[color]} />
      <rect x="-15" y="-41" width="30" height="7" rx="3" fill={C[color]} />
    </Placed>
  );
}

/** Tavolo: piano spesso con il bordo superiore a y = `top`, gambe in ferro, tovaglia opzionale che ricade. */
export function Table({ w = 120, top = -50, color = "white", cloth, ...at }: At & { w?: number; top?: number; color?: Fill; cloth?: Fill }) {
  return (
    <Placed {...at}>
      <path d={`M${-w / 2 + 8} ${top + 4} V0 M${w / 2 - 8} ${top + 4} V0`} stroke={C.ink} strokeWidth="3.4" {...R} />
      <rect x={-w / 2} y={top} width={w} height="7" rx="3" fill={C[color]} />
      {cloth && <path d={`M${-w / 2 - 2} ${top - 1} H${w / 2 + 2} L${w / 2 + 4} ${top + 16} C${w / 2 - 6} ${top + 19} ${-w / 2 + 6} ${top + 19} ${-w / 2 - 4} ${top + 16} Z`} fill={C[cloth]} stroke={C[cloth]} strokeWidth="2" strokeLinejoin="round" />}
      {cloth && <path d={`M${-w / 4} ${top + 2}v14M0 ${top + 2}v16M${w / 4} ${top + 2}v14`} {...fine(1.2)} opacity="0.6" />}
    </Placed>
  );
}

/** Scala a pioli appoggiata: montanti a x = l e x = r (dove <Person pose="climb"> mette le mani), un piolo ogni 20 unita'. */
export function Ladder({ h = 160, l = -8, r = 16, color = "white", ...at }: At & { h?: number; l?: number; r?: number; color?: Fill }) {
  const rungs = Array.from({ length: Math.floor(h / 20) }, (_, i) => -i * 20 - 2);
  return (
    <Placed {...at}>
      <path d={rungs.map((ry) => `M${l} ${ry}H${r}`).join("")} stroke={C[color]} strokeWidth="3.6" {...R} />
      <path d={`M${l} 2 V${-h} M${r} 2 V${-h}`} stroke={C[color]} strokeWidth="4.6" {...R} />
    </Placed>
  );
}

/* ------------------------------------------------------- oggetti in mano */

/** Atto di assegnazione: foglio bianco (oggetto piccolo bianco: contorno sottile ammesso), righe e timbro. Posato su un piano: punto = centro del bordo basso. */
export function Deed({ x, y, w = 62, color = "orange" }: { x: number; y: number; w?: number; color?: Fill }) {
  const h = 16;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-w / 2} 0 L${-w / 2 + 8} ${-h} H${w / 2 + 6} L${w / 2 - 2} 0 Z`} {...fine(1.6)} fill={C.white} />
      <path d={`M${-w / 2 + 10} -11.5H${w / 2 - 14}M${-w / 2 + 7} -6.5H${w / 2 - 22}`} {...fine(1.4)} />
      <ellipse cx={w / 2 - 12} cy="-5" rx="6.4" ry="3.6" fill={C[color]} />
    </g>
  );
}

/** Chiave antica: anello, canna, ingegno. Disegnata orizzontale con l'anello a sinistra; punto = centro dell'anello. */
export function Key({ color = "green", ...at }: At & { color?: Fill }) {
  return (
    <Placed {...at}>
      <path d={disc(0, 0, 9)} fill={C[color]} />
      <circle r="3.8" fill={C.yellow} />
      <rect x="7" y="-2.6" width="34" height="5.2" rx="2.6" fill={C[color]} />
      <path d="M29 2 h4 v8 h-4 Z M35.4 2 h4 v6 h-4 Z" fill={C[color]} stroke={C[color]} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9.6 -4.4 v8.8" {...fine(1.4)} />
    </Placed>
  );
}

/** Pallone da calcio colorato (per i fondi bianchi, dove il pallone bianco sparirebbe): pentagoni in inchiostro. */
export function Football({ r = 9, color = "orange" }: { r?: number; color?: Fill }) {
  return (
    <g>
      <circle r={r} fill={C[color]} />
      <path d={`M0 ${-r * 0.42} L${r * 0.4} ${-r * 0.13} L${r * 0.25} ${r * 0.34} H${-r * 0.25} L${-r * 0.4} ${-r * 0.13} Z`} fill={C.ink} />
      <path d={`M0 ${-r * 0.42} V${-r * 0.92} M${r * 0.4} ${-r * 0.13} L${r * 0.88} ${-r * 0.3} M${r * 0.25} ${r * 0.34} L${r * 0.55} ${r * 0.76} M${-r * 0.25} ${r * 0.34} L${-r * 0.55} ${r * 0.76} M${-r * 0.4} ${-r * 0.13} L${-r * 0.88} ${-r * 0.3}`} stroke={C.ink} strokeWidth={r * 0.12} {...R} />
    </g>
  );
}

/** Pallone da pallavolo: bianco (contorno sottile ammesso) con le tre cuciture curve. */
export function Volleyball({ r = 13 }: { r?: number }) {
  return (
    <g>
      <circle r={r} fill={C.white} stroke={C.ink} strokeWidth={r * 0.12} />
      <path d={`M${-r * 0.1} ${-r * 0.98} C${r * 0.5} ${-r * 0.4} ${r * 0.45} ${r * 0.35} ${-r * 0.05} ${r * 0.1} M${-r * 0.05} ${r * 0.1} C${-r * 0.5} ${-r * 0.2} ${-r * 0.9} ${-r * 0.1} ${-r * 0.98} ${r * 0.2} M${-r * 0.05} ${r * 0.1} C${r * 0.2} ${r * 0.6} ${r * 0.6} ${r * 0.85} ${r * 0.9} ${r * 0.42}`} stroke={C.ink} strokeWidth={r * 0.1} {...R} />
    </g>
  );
}

/** Sacca a rete con tre palloni, impugnata al cordino in (0, 0). */
export function BallBag({ ball = "white" }: { ball?: Fill }) {
  return (
    <g>
      <path d="M0 0 L-7 12 M0 0 L7 12" stroke={C.ink} strokeWidth="1.8" {...R} />
      <path d={disc(-7, 21, 8) + disc(8, 22, 8) + disc(0, 33, 8.4)} fill={C[ball]} />
      <path d="M-15 18 C-12 40 12 42 16 18 M-13 26 H15 M-10 35 H11 M-6 13 L-2 41 M6 13 L3 41" stroke={C.ink} strokeWidth="1.4" {...R} />
    </g>
  );
}

/** Cartellina dell'allenatore, impugnata in (0, 0). Foglio bianco con contorno sottile, molletta in ferro. */
export function Clipboard() {
  return (
    <g transform="rotate(-8)">
      <rect x="-3" y="-6" width="18" height="24" rx="2.4" fill={C.white} stroke={C.ink} strokeWidth="1.4" />
      <path d="M2 -6.4 h8 M1 3 h10 M1 8 h8 M1 13 h9" stroke={C.ink} strokeWidth="1.4" {...R} />
    </g>
  );
}

/* --------------------------------------------------------------- sport */

/** Cono da allenamento senza contorno: corpo, fascia bianca, base. Punto a terra = centro della base. */
export function Cone({ color = "orange", ...at }: At & { color?: Fill }) {
  return (
    <Placed {...at}>
      <rect x="-15" y="-4" width="30" height="5" rx="2.5" fill={C[color]} />
      <path d="M-11 -3 L-4.4 -29 C-4 -30.4 -3 -31 -1.6 -31 H1.6 C3 -31 4 -30.4 4.4 -29 L11 -3 Z" fill={C[color]} />
      <path d="M-7.6 -14 L-6 -20 H6 L7.6 -14 Z" fill={C.white} />
    </Placed>
  );
}

/** Porta da calcio vista di fronte: rete in inchiostro sottile dietro, pali e traversa bianchi. Punto a terra = centro. */
export function Goal({ w = 120, h = 50, post = "white", ...at }: At & { w?: number; h?: number; post?: Fill }) {
  const cols = Math.round(w / 12);
  return (
    <Placed {...at}>
      <path d={`${Array.from({ length: cols - 1 }, (_, i) => `M${-w / 2 + ((i + 1) * w) / cols} ${-h}V0`).join("")}${[1, 2, 3].map((k) => `M${-w / 2} ${-h + (k * h) / 4}H${w / 2}`).join("")}`} {...fine(1.2)} opacity="0.6" />
      <path d={`M${-w / 2} 0 V${-h} H${w / 2} V0`} stroke={C[post]} strokeWidth="5.5" {...R} />
    </Placed>
  );
}

/** Rete da pallavolo di lato: pali in ferro, maglie sottili, banda bianca in alto. Punto a terra = centro tra i pali. */
export function VolleyNet({ w = 240, h = 64, post = 150, ...at }: At & { w?: number; h?: number; post?: number }) {
  const cols = Math.round(w / 13);
  const yT = -post + 6;
  return (
    <Placed {...at}>
      <path d={`${Array.from({ length: cols - 1 }, (_, i) => `M${-w / 2 + ((i + 1) * w) / cols} ${yT}V${yT + h}`).join("")}${[1, 2, 3, 4].map((k) => `M${-w / 2} ${yT + (k * h) / 5}H${w / 2}`).join("")}M${-w / 2} ${yT + h}H${w / 2}`} {...fine(1.3)} opacity="0.7" />
      <rect x={-w / 2} y={yT - 5} width={w} height="9" rx="3" fill={C.white} />
      <path d={`M${-w / 2} ${-post - 4} V0 M${w / 2} ${-post - 4} V0`} stroke={C.ink} strokeWidth="7" {...R} />
      <path d={`M${-w / 2 - 8} 0 H${-w / 2 + 8} M${w / 2 - 8} 0 H${w / 2 + 8}`} stroke={C.ink} strokeWidth="5" {...R} />
    </Placed>
  );
}

/** Borsa sportiva posata a terra. */
export function SportBag({ color = "green", ...at }: At & { color?: Fill }) {
  return (
    <Placed {...at}>
      <path d="M-8 -18 C-8 -30 8 -30 8 -18" stroke={C.ink} strokeWidth="2.6" {...R} />
      <rect x="-20" y="-20" width="40" height="20" rx="8" fill={C[color]} />
      <path d="M-16 -13 H16" {...fine(1.4)} />
    </Placed>
  );
}

/** Borraccia posata. */
export function Bottle({ color = "orange", ...at }: At & { color?: Fill }) {
  return (
    <Placed {...at}>
      <rect x="-3" y="-25" width="6" height="5" rx="1.6" fill={C.ink} />
      <rect x="-6" y="-21" width="12" height="21" rx="4" fill={C[color]} />
    </Placed>
  );
}

/** Piatto e brocca per la tavola (oggetti piccoli bianchi: contorno sottile). Punto = piano del tavolo. */
export function TableSet({ x, y, plate = "white", jug = "orange" }: { x: number; y: number; plate?: Fill; jug?: Fill }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="-22" cy="-2" rx="11" ry="2.6" fill={C[plate]} />
      <ellipse cx="24" cy="-2" rx="11" ry="2.6" fill={C[plate]} />
      <path d="M-5 0 C-7 -8 -6 -14 -3 -18 H5 C8 -14 9 -8 7 0 Z" fill={C[jug]} />
      <path d="M6 -14 c5 0 6 7 1 9" stroke={C[jug]} strokeWidth="2.4" {...R} />
      <path d="M-3 -18 l-3 -2" stroke={C[jug]} strokeWidth="2.4" {...R} />
    </g>
  );
}

/** Erbacce secche (per un terreno abbandonato): tre steli curvi. */
export function Weeds({ x, y, s = 1, color = "green" }: { x: number; y: number; s?: number; color?: Fill }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M-6 0 Q-9 -10 -14 -16 M0 0 Q1 -14 -2 -26 M6 0 Q9 -9 14 -14 M0 -12 Q5 -16 9 -24" stroke={C[color]} strokeWidth="3" {...R} />;
}

/** Albero secco: tronco e rami spogli in inchiostro (il terreno che nessuno usa). Punto a terra = piede del tronco. */
export function BareTree({ ...at }: At) {
  return (
    <Placed {...at}>
      <path d="M-5 0 C-3 -14 -3 -28 -1 -40 L3 -40 C4 -28 4 -14 6 0 Z" fill={C.ink} />
      <path d="M0 -38 C-4 -50 -12 -56 -20 -62 M-9 -51 C-10 -58 -8 -64 -5 -70 M1 -38 C3 -52 4 -62 2 -76 M2 -56 C8 -60 14 -64 18 -74 M14 -66 C20 -66 24 -68 27 -72" stroke={C.ink} strokeWidth="2.6" {...R} />
    </Placed>
  );
}

/** Albero visto dall'alto per la mappa: chioma lobata con foglie argento (ulivo). */
export function TopOlive({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <path d={disc(x - r * 0.3, y, r * 0.8) + disc(x + r * 0.35, y - r * 0.25, r * 0.75) + disc(x + r * 0.2, y + r * 0.45, r * 0.7)} fill={C.green} />
      <path d={`M${x - r * 0.6} ${y - r * 0.1} q${r * 0.3} ${-r * 0.3} ${r * 0.6} 0 M${x + r * 0.1} ${y + r * 0.4} q${r * 0.3} ${-r * 0.3} ${r * 0.6} 0`} stroke={C.white} strokeWidth="2.6" {...R} />
    </g>
  );
}


/* ------------------------------------------------------ scene vive (kit Live) */

type LvVars = { k?: number; base?: number; d?: number; t?: number; vars?: Record<string, string | number> };
const lvStyle = ({ k, base, d, t, vars }: LvVars) => {
  const o: Record<string, string | number> = { ...vars };
  if (k !== undefined) o["--k"] = k;
  if (base !== undefined) o["--lv-base"] = `${base}s`;
  if (d !== undefined) o["--d"] = d;
  if (t !== undefined) o["--t"] = t;
  return o as CSSProperties;
};

/** Un <g> animato (classi del kit Live o di live-b.css), senza attributo transform: si mette DENTRO un gruppo posizionato. */
export function Lv({ cls, children, ...vv }: LvVars & { cls: string; children: ReactNode }) {
  return <g className={cls} style={lvStyle(vv)}>{children}</g>;
}

/** Posiziona (x, y) e anima il contenuto disegnato al suo punto a terra (0, 0). */
export function LvAt({ x, y, cls, children, ...vv }: LvVars & { x: number; y: number; cls: string; children: ReactNode }) {
  return <g transform={`translate(${x} ${y})`}><g className={cls} style={lvStyle(vv)}>{children}</g></g>;
}

/** Uccello in volo (due ali in inchiostro che battono); va messo dentro un gruppo .lv-fly. */
export function Bird({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <g className="lv-flap">
        <path d="M-12 -2 C-8 -8 -3 -7 0 0 C3 -7 8 -8 12 -2" stroke={C.ink} strokeWidth="2.6" {...R} />
      </g>
    </g>
  );
}

/** Farfalla arancio (ali che sbattono). */
export function Butterfly({ color = "orange" }: { color?: Fill }) {
  return (
    <g className="lv-flutter">
      <path d="M0 0 C-10 -12 -16 -2 -8 2 C-14 6 -8 12 0 2 C8 12 14 6 8 2 C16 -2 10 -12 0 0 Z" fill={C[color]} />
      <path d="M0 -5 V5" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}
