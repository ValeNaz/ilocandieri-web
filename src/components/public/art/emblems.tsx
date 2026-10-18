import { cn } from "@/lib/utils";

/**
 * Emblems: one flat illustration per activity (open door, key, ball, orange). Three print colors come from the
 * CSS variables --e1 (main), --e2 (accent) and --e3 (light), so the same drawing works on any colored field.
 */
type Props = { className?: string };
const f = (n: 1 | 2 | 3) => ({ fill: `var(--e${n})` });
const s = (n: 1 | 2 | 3, w: number) => ({ stroke: `var(--e${n})`, strokeWidth: w, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

function Frame({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 240" className={cn("emblem", className)}>
      {children}
    </svg>
  );
}

export function EmblemDoor({ className }: Props) {
  return (
    <Frame className={className}>
      <path d="M44 214 V108 a76 76 0 0 1 152 0 V214Z" style={f(1)} />
      <path d="M68 214 V110 a52 52 0 0 1 104 0 V214Z" style={f(3)} />
      <circle cx="120" cy="116" r="24" style={f(2)} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = Math.PI + (i * Math.PI) / 5;
        return <line key={i} x1={120 + 32 * Math.cos(a)} y1={116 + 32 * Math.sin(a)} x2={120 + 42 * Math.cos(a)} y2={116 + 42 * Math.sin(a)} style={s(2, 5)} />;
      })}
      <path d="M68 214 V112 L100 92 V196 Z" style={f(1)} />
      <circle cx="90" cy="150" r="4" style={f(3)} />
      <rect x="30" y="214" width="180" height="12" rx="3" style={f(1)} />
      <rect x="18" y="226" width="204" height="10" rx="3" style={f(2)} />
    </Frame>
  );
}

export function EmblemKey({ className }: Props) {
  return (
    <Frame className={className}>
      <g transform="rotate(38 120 120)">
        <circle cx="120" cy="56" r="40" style={s(1, 20)} />
        <circle cx="120" cy="56" r="14" style={f(2)} />
        <rect x="111" y="92" width="18" height="124" rx="5" style={f(1)} />
        <rect x="129" y="162" width="32" height="16" rx="4" style={f(2)} />
        <rect x="129" y="188" width="22" height="16" rx="4" style={f(2)} />
      </g>
      <path d="M44 176 q-20 10 -12 34" style={s(3, 5)} />
      <rect x="22" y="206" width="34" height="24" rx="5" style={f(3)} />
      <line x1="28" y1="216" x2="50" y2="216" style={s(1, 3)} />
      <line x1="28" y1="223" x2="42" y2="223" style={s(1, 3)} />
    </Frame>
  );
}

export function EmblemBall({ className }: Props) {
  return (
    <Frame className={className}>
      <ellipse cx="120" cy="222" rx="70" ry="10" style={{ ...f(2), opacity: 0.4 }} />
      <circle cx="120" cy="116" r="92" style={f(1)} />
      <path d="M120 24 C 76 66 76 166 120 208" style={s(3, 7)} />
      <path d="M120 24 C 164 66 164 166 120 208" style={s(3, 7)} />
      <line x1="28" y1="116" x2="212" y2="116" style={s(3, 7)} />
      <path d="M44 56 C 76 80 164 80 196 56" style={s(3, 7)} />
      <path d="M44 176 C 76 152 164 152 196 176" style={s(3, 7)} />
      <circle cx="120" cy="116" r="92" style={s(2, 6)} />
    </Frame>
  );
}

export function EmblemOrange({ className }: Props) {
  return (
    <Frame className={className}>
      <ellipse cx="116" cy="224" rx="70" ry="9" style={{ ...f(2), opacity: 0.4 }} />
      <circle cx="116" cy="140" r="84" style={f(1)} />
      <circle cx="116" cy="140" r="64" style={s(3, 5)} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        return <line key={i} x1="116" y1="140" x2={116 + 64 * Math.cos(a)} y2={140 + 64 * Math.sin(a)} style={s(3, 5)} />;
      })}
      <circle cx="116" cy="140" r="7" style={f(3)} />
      <path d="M122 60 C 132 24 172 12 204 26 C 196 62 160 80 122 60Z" style={f(2)} />
      <path d="M126 58 C 150 46 170 38 192 30" style={s(1, 3)} />
      <line x1="118" y1="62" x2="116" y2="48" style={s(1, 6)} />
    </Frame>
  );
}

/** Index of the emblem for a slot name (so editing the text does not change the picture), else cycles by position. */
function emblemIndex(slot: string | undefined, index: number): number {
  const key = slot ?? "";
  if (/accogl/.test(key)) return 0;
  if (/beni|confisc/.test(key)) return 1;
  if (/sport|campo/.test(key)) return 2;
  if (/abes|agric|orang/.test(key)) return 3;
  return index % 4;
}

export function Emblem({ slot, index, className }: { slot?: string; index: number; className?: string }) {
  switch (emblemIndex(slot, index)) {
    case 0: return <EmblemDoor className={className} />;
    case 1: return <EmblemKey className={className} />;
    case 2: return <EmblemBall className={className} />;
    default: return <EmblemOrange className={className} />;
  }
}
