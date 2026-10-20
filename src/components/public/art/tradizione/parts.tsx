/**
 * Parti SVG della pagina Tradizione, linguaggio v4 (DESIGN.md "Illustration language"): masse piatte SENZA contorno
 * esterno; --c-ink solo per le cose scure (ferro, rami, reste) e per i dettagli interni (scanalature, giunti, tagli,
 * nervature) a due pesi. Angoli tondi, curve per le cose vive, rette per le costruite. Punto di appoggio (0,0) al suolo.
 * Ogni parte è un oggetto solo: <Placed> tiene la posizione sul gruppo esterno e l'animazione su quello interno.
 */
import type { CSSProperties, ReactNode } from "react";
import { C, INK, Placed, type Fill } from "../parts";

export type At = { x?: number; y?: number; s?: number; className?: string; style?: CSSProperties; flip?: boolean };
/** Ritardo (--d, in secondi) e durata (--t) di un'animazione ambientale, per sfasare i vicini. */
export const dl = (d: number, t?: number) => ({ "--d": d, ...(t ? { "--t": `${t}s` } : {}) }) as CSSProperties;

const n = (v: number) => Number(v.toFixed(1));
const R = { strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
/** Bordo dello stesso colore del riempimento: arrotonda gli spigoli senza disegnare un contorno. */
const soft = (f: Fill, w = 3) => ({ fill: C[f], stroke: C[f], strokeWidth: w, strokeLinejoin: "round" as const });
const fine = { stroke: C.ink, strokeWidth: INK.fine, ...R };
const bold = { stroke: C.ink, strokeWidth: INK.bold, ...R };

/**
 * Colonna dorica: fusto con entasi, echino a cuscino, abaco. Con `draw` (stile con --k/--lv-base) le scanalature (ink) si
 * disegnano nell'intro di <Live> (.lv-draw); senza JS o con movimento ridotto restano disegnate.
 */
export function Colonna({ h = 160, w = 34, color = "yellow", draw, ...a }: At & { h?: number; w?: number; color?: Fill; draw?: CSSProperties }) {
  const top = -h + 22, bw = w / 2, tw = w * 0.4;
  const flute = draw ? ({ className: "lv-draw", pathLength: 1, style: draw } as const) : {};
  return (
    <Placed {...a}>
      <path d={`M${n(-bw)} 0Q${n(-bw * 1.06)} ${n(top / 2)} ${n(-tw)} ${top}H${n(tw)}Q${n(bw * 1.06)} ${n(top / 2)} ${n(bw)} 0Z`} {...soft(color, 2.5)} />
      <path d={`M${n(-tw)} ${top + 1}Q${n(-w * 0.74)} ${top} ${n(-w * 0.7)} ${top - 11}H${n(w * 0.7)}Q${n(w * 0.74)} ${top} ${n(tw)} ${top + 1}Z`} {...soft(color, 2.5)} />
      <rect x={n(-w * 0.78)} y={-h} width={n(w * 1.56)} height="12" rx="3" fill={C[color]} />
      <path d={`M${n(-w * 0.72)} ${top - 11}H${n(w * 0.72)}M${n(-tw)} ${top + 5}H${n(tw)}`} {...fine} />
      {[-0.28, -0.09, 0.1, 0.28].map((k) => (
        <path key={k} d={`M${n(k * w)} -5Q${n(k * w * 1.05)} ${n(top / 2)} ${n(k * w * 0.8)} ${top + 10}`} {...fine} opacity="0.6" {...flute} />
      ))}
    </Placed>
  );
}

/**
 * Tempio dorico di Selinunte: crepidoma a tre gradini, colonne, architrave, fregio con triglifi, cornice e frontone.
 * Con `live` si costruisce nell'intro di <Live>: sale il basamento, crescono le colonne una dopo l'altra, poi si posa la trabeazione.
 */
export function Tempio({ cols = 6, colH = 150, gap = 74, color = "yellow", live, ...a }: At & { cols?: number; colH?: number; gap?: number; color?: Fill; live?: boolean }) {
  const span = (cols - 1) * gap, hw = span / 2 + 40;
  const base = -27, yt = base - colH;
  const tri = Array.from({ length: cols * 2 - 1 }, (_, i) => -span / 2 + (i * gap) / 2);
  return (
    <Placed {...a}>
      {/* crepidoma: tre gradini, i giunti sono linee interne */}
      <g className={live ? "lv-rise" : undefined} style={live ? ({ "--lv-y": "30px", "--k": 2 } as CSSProperties) : undefined}>
      <rect x={-hw - 18} y="-10" width={hw * 2 + 36} height="10" rx="3" fill={C[color]} />
      <rect x={-hw - 9} y="-19" width={hw * 2 + 18} height="10" rx="3" fill={C[color]} />
      <rect x={-hw} y="-28" width={hw * 2} height="10" rx="3" fill={C[color]} />
      <path d={`M${-hw - 9} -9.5H${hw + 9}M${-hw} -18.5H${hw}M${-hw * 0.5} -9.5v9M${hw * 0.3} -9.5v9M${-hw * 0.15} -18.5v9M${hw * 0.62} -18.5v9`} {...fine} opacity="0.7" />
      </g>
      {Array.from({ length: cols }, (_, i) => <Colonna key={i} x={-span / 2 + i * gap} y={base} h={colH} w={30} color={color} className={live ? "lv-pop" : undefined} style={live ? ({ "--k": i, "--lv-base": "0.55s" } as CSSProperties) : undefined} />)}
      {/* architrave, fregio bianco con triglifi, cornice */}
      <g className={live ? "lv-rise" : undefined} style={live ? ({ "--lv-y": "-40px", "--k": 0, "--lv-base": "1.35s" } as CSSProperties) : undefined}>
      <rect x={-hw} y={yt - 18} width={hw * 2} height="19" rx="3" fill={C[color]} />
      <path d={`M${-hw + 2} ${yt + 0.5}H${hw - 2}`} {...fine} />
      <rect x={-hw} y={yt - 38} width={hw * 2} height="20" rx="2" fill={C.white} />
      {tri.map((x) => (
        <g key={x}>
          <rect x={x - 6} y={yt - 38} width="12" height="20" rx="2" fill={C[color]} />
          <path d={`M${x - 2} ${yt - 34}v12M${x + 2} ${yt - 34}v12`} {...fine} />
        </g>
      ))}
      <rect x={-hw - 8} y={yt - 46} width={hw * 2 + 16} height="9" rx="3" fill={C[color]} />
      <path d={`M${-hw - 6} ${yt - 48}H${hw + 6}L0 ${yt - 96}Z`} {...soft(color, 5)} />
      <path d={`M${-hw * 0.72} ${yt - 53}H${hw * 0.72}L0 ${yt - 85}Z`} {...soft("white", 3)} />
      <path d={`M${-hw - 6} ${yt - 46.5}H${hw + 6}`} {...fine} />
      </g>
    </Placed>
  );
}

/** Spiga grande di Tumminia: chicchi pieni (arancio: la Tumminia è scura) con la piega, reste lunghe e scure (ink), stelo e due foglie verdi. */
export function Spiga({ h = 420, pairs = 9, grain = "white", ...a }: At & { h?: number; pairs?: number; grain?: Fill }) {
  const step = (h * 0.6) / pairs;
  const kids: ReactNode[] = [];
  for (let i = 0; i < pairs; i++) {
    const y = -h * 0.38 - i * step, k = 1 - i * 0.045;
    for (const sd of [-1, 1]) {
      const x = n(sd * 14 * k), cy = n(y - (sd > 0 ? step * 0.45 : 0));
      kids.push(
        <g key={`${i}${sd}`}>
          <path d={`M${x} ${n(cy - 12)}C${n(x + sd * 12)} ${n(cy - 50)} ${n(x + sd * 22)} ${n(cy - 82)} ${n(x + sd * 34)} ${n(cy - 108)}`} {...fine} strokeWidth="2.2" />
          <g transform={`rotate(${sd * 22} ${x} ${cy})`}>
            <ellipse cx={x} cy={cy} rx={n(13 * k)} ry={n(22 * k)} fill={C[grain]} />
            <path d={`M${x} ${n(cy - 13 * k)}Q${n(x + sd * 3)} ${cy} ${x} ${n(cy + 13 * k)}`} {...fine} opacity="0.55" />
          </g>
        </g>,
      );
    }
  }
  return (
    <Placed {...a}>
      <path d={`M0 0Q4 ${n(-h * 0.2)} 0 ${n(-h * 0.42)}`} stroke={C.green} strokeWidth="9" {...R} />
      <path d={`M0 ${n(-h * 0.1)}C-60 ${n(-h * 0.12)} -86 ${n(-h * 0.28)} -96 ${n(-h * 0.38)}C-50 ${n(-h * 0.32)} -8 ${n(-h * 0.24)} 0 ${n(-h * 0.1)}Z`} {...soft("green", 2)} />
      <path d={`M2 ${n(-h * 0.2)}C50 ${n(-h * 0.22)} 70 ${n(-h * 0.34)} 78 ${n(-h * 0.42)}C40 ${n(-h * 0.38)} 8 ${n(-h * 0.32)} 2 ${n(-h * 0.2)}Z`} {...soft("green", 2)} />
      {kids}
      <ellipse cx="0" cy={n(-h * 0.38 - pairs * step - 4)} rx="11" ry="21" fill={C[grain]} />
      <path d={`M0 ${n(-h * 0.38 - pairs * step - 24)}V${n(-h * 0.38 - pairs * step - 120)}`} {...fine} strokeWidth="2.2" />
    </Placed>
  );
}

/** Spighe piccole di un campo (fila): stelo verde, chicchi, reste ink. Base in (0,0). */
export function Spighetta({ h = 70, grain = "white", lean = 0 }: { h?: number; grain?: Fill; lean?: number }) {
  const top = -h, ear = h * 0.32;
  return (
    <g transform={lean ? `rotate(${lean})` : undefined}>
      <path d={`M0 0Q1.5 ${n(-h / 2)} 0 ${n(top + ear)}`} stroke={C.green} strokeWidth="2.6" {...R} />
      <path d={`M0 ${n(top + ear * 0.2)}C-6 ${n(top + ear * 0.1)} -6 ${n(top + ear)} 0 ${n(top + ear + 3)}C6 ${n(top + ear)} 6 ${n(top + ear * 0.1)} 0 ${n(top + ear * 0.2)}Z`} fill={C[grain]} />
      <path d={`M0 ${n(top + ear * 0.25)}V${n(top - ear * 0.7)}M-3 ${n(top + ear * 0.4)}L-7 ${n(top - ear * 0.4)}M3 ${n(top + ear * 0.4)}L7 ${n(top - ear * 0.4)}`} {...fine} strokeWidth="1.3" />
    </g>
  );
}

/**
 * Covone tenuto in mano (oggetto `hold` di <Person>): presa sul nastro in (0,0), steli in basso, spighe in alto.
 * Un fascio pieno (nessun contorno), linee ink per gli steli e le reste, legaccio verde sotto le dita.
 */
export function Covone({ ears = "yellow", stems = "yellow", tie = "green", size = 1, tilt = 10 }: { ears?: Fill; stems?: Fill; tie?: Fill; size?: number; tilt?: number }) {
  const heads: [number, number, number][] = [[-8.5, -31, -20], [-4, -34.5, -8], [1, -36, 3], [5.8, -34, 13], [9.6, -30, 24]];
  return (
    <g transform={`translate(${tilt > 20 ? 4 : 0} 4) rotate(${tilt}) scale(${size})`}>
      <path d="M-7 25C-5 15 -3 6 -3 0C-3 -8 -8 -18 -10 -26H10C8 -18 3 -8 3 0C3 6 5 15 7 25Z" {...soft(stems, 2)} />
      <path d="M-4 23L-1.5 4M0 24V4M4 23L1.5 4M-5.5 -22L-1.5 -5M5.5 -22L1.5 -5" {...fine} strokeWidth="1.1" opacity="0.7" />
      {heads.map(([x, y, r]) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 -6V-15" {...fine} strokeWidth="1.1" />
          <ellipse rx="2.8" ry="7.2" fill={C[ears]} />
          <path d="M0 -5V5" {...fine} strokeWidth="0.9" opacity="0.6" />
        </g>
      ))}
      <rect x="-5" y="-3.4" width="10" height="6.8" rx="2.4" fill={C[tie]} />
    </g>
  );
}

