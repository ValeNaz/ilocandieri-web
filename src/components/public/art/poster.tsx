import { useId } from "react";
import { cn } from "@/lib/utils";

export type PosterTone = "terracotta" | "cobalto" | "limone" | "olive" | "kraft";

/**
 * Large ornament for the title of an inner page. One per color field, drawn in the same flat label-print
 * language as the home scenes. Decorative (aria-hidden); slow drift is in journey.css (.poster-art).
 */
export function PosterArt({ tone, className }: { tone: PosterTone; className?: string }) {
  const id = useId().replace(/:/g, "");
  const wrap = cn("poster-art", className);
  if (tone === "terracotta") {
    return (
      <svg aria-hidden="true" viewBox="0 0 600 600" className={wrap}>
        <circle cx="300" cy="300" r="290" className="fill-arancio" />
        <circle cx="300" cy="300" r="238" fill="none" strokeWidth="14" className="stroke-paper/85" />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i * Math.PI) / 5 + Math.PI / 10;
          return <line key={i} x1="300" y1="300" x2={300 + 238 * Math.cos(a)} y2={300 + 238 * Math.sin(a)} strokeWidth="12" strokeLinecap="round" className="stroke-paper/85" />;
        })}
        <circle cx="300" cy="300" r="22" className="fill-paper/85" />
      </svg>
    );
  }
  if (tone === "cobalto") {
    return (
      <svg aria-hidden="true" viewBox="0 0 600 600" className={wrap}>
        <defs>
          <pattern id={`${id}-t`} width="150" height="150" patternUnits="userSpaceOnUse">
            <rect width="150" height="150" fill="none" />
            {[[75, 40], [75, 110], [40, 75], [110, 75]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="22" className="fill-paper/90" />)}
            <circle cx="75" cy="75" r="14" className="fill-limone" />
            <circle cx="0" cy="0" r="14" className="fill-limone" /><circle cx="150" cy="0" r="14" className="fill-limone" />
            <circle cx="0" cy="150" r="14" className="fill-limone" /><circle cx="150" cy="150" r="14" className="fill-limone" />
          </pattern>
        </defs>
        <rect width="600" height="600" fill={`url(#${id}-t)`} style={{ maskImage: "radial-gradient(circle at 60% 60%, #000 38%, transparent 72%)" }} />
      </svg>
    );
  }
  if (tone === "limone") {
    return (
      <svg aria-hidden="true" viewBox="0 0 600 600" className={wrap}>
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i * Math.PI * 2) / 36;
          return <line key={i} x1={300 + 120 * Math.cos(a)} y1={300 + 120 * Math.sin(a)} x2={300 + (i % 2 ? 250 : 292) * Math.cos(a)} y2={300 + (i % 2 ? 250 : 292) * Math.sin(a)} strokeWidth="14" strokeLinecap="round" className="stroke-terracotta" />;
        })}
        <circle cx="300" cy="300" r="104" className="fill-terracotta" />
        <circle cx="300" cy="300" r="62" className="fill-cobalto" />
      </svg>
    );
  }
  if (tone === "olive") {
    return (
      <svg aria-hidden="true" viewBox="0 0 600 600" className={wrap}>
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M-20 ${90 + i * 48} C 160 ${30 + i * 48}, 340 ${170 + i * 48}, 620 ${70 + i * 48}`} fill="none" strokeWidth="20" strokeLinecap="round" className={i % 3 === 0 ? "stroke-limone" : i % 3 === 1 ? "stroke-sage" : "stroke-arancio"} />
        ))}
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 600 600" className={wrap}>
      <circle cx="300" cy="300" r="270" className="fill-terracotta" />
      <circle cx="300" cy="300" r="200" className="fill-kraft" />
      <circle cx="300" cy="300" r="130" className="fill-cobalto" />
      <circle cx="300" cy="300" r="60" className="fill-limone" />
    </svg>
  );
}
