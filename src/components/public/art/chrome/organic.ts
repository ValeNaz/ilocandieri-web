/**
 * Geometry of the organic header. Paths are built from the MEASURED size of the bar (and of where its logo, links and
 * CTA actually sit) and of each panel, via ResizeObserver: the end radii and the curves keep their size at any width,
 * only the straight runs stretch. All the outlines are cubic Béziers with matching tangents at every joint.
 * Coordinates are px, origin at the top-left of the element the path is drawn in.
 */

type P = [number, number];
const f = (n: number) => Math.round(n * 100) / 100;
const K = 0.552; // quarter circle

/** Smooth run through points with horizontal tangents at each one (gentle swells, never a kink). */
function run(points: P[]) {
  let d = "";
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]!;
    const [x1, y1] = points[i]!;
    const k = (x1 - x0) * 0.42;
    d += ` C${f(x0 + k)} ${f(y0)} ${f(x1 - k)} ${f(y1)} ${f(x1)} ${f(y1)}`;
  }
  return d;
}

/** Desktop bar levels (px). The two ends (logo, CTA) stand a little higher than the links part between them. */
export const BAR = { H: 104, navTop: 22, endTop: 10 } as const;
/** Width of the step between an end part and the links part (the same curve on both sides, mirrored). */
const STEP = 120;

/**
 * The full desktop silhouette, symmetric. Both ends are the same big round cap (y 10..104); the top edge steps down
 * ~12px from each end part into the links part with ONE identical soft curve (mirrored), and runs almost level over the
 * links. The bottom edge is level and clean all along, so panels can grow from it anywhere under the links.
 * `m` = where the logo ends and where the CTA starts (px from the bar's left edge); the steps sit 6px off them.
 */
export function barPathDesktop(w: number, m: { logoRight: number; ctaLeft: number }) {
  const { H, navTop: D, endTop: T } = BAR;
  const r = (H - T) / 2, k = K * r;
  const xa = Math.max(m.logoRight + 6, r + 4), xb = xa + STEP;
  const xd = Math.min(m.ctaLeft - 6, w - r - 4), xc = Math.max(xb + 40, xd - STEP);
  const step = (x0: number, y0: number, x1: number, y1: number) =>
    ` C${f(x0 + (x1 - x0) * 0.45)} ${y0} ${f(x1 - (x1 - x0) * 0.45)} ${y1} ${f(x1)} ${y1}`;
  return (
    `M0 ${f(T + r)} C0 ${f(T + r - k)} ${f(r - k)} ${T} ${f(r)} ${T}` +
    ` L${f(xa)} ${T}` +
    step(xa, T, xb, D) +
    run([[xb, D], [f((xb + xc) / 2), D + 0.8], [xc, D]]) +
    step(xc, D, xd, T) +
    ` L${f(w - r)} ${T}` +
    ` C${f(w - r + k)} ${T} ${f(w)} ${f(T + r - k)} ${f(w)} ${f(T + r)}` +
    ` C${f(w)} ${f(T + r + k)} ${f(w - r + k)} ${H} ${f(w - r)} ${H}` +
    ` L${f(r)} ${H}` +
    ` C${f(r - k)} ${H} 0 ${f(T + r + k)} 0 ${f(T + r)} Z`
  );
}

/** Compact bar (tablet / phone): a soft capsule with only a hint of hand, no level changes. */
export function barPathCompact(w: number, h: number) {
  const r = h / 2, k = K * r;
  const top: P[] = [[r + 4, -1.4], [Math.max(r + 40, w * 0.45), 0.6], [w - r, 0]];
  const bottom: P[] = [[w - r, h], [Math.max(r + 30, w * 0.4), h + 1.2], [r + 4, h - 0.4]];
  return (
    `M0 ${f(h * 0.52)} C0 ${f(h * 0.2)} ${f(r * 0.45)} -1.4 ${f(r + 4)} -1.4` +
    run(top) +
    ` C${f(w - r + k)} 0 ${f(w)} ${f(r - k)} ${f(w)} ${f(r)}` +
    ` C${f(w)} ${f(r + k)} ${f(w - r + k)} ${f(h)} ${f(w - r)} ${f(h)}` +
    run(bottom) +
    ` C${f(r * 0.4)} ${f(h - 0.4)} 0 ${f(h * 0.84)} 0 ${f(h * 0.52)} Z`
  );
}

