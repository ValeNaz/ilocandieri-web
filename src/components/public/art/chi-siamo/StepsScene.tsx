import { INK, Person, Placed, C, type Fill } from "../parts";
import { Live } from "../../kit/Live";
import { Crate, lk, vars } from "./parts";

/* viewBox 10:7; four steps of equal width, so the HTML labels under the scene line up with them (grid of 4). */
const VB = "0 0 1000 700";
export const STEP_LABELS = ["Accoglienza", "Educazione", "Formazione", "Lavoro"] as const;
const W = 250;
const top = (i: number) => 590 - i * 90;

/** A pile of three books seen from the side, 38 units tall: spines, page edges. Ground point = bottom centre. */
function Books({ x, y }: { x: number; y: number }) {
  const b: [Fill, number, number][] = [["green", -27, 54], ["white", -23, 48], ["green", -26, 52]];
  return (
    <Placed x={x} y={y}>
      {b.map(([c, x0, w], i) => (
        <g key={i}>
          <rect x={x0} y={-12.7 * (i + 1)} width={w} height="12.2" rx="2" fill={C[c]} />
          <path d={`M${x0 + 6} ${-12.7 * (i + 1) + 2.5} V${-12.7 * i - 3} M${x0 + 12} ${-12.7 * i - 6} H${x0 + w - 4}`} stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.7" />
        </g>
      ))}
    </Placed>
  );
}

/**
 * Scena: il percorso dell'accoglienza come una scala di quattro gradini larghi, ognuno con il suo gesto.
 * 1 chi arriva con la valigia · 2 chi studia, seduto su una pila di libri, un libro aperto in mano · 3 chi impara a
 * vangare, la vanga nella terra, accanto a una cassetta già piena · 4 la porta aperta in cima e chi esce da solo, a piedi
 * (soggetto). Vita: intro (i gradini salgono uno dopo l'altro, libri, cassetta e porta spuntano, arrivano le persone);
 * poi chi arriva fa il passo con la valigia, chi studia si dondola sul libro, chi impara vanga, e dalla porta in cima
 * qualcuno esce e se ne va da solo, di continuo.
 */
export function StepsScene() {
  return (
    <Live className="scene-live">
    <svg viewBox={VB} className="block h-full w-full" role="img" aria-label="Quattro gradini: accoglienza, educazione, formazione, lavoro. Si sale da chi arriva con la valigia, a chi studia, a chi impara a lavorare la terra, fino a chi esce dalla porta da solo." preserveAspectRatio="xMidYMax meet" focusable="false">
      {STEP_LABELS.map((l, i) => <rect key={l} x={i * W} y={top(i)} width={W + (i < 3 ? 24 : 0)} height={760 - top(i)} rx="18" fill={i % 2 ? C.yellow : C.white} className="lv-rise" style={lk(i, 0.1, { "--lv-y": "80px" })} />)}
      {/* 1. arriving */}
      <g className="lv-pop" style={lk(0, 1.4)}><Person x={120} y={top(0)} s={0.95} color="green" pose="walk" item="suitcase" itemColor="yellow" hair="cap" className="lv-step" style={vars({ "--d": 0.3 })} /></g>
      {/* 2. studying, sitting on a pile of books, an open book on the knees */}
      <g className="lv-pop" style={lk(0, 0.8)}><Books x={352} y={top(1)} /></g>
      <g className="lv-pop" style={lk(1, 1.4)}><Person x={348} y={top(1)} s={0.95} color="white" pose="sit" item="book" itemColor="green" hair="long" className="lv-rock" style={vars({ "--t": 3.4, "--d": 1 })} /></g>
      {/* 3. learning the land: digging with a spade, a crate already filled */}
      <g className="lv-pop" style={lk(2, 1.4)}><Person x={566} y={top(2)} s={0.95} color="green" pose="dig" itemColor="yellow" hair="short" className="lv-rock" style={vars({ "--t": 1.4, "--d": 0.6 })} /></g>
      <Crate x={650} y={top(2) - 30} w={56} h={30} fruit="yellow" box="green" className="lv-pop" style={lk(1, 0.8)} />
      {/* 4. the open door at the top (frame, fanlight, the leaf swung open, the threshold), and someone walking out on their own */}
      <Placed x={790} y={top(3)} className="lv-pop" style={lk(2, 0.8)}>
        <path d="M-46 0 V-120 a46 46 0 0 1 92 0 V0 Z" fill={C.green} />
        <path d="M-32 0 V-118 a32 32 0 0 1 64 0 V0 Z" fill={C.white} />
        <path d="M-32 -118 H32" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" />
        <path d="M-32 -2 V-140 L-60 -128 V-6 Z" fill={C.yellow} stroke={C.yellow} strokeWidth="3" strokeLinejoin="round" />
        <path d="M-37 -122 L-55 -114 V-76 L-37 -80 Z M-37 -64 L-55 -60 V-18 L-37 -18 Z" fill="none" stroke={C.ink} strokeWidth={INK.fine} strokeLinejoin="round" opacity="0.7" />
        <circle cx="-52" cy="-68" r="2.6" fill={C.ink} />
        <rect x="-54" y="-4" width="108" height="8" rx="3" fill={C.green} />
      </Placed>
      {/* someone steps out of the door, on their own, and walks away (grows on the threshold, leaves the frame) */}
      <g transform={`translate(890 ${top(3)})`}>
        <g className="lv-cs-out" style={vars({ "--x0": "-104px", "--y0": "0px", "--x1": "180px", "--y1": "0px", "--t": 11, "--d": 1.8 })}>
          <g className="lv-step"><Person s={0.95} color="green" pose="walk" hair="bun" /></g>
        </g>
      </g>
    </svg>
    </Live>
  );
}
