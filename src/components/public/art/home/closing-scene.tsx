/**
 * CHIUSURA scene (HOME-A): one SVG with the drawing's own ratio (900x920), the real logo laid over it as HTML.
 * A live scene like the Home hero (kit <Live>): built once when it comes into view, then small loops of life.
 * Reduced motion / no JS: the still, complete final frame.
 */
import type { CSSProperties } from "react";
import { Live } from "@/components/public/kit/Live";
import { C, INK, Person } from "../parts";
import { Citrus, Crate, LayerSvg, LogoAt, Ridge, yAt, type Pt } from "./geo";

const VB = "-130 -110 900 920";
const SUN = { x: 320, y: 168 };
/** Back hills dip into a valley in the middle, so the logo stands on yellow and white, never on its own green. */
const BACK: Pt[] = [[40, 470], [150, 520], [236, 604], [320, 690], [404, 604], [490, 520], [600, 468]];
const FRONT: Pt[] = [[40, 610], [180, 618], [320, 638], [460, 618], [600, 610]];
const ARCH = "M60 730V300A260 260 0 0 1 580 300V730Z";
const LOGO = { w: 270, h: (270 * 156) / 126, x: 320 - 135, bottom: 690 };
const v = (o: Record<string, string | number>) => o as CSSProperties;

/**
 * Scena: una porta ad arco aperta sull'alba; dentro, la casa (il logo vero, intero) in fondo alla valle; fuori, sulla
 * soglia, chi arriva. Soggetto: la porta aperta con la casa.
 * Intro (una volta): il sole sale, le colline salgono una dopo l'altra, gli aranci spuntano sui crinali, la cassetta e
 * chi saluta compaiono sulla soglia, chi arriva entra da sinistra con la valigia; il logo entra col suo logo-build.
 * Vita: gli aranci ondeggiano, una nuvola verde scorre nell'alba, due uccelli attraversano l'arco, chi è sulla soglia
 * saluta con la mano.
 */
export function ClosingScene() {
  return (
    <Live className="relative aspect-[900/920] w-full">
      <div role="img" aria-label="Una porta ad arco aperta sull'alba: il sole sale sulle colline, la casa de I Locandieri è in fondo alla valle e sulla soglia arriva una persona con la valigia e un'altra la saluta." className="absolute inset-0">
        <LayerSvg viewBox={VB} align="xMidYMid" className="absolute inset-0 block size-full">
          <defs><clipPath id="ic-arch"><path d={ARCH} /></clipPath></defs>
          <path d={ARCH} fill={C.white} />
          <g clipPath="url(#ic-arch)">
            <g className="lv-sun" style={v({ "--lv-y": "120px", "--lv-base": "0.3s" })}><circle cx={SUN.x} cy={SUN.y} r={96} fill={C.orange} /></g>
            <g transform="translate(450 250)"><g className="lv-cloud" style={v({ "--d": 2 })}><path d="M0 0a16 16 0 0 1 22 -16a22 22 0 0 1 40 4a16 16 0 0 1 14 18 Z" fill={C.green} /></g></g>
            <g transform="translate(140 330)">
              <g className="lv-fly" style={v({ "--x0": "-160px", "--x1": "520px", "--y0": "20px", "--y1": "-30px", "--t": 20, "--d": 2.5 })}>
                {[[0, 0], [24, -10]].map(([x, y], i) => (
                  <g key={i} transform={`translate(${x} ${y})`}>
                    <g className="lv-flap" style={v({ "--d": i * 0.17 })}><path d="M-10 0 q5 -6 10 0 q5 -6 10 0" stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
                  </g>
                ))}
              </g>
            </g>
            <g className="lv-rise" style={v({ "--k": 0, "--lv-y": "90px" })}><Ridge pts={BACK} bottom={840} color="green" /></g>
            <g className="lv-rise" style={v({ "--k": 2, "--lv-y": "90px" })}>
              <Ridge pts={FRONT} bottom={840} color="yellow" />
              <path d="M110 676 Q200 668 262 676 M388 676 Q450 668 540 676" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" opacity="0.3" />
            </g>
            {/* two orange trees on the crests, against the sky */}
            <g className="lv-pop" style={v({ "--k": 0, "--lv-base": "0.85s" })}><Citrus x={112} y={yAt(BACK, 112) + 4} s={0.7} className="sway" style={v({ "--d": 0.7 })} /></g>
            <g className="lv-pop" style={v({ "--k": 1, "--lv-base": "0.85s" })}><Citrus x={528} y={yAt(BACK, 528) + 4} s={0.62} className="sway" style={v({ "--d": 2.9 })} /></g>
          </g>
          {/* the two leaves of the door, swung open against the wall: panels in fine ink, iron hinges */}
          <path d="M58 322 Q36 318 14 334 V734 L58 728 Z M582 322 Q604 318 626 334 V734 L582 728 Z" fill={C.orange} />
          <path d="M24 380 L50 374 M24 560 L50 558 M24 700 L50 700 M616 380 L590 374 M616 560 L590 558 M616 700 L590 700" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
          <path d="M54 420 H66 M54 640 H66 M586 420 H574 M586 640 H574" stroke={C.ink} strokeWidth={INK.bold * 1.6} strokeLinecap="round" />
          <rect x="-90" y="722" width="820" height="96" rx="40" fill={C.green} />
          {/* on the threshold: one arrives with a suitcase, one is there to welcome and waves, a crate of the day's oranges */}
          <g className="home-lv-arrive-l"><Person color="green" pose="walk" item="suitcase" itemColor="orange" hair="short" build="broad" outfit="trousers" x={110} y={760} s={1.16} /></g>
          <g className="lv-in" style={v({ "--k": 1, "--lv-base": "1.3s" })}>
            <g className="lv-rock" style={v({ "--t": 0.9, "--d": 2.4 })}><Person color="orange" pose="wave" hair="long" outfit="dress" x={548} y={760} s={1.14} flip /></g>
          </g>
          <g className="lv-pop" style={v({ "--k": 0, "--lv-base": "1.3s" })}><Crate x={320} y={770} s={1.2} /></g>
        </LayerSvg>
        <LogoAt left={((LOGO.x + 130) / 900) * 100} top={((LOGO.bottom - LOGO.h + 110) / 920) * 100} width={(LOGO.w / 900) * 100} />
      </div>
    </Live>
  );
}