/** Falcetto (oggetto `hold`): manico arancio sotto la mano, lama di ferro (ink) a mezzaluna. */
export function Falcetto() {
  return (
    <g transform="rotate(-30)">
      <rect x="-2.6" y="-3" width="5.2" height="12" rx="2.4" fill={C.orange} />
      <path d="M0 9C1 15 8 20 15 18C20 16.5 22 11 19 7C18 11 14 13.5 10 13C5 12.5 2 10 1 7Z" fill={C.ink} />
    </g>
  );
}

/** Foglia d'ulivo lanceolata, piena, con la nervatura chiara. Base in (0,0), punta verso +x. */
export function Foglia({ len = 70, fill = "green" }: { len?: number; fill?: Fill }) {
  const w = len * 0.16;
  return (
    <>
      <path d={`M0 0C${n(len * 0.2)} ${n(-w * 1.5)} ${n(len * 0.7)} ${n(-w * 1.3)} ${len} 0C${n(len * 0.7)} ${n(w * 1.3)} ${n(len * 0.2)} ${n(w * 1.5)} 0 0Z`} {...soft(fill, 1.5)} />
      <path d={`M4 0Q${n(len * 0.5)} ${n(-w * 0.2)} ${n(len * 0.86)} 0`} stroke={fill === "white" ? C.ink : C.white} strokeWidth={INK.fine} {...R} opacity="0.85" />
    </>
  );
}

