import type { ReactNode } from "react";
import { INK, Person, Placed, C, type Fill, type Hair } from "../parts";
import { Live } from "../../kit/Live";
import { Birds, lk, vars } from "./parts";

/* viewBox 2:1. The page gives the box the same ratio, so nothing is cropped. */
const VB = "0 250 800 400";
const CX = 400, CY = 470, RX = 290, RY = 112; // the round threshing floor (aia), seen in perspective

/** A point on the rim of the floor. 90 = far side, 270 = near side. */
const rim = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + Math.cos(a) * RX, y: CY - Math.sin(a) * RY };
};

/** Half an orange, cut side to us: rind, pith, six segments. It is the circle of the text, divided in shares. */
function HalfOrange({ r = 66 }: { r?: number }) {
  return (
    <g>
      <circle r={r} fill={C.orange} />
      <circle r={r - 8} fill={C.white} />
      {Array.from({ length: 6 }, (_, i) => {
        const a0 = (i * 60 + 5) * (Math.PI / 180), a1 = (i * 60 + 55) * (Math.PI / 180), rr = r - 13;
        return <path key={i} d={`M${(Math.cos(a0) * 8).toFixed(1)} ${(Math.sin(a0) * 8).toFixed(1)} L${(Math.cos(a0) * rr).toFixed(1)} ${(Math.sin(a0) * rr).toFixed(1)} A${rr} ${rr} 0 0 1 ${(Math.cos(a1) * rr).toFixed(1)} ${(Math.sin(a1) * rr).toFixed(1)} Z`} fill={C.orange} stroke={C.orange} strokeWidth="4" strokeLinejoin="round" />;
      })}
      <circle r="5" fill={C.white} />
    </g>
  );
}

/** A wooden stool: seat top at -40 (person units), so a sitter's hips rest on it. Ground point = bottom centre. */
function Stool({ x, y, s, color = "yellow" }: { x: number; y: number; s: number; color?: Fill }) {
  return (
    <Placed x={x} y={y} s={s}>
      <path d="M-11 0 L-8 -36 M11 0 L8 -36 M-9 -14 H9" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
      <rect x="-16" y="-41" width="32" height="7" rx="3" fill={C[color]} />
    </Placed>
  );
}

/** A green glazed water jug held by its handle: grip at 0,0 (it hangs against the white sky, so not white). */
const Jug = (
  <g>
    <path d="M2 -6 C2 -10 6 -12 9 -12 H17 L20 -16 L22 -11 C25 -6 26 2 24 12 C23 16 20 18 16 18 H8 C4 18 1 16 1 12 Z" fill={C.green} />
    <path d="M2 -6 C-4 -6 -5 6 1 6" fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round" />
  </g>
);

type Seat = { deg: number; s: number; color: Fill; pose: "wave" | "walk" | "stand" | "cheer" | "carry" | "sit"; kid?: boolean; flip?: boolean; item?: "basket" | "book"; hair: Hair; hold?: ReactNode; k: number; life?: string; t?: number };
/* Far side small, near side big. The near middle (270) is left free: there is a place for whoever arrives. */
const RING: Seat[] = [
  { deg: 138, s: 0.8, color: "green", pose: "sit", hair: "short", k: 0, life: "lv-rock", t: 2.6 },
  { deg: 42, s: 0.8, color: "orange", pose: "stand", flip: true, hair: "long", hold: Jug, k: 1 },
  { deg: 180, s: 0.95, color: "orange", pose: "carry", item: "basket", hair: "bun", k: 2, life: "lv-step" },
  { deg: 0, s: 1.3, color: "orange", pose: "cheer", kid: true, flip: true, hair: "curly", k: 3, life: "lv-hop", t: 1.1 },
  { deg: 222, s: 1.1, color: "yellow", pose: "walk", item: "book", hair: "cap", k: 4, life: "lv-step" },
];

function Member({ p }: { p: Seat }) {
  const q = rim(p.deg);
  return (
    <g className="lv-pop" style={lk(p.k, 1.2)}>
      {p.pose === "sit" && <Stool x={q.x + (p.flip ? 4 : -4) * p.s} y={q.y} s={p.s} color="orange" />}
      <g className={p.life} style={vars({ "--t": p.t ?? 1, "--d": p.k * 0.7 })}>
        <Person x={q.x} y={q.y} s={p.s} color={p.color} pose={p.pose} kid={p.kid} flip={p.flip} item={p.item} itemColor="white" hair={p.hair} hold={p.hold} />
      </g>
    </g>
  );
}

/** Scena viva. Intro: l'aia si apre, il tavolo e l'arancia spuntano, arrivano le persone una dopo l'altra. Vita: l'arancia gira piano, il bambino salta di gioia, chi siede parla dondolandosi, chi porta il cesto e chi arriva col libro fanno il passo, chi invita fa cenno, passa uno stormo.
 * Scena: il cerchio della cooperativa. Soggetto: mezza arancia divisa in sei spicchi, ritta sul tavolo, al centro di un cerchio di persone su un'aia (chi siede, chi porta l'acqua, chi un cesto, chi arriva con un libro, un bambino che esulta); davanti un posto libero con uno sgabello. Si muove solo l'arancia (giro lentissimo, il valore che gira) e chi fa cenno di venire. */
export function MissioneScene() {
  const near = rim(318);
  return (
    <Live className="scene-live">
    <svg viewBox={VB} className="block h-full w-full" role="img" aria-label="Persone in cerchio su un'aia intorno a un tavolo con mezza arancia divisa in sei spicchi; davanti, uno sgabello libero e qualcuno che invita a sedersi" preserveAspectRatio="xMidYMid meet" focusable="false">
      <ellipse cx={CX} cy={CY} rx={RX + 40} ry={RY + 18} fill={C.green} className="lv-reveal" style={lk(0, 0.1)} />
      {RING.filter((p) => p.deg > 0 && p.deg < 180).map((p) => <Member key={p.deg} p={p} />)}
      {/* the table: an iron base, a round wooden top with its thickness */}
      <Placed x={CX} y={CY + 8} className="lv-pop" style={lk(0, 0.6)}>
        <path d="M-8 -42 V-4 M8 -42 V-4 M-32 0 Q0 -8 32 0" stroke={C.ink} strokeWidth="5" strokeLinecap="round" fill="none" />
        <ellipse cx="0" cy="-44" rx="96" ry="18" fill={C.yellow} />
        <path d="M-94 -42 Q0 -16 94 -42" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" fill="none" opacity="0.55" />
      </Placed>
      {/* the half orange stands on its rind on the table top */}
      <Placed x={CX} y={CY - 98} className="spin-slow" style={vars({ "--t": "90s" })}><g className="lv-pop" style={lk(2, 0.6)}><HalfOrange /></g></Placed>
      {RING.filter((p) => p.deg === 0 || p.deg >= 180).map((p) => <Member key={p.deg} p={p} />)}
      {/* the free place: a stool, and someone near it waving you in */}
      <g className="lv-pop" style={lk(5, 1.2)}><Stool x={CX} y={CY + RY - 6} s={1.15} /></g>
      <g className="lv-pop" style={lk(6, 1.2)}><Person x={near.x} y={near.y} s={1.15} color="yellow" pose="wave" flip hair="bun" className="bob" style={vars({ "--d": 1.2 })} /></g>
      <Birds x={150} y={290} x0={-260} x1={820} t={28} d={3} s={0.7} />
    </svg>
    </Live>
  );
}
