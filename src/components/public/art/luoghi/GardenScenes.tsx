/**
 * Scene della pagina Giardino delle Arance (v4, "lo stesso illustratore"). Ogni scena: un soggetto, due o tre gruppi
 * secondari, vuoto voluto; al massimo 3 cose in moto. Regola dei contorni: nessun contorno esterno sulle masse
 * (persone, alberi, case, casse, mobili); l'inchiostro solo per capelli/pantaloni/scarpe, ferro, tronchi e righe interne.
 * Disegni illustrativi: nessuna pianta reale, nessun dato inventato. Nessun testo dentro i disegni.
 */
import type { CSSProperties, ReactNode } from "react";
import { Live } from "@/components/public/kit/Live";
import { Stage, Layer } from "@/components/public/kit/Stage";
import { INK, Person, Placed, Sun, type Fill } from "../parts";
import { CAN_SPOUT, C, Crate, Jar, Ladder, Pot, Seedling, Stool, Sv, Tiles, Tree, Walker, WateringCan } from "./parts";
import { SceneFrame } from "./ui";

const ink = { stroke: C.ink, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
const fine = { ...ink, strokeWidth: INK.fine };
const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Colline/suoli che continuano oltre il riquadro: con "meet" riempiono i lati senza tagliare nessun soggetto. */
const WideGround = ({ y, color }: { y: number; color: Fill }) => <rect x="-1000" y={y} width="3000" height="800" fill={C[color]} />;

/* ---------- vita (kit Live): intro una volta, poi piccoli loop, ognuno nel suo posto e col suo ritmo ---------- */
/** Ordine dell'intro: `n` = posizione nella sequenza, `base` = secondi di partenza (alberi ~0.85, persone ~1.6). */
const k = (n: number, base?: number, extra: Record<string, string | number> = {}) => v({ "--k": n, ...(base !== undefined ? { "--lv-base": `${base}s` } : {}), ...extra });

/** Livello "lontano" che scorre piano con lo scroll (profondita'), dentro un Layer del palco. */
const Far = ({ depth, children }: { depth: number; children: ReactNode }) => <div className="depth absolute inset-0" style={v({ "--depth": depth })}>{children}</div>;

/** Sole che sorge (intro) e poi gira lentamente i raggi. */
function RisingSun({ cx, cy, r, color, rays }: { cx: number; cy: number; r: number; color: Fill; rays: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className="lv-sun" style={k(0, 0.35)}>
        <g className={rays ? "spin-slow" : undefined} style={v({ "--t": "60s" })}><Sun cx={0} cy={0} r={r} color={color} rays={rays} /></g>
      </g>
    </g>
  );
}

/** Uno stormo che attraversa il cielo (ali che battono), da x0 a x1 rispetto al punto di riposo (x, y). */
function Birds({ x, y, x0, x1, t, d = 0, s = 1, n = 3 }: { x: number; y: number; x0: number; x1: number; t: number; d?: number; s?: number; n?: number }) {
  const pos: [number, number, number][] = ([[0, 0, 1], [30, 14, 0.8], [56, -6, 0.9]] as [number, number, number][]).slice(0, n);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="lv-fly" style={v({ "--x0": `${x0}px`, "--x1": `${x1}px`, "--t": t, "--d": d })}>
        {pos.map(([bx, by, bs], i) => (
          <g key={i} transform={`translate(${bx} ${by}) scale(${bs})`}>
            <g className="lv-flap" style={v({ "--d": i * 0.13 })}>
              <path d="M-12 -2 Q-6 -9 0 0 Q6 -9 12 -2" {...ink} strokeWidth="3" />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

/** Farfalla che svolazza (ali) lungo un tratto, avanti e indietro. */
function Butterfly({ x, y, x0, x1, y1 = -20, t, color = "white" }: { x: number; y: number; x0: number; x1: number; y1?: number; t: number; color?: Fill }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="lv-move lv-alt" style={v({ "--x0": `${x0}px`, "--x1": `${x1}px`, "--y1": `${y1}px`, "--t": t })}>
        <g className="lv-flutter">
          <path d="M0 0 C-9 -11 -14 -2 -7 2 C-12 6 -7 11 0 2 C7 11 12 6 7 2 C14 -2 9 -11 0 0 Z" fill={C[color]} />
        </g>
        <path d="M0 -4.5 V4.5" {...ink} strokeWidth="2" />
      </g>
    </g>
  );
}

/** Arancia col picciolo e una foglia, centro in (0, 0): si tiene in mano (prop `hold` di Person) o pende da un ramo. */
function Fruit({ color = "orange", r = 5.6, leaf = true }: { color?: Fill; r?: number; leaf?: boolean }) {
  return (
    <g>
      {leaf && <path d={`M0 ${-r + 0.4} C2 ${-r - 4} 6 ${-r - 5} 9 ${-r - 3} C6 ${-r} 3 ${-r + 0.6} 0 ${-r + 0.4} Z`} fill={C.green} />}
      <circle r={r} fill={C[color]} />
      <path d={`M0.4 ${-r + 0.6} l1 -2.4`} {...fine} />
    </g>
  );
}

/* =====================================================================
   IL CASOLARE: facciata riusabile. Origine = spigolo in basso a sinistra del corpo principale (400 x 280).
   Corpo a due piani con i cantonali in tufo, marcapiano, gronda sporgente su un tetto a padiglione di coppi, pluviale,
   portale ad arco con la soglia, finestre con le inferriate al piano terra e le persiane al primo piano, balcone,
   comignolo, ala bassa con il tetto a una falda. Nessun contorno esterno: i volumi si staccano per colore.
   ===================================================================== */
function CasolareFacade({ id, smoke = false }: { id: string; smoke?: boolean }) {
  const quoins = Array.from({ length: 10 }, (_, i) => i);
  const vous = [-150, -125, -100, -75, -50, -25].map((deg) => (deg * Math.PI) / 180);
  return (
    <g>
      {/* comignolo (dietro il tetto) e il suo fumo: un solo gruppo */}
      {smoke && [0, 1, 2].map((i) => <path key={i} className="lv-puff" style={v({ "--d": 1.4 + i * 1.2, "--t": 3.6, "--lv-y": "26px" })} d={`M${296 + i * 9} -420 q-7 -9 0 -18 t0 -18`} {...ink} strokeWidth={INK.bold} />)}
      <rect x="291" y="-404" width="26" height="64" rx="2" fill={C.orange} />
      <rect x="285" y="-414" width="38" height="12" rx="3" fill={C.orange} />
      <path d="M291 -401 H317" {...fine} />
      {/* ala bassa a destra: muro, falda unica, porta con la soglia, finestrella */}
      <rect x="396" y="-150" width="144" height="150" fill={C.white} />
      <Tiles id={`${id}-wing`} d="M396 -190 L552 -156 C556 -155 556 -146 551 -146 H396 Z" x={390} y={-194} w={170} h={52} a="orange" b="yellow" size={20} />
      <path d="M400 -145 H540" {...fine} />
      <rect x="414" y="-112" width="22" height="26" rx="2" fill={C.yellow} />
      <path d="M425 -112 V-86" {...fine} />
      <rect x="452" y="-86" width="34" height="78" rx="3" fill={C.green} />
      <path d="M458 -76 H480 V-50 H458 Z M458 -40 H480 V-16 H458 Z" {...fine} opacity="0.7" />
      <rect x="444" y="-8" width="50" height="8" rx="2" fill={C.yellow} />
      {/* corpo principale */}
      <rect x="0" y="-280" width="400" height="280" fill={C.white} />
      {quoins.map((i) => (
        <g key={i}>
          <rect x={0} y={-28 * (i + 1) + 2} width={i % 2 ? 15 : 24} height="24" rx="2" fill={C.yellow} />
          <rect x={i % 2 ? 385 : 376} y={-28 * (i + 1) + 2} width={i % 2 ? 15 : 24} height="24" rx="2" fill={C.yellow} />
        </g>
      ))}
      <rect x="-4" y="-146" width="408" height="8" rx="3" fill={C.yellow} />
      {/* tetto a padiglione, gronda sporgente con la sua riga d'ombra, pluviale in ferro */}
      <Tiles id={`${id}-roof`} d="M-22 -290 L64 -372 H336 L422 -290 Z" x={-26} y={-376} w={452} h={90} a="orange" b="yellow" size={24} />
      <rect x="-18" y="-296" width="436" height="14" rx="4" fill={C.orange} />
      <path d="M-14 -296 H414" {...fine} />
      <path d="M-14 -281 H414" {...ink} strokeWidth={INK.bold} />
      <path d="M-8 -282 C-13 -278 -13 -273 -13 -266 V-6 C-13 -3 -11 -1 -7 -1" {...ink} strokeWidth={INK.bold} />
      {/* portale ad arco in tufo con i conci, portone verde a due ante, soglia */}
      <path d="M146 -8 V-94 A54 54 0 0 1 254 -94 V-8 Z" fill={C.yellow} />
      <path d="M164 -8 V-92 A36 36 0 0 1 236 -92 V-8 Z" fill={C.green} />
      <path d={vous.map((a) => `M${(200 + Math.cos(a) * 37).toFixed(1)} ${(-92 + Math.sin(a) * 37).toFixed(1)} L${(200 + Math.cos(a) * 53).toFixed(1)} ${(-92 + Math.sin(a) * 53).toFixed(1)}`).join(" ")} {...fine} />
      <path d="M200 -127 V-8" {...ink} strokeWidth={INK.bold} />
      <path d="M174 -70 H192 M208 -70 H226 M174 -36 H192 M208 -36 H226" {...fine} opacity="0.7" />
      <circle cx="194" cy="-56" r="2.4" fill={C.ink} />
      <circle cx="206" cy="-56" r="2.4" fill={C.ink} />
      <rect x="138" y="-8" width="124" height="8" rx="2" fill={C.yellow} />
      <path d="M140 -8 H260" {...fine} />
      {/* piano terra: finestre con l'inferriata e il davanzale */}
      {[52, 308].map((x) => (
        <g key={x}>
          <rect x={x} y="-104" width="40" height="46" rx="3" fill={C.yellow} />
          <path d={`M${x + 13} -104 V-58 M${x + 27} -104 V-58 M${x} -81 H${x + 40}`} {...ink} strokeWidth={INK.bold} />
          <path d={`M${x - 5} -55 H${x + 45}`} {...ink} strokeWidth={INK.bold} />
        </g>
      ))}
      {/* primo piano: finestre a due ante con le persiane aperte; al centro la porta-finestra sul balcone */}
      {[80, 200, 320].map((cx) => (
        <g key={cx}>
          <rect x={cx - 17} y="-252" width="34" height={cx === 200 ? 62 : 58} rx="3" fill={C.yellow} />
          <path d={`M${cx} -252 V${cx === 200 ? -190 : -194} M${cx - 17} -230 H${cx + 17}`} {...fine} />
          <rect x={cx - 34} y="-252" width="14" height="60" rx="2" fill={C.green} />
          <rect x={cx + 20} y="-252" width="14" height="60" rx="2" fill={C.green} />
          <path d={`M${cx - 31} -240 H${cx - 23} M${cx - 31} -228 H${cx - 23} M${cx - 31} -216 H${cx - 23} M${cx - 31} -204 H${cx - 23} M${cx + 23} -240 H${cx + 31} M${cx + 23} -228 H${cx + 31} M${cx + 23} -216 H${cx + 31} M${cx + 23} -204 H${cx + 31}`} stroke={C.white} strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          {cx !== 200 && <rect x={cx - 22} y="-192" width="44" height="6" rx="2" fill={C.yellow} />}
        </g>
      ))}
      <rect x="160" y="-192" width="80" height="8" rx="3" fill={C.yellow} />
      <path d="M166 -192 V-216 H234 V-192 M180 -216 V-192 M193 -216 V-192 M207 -216 V-192 M220 -216 V-192" {...ink} strokeWidth={INK.bold} />
    </g>
  );
}

/* =====================================================================
   1. APERTURA
   ===================================================================== */
export const GARDEN_AR = "1000 / 560";
/* a close crop of the 1000x560 drawing (same ratio), so the casolare and the people read big */
const HV = "120 132 760 425.6";

function HeroSky() {
  return (
    <Sv vb={HV} meet align="xMidYMax">
      <RisingSun cx={800} cy={214} r={32} color="orange" rays={10} />
      {/* uno stormo attraversa il cielo libero a sinistra, lontano dal sole */}
      <Birds x={200} y={226} x0={-60} x1={420} t={22} d={2.4} s={0.9} />
    </Sv>
  );
}

function HeroFarm() {
  return (
    <Sv vb={HV} meet align="xMidYMax">
      {/* il resto dell'agrumeto, dietro la casa: piu' piccolo e piu' in alto */}
      <Tree x={286} y={474} s={0.78} n={5} className="lv-pop" style={k(2, 0.85)} />
      <Tree x={792} y={474} s={0.74} n={4} className="lv-pop" style={k(3, 0.85)} />
      <g className="lv-rise" style={k(0)}><WideGround y={472} color="green" /></g>
      <g className="lv-rise" style={k(1, 0.3, { "--lv-y": "40px" })}>
        <g transform="translate(330 474) scale(0.78)"><CasolareFacade id="hero" smoke /></g>
      </g>
      {/* l'aia di terra battuta davanti al portone */}
      <path className="lv-reveal" style={k(4, 0.9)} d="M462 474 H510 C524 500 548 530 572 560 H404 C424 530 446 500 462 474 Z" fill={C.white} />
    </Sv>
  );
}

/** Punto della mano vicina di chi riempie le cassette (posa bend, mano in (37, -20)), dove l'arancia parte. */
const HERO_BEND = { x: 608, y: 552, s: 0.84 };
function HeroHarvest() {
  return (
    <Sv vb={HV} meet align="xMidYMax">
      {/* a sinistra: chi sale sulla scala appoggiata all'arancio (mani sui montanti, piede sul piolo) */}
      <Tree x={214} y={550} s={1.4} n={8} className="lv-pop" style={k(0, 0.85)} />
      <g className="lv-in" style={k(0, 1.6)}>
        <Placed x={160} y={550} s={0.84}>
          <Ladder h={122} />
          <Person color="white" pose="climb" build="regular" hair="cap" />
        </Placed>
      </g>
      {/* al centro: chi porta la cassetta piena verso la casa e torna indietro */}
      <Walker x={290} y={552} dx={110} t={12}>
        <g className="lv-in" style={k(1, 1.6)}><g className="lv-step"><Person color="orange" pose="carry" itemColor="yellow" build="broad" hair="short" s={0.84} /></g></g>
      </Walker>
      {/* a destra: chi coglie un'arancia (il frutto e' nella mano), chi riempie le cassette: un'arancia alla volta cade nella cassa */}
      <Tree x={838} y={550} s={1.4} n={7} className="lv-pop" style={k(2, 0.85)} />
      <Person x={778} y={552} s={0.84} color="orange" pose="reach" hair="long" outfit="dress" hold={<Fruit leaf={false} />} className="lv-in" style={k(3, 1.6)} />
      <Crate x={650} y={552} s={0.86} box="white" count={4} className="lv-pop" style={k(3, 1.3)} />
      <Crate x={706} y={552} s={0.86} box="white" className="lv-pop" style={k(4, 1.3)} />
      <g className="lv-in" style={k(2, 1.6)}>
        <Person x={HERO_BEND.x} y={HERO_BEND.y} s={HERO_BEND.s} color="yellow" pose="bend" hair="curly" />
        <Placed x={HERO_BEND.x + 37 * HERO_BEND.s} y={HERO_BEND.y - 20 * HERO_BEND.s} s={HERO_BEND.s}>
          <g className="lv-drop" style={v({ "--dx": "14px", "--dy": "6px", "--d": 2.2 })}><Fruit /></g>
        </Placed>
      </g>
    </Sv>
  );
}

// Scena: il casolare di fine Settecento tra gli aranci (soggetto: il casolare).
// Intro: il prato sale, la casa si alza, gli aranci spuntano, l'aia si apre, arrivano le persone.
// Vita: chi porta la cassetta va e viene, un'arancia cade nella cassa, il comignolo fuma, uno stormo passa.
export function GardenHero() {
  return (
    <SceneFrame label="Il casolare di fine Settecento, con il tetto di coppi e le persiane verdi, tra gli aranci. Una persona sale su una scala appoggiata a un arancio, una porta una cassetta piena verso la casa, una coglie un'arancia, una mette le arance nelle cassette.">
      <Live className="h-full">
        <Stage className="lw-stage">
          <Layer z={-18}><Far depth={0.35}><HeroSky /></Far></Layer>
          <Layer z={0}><HeroFarm /></Layer>
          <Layer z={20}><HeroHarvest /></Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

/* =====================================================================
   2. IL CASOLARE (facciata grande, con i dettagli che lo fanno riconoscere)
   ===================================================================== */
const CV = "0 0 1000 720";

// Scena: la facciata del casolare (soggetto: il casolare); si muovono il fumo del comignolo (la casa e' abitata) e chi rientra col cesto.
export function CasolareScene() {
  return (
    <SceneFrame label="La facciata del casolare: due piani con i cantonali in pietra, tetto a padiglione di coppi, comignolo che fuma, portale ad arco, persiane verdi aperte, un balcone e un'ala bassa. Davanti, una persona rientra col cesto, una è seduta sulla panca sotto la finestra, un'altra coglie arance e le lascia cadere in una cassetta.">
      <Live className="lw-panel lw-yellow">
        <Stage className="lw-stage aspect-[1000/720]">
          <Layer z={-14}>
            <Far depth={0.3}>
              <Sv vb={CV}>
                <RisingSun cx={140} cy={122} r={40} color="orange" rays={0} />
                <Birds x={620} y={110} x0={-200} x1={520} t={22} d={3} s={0.85} />
              </Sv>
            </Far>
          </Layer>
          <Layer z={0}>
            <Sv vb={CV}>
              <g transform="translate(96 622)"><g className="lv-pop" style={k(2, 0.85)}><g className="sway" style={v({ "--d": 1.2 })}><Tree s={0.95} n={5} /></g></g></g>
              <rect className="lv-rise" style={k(0)} x="-20" y="618" width="1040" height="130" fill={C.green} />
              <g className="lv-rise" style={k(1, 0.3, { "--lv-y": "40px" })}>
                <g transform="translate(190 622) scale(1.05)"><CasolareFacade id="caso" smoke /></g>
              </g>
            </Sv>
          </Layer>
          <Layer z={16}>
            <Sv vb={CV}>
              <path className="lv-reveal" style={k(3, 0.9)} d="M358 622 H442 C470 664 510 702 548 740 H252 C290 702 330 664 358 622 Z" fill={C.white} />
              {/* la panca sotto la finestra: chi siede ha accanto una cassetta di arance */}
              <g className="lv-in" style={k(1, 1.6)}>
                <Placed x={576} y={626} s={0.86}>
                  <Stool w={92} x={-12} color="orange" />
                  <Crate x={-38} y={-41} s={0.66} box="green" count={3} />
                  <Person color="green" pose="sit" hair="bun" outfit="trousers" />
                </Placed>
              </g>
              {/* l'arancio a destra; chi coglie lascia cadere l'arancia nella cassetta ai suoi piedi */}
              <Tree x={880} y={652} s={1.3} n={7} className="lv-pop" style={k(3, 0.85)} />
              <Crate x={850} y={664} s={0.62} box="yellow" count={3} className="lv-pop" style={k(4, 1.3)} />
              <g className="lv-in" style={k(2, 1.6)}>
                <Person x={816} y={664} s={0.9} color="orange" pose="reach" hair="short" />
                <Placed x={832.2} y={569.5} s={0.9}>
                  <g className="lv-drop" style={v({ "--dx": "18px", "--dy": "76px", "--d": 2.6 })}><Fruit color="yellow" leaf={false} /></g>
                </Placed>
              </g>
              <Walker x={248} y={686} dx={140} t={12}>
                <g className="lv-in" style={k(0, 1.6)}><g className="lv-step"><Person color="orange" pose="walk" item="basket" itemColor="yellow" hair="curly" s={0.84} /></g></g>
              </Walker>
            </Sv>
          </Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

/* =====================================================================
   3. I TRE ETTARI VISTI DALL'ALTO (la legenda e' nel testo, fuori dal disegno)
   ===================================================================== */
const AV = "0 0 1000 640";
export const AERIAL_KEY = [
  { label: "Confine: circa 3 ettari in tutto", swatch: "white", dot: "green", line: true },
  { label: "Agrumeto, circa 2 ettari", swatch: "yellow", dot: "green", line: false },
  { label: "Orto biologico intensivo", swatch: "orange", dot: "green", line: false },
  { label: "Casolare e aia", swatch: "white", dot: "orange", line: false },
] as const satisfies readonly { label: string; swatch: Fill; dot: Fill; line: boolean }[];

/** Chioma vista dall'alto, come sottotracciato: quattro masse e una foglia che rompe il bordo. */
const crownTop = (x: number, y: number, r: number) => {
  const d = (cx: number, cy: number, rr: number) => `M${(cx - rr).toFixed(1)} ${cy.toFixed(1)}a${rr.toFixed(1)} ${rr.toFixed(1)} 0 1 0 ${(rr * 2).toFixed(1)} 0a${rr.toFixed(1)} ${rr.toFixed(1)} 0 1 0 ${(-rr * 2).toFixed(1)} 0`;
  return d(x, y, r * 0.78) + d(x - r * 0.32, y - r * 0.3, r * 0.6) + d(x + r * 0.36, y - r * 0.18, r * 0.58) + d(x + r * 0.08, y + r * 0.36, r * 0.6);
};

// Scena: i tre ettari visti dall'alto (soggetto: il confine del terreno). Intro: il terreno si apre, gli aranci spuntano fila per fila,
// le aiuole si aprono, il casolare sorge, il confine si disegna. Vita: l'acqua scorre nell'irrigazione, il motocarro va e viene sulla strada.
export function AerialPlot() {
  const plot = "M90 110 L600 80 L930 100 L950 540 L110 570 Z";
  // filari sfalsati, come in un agrumeto vero; ogni albero un po' diverso di misura
  const trees = [158, 220, 282, 344, 406, 468, 528].flatMap((y, r) => [140, 202, 264, 326, 388, 450, 512].map((x, c) => [x + (r % 2 ? 22 : 0), y, 19 + ((r * 5 + c * 3) % 4)] as const)).filter(([x]) => x < 530);
  return (
    <SceneFrame label="Schema dall'alto dei tre ettari: a sinistra l'agrumeto con gli alberi in filari sfalsati, a destra l'orto biologico intensivo a strisce, in mezzo il casolare con il tetto a padiglione, l'aia e la strada interna. Le proporzioni non sono in scala.">
      <Live className="relative aspect-[1000/640]">
        <svg viewBox={AV} className="lw-svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
          <path className="lv-reveal" style={k(0)} d={plot} fill={C.white} />
          <path className="lv-reveal-x" style={k(1, 0.3)} d="M90 110 L560 83 L560 557 L110 570 Z" fill={C.yellow} />
          <path className="lv-reveal" style={k(2, 0.3)} d="M680 87 L930 100 L950 540 L680 549 Z" fill={C.orange} />
          {/* gli aranci spuntano fila per fila; chiome e frutti di una fila sono un solo gruppo */}
          {[158, 220, 282, 344, 406, 468, 528].map((ry, r) => {
            const row = trees.map((t, i) => [t, i] as const).filter(([[, y]]) => y === ry);
            return (
              <g key={ry} className="lv-pop" style={k(r, 0.85)}>
                <path d={row.map(([[x, y, rr]]) => crownTop(x, y, rr)).join("")} fill={C.green} />
                <path d={row.map(([[x, y, rr], i]) => { const o = i % 3 === 0 ? [-0.36, -0.2] : i % 3 === 1 ? [0.3, 0.1] : [-0.06, 0.4]; const [fx, fy] = [x + o[0]! * rr, y + o[1]! * rr]; return `M${(fx - 3.6).toFixed(1)} ${fy.toFixed(1)}a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0`; }).join("")} fill={C.orange} />
              </g>
            );
          })}
          {/* orto: sei aiuole che si aprono una dopo l'altra; l'acqua scorre nelle righe dell'irrigazione */}
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} className="lv-reveal" style={k(i, 1)} x={704 + i * 38} y="128" width="22" height="392" rx="11" fill={C.green} />)}
          <g className="lv-reveal" style={k(6, 1)}>
            <path className="lw-flow" d={[0, 1, 2, 3, 4, 5].map((i) => `M${715 + i * 38} 142 V506`).join(" ")} stroke={C.white} strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 9" fill="none" />
          </g>
          {/* strada interna, casolare con il tetto a padiglione e l'ala bassa */}
          <path d="M620 556 V384" {...ink} strokeWidth="3" strokeDasharray="10 12" opacity="0.6" />
          <g className="lv-pop" style={k(4, 0.9)}>
            <rect x="572" y="262" width="96" height="68" rx="3" fill={C.orange} />
            <path d="M572 262 L600 296 L572 330 M668 262 L640 296 L668 330 M600 296 H640" {...fine} />
            <rect x="598" y="330" width="46" height="30" rx="3" fill={C.orange} />
            <path d="M621 330 V360" {...fine} />
          </g>
          {/* il motocarro porta le cassette lungo la strada interna, dal cancello al casolare e ritorno */}
          <g transform="translate(620 392)">
            <g className="lv-move lv-alt" style={v({ "--y0": "150px", "--y1": "0px", "--t": 9, "--d": 2.2 })}>
              <rect x="-9" y="-2" width="18" height="12" rx="3" fill={C.orange} />
              <rect x="-11" y="10" width="22" height="22" rx="3" fill={C.green} />
              <path d="M-7.5 14a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M1.5 14a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M-7.5 23a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M1.5 23a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" fill={C.orange} />
            </g>
          </g>
          <path d={plot} fill="none" stroke={C.green} strokeWidth="8" strokeLinejoin="round" pathLength={1} className="lv-draw" style={k(0, 0.2)} />
        </svg>
      </Live>
    </SceneFrame>
  );
}

/** Quadratino di legenda per lo schema dall'alto (HTML accanto alla scena, non dentro). */
export function KeySwatch({ swatch, dot, line }: { swatch: Fill; dot: Fill; line?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden="true" focusable="false">
      {line ? (
        <rect x="5" y="5" width="30" height="30" rx="9" fill={C.white} stroke={C.green} strokeWidth="6" />
      ) : (
        <>
          <rect x="2" y="2" width="36" height="36" rx="10" fill={C[swatch]} {...(swatch === "white" ? { stroke: C.ink, strokeWidth: 2 } : {})} />
          <circle cx="20" cy="20" r="8" fill={C[dot]} />
        </>
      )}
    </svg>
  );
}

/* =====================================================================
   4. LE STAGIONI: lo stesso angolo di giardino quattro volte.
   Colori: cielo (pannello) e suolo devono differire dalla stanza che li contiene, cosi' i bordi del pannello si leggono
   (autunno: stanza verde; inverno: arancio; primavera: bianca; estate: gialla).
   Stesso punto di vista (arancio a sinistra, filari dell'orto in prospettiva a destra); cambiano il sole, l'albero,
   le piante, il gesto. L'arancio resta verde tutto l'anno: e' un sempreverde.
   ===================================================================== */
const SV = "0 0 700 480";
type Season = "autumn" | "winter" | "spring" | "summer";
const ROWS = [380, 470, 560, 650];
const VP = { x: 560, y: 290 };
const TS = [0.12, 0.38, 0.62, 0.84];

function Plant({ kind, x, y, s }: { kind: Season; x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`}>
      {kind === "autumn" && (
        <g>
          <path d="M0 0 V-16" {...ink} strokeWidth="3" />
          <path d="M0 -12 C-13 -12 -15 -24 -13 -28 C-4 -28 0 -20 0 -12 Z M0 -16 C11 -16 15 -28 13 -32 C4 -32 0 -24 0 -16 Z" fill={C.green} />
        </g>
      )}
      {kind === "winter" && (
        <g>
          {/* cavolo: foglie esterne aperte, cuore chiuso con le nervature */}
          <path d="M0 -4 C-22 -2 -26 -18 -16 -22 C-8 -24 -4 -16 0 -12 C4 -16 8 -24 16 -22 C26 -18 22 -2 0 -4 Z" fill={C.green} />
          <circle cy="-17" r="10" fill={C.green} />
          <path d="M-5 -24 C-1 -20 -1 -14 -4 -9 M5 -24 C1 -20 1 -14 4 -9" stroke={C.white} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      )}
      {kind === "spring" && (
        <g>
          <path d="M0 0 V-24" {...ink} strokeWidth="3" />
          <path d="M0 -10 C-18 -10 -20 -26 -18 -30 C-6 -30 0 -20 0 -10 Z M0 -14 C16 -14 20 -30 18 -34 C6 -34 0 -24 0 -14 Z M0 -24 C-8 -30 -6 -42 0 -44 C6 -42 8 -30 0 -24 Z" fill={C.green} />
        </g>
      )}
      {kind === "summer" && (
        <g>
          <path d="M0 0 C-30 -4 -34 -34 -20 -46 C-6 -46 0 -22 0 0 Z M0 0 C30 -4 34 -34 20 -46 C6 -46 0 -22 0 0 Z M0 -10 C-8 -30 -6 -50 0 -54 C6 -50 8 -30 0 -10 Z" fill={C.green} />
          <path d="M-11 -29 C-6 -29 -4.5 -24 -4.5 -20 C-4.5 -15 -7.5 -11 -11 -11 C-14.5 -11 -17.5 -15 -17.5 -20 C-17.5 -24 -16 -29 -11 -29 Z M12 -37 C17 -37 18.5 -32 18.5 -28 C18.5 -23 15.5 -19 12 -19 C8.5 -19 5.5 -23 5.5 -28 C5.5 -32 7 -37 12 -37 Z" fill={C.yellow} />
          <path d="M-11 -29 v-3 M12 -37 v-3" {...fine} />
        </g>
      )}
    </g>
  );
}

function Rows({ kind }: { kind: Season }) {
  const q = (480 - 316) / (480 - VP.y);
  return (
    <g>
      {ROWS.map((xb, i) => {
        const xt = xb + (VP.x - xb) * q;
        return <path key={xb} className="lv-draw" style={k(i, 0.4)} pathLength={1} d={`M${xb} 482 L${xt.toFixed(1)} 316`} {...ink} strokeWidth="3" opacity="0.35" />;
      })}
      {/* le piante spuntano dal davanti verso il fondo */}
      {ROWS.flatMap((xb, i) => {
        const xt = xb + (VP.x - xb) * q;
        return TS.map((t, j) => (
          <g key={`${xb}-${t}`} transform={`translate(${(xb + (xt - xb) * t).toFixed(1)} ${(480 - t * 164).toFixed(1)})`}>
            <g className="lv-pop" style={k(j * 2 + i * 0.5, 0.9)}><Plant kind={kind} x={0} y={0} s={1 - 0.55 * t} /></g>
          </g>
        ));
      })}
    </g>
  );
}

const SEASON: Record<Season, { panel: Fill; ground: Fill; sun: { cx: number; cy: number; r: number; color: Fill; rays: number }; fruit: Fill; n: number }> = {
  autumn: { panel: "orange", ground: "white", sun: { cx: 520, cy: 130, r: 42, color: "yellow", rays: 8 }, fruit: "yellow", n: 4 },
  winter: { panel: "white", ground: "yellow", sun: { cx: 580, cy: 226, r: 38, color: "orange", rays: 0 }, fruit: "orange", n: 8 },
  spring: { panel: "yellow", ground: "orange", sun: { cx: 530, cy: 118, r: 42, color: "orange", rays: 10 }, fruit: "orange", n: 3 },
  summer: { panel: "white", ground: "orange", sun: { cx: 520, cy: 92, r: 54, color: "orange", rays: 12 }, fruit: "orange", n: 0 },
};

/** Cassetta bassa di piantine portata a due mani: disegnata dalla mano vicina della posa `carry` (build regular) verso quella lontana. */
const SeedTray = (
  <g>
    {[-33, -19, -5].map((x) => <Seedling key={x} x={x} y={-3} s={0.8} soil="orange" />)}
    <rect x="-42" y="-4" width="48" height="11" rx="2.5" fill={C.green} />
    <path d="M-38 1.6 H2" {...fine} />
  </g>
);

/** Annaffiatoio inclinato a versare, tenuto dalla mano vicina della posa `walk`. */
const CAN_TILT = 16;
const Can = <g transform={`rotate(${CAN_TILT})`}><WateringCan color="white" /></g>;
const tip = (() => {
  const a = (CAN_TILT * Math.PI) / 180;
  const [x, y] = CAN_SPOUT;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)] as const;
})();

function SeasonScene({ kind, label }: { kind: Season; label: string }) {
  const s = SEASON[kind];
  const blossoms: [number, number][] = [[-52, -10], [-30, -46], [-6, -58], [22, -48], [46, -26], [-40, 14], [-14, -22], [12, -4], [34, 10], [56, -2]];
  // punto in cui l'acqua lascia il beccuccio: mano vicina della posa walk (24, -49) + punta dell'annaffiatoio ruotato
  const sx = (24 + tip[0]) * 1.1, sy = (-49 + tip[1]) * 1.1;
  const tree = (
    <g>
      <Tree x={150} y={430} s={1.55} n={s.n} fruit={s.fruit} />
      {kind === "spring" && (
        <g>
          <path d={blossoms.map(([x, y]) => `M${150 + x - 6} ${312 + y}a6 6 0 1 0 12 0a6 6 0 1 0 -12 0`).join("")} fill={C.white} />
          <path d={blossoms.map(([x, y]) => `M${150 + x - 2} ${312 + y}a2 2 0 1 0 4 0a2 2 0 1 0 -4 0`).join("")} fill={C.yellow} />
        </g>
      )}
    </g>
  );
  return (
    <SceneFrame label={label}>
      <Live className={`lw-panel lw-${s.panel}`}>
        <Stage className="lw-stage aspect-[700/480]">
          <Layer z={-12}>
            <Far depth={0.3}>
              <Sv vb={SV}>
                <RisingSun {...s.sun} />
                {kind === "autumn" && <Birds x={120} y={120} x0={-200} x1={560} t={20} d={2} s={0.8} />}
                {kind === "winter" && <Birds x={140} y={150} x0={-220} x1={520} t={26} d={2.6} s={0.7} n={2} />}
              </Sv>
            </Far>
          </Layer>
          <Layer z={0}>
            <Sv vb={SV}>
              <path className="lv-rise" style={k(0)} d="M-20 300 Q350 284 720 300 V500 H-20 Z" fill={C[s.ground]} />
              <Rows kind={kind} />
            </Sv>
          </Layer>
          <Layer z={14}>
            <Sv vb={SV}>
              {/* l'arancio spunta; poi ondeggia, tranne d'inverno, quando una mano coglie dentro la chioma */}
              <g className="lv-pop" style={k(0, 0.75)}>
                {kind === "winter" ? tree : <g className="sway" style={v({ "--d": 0.8 })}>{tree}</g>}
              </g>
              {kind === "autumn" && (
                <>
                  {/* chi vanga la terra tra i filari (dondola sul piede), chi va e viene con la cassetta di piantine */}
                  <g className="lv-in" style={k(0, 1.6)}>
                    <Person x={330} y={456} s={1.1} color="green" pose="dig" hair="cap" itemColor="orange" className="lv-rock" style={v({ "--t": 1.4 })} />
                  </g>
                  <Walker x={208} y={468} dx={60} t={10}>
                    <g className="lv-in" style={k(1, 1.6)}><g className="lv-step"><Person color="orange" pose="carry" item="none" build="regular" hair="bun" s={0.95} hold={SeedTray} /></g></g>
                  </Walker>
                </>
              )}
              {kind === "winter" && (
                <>
                  {/* chi coglie lascia cadere l'arancia nella cassetta; accanto un'altra cassetta piena */}
                  <Crate x={268} y={470} s={1} box="green" className="lv-pop" style={k(1, 1.2)} />
                  <Crate x={326} y={472} s={0.94} box="green" count={4} className="lv-pop" style={k(2, 1.2)} />
                  <g className="lv-in" style={k(0, 1.6)}>
                    <Person x={226} y={456} s={1.1} color="orange" pose="reach" flip hair="long" />
                    <Placed x={206.2} y={340.5} s={1.1}>
                      <g className="lv-drop" style={v({ "--dx": "62px", "--dy": "100px", "--d": 2.4 })}><Fruit leaf={false} /></g>
                    </Placed>
                  </g>
                </>
              )}
              {kind === "spring" && (
                <>
                  {/* chi mette in terra una piantina nuova; l'ape gira tra i fiori; una farfalla sopra i filari */}
                  <g className="lv-in" style={k(0, 1.6)}>
                    <Person x={318} y={456} s={1.1} color="white" pose="bend" hair="curly" hold={<Seedling y={4} soil="yellow" />} className="lv-rock" style={v({ "--t": 2.2 })} />
                  </g>
                  <Placed x={168} y={300} s={1.4} className="lw-bee" style={v({ "--t": "8s" })}>
                    <path d="M-7 -5 C-10 -12 -4 -15 -1 -7 Z M1 -6 C2 -14 9 -13 6 -5 Z" fill={C.white} />
                    <ellipse rx="10" ry="7" fill={C.yellow} />
                    <path d="M-3 -6 V6 M3 -6 V6" {...ink} strokeWidth="2.4" />
                    <path d="M10 0 l3 0" {...ink} strokeWidth="2" />
                  </Placed>
                  <Butterfly x={470} y={380} x0={-40} x1={90} y1={-26} t={7} />
                </>
              )}
              {kind === "summer" && (
                <>
                  {/* chi annaffia cammina avanti e indietro lungo il filare: persona, annaffiatoio e acqua sono un solo gruppo */}
                  <g transform="translate(322 452)">
                    <g className="lv-move lv-alt" style={v({ "--x0": "-16px", "--x1": "30px", "--t": 8, "--d": 2 })}>
                      <g className="lv-in" style={k(0, 1.6)}>
                        <g className="lv-step">
                          <Person s={1.1} color="white" pose="walk" hair="short" hold={Can} />
                          <Placed x={Number(sx.toFixed(1))} y={Number(sy.toFixed(1))}>
                            <g className="lw-drops">
                              {[[4, 11], [9, 18], [2, 24]].map(([dx, dy], i) => <ellipse key={i} cx={dx} cy={dy} rx="2.6" ry="4" fill={C.white} />)}
                            </g>
                          </Placed>
                        </g>
                      </g>
                    </g>
                  </g>
                  <Butterfly x={244} y={410} x0={-20} x1={30} y1={-24} t={9} />
                </>
              )}
            </Sv>
          </Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

// Scena: autunno nello stesso angolo (soggetto: chi prepara la terra); si muove solo chi porta la cassetta di piantine.
export const SeasonAutumn = () => <SeasonScene kind="autumn" label="Autunno: una persona vanga la terra tra i solchi dell'orto, un'altra porta una cassetta di piantine da mettere a dimora. L'arancio ha i frutti ancora piccoli." />;
// Scena: inverno (soggetto: la raccolta delle arance); niente si muove, l'albero carico e le cassette piene bastano.
export const SeasonWinter = () => <SeasonScene kind="winter" label="Inverno: l'arancio è carico, una persona coglie un'arancia, accanto due cassette piene. Il sole è basso, nell'orto ci sono i cavoli." />;
// Scena: primavera (soggetto: l'arancio in fiore); si muove solo l'ape tra i fiori.
export const SeasonSpring = () => <SeasonScene kind="spring" label="Primavera: l'arancio è in fiore e un'ape gira tra i fiori; una persona mette in terra una piantina nuova." />;
// Scena: estate (soggetto: chi annaffia l'orto); si muove solo l'acqua che scende dall'annaffiatoio.
export const SeasonSummer = () => <SeasonScene kind="summer" label="Estate: sole alto, l'orto è pieno di piante con i frutti, una persona cammina lungo il filare e annaffia." />;

/* =====================================================================
   5. IL LABORATORIO: dal campo al barattolo, da sinistra a destra
   ===================================================================== */
const LV = "0 0 1000 600";

function LabRoom() {
  return (
    <Sv vb={LV}>
      {/* la finestra sul giardino: telaio, due ante, fuori un arancio sul prato che ondeggia e un uccello che passa */}
      <clipPath id="lab-view"><rect x="442" y="122" width="146" height="126" rx="3" /></clipPath>
      <g className="lv-pop" style={k(1, 0.4)}>
        <rect x="430" y="110" width="170" height="150" rx="6" fill={C.white} />
        <g clipPath="url(#lab-view)">
          <rect x="442" y="122" width="146" height="126" fill={C.orange} />
          <rect x="430" y="216" width="170" height="40" fill={C.green} />
          <Tree x={536} y={232} s={0.72} n={5} fruit="yellow" className="sway-s" style={v({ "--d": 0.6 })} />
          <Birds x={460} y={150} x0={-60} x1={200} t={11} d={3.2} s={0.55} n={1} />
        </g>
        <path d="M515 116 V254 M436 172 H594" stroke={C.white} strokeWidth="7" strokeLinecap="round" />
        <rect x="420" y="256" width="190" height="10" rx="3" fill={C.green} />
        <path d="M424 266 H606" {...fine} />
      </g>
      {/* pavimento in cotto: arancio, diverso dal verde della stanza intorno al pannello; zoccolino */}
      <g className="lv-rise" style={k(0)}>
        <rect x="-20" y="520" width="1040" height="100" fill={C.orange} />
        <path d="M-20 521 H1020" {...ink} strokeWidth={INK.bold} />
      </g>
    </Sv>
  );
}

/** Mestolone di legno tenuto dalla mano vicina della posa `dig` (16, -82): scende fino all'orlo della pentola. */
const Paddle = <path d="M-4 -6 L18 26" {...ink} strokeWidth="3.6" />;

function LabWork() {
  const shelf: Fill[] = ["orange", "orange", "orange", "orange", "orange"];
  const filled: Fill[] = ["green", "green", "green"];
  return (
    <Sv vb={LV}>
      {/* 1. le cassette arrivate dal campo, posate a terra */}
      <Crate x={86} y={522} s={1.1} box="green" className="lv-pop" style={k(0, 0.8)} />
      <Crate x={150} y={522} s={1.02} box="green" count={4} className="lv-pop" style={k(1, 0.8)} />
      {/* 2. il soggetto: il pentolone sul fornello a terra (fiamma che guizza, vapore a sbuffi), chi lo mescola dondolando col mestolone */}
      <Placed x={236} y={522} s={1.5}>
        <g className="lv-pop" style={k(2, 0.8)}>
          <path d="M24 0 L28 -8 M56 0 L52 -8" {...ink} strokeWidth="3" />
          <rect x="20" y="-11" width="40" height="4" rx="2" fill={C.ink} />
          <path className="lv-flap" style={v({ "--d": 0.1 })} d="M30 -12 q2 -4 4 0 M38 -12 q2 -5 4 0 M46 -12 q2 -4 4 0" fill={C.orange} />
          <Pot x={40} y={-15} s={0.72} color="green" />
          {[-14, 0, 14].map((vx, i) => <path key={vx} className="lv-puff" style={v({ "--d": 2 + i * 1.1, "--t": 3.3, "--lv-y": "16px" })} d={`M${(40 + vx * 0.72).toFixed(1)} -64 q-4 -6 0 -11.5 t0 -11.5`} {...ink} strokeWidth="1.8" />)}
        </g>
        <g className="lv-in" style={k(0, 1.5)}>
          <Person color="orange" pose="dig" item="none" build="regular" hair="bun" outfit="trousers" hold={Paddle} className="lv-rock" style={v({ "--t": 1.3 })} />
        </g>
      </Placed>
      {/* 3. il tavolo: chi sta dietro posa i barattoli pieni accanto a quelli ancora da etichettare */}
      <g className="lv-in" style={k(1, 1.5)}>
        <Placed x={566} y={522} s={1.5}>
          <Person color="green" pose="carry" item="none" build="regular" hair="long" hold={<Jar x={4} y={0} s={0.5} body="orange" lid="green" />} />
        </Placed>
      </g>
      <g className="lv-rise" style={k(1, 0.5, { "--lv-y": "30px" })}>
        <rect x="462" y="448" width="250" height="13" rx="4" fill={C.orange} />
        <path d="M470 461 H704" {...fine} />
        <path d="M480 461 L474 522 M694 461 L700 522 M478 498 H696" {...ink} strokeWidth="4" />
      </g>
      {(["green", "green"] as Fill[]).map((b, i) => <Jar key={i} x={490 + i * 34} y={448} s={0.62} body={b} lid="orange" label="yellow" className="lv-pop" style={k(i, 1.1)} />)}
      {filled.map((b, i) => <Jar key={i} x={622 + i * 30} y={448} s={0.62} body={b} lid={b === "green" ? "orange" : "green"} className="lv-pop" style={k(i + 2, 1.1)} />)}
      {/* 4. lo scaffale dei barattoli finiti e chi ci posa l'ultimo */}
      <g className="lv-rise" style={k(2, 0.5, { "--lv-y": "30px" })}>
        <rect x="742" y="380" width="216" height="9" rx="3" fill={C.green} />
        <path d="M760 389 V404 L776 389 M940 389 V404 L924 389" {...ink} strokeWidth="3" />
      </g>
      {shelf.map((b, i) => <Jar key={i} x={i < 2 ? 764 + i * 32 : 870 + (i - 2) * 30} y={380} s={0.66} body={b} lid={b === "green" ? "orange" : "green"} className="lv-pop" style={k(i, 1.2)} />)}
      <Person x={814} y={522} s={1.5} color="orange" pose="reach" hair="cap" hold={<Jar x={4} y={10} s={0.46} body="green" lid="orange" />} className="lv-in" style={k(2, 1.5)} />
    </Sv>
  );
}

// Scena: il laboratorio letto da sinistra a destra, cassette, pentolone, tavolo, scaffale (soggetto: il pentolone sul fuoco).
// Intro: il pavimento sale, la finestra, il tavolo e lo scaffale si alzano, cassette e barattoli spuntano, arrivano le persone.
// Vita: chi mescola dondola col mestolone, la fiamma guizza, il vapore sale a sbuffi, fuori l'arancio ondeggia e passa un uccello.
export function LabScene() {
  return (
    <SceneFrame label="Il laboratorio, da sinistra a destra: le cassette di arance arrivate dal campo, una persona che mescola il pentolone sul fornello, una che posa i barattoli pieni sul tavolo accanto a quelli ancora da etichettare, una che mette l'ultimo barattolo sullo scaffale. Dalla finestra si vede un arancio.">
      <Live className="lw-panel lw-yellow">
        <Stage className="lw-stage aspect-[1000/600]">
          <Layer z={-8}><LabRoom /></Layer>
          <Layer z={12}><LabWork /></Layer>
        </Stage>
      </Live>
    </SceneFrame>
  );
}

/* =====================================================================
   6. IL TAVOLO LARGO dei partner, e le sagome dei gruppi
   ===================================================================== */
// Scena: il tavolo lungo (soggetto: il tavolo con chi ci siede); si muove solo chi arriva col cesto.
export function WideTable() {
  const jars: [number, Fill][] = [[252, "green"], [288, "orange"], [408, "green"], [528, "orange"], [562, "green"]];
  return (
    <SceneFrame label="Un tavolo lungo con i barattoli sopra: quattro persone sedute, due ai capi e due dietro il tavolo, una tiene in mano un barattolo; una quinta arriva con un cesto.">
      <Live className="aspect-[800/260]">
        <Sv vb="0 0 800 260">
          <Birds x={300} y={60} x0={-360} x1={560} t={22} d={2.5} s={0.8} />
          <rect className="lv-reveal-x" style={k(0)} x="24" y="234" width="752" height="22" rx="11" fill={C.green} />
          {/* dietro il tavolo: il tavolo le copre in parte */}
          <g className="lv-in" style={k(2, 1.3)}>
            <Placed x={336} y={236} s={1.02}>
              <Stool w={30} color="orange" />
              <Person color="green" pose="sit" hair="short" build="broad" />
            </Placed>
          </g>
          <g className="lv-in" style={k(3, 1.3)}>
            <Placed x={472} y={236} s={1.02} flip>
              <Stool w={30} color="green" />
              <Person color="orange" pose="sit" hair="curly" />
            </Placed>
          </g>
          {/* il tavolo: piano con lo spessore, gambe a cavalletto con la traversa */}
          <g className="lv-rise" style={k(1, 0.3, { "--lv-y": "30px" })}>
            <rect x="204" y="166" width="392" height="12" rx="4" fill={C.yellow} />
            <path d="M210 178 H590" {...fine} />
            <path d="M228 178 L218 236 M572 178 L582 236 M224 206 H576" {...ink} strokeWidth="4" />
          </g>
          {jars.map(([x, b], i) => <Jar key={x} x={x} y={166} s={0.6} body={b} lid={b === "green" ? "orange" : "green"} className="lv-pop" style={k(i, 0.8)} />)}
          {/* ai capi */}
          <g className="lv-in" style={k(0, 1.3)}>
            <Placed x={164} y={236} s={1.04}>
              <Stool w={30} color="green" />
              <Person color="orange" pose="sit" hair="long" hold={<Jar x={2} y={6} s={0.4} body="green" lid="orange" />} />
            </Placed>
          </g>
          <g className="lv-in" style={k(1, 1.3)}>
            <Placed x={636} y={236} s={1.04} flip>
              <Stool w={30} color="orange" />
              <Person color="green" pose="sit" hair="bun" />
            </Placed>
          </g>
          {/* chi arriva col cesto: si avvicina al tavolo, si gira, torna indietro */}
          <Walker x={722} y={236} dx={-36} t={8}>
            <g className="lv-in" style={k(4, 1.3)}><g className="lv-step"><Person color="orange" pose="walk" item="basket" itemColor="green" hair="cap" s={0.95} flip /></g></g>
          </Walker>
        </Sv>
      </Live>
    </SceneFrame>
  );
}

/** Ramo con due foglie che entra dall'alto fino alla mano (per la posa reach delle sagome). */
const Twig = (
  <g>
    <path d="M0 -2 C8 -10 20 -14 36 -16" {...ink} strokeWidth="2.6" />
    <path d="M14 -10 C16 -20 24 -22 28 -20 C26 -14 20 -10 14 -10 Z M24 -14 C30 -8 38 -8 40 -10 C36 -16 30 -16 24 -14 Z" fill={C.green} />
    <g transform="translate(0 4)"><Fruit color="yellow" /></g>
  </g>
);

const CREW_T = { bend: 1.6, reach: 2.1, carry: 1.3, wave: 1.8 } as const;

/** Piccola sagoma per i pannelli dei gruppi di persone: una figura intera, di un solo colore, che fa qualcosa. */
export function CrewIcon({ color, pose }: { color: Fill; pose: "bend" | "reach" | "carry" | "wave" }) {
  const hold: Record<typeof pose, ReactNode> = { bend: <Seedling y={4} soil="ink" />, reach: Twig, carry: null, wave: null };
  return (
    <Live className="shrink-0">
      <svg viewBox="-50 -120 120 130" className="h-24 w-auto" aria-hidden="true" focusable="false">
        <path d="M-36 1 H62" stroke={C.ink} strokeWidth={INK.fine} strokeLinecap="round" opacity="0.5" />
        {/* la figura arriva, poi fa il suo gesto dondolando sui piedi, ognuna col suo ritmo */}
        <g className="lv-in" style={k(0, 0.3)}>
          <g className="lv-rock" style={v({ "--t": CREW_T[pose], "--d": 1 })}>
            <Person color={color} pose={pose} itemColor={color === "orange" ? "yellow" : "orange"} hold={hold[pose] ?? undefined} />
          </g>
        </g>
      </svg>
    </Live>
  );
}