/** Oliva Nocellara appesa: picciolo ink sottile, frutto pieno verde, senza riflessi. (0,0) = centro del frutto. */
export function Oliva({ rx = 24, ry = 32 }: { rx?: number; ry?: number }) {
  return (
    <>
      <path d={`M1 ${-ry + 3}Q-3 ${-ry - 10} 3 ${-ry - 24}`} {...bold} />
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill={C.green} />
      <circle cx={n(rx * 0.1)} cy={n(ry * 0.92)} r="2" fill={C.ink} opacity="0.6" />
    </>
  );
}

/** Spicchio d'arancia: settore pieno con gli angoli tondi e una vena chiara. */
export function Spicchio({ r, from, to, fill = "orange", inner = 0 }: { r: number; from: number; to: number; fill?: Fill; inner?: number }) {
  const p = (a: number, rr: number) => `${n(Math.cos((a * Math.PI) / 180) * rr)} ${n(Math.sin((a * Math.PI) / 180) * rr)}`;
  const mid = (from + to) / 2;
  return (
    <>
      <path d={`M${p(from, inner)}L${p(from, r)}A${r} ${r} 0 0 1 ${p(to, r)}L${p(to, inner)}Z`} {...soft(fill, 3)} />
      <path d={`M${p(mid, inner + r * 0.25)}L${p(mid, r * 0.74)}`} stroke={C.white} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

/** Bottiglia d'olio: vetro giallo pieno, tappo arancio, anello del collo, etichetta bianca con oliva e righe di testo. */
export function Bottiglia({ cap = "orange", ...a }: At & { cap?: Fill }) {
  return (
    <Placed {...a}>
      <rect x="-10" y="-152" width="20" height="16" rx="4" fill={C[cap]} />
      <path d="M-9 -138H9V-112C9 -101 34 -98 34 -72V-8A8 8 0 0 1 26 0H-26A8 8 0 0 1 -34 -8V-72C-34 -98 -9 -101 -9 -112Z" fill={C.yellow} />
      <path d="M-10 -126H10M-10 -121H10" {...fine} />
      <rect x="-25" y="-66" width="50" height="44" rx="5" fill={C.white} />
      <path d="M-2 -57C7 -62 15 -59 17 -54C9 -50 2 -52 -2 -57Z" fill={C.green} />
      <ellipse cx="-6" cy="-47" rx="7" ry="9.5" fill={C.green} />
      <path d="M-16 -32H16M-12 -27H12" {...fine} />
    </Placed>
  );
}

/** Piattino bianco con olive verdi: oggetto bianco da mano, quindi con il contorno ink fine (eccezione della regola). */
export function Piattino({ w = 66, ...a }: At & { w?: number }) {
  return (
    <Placed {...a}>
      {[[-0.42, -10], [0, -12], [0.42, -10], [-0.2, -18], [0.22, -19]].map(([k, y], i) => <ellipse key={i} cx={n(k! * w)} cy={n((y! * w) / 66)} rx={n(w * 0.18)} ry={n(w * 0.144)} fill={C.green} />)}
      <path d={`M${-w} ${n(-w / 8)}Q${n(-w * 0.9)} ${n(w / 16)} ${n(-w * 0.6)} ${n(w / 16)}H${n(w * 0.6)}Q${n(w * 0.9)} ${n(w / 16)} ${w} ${n(-w / 8)}Z`} {...fine} fill={C.white} />
    </Placed>
  );
}

/** Casolare di fine Settecento (lontano): muri bianchi, tetto di coppi con gronda, comignolo, finestre con persiane, porta con gradino. ~130 x 100. */
export function Casolare(a: At) {
  const win = (x: number, y: number, k: number) => (
    <g key={`${x}${y}`}>
      <rect x={x - 6} y={y} width="12" height="16" rx="1.5" fill={C.ink} />
      <path d={`M${x} ${y + 1}v14M${x - 5} ${y + 7}h10`} stroke={C.white} strokeWidth="1.4" strokeLinecap="round" />
      <rect x={x - 11} y={y} width="4.5" height="16" rx="1" fill={C.green} />
      {k > 0 && <rect x={x + 6.5} y={y} width="4.5" height="16" rx="1" fill={C.green} />}
    </g>
  );
  return (
    <Placed {...a}>
      <rect x="44" y="-104" width="11" height="24" rx="2" fill={C.orange} />
      <rect x="42" y="-107" width="15" height="5" rx="2" fill={C.orange} />
      <path d="M44.5 -102.5H54.5" {...fine} />
      <path d="M-74 -70H74L60 -94H-60Z" {...soft("orange", 4)} />
      <path d="M-68 -78H68M-63 -86H63" {...fine} opacity="0.6" />
      <rect x="-66" y="-70" width="132" height="70" rx="3" fill={C.white} />
      <path d="M-72 -69H72" {...bold} />
      <path d="M68 -69V-6" {...fine} />
      {[-38, 0, 38].map((x) => win(x, -60, 1))}
      {win(-38, -32, 1)}
      {win(38, -32, 1)}
      <path d="M-11 -6V-30C-11 -36 -6 -40 0 -40S11 -36 11 -30V-6Z" fill={C.green} />
      <path d="M0 -38V-6" {...fine} />
      <rect x="-16" y="-7" width="32" height="7" rx="2" fill={C.white} />
      <path d="M-15 -6.5H15" {...fine} />
    </Placed>
  );
}

/** Sedia impagliata vista di lato: la seduta (alta 40 unità persona) è dove si siede <Person pose="sit"> alla stessa x/scala. */
export function Sedia({ color = "white", ...a }: At & { color?: Fill }) {
  return (
    <Placed {...a}>
      <rect x="-15" y="-84" width="5" height="84" rx="2.5" fill={C[color]} />
      <rect x="15" y="-38" width="5" height="38" rx="2.5" fill={C[color]} />
      <rect x="-17" y="-41" width="40" height="6" rx="2.5" fill={C[color]} />
      <path d="M-14 -72H-11M-14 -62H-11" {...fine} />
      <path d="M-12 -38.5H20" {...fine} opacity="0.7" />
      <rect x="-13" y="-16" width="31" height="3.5" rx="1.75" fill={C[color]} />
    </Placed>
  );
}

/** Barattolo ABES piccolo: vetro bianco con il contenuto, fascia del coperchio, etichetta. Bianco da mano: contorno fine. */
export function Barattolo({ fill = "orange", label = "green", ...a }: At & { fill?: Fill; label?: Fill }) {
  return (
    <Placed {...a}>
      <path d="M-13 -40H13V-4A4 4 0 0 1 9 0H-9A4 4 0 0 1 -13 -4Z" {...fine} fill={C.white} />
      <path d="M-10 -31H10V-6A3 3 0 0 1 7 -3H-7A3 3 0 0 1 -10 -6Z" fill={C[fill]} />
      <rect x="-15" y="-48" width="30" height="9" rx="3" fill={C.yellow} />
      <path d="M-15 -43.5H15" {...fine} opacity="0.7" />
      <rect x="-11" y="-25" width="22" height="13" rx="2" fill={C[label]} />
      <path d="M-6 -18.5H6" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" />
    </Placed>
  );
}
