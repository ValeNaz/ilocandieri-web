import { useId } from "react";
import { cn } from "@/lib/utils";

/** Illustrated plates for the places (used when the admin has not uploaded a real photo). Flat, original, aria-hidden. */

function Rows({ id, w = 28, h = 11, angle = -10, className }: { id: string; w?: number; h?: number; angle?: number; className: string }) {
  return (
    <pattern id={id} width={w} height={w} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
      <rect width={w} height={h} className={className} />
    </pattern>
  );
}

export function PlateGiardino({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const fruit: [number, number][] = [[-70, -150], [10, -210], [64, -128], [-20, -86], [-110, -90], [100, -190], [36, -260]];
  return (
    <svg aria-hidden="true" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className={cn("plate-art", className)}>
      <defs><Rows id={`${id}-r`} className="fill-olive-deep/30" /></defs>
      <rect width="800" height="1000" className="fill-kraft" />
      <circle cx="560" cy="250" r="150" className="fill-limone" />
      <circle cx="560" cy="250" r="172" fill="none" strokeWidth="6" className="stroke-limone/70" />
      <path d="M0 520 C 180 440 380 470 560 520 S 760 500 800 480 V1000 H0Z" className="fill-sage" />
      <path d="M0 640 C 200 580 420 620 800 560 V1000 H0Z" className="fill-olive" />
      <path d="M0 640 C 200 580 420 620 800 560 V1000 H0Z" fill={`url(#${id}-r)`} />
      <g transform="translate(250 820)">
        <ellipse cx="0" cy="6" rx="150" ry="24" className="fill-ink/20" />
        <rect x="-14" y="-170" width="28" height="176" rx="6" className="fill-ink" />
        <circle cx="0" cy="-260" r="170" className="fill-olive-deep" />
        <circle cx="-50" cy="-290" r="100" className="fill-olive" />
        {fruit.map(([x, y], i) => <circle key={i} cx={x} cy={y - 40} r="21" className="fill-arancio" />)}
      </g>
      <g transform="translate(600 880) scale(.62)">
        <ellipse cx="0" cy="6" rx="150" ry="24" className="fill-ink/20" />
        <rect x="-14" y="-170" width="28" height="176" rx="6" className="fill-ink" />
        <circle cx="0" cy="-260" r="170" className="fill-olive-deep" />
        <circle cx="-50" cy="-290" r="100" className="fill-olive" />
        {fruit.map(([x, y], i) => <circle key={i} cx={x} cy={y - 40} r="21" className="fill-arancio" />)}
      </g>
      <path d="M0 930 C 260 890 520 910 800 880 V1000 H0Z" className="fill-olive-deep" />
    </svg>
  );
}

export function PlateCampo({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden="true" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className={cn("plate-art", className)}>
      <defs><Rows id={`${id}-m`} w={160} h={80} angle={0} className="fill-ink/10" /></defs>
      <rect width="800" height="1000" className="fill-olive" />
      <rect width="800" height="1000" fill={`url(#${id}-m)`} />
      <g fill="none" strokeWidth="8" className="stroke-paper" strokeLinecap="round">
        <rect x="80" y="110" width="640" height="780" />
        <line x1="80" y1="500" x2="720" y2="500" />
        <circle cx="400" cy="500" r="104" />
        <rect x="224" y="110" width="352" height="156" />
        <rect x="224" y="734" width="352" height="156" />
        <rect x="320" y="110" width="160" height="60" />
        <rect x="320" y="830" width="160" height="60" />
        <path d="M296 266 A104 104 0 0 0 504 266" />
        <path d="M296 734 A104 104 0 0 1 504 734" />
      </g>
      <circle cx="400" cy="500" r="9" className="fill-paper" />
      <g transform="translate(470 440)">
        <circle r="34" className="fill-limone" />
        <path d="M-34 0 H34 M0 -34 V34 M-24 -24 Q0 0 -24 24 M24 -24 Q0 0 24 24" fill="none" strokeWidth="4" className="stroke-ink" />
      </g>
      <rect x="0" y="0" width="800" height="70" className="fill-olive-deep" />
      <rect x="0" y="930" width="800" height="70" className="fill-olive-deep" />
    </svg>
  );
}

export function PlateCampi({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className={cn("plate-art", className)}>
      <rect width="800" height="1000" className="fill-cobalto" />
      <circle cx="560" cy="240" r="130" className="fill-limone" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M-20 ${440 + i * 48} C 200 ${380 + i * 48}, 520 ${520 + i * 48}, 820 ${430 + i * 48}`} fill="none" strokeWidth="18" strokeLinecap="round" className={i % 3 === 0 ? "stroke-arancio" : i % 3 === 1 ? "stroke-sage" : "stroke-paper/80"} />
      ))}
    </svg>
  );
}

/** Plate for the n-th place: garden, pitch, then fields. */
export function Plate({ index, className }: { index: number; className?: string }) {
  switch (index % 3) {
    case 0: return <PlateGiardino className={className} />;
    case 1: return <PlateCampo className={className} />;
    default: return <PlateCampi className={className} />;
  }
}
