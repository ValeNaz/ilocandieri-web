import { useId } from "react";

/** One orange tree: shadow, trunk, canopy, highlight and fruit. Origin is the base of the trunk. */
function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const fruit: [number, number][] = [[-30, -80], [26, -112], [36, -70], [-6, -128], [-48, -108], [8, -88]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="60" ry="12" className="fill-olive-deep/30" />
      <rect x="-7" y="-50" width="14" height="54" rx="3" className="fill-ink" />
      <circle cx="0" cy="-94" r="68" className="fill-olive-deep" />
      <circle cx="-22" cy="-108" r="42" className="fill-olive" />
      {fruit.map(([fx, fy], i) => (
        <circle key={i} cx={fx} cy={fy} r="9" className="fill-arancio" />
      ))}
    </g>
  );
}

const BACK_TREES: [number, number][] = [[40, 548], [170, 540], [300, 552], [430, 544], [1215, 546], [1340, 554], [1470, 542], [1580, 550]];
const MID_TREES: [number, number][] = [[110, 690], [330, 700], [560, 690], [1290, 700], [1480, 690]];

/**
 * The garden behind the gate: sun, hills, orange grove, farmhouse and the path leading to the door.
 * Flat shapes in the label-print palette. It is a `<g>` rendered once per crop
 * (phone and desktop, see HeroStage): <use> is avoided because CSS animations do not run inside its shadow tree.
 */
export function HeroSceneArt() {
  const rows = useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        <pattern id={`${rows}-r`} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
          <rect width="22" height="9" className="fill-olive-deep/35" />
        </pattern>
        <pattern id={`${rows}-f`} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
          <rect width="26" height="10" className="fill-ink/10" />
        </pattern>
      </defs>
      <rect width="1600" height="900" className="fill-paper" />
      <rect y="250" width="1600" height="330" className="fill-paper-deep/70" />

      <g className="hero-sun">
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * Math.PI * 2) / 24;
          return <line key={i} x1={1060 + 168 * Math.cos(a)} y1={240 + 168 * Math.sin(a)} x2={1060 + (i % 2 ? 196 : 218) * Math.cos(a)} y2={240 + (i % 2 ? 196 : 218) * Math.sin(a)} strokeWidth="9" strokeLinecap="round" className="stroke-arancio" />;
        })}
        <circle cx="1060" cy="240" r="132" className="fill-limone" />
        <circle cx="1060" cy="240" r="148" fill="none" strokeWidth="5" className="stroke-limone/70" />
      </g>

      <path d="M0 560 C 200 470 420 470 640 540 S 1040 604 1240 522 S 1500 470 1600 500 V900 H0Z" className="fill-sage" />
      {BACK_TREES.map(([x, y], i) => <Tree key={i} x={x} y={y} s={0.4} />)}
      <path d="M0 650 C 260 570 520 604 760 652 S 1220 640 1600 566 V900 H0Z" className="fill-olive" />
      <path d="M0 650 C 260 570 520 604 760 652 S 1220 640 1600 566 V900 H0Z" fill={`url(#${rows}-r)`} />
      {MID_TREES.map(([x, y], i) => <Tree key={i} x={x} y={y} s={0.66} />)}

      {/* Farmhouse */}
      <g transform="translate(780 0)">
        <rect x="0" y="446" width="340" height="190" className="fill-card" />
        <rect x="226" y="446" width="114" height="190" className="fill-kraft/60" />
        <rect x="0" y="606" width="340" height="30" className="fill-kraft-deep/70" />
        <polygon points="-22,450 170,350 362,450" className="fill-terracotta" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={-6 + i * 14} y1={446 - i * 12} x2={346 - i * 14} y2={446 - i * 12} strokeWidth="3" className="stroke-terracotta-deep/60" />)}
        <rect x="262" y="366" width="34" height="62" className="fill-terracotta-deep" />
        <path d="M140 636 V552 a30 30 0 0 1 60 0 V636Z" className="fill-cobalto" />
        <circle cx="188" cy="596" r="3.5" className="fill-limone" />
        {[50, 244].map((wx) => (
          <g key={wx}>
            <rect x={wx} y="494" width="52" height="64" className="fill-cobalto" />
            <line x1={wx + 26} y1="494" x2={wx + 26} y2="558" strokeWidth="4" className="stroke-card" />
            <line x1={wx} y1="526" x2={wx + 52} y2="526" strokeWidth="4" className="stroke-card" />
            <rect x={wx - 8} y="558" width="68" height="9" className="fill-kraft-deep" />
          </g>
        ))}
        <circle cx="112" cy="622" r="11" className="fill-terracotta" />
        <circle cx="244" cy="622" r="11" className="fill-terracotta" />
      </g>

      {/* Foreground field and the path to the door */}
      <path d="M0 760 C 340 706 640 724 800 790 L 800 900 H0Z" className="fill-olive-deep" />
      <path d="M1600 740 C 1300 704 1040 730 800 790 L 800 900 H1600Z" className="fill-olive-deep" />
      <path d="M0 760 C 340 706 640 724 800 790 L 800 900 H0Z" fill={`url(#${rows}-r)`} />
      <path d="M1600 740 C 1300 704 1040 730 800 790 L 800 900 H1600Z" fill={`url(#${rows}-r)`} />
      <path d="M680 900 L 912 636 L 988 636 L 1220 900 Z" className="fill-kraft" />
      <path d="M680 900 L 912 636 L 988 636 L 1220 900 Z" fill={`url(#${rows}-f)`} />
      <Tree x={190} y={846} s={1} />
      <Tree x={1400} y={858} s={1.12} />
    </g>
  );
}
