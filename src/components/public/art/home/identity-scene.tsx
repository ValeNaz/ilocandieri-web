/**
 * IDENTITA scene (HOME-A), drawn for a white panel with the drawing's exact ratio (600x680): nothing is cropped and
 * the HTML logo stays registered. A live scene like the Home hero (kit <Live>): the land builds itself once when it
 * comes into view, then small loops of life. Reduced motion / no JS: the still, complete final frame.
 */
import type { CSSProperties } from "react";
import { Live } from "@/components/public/kit/Live";
import { C, INK, Person } from "../parts";
import { Chair, Jug, Table } from "../home-story/parts";
import { Citrus, LogoAt, Ridge, type Pt } from "./geo";

const W = 600, H = 680;
const GROUND: Pt[] = [[-20, 472], [150, 460], [300, 454], [450, 460], [620, 472]];
const LOGO = { w: 224, h: (224 * 156) / 126, cx: 300, base: 458 };
const v = (o: Record<string, string | number>) => o as CSSProperties;
/** Fruit on the crowns that ripen, fall and roll into the grass (tree foot + fruit offset × scale). */
const FALL = [
  { x: 92 - 27 * 0.95, y: 484 - 52 * 0.95, dy: 66, d: 0.4 },
  { x: 510 + 30 * 0.8, y: 478 - 66 * 0.8, dy: 70, d: 3.7 },
];

/** Two birds crossing the empty sky above the house. */
function Birds() {
  return (
    <g transform="translate(150 96)">
      <g className="lv-fly" style={v({ "--x0": "-260px", "--x1": "560px", "--y0": "18px", "--y1": "-14px", "--t": 24, "--d": 1.2 })}>
        {[[0, 0], [26, -12]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <g className="lv-flap" style={v({ "--d": i * 0.15 })}><path d="M-9 0 q4.5 -5 9 0 q4.5 -5 9 0" stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
          </g>
        ))}
      </g>
    </g>
  );
}

/** An orange butterfly turning over the table. */
function Butterfly() {
  return (
    <g transform="translate(470 500)">
      <g className="lv-move lv-alt" style={v({ "--x0": "-60px", "--x1": "36px", "--y0": "10px", "--y1": "-22px", "--t": 5.5, "--d": 0.8 })}>
        <g className="lv-flutter"><path d="M0 0 C-7 -9 -12 -3 -8 2 C-5 5 -2 3 0 0 Z M0 0 C7 -9 12 -3 8 2 C5 5 2 3 0 0 Z" fill={C.orange} /></g>
        <path d="M0 -2 V3" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      </g>
    </g>
  );
}

/** The table laid in front of the house: thick top, plates, a bowl of oranges, a jug (white things keep a fine contour). One object. */
function LaidTable() {
  return (
    <g>
      <Table x1={196} x2={404} top={554} floor={612} color="orange" />
      <ellipse cx="236" cy="551" rx="20" ry="5" fill={C.green} />
      <ellipse cx="364" cy="551" rx="20" ry="5" fill={C.green} />
      <path d="M278 537a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M293 533a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" fill={C.orange} />
      <path d="M287 528.5l1.4 -3M302 524.5l1.4 -3" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
      <path d="M272 538 H320 Q318 554 296 554 Q274 554 272 538 Z" fill={C.green} />
      <Jug x={336} y={554} color="green" />
    </g>
  );
}

/**
 * Scena: la casa (il logo vero, intero) e davanti una tavola apparecchiata: due persone sedute sulle sedie, una terza
 * arriva con una cassetta di arance. Soggetto: la casa fatta di persone.
 * Intro (una volta): il prato sale, i solchi si disegnano, gli aranci spuntano, poi tavola e sedie, chi è seduto, e
 * chi arriva da destra con la cassetta; il logo entra intero col suo logo-build.
 * Vita: gli aranci ondeggiano, due arance maturano e cadono nell'erba, due uccelli attraversano il cielo vuoto,
 * una farfalla gira sopra la tavola.
 */
export function IdentityScene() {
  return (
    <Live className="absolute inset-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 block size-full" role="img" aria-label="La casa de I Locandieri con una tavola apparecchiata davanti: due persone sedute sulle sedie, una terza arriva con una cassetta di arance.">
        <title>Una casa fatta di persone</title>
        <Birds />
        <g className="lv-rise" style={v({ "--k": 0 })}><Ridge pts={GROUND} bottom={H + 80} color="yellow" /></g>
        <path className="lv-draw" pathLength={1} style={v({ "--k": 2 })} d="M40 520 Q110 510 160 514 M440 514 Q500 510 560 520 M60 640 Q180 628 300 630 Q420 628 540 640" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" opacity="0.28" />
        <g className="lv-pop" style={v({ "--k": 0, "--lv-base": "0.85s" })}><Citrus x={92} y={484} s={0.95} className="sway" style={v({ "--d": 1.1 })} /></g>
        <g className="lv-pop" style={v({ "--k": 1, "--lv-base": "0.85s" })}><Citrus x={510} y={478} s={0.8} className="sway" style={v({ "--d": 3.4 })} /></g>
        {FALL.map((f, i) => (
          <g key={i} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)})`}>
            <g className="lv-drop" style={v({ "--dx": `${i ? 6 : -8}px`, "--dy": `${f.dy}px`, "--d": f.d })}><circle r="5.4" fill={C.orange} /></g>
          </g>
        ))}
        {/* two people at the table, on their chairs; a third arrives with the day's crate of oranges */}
        <g className="lv-in" style={v({ "--k": 0, "--lv-base": "1.2s" })}>
          <Chair x={150} y={612} color="orange" />
          <Chair x={446} y={612} s={1.35 * 0.64} color="green" flip />
          <LaidTable />
        </g>
        <g className="lv-in" style={v({ "--k": 1, "--lv-base": "1.3s" })}><Person color="green" pose="sit" hair="short" build="broad" x={150} y={612} s={1} /></g>
        <g className="lv-in" style={v({ "--k": 2, "--lv-base": "1.3s" })}><Person color="orange" pose="sit" kid hair="curly" x={446} y={612} s={1.35} flip /></g>
        <g className="home-lv-arrive-r"><Person color="green" pose="carry" itemColor="orange" hair="bun" outfit="trousers" x={532} y={612} s={0.98} flip /></g>
        <Butterfly />
      </svg>
      <LogoAt left={((LOGO.cx - LOGO.w / 2) / W) * 100} top={((LOGO.base - LOGO.h) / H) * 100} width={(LOGO.w / W) * 100} />
    </Live>
  );
}
