import { Ball, C, INK, Sun } from "../art/parts";

/**
 * Drawn pieces that BREAK THE FRAME of a real photo ("la foto dice che è vero, l'illustrazione dice cosa significa").
 * Same hand as the scenes (parts.tsx): flat logo colours, ink only for details. Purely decorative (aria-hidden).
 * Placement and size live in photo.css (.pf-deco--<name>); each piece is drawn in its own small viewBox.
 */
export type DecoName = "sun" | "branch" | "birds" | "ball" | "leaf" | "arrow" | "circle";

const leaf = (x: number, y: number, a: number, s = 1) => (
  <path key={`${x}-${y}`} d="M0 0 C6 -10 18 -14 30 -12 C24 -2 12 4 0 0 Z" transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} fill={C.green} />
);

function Piece({ name }: { name: DecoName }) {
  switch (name) {
    case "sun":
      return <svg viewBox="-60 -60 120 120"><Sun r={30} rays={10} /></svg>;
    case "branch":
      return (
        <svg viewBox="0 0 200 110">
          <path d="M4 96 C46 84 92 66 132 40 C150 28 166 18 194 12" fill="none" stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" />
          {leaf(40, 86, -40)}{leaf(70, 74, 160, 0.9)}{leaf(96, 62, -60)}{leaf(128, 44, 150)}{leaf(160, 26, -50, 0.85)}
          <circle cx="86" cy="86" r="14" fill={C.orange} /><circle cx="146" cy="58" r="12" fill={C.orange} />
          <path d="M86 72 l2 -6 M146 46 l2 -6" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
        </svg>
      );
    case "birds":
      return (
        <svg viewBox="0 0 120 50">
          <path d="M6 30 q10 -12 20 0 q10 -12 20 0 M64 14 q8 -9 16 0 q8 -9 16 0" fill="none" stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" />
        </svg>
      );
    case "ball":
      return <svg viewBox="-20 -20 40 40"><Ball r={17} /></svg>;
    case "leaf":
      return <svg viewBox="-4 -18 40 26">{leaf(0, 0, 0)}</svg>;
    case "arrow":
      return (
        <svg viewBox="0 0 120 80">
          <path className="pf-draw" pathLength={1} d="M8 70 C30 20 70 10 108 22 M92 10 L110 22 L94 36" fill="none" stroke={C.ink} strokeWidth={INK.bold} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 200 120" preserveAspectRatio="none">
          <path className="pf-draw" pathLength={1} d="M112 8 C60 4 10 22 8 60 C6 98 70 114 120 110 C170 106 196 80 192 52 C188 24 150 10 96 14" fill="none" stroke={C.orange} strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      );
  }
}

export function Deco({ name }: { name: DecoName }) {
  return <span className={`pf-deco pf-deco--${name}`} aria-hidden="true"><Piece name={name} /></span>;
}
