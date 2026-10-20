/**
 * Small living things for the "scene vive" loops of the ABES and Lavora scenes (kit/live.css classes). Each one is
 * placed by an outer <g transform> and animated only on inner groups without a transform attribute.
 * REST position (reduced motion, no JS) = where it is drawn.
 */
import type { CSSProperties } from "react";
import { C, type Fill } from "../parts";

/** Typed CSS custom properties for inline styles. */
export const v = (o: Record<string, string | number>) => o as CSSProperties;

/** A bird crossing the sky: ink "m" wings that beat; flies from x0 to x1 (px = user units of the parent). */
export function Bird({ x, y, s = 1, x0, x1, y0 = 0, y1 = 0, t = 26, d = 0 }: { x: number; y: number; s?: number; x0: number; x1: number; y0?: number; y1?: number; t?: number; d?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lv-fly" style={v({ "--x0": `${x0}px`, "--x1": `${x1}px`, "--y0": `${y0}px`, "--y1": `${y1}px`, "--t": t, "--d": d })}>
        <g transform={`scale(${s})`}>
          <g className="lv-flap" style={v({ "--d": d / 3 })}>
            <path d="M-10 0 C-7 -6 -3 -6 0 0 C3 -6 7 -6 10 0" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </g>
    </g>
  );
}

/** A butterfly wandering back and forth over a patch (wings flutter); `color` must differ from what is behind it. */
export function Butterfly({ x, y, s = 1, dx = 60, dy = -24, t = 7, d = 0, color = "white" }: { x: number; y: number; s?: number; dx?: number; dy?: number; t?: number; d?: number; color?: Fill }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lv-move lv-alt" style={v({ "--x0": "0px", "--y0": "0px", "--x1": `${dx}px`, "--y1": `${dy}px`, "--t": t, "--d": d })}>
        <g transform={`scale(${s})`}>
          <g className="lv-flutter" style={v({ "--d": d / 4 })}>
            <path d="M0 0 C-4 -9 -11 -9 -10 -3 C-9 1 -4 2 0 0 Z M0 0 C4 -9 11 -9 10 -3 C9 1 4 2 0 0 Z M0 0 C-3 3 -7 7 -4 8 C-2 8 -1 4 0 0 Z M0 0 C3 3 7 7 4 8 C2 8 1 4 0 0 Z" fill={C[color]} />
            <path d="M0 -4 V5" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </g>
  );
}

/** Steam or smoke: three puffs rising in turn from (x,y). `r` = puff radius, `rise` = how high they go (user units). */
export function Puffs({ x, y, r = 6, rise = 40, color = "white", d = 0, t = 3.6, spread = 8 }: { x: number; y: number; r?: number; rise?: number; color?: Fill; d?: number; t?: number; spread?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${(i - 1) * spread} 0)`}>
          <circle className="lv-puff" r={r * (1 - i * 0.12)} fill={C[color]} style={v({ "--lv-y": `${rise}px`, "--t": t, "--d": d + (i * t) / 3 })} />
        </g>
      ))}
    </g>
  );
}
