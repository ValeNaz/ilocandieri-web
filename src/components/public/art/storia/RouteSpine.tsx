"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Person } from "../parts";

type Geo = { w: number; h: number; d: string; nodes: { x: number; y: number }[] };

/**
 * Il percorso della storia. Avvolge le tappe (elementi con data-stop) e disegna sopra di esse una linea che serpeggia:
 * tratteggiata davanti, piena e con un contorno bianco dietro a chi cammina. UNA sola persona (Person intera, posa walk,
 * sempre arancio su un disco bianco) la percorre mentre si scorre, ferma nella posa: si sposta, non saltella.
 * Il percorso sta nella fascia libera tra scena e testo (desktop: colonne 6-7; telefono: margine sinistro di 44px), quindi
 * la persona non passa mai sopra un testo. La posizione insegue lo scroll con uno smorzamento esponenziale: la posizione insegue lo scroll con uno smorzamento esponenziale, quindi il passo è
 * sempre morbido anche con la rotella. Con prefers-reduced-motion il percorso è tutto disegnato e la persona è arrivata.
 * Solo stroke-dashoffset e transform; la posizione si calcola da getPointAtLength.
 */
export function RouteSpine({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const full = useRef<SVGPathElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const halo = useRef<SVGPathElement>(null);
  const walker = useRef<SVGGElement>(null);
  const nodeEls = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const build = () => {
      const r = el.getBoundingClientRect();
      const w = r.width, h = el.offsetHeight;
      const wide = w >= 1024;
      const cx = wide ? w / 2 : 24;
      const amp = wide ? Math.min(30, w * 0.02) : 7;
      const stops = [...el.querySelectorAll<HTMLElement>("[data-stop]")].map((s) => {
        const b = s.getBoundingClientRect();
        return { y: b.top - r.top + b.height * 0.5, top: b.top - r.top };
      });
      if (!stops.length) return;
      const ys: number[] = [Math.max(0, stops[0]!.top + 40)];
      stops.forEach((s, i) => {
        if (i > 0) ys.push((stops[i - 1]!.y + s.y) / 2);
        ys.push(s.y);
      });
      const pts = ys.map((y, i) => ({ x: cx + (i % 2 ? amp : -amp), y }));
      let dd = `M${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]!, b = pts[i]!, k = (b.y - a.y) / 2;
        dd += `C${a.x.toFixed(1)} ${(a.y + k).toFixed(1)} ${b.x.toFixed(1)} ${(b.y - k).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }
      setGeo({ w, h, d: dd, nodes: stops.map((s, i) => ({ x: pts[i * 2 + 1]!.x, y: s.y })) });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrap.current, path = full.current;
    if (!geo || !el || !path) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = path.getTotalLength();
    const lines = [trail.current, halo.current];
    lines.forEach((p) => { if (p) p.style.strokeDasharray = `${total}`; });
    // Lunghezza lungo il percorso per una data quota (ricerca binaria: il percorso scende sempre)
    const lengthAtY = (y: number) => {
      let lo = 0, hi = total;
      for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (path.getPointAtLength(m).y < y) lo = m; else hi = m; }
      return lo;
    };
    const apply = (L: number) => {
      lines.forEach((p) => { if (p) p.style.strokeDashoffset = `${total - L}`; });
      const pt = path.getPointAtLength(L);
      walker.current?.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      geo.nodes.forEach((n, i) => nodeEls.current[i]?.setAttribute("data-on", String(n.y <= pt.y + 2)));
    };
    if (still) { apply(total); return; }

    const target = () => {
      const r = el.getBoundingClientRect();
      return lengthAtY(Math.min(geo.h, Math.max(0, window.innerHeight * 0.55 - r.top)));
    };
    let cur = target(), goal = cur, raf = 0, last = 0;
    apply(cur);
    // Inseguimento morbido: ogni frame copre una frazione della distanza che dipende dal tempo trascorso (~180 ms)
    const tick = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const k = 1 - Math.exp(-dt / 180);
      cur += (goal - cur) * k;
      const moving = Math.abs(goal - cur) > 0.4;
      if (!moving) cur = goal;
      apply(cur);
      raf = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) last = 0;
    };
    const onScroll = () => {
      goal = target();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [geo]);

  return (
    <div ref={wrap} className="route-wrap relative">
      {children}
      {geo && (
        <svg className="route-svg" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true" focusable="false">
          <path ref={full} d={geo.d} className="route-ahead" />
          <path ref={halo} d={geo.d} className="route-halo" />
          <path ref={trail} d={geo.d} className="route-trail" />
          {geo.nodes.map((n, i) => <circle key={i} ref={(e) => { nodeEls.current[i] = e; }} cx={n.x} cy={n.y} r="13" className="route-node" data-on="false" />)}
          <g ref={walker} className="route-walker">
            {/* disco bianco dietro: la figura resta leggibile su ogni colore di stanza */}
            <g transform={geo.w < 1024 ? "scale(0.56)" : undefined}>
            <circle cx="0" cy="-26" r="42" className="route-walker-disc" />
            <Person x={0} y={10} s={0.7} color="orange" pose="walk" />
            </g>
          </g>
        </svg>
      )}
    </div>
  );
}