/** Panel geometry: the cusp's height, and how far the panel starts left of its trigger (CSS .hdr-panel uses both). */
export const PANEL = { cusp: 14, lead: 28 } as const;

/**
 * A panel grown out of the bar. y = 0 is the bar's bottom line; the panel's own top edge runs `cusp` px lower. Under the
 * trigger (x = nx) that edge rises in a soft rounded cusp (~56px wide) and melts into the bar's line: both sides arrive
 * tangent, so the two outlines read as one. Corners: top-left 36, bottom-left 42, top-right 30, bottom-right 34; the
 * bottom edge sags a little off-centre.
 * Returns `stroke` (open: the bar's own line carries on into it), `fill` (closed, also covering the bar's line inside
 * the cusp: no seam, no double line) and `clip` (the outline, for the hills).
 */
export function panelPath(w: number, h: number, nx: number) {
  const G = PANEL.cusp, n = 7, s = 21;
  const tl = 36, bl = 42, tr = 30, br = 34;
  const L = Math.max(nx - n, tl + s + 2), Rx = Math.min(nx + n, w - tr - s - 2);
  const outline =
    `M${f(L)} 0` +
    ` C${f(L - s * 0.5)} 0 ${f(L - s * 0.5)} ${G} ${f(L - s)} ${G}` +
    ` L${tl} ${G}` +
    ` C${f(tl - K * tl)} ${G} 0 ${f(G + tl - K * tl)} 0 ${G + tl}` +
    ` L0 ${f(h - bl)}` +
    ` C0 ${f(h - bl + K * bl)} ${f(bl - K * bl)} ${f(h + 1)} ${bl} ${f(h + 1)}` +
    ` C${f(w * 0.34)} ${f(h + 1)} ${f(w * 0.48)} ${f(h + 3.4)} ${f(w * 0.64)} ${f(h + 2.6)}` +
    ` C${f(w * 0.8)} ${f(h + 1.8)} ${f(w - br - 10)} ${f(h)} ${f(w - br)} ${f(h)}` +
    ` C${f(w - br + K * br)} ${f(h)} ${f(w)} ${f(h - br + K * br)} ${f(w)} ${f(h - br)}` +
    ` L${f(w)} ${G + tr}` +
    ` C${f(w)} ${f(G + tr - K * tr)} ${f(w - tr + K * tr)} ${G} ${f(w - tr)} ${G}` +
    ` L${f(Rx + s)} ${G}` +
    ` C${f(Rx + s * 0.5)} ${G} ${f(Rx + s * 0.5)} 0 ${f(Rx)} 0`;
  return {
    stroke: outline,
    fill: `${outline} L${f(Rx)} -1.4 L${f(L)} -1.4 Z`,
    clip: `${outline} Z`,
  };
}

/** The yellow landscape in the panel's foot: low on the left, a dip, a taller hill to the right, gone behind the edge. */
export function hillsPath(w: number, h: number) {
  return (
    `M0 ${f(h - 20)}` +
    ` C${f(w * 0.14)} ${f(h - 27)} ${f(w * 0.28)} ${f(h - 14)} ${f(w * 0.44)} ${f(h - 13)}` +
    ` C${f(w * 0.6)} ${f(h - 12)} ${f(w * 0.68)} ${f(h - 42)} ${f(w * 0.81)} ${f(h - 42)}` +
    ` C${f(w * 0.91)} ${f(h - 42)} ${f(w * 0.96)} ${f(h - 26)} ${f(w)} ${f(h - 16)}` +
    ` L${f(w + 4)} ${f(h + 8)} L0 ${f(h + 8)} Z`
  );
}
