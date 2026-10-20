"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

/** Link tile that tilts slightly in 3D toward the pointer (max ~4deg, eased by a long CSS transition). Whole tile is the link (keyboard: focus lifts it via CSS). No tilt under reduced motion. */
export function TiltLink({ href, className, style, children, ...rest }: { href: string; className?: string; style?: CSSProperties; children: ReactNode; "data-abes-product"?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width) - 0.5) * 7}deg`);
    el.style.setProperty("--rx", `${(-((e.clientY - r.top) / r.height) + 0.5) * 5}deg`);
  };
  const leave = () => { ref.current?.style.setProperty("--ry", "0deg"); ref.current?.style.setProperty("--rx", "0deg"); };
  return (
    <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" className={className} style={style} onPointerMove={move} onPointerLeave={leave} {...rest}>
      {children}
    </a>
  );
}
