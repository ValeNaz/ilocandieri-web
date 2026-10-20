"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 3D parallax stage. Children are SVG layers wrapped in <Layer z={...}>: a bigger |z| moves more with the pointer
 * (and, on touch, with a slow idle sway). Sets --px / --py (-1..1) on the container. Does nothing under reduced motion.
 */
export function Stage({ children, className, tilt = true }: { children: ReactNode; className?: string; tilt?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0, idle = true, t0 = performance.now();
    const set = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      el.style.setProperty("--px", cx.toFixed(3));
      el.style.setProperty("--py", cy.toFixed(3));
    };
    const loop = (t: number) => {
      if (idle) { tx = Math.sin((t - t0) / 2600) * 0.55; ty = Math.cos((t - t0) / 3400) * 0.3; }
      set();
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top - 80 || e.clientY > r.bottom + 80) { idle = true; return; }
      idle = false;
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const leave = () => { idle = true; t0 = performance.now(); };
    let visible = true;
    const io = new IntersectionObserver(([en]) => {
      visible = !!en?.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, []);
  return (
    <div ref={ref} className={cn("stage", className)}>
      <div className={tilt ? "stage-tilt" : "contents"}>{children}</div>
    </div>
  );
}

/** One depth layer of a <Stage>. z in px: positive = nearer (moves more), negative = farther. */
export function Layer({ z = 0, className, children, style }: { z?: number; className?: string; children: ReactNode; style?: CSSProperties }) {
  return <div className={cn("stage-layer absolute inset-0", className)} style={{ "--z": z, ...style } as CSSProperties}>{children}</div>;
}
