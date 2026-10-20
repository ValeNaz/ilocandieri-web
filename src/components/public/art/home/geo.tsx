/**
 * Shared geometry for the Home scenes (HOME-A): smooth ridges, trees, crates, the real logo placed over a scene.
 * Same style law as DESIGN.md: flat shapes, logo palette, ink only for fine detail. Every object is ONE group placed
 * with <Placed> (outer transform, inner animation class), so nothing ever comes apart or jumps while it moves.
 */
import type { CSSProperties, ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { C, OliveTree, OrangeTree, Placed, type Fill } from "../parts";

export type Pt = [number, number];

/** Smooth closed ridge (Catmull-Rom to cubic Bezier), filled down to `bottom`. */
export function ridgePath(pts: Pt[], bottom: number): string {
  const p = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))]!;
  let d = `M${pts[0]![0]} ${bottom} L${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return `${d} L${pts[pts.length - 1]![0]} ${bottom} Z`;
}

export function Ridge({ pts, bottom = 900, color, className }: { pts: Pt[]; bottom?: number; color: Fill; className?: string }) {
  return <path className={className} d={ridgePath(pts, bottom)} fill={C[color]} />;
}

/** Height of a polyline ridge at x (linear, good enough to seat trees on a crest). */
export function yAt(pts: Pt[], x: number): number {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!, b = pts[i + 1]!;
    if (x >= a[0] && x <= b[0]) return a[1] + ((x - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
  }
  return pts[pts.length - 1]![1];
}

/** SVG root of a scene layer: same viewBox for every layer so they stay registered. */
export function LayerSvg({ viewBox, align = "xMaxYMax", children, className, style }: { viewBox: string; align?: string; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox={viewBox} preserveAspectRatio={`${align} slice`} className={className ?? "block h-full w-full"} style={style} aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const ball = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/** Citrus tree: the shared OrangeTree (one drawing for the whole site), kept under this name for the Home scenes. */
export function Citrus({ x, y, s = 1, crown = "green", fruit = "orange", className, style }: { x: number; y: number; s?: number; crown?: Fill; fruit?: Fill; className?: string; style?: CSSProperties }) {
  return <OrangeTree x={x} y={y} s={s} crown={crown} fruit={fruit} className={className} style={style} />;
}

/** Small olive: the shared OliveTree. */
export function Olive({ x, y, s = 1, color = "green" }: { x: number; y: number; s?: number; color?: Fill }) {
  return <OliveTree x={x} y={y} s={s} color={color} />;
}

/**
 * Fruit crate heaped with oranges, ground point at bottom centre. Same drawing language as the crate people carry:
 * no outline, ink only for the slat gaps, the end posts and the stalks.
 */
export function Crate({ x = 0, y = 0, s = 1, w = 56, fruit = true, color = "yellow", className, style }: { x?: number; y?: number; s?: number; w?: number; fruit?: boolean; color?: Fill; className?: string; style?: CSSProperties }) {
  const h = 24;
  const heap: Pt[] = [[-w / 2 + 14, -h + 1], [-w / 2 + 31, -h - 2], [w / 2 - 12, -h + 2]];
  return (
    <Placed x={x} y={y} s={s} className={className} style={style}>
      {fruit && <path d={heap.map(([cx, cy], i) => ball(cx, cy, 9 + (i % 2))).join("")} fill={C[color === "orange" ? "yellow" : "orange"]} />}
      {fruit && <path d={heap.map(([cx, cy], i) => `M${cx + 1} ${cy - 9 - (i % 2)}l2 -3`).join("")} stroke={C.ink} strokeWidth="2" strokeLinecap="round" />}
      <rect x={-w / 2} y={-h} width={w} height={h} rx="3.5" fill={C[color]} />
      <path d={`M${-w / 2 + 8} ${-h + 8}H${w / 2 - 8}M${-w / 2 + 8} ${-h + 16}H${w / 2 - 8}M${-w / 2 + 6} ${-h + 4}V-4M${w / 2 - 6} ${-h + 4}V-4`} stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
    </Placed>
  );
}

/** Sun disc with thick round rays (numbers rounded so server and client markup match). */
export function SunRays({ cx, cy, r, rays = 24, color = "yellow", className, style }: { cx: number; cy: number; r: number; rays?: number; color?: Fill; className?: string; style?: CSSProperties }) {
  const n = (v: number) => v.toFixed(1);
  return (
    <g className={className} style={style}>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const [c, sn] = [Math.cos(a), Math.sin(a)];
        return <line key={i} x1={n(cx + c * r * 1.2)} y1={n(cy + sn * r * 1.2)} x2={n(cx + c * r * (i % 2 ? 1.5 : 1.7))} y2={n(cy + sn * r * (i % 2 ? 1.5 : 1.7))} stroke={C[color]} strokeWidth={n(r * 0.14)} strokeLinecap="round" />;
      })}
      <circle cx={cx} cy={cy} r={r} fill={C[color]} />
    </g>
  );
}

/**
 * The real logo (LogoMark, whole, flat, uniform scale) placed by percentages of its scene box. It is an HTML-level <svg>
 * laid over the scene SVG, never inside a tilted layer. It enters only with .logo-build (`build`) or .logo-build-view.
 */
export function LogoAt({ left, top, width, build = "view" }: { left: number; top: number; width: number; build?: boolean | "view" }) {
  return (
    <div className="absolute" style={{ left: `${left}%`, top: `${top}%`, width: `${width}%` }}>
      <LogoMark build={build} className="block h-auto w-full" />
    </div>
  );
}
