/**
 * Scene della pagina Storia (linguaggio v4): un soggetto per scena, due o tre gruppi secondari, almeno un terzo di vuoto.
 * Scene VIVE come l'hero della Home (docs/LIVE_BRIEF.md): ogni scena sta in <Live>; entrando nella vista si costruisce una
 * volta (terra, sole, alberi, linee, poi le persone) e poi vivono 2-5 piccole storie, ognuna nel suo posto e col suo ritmo.
 * Senza JS o con reduced motion resta il fotogramma finale, fermo. Masse senza contorno; il disegno "a linee" resta solo nei luoghi
 * vuoti (tappa 1 e il "prima" del giardino), come dice il testo della pagina.
 * Ogni oggetto si muove intero: la classe di animazione sta sul gruppo interno di <Placed> (o sulla prop className delle parti).
 * Margini: i soggetti restano almeno all'8% dal bordo del riquadro; solo terreno e cielo escono.
 */
import type { CSSProperties, ReactNode } from "react";
import { Live } from "@/components/public/kit/Live";
import { Art, Cloud, Hill, INK, OliveTree, OrangeTree, Person, Sun, C } from "../parts";
import { Crate } from "../home/geo";
import { BareTree, Bench, Birds, Butterfly, Casa, CloudLine, DryWall, Gate, Jar, Key, Sack, Tomato, Weeds, det, disc, dl, ln } from "./parts";

const v = (o: Record<string, string | number>) => o as CSSProperties;
/** La scena viva: riempie il suo riquadro (pannello, livello dello Stage o del prima/adesso). */
const Scene = ({ children }: { children: ReactNode }) => <Live className="st-live">{children}</Live>;
/** Intro: `c` = classe lv-* (pop, rise, in, reveal…), `k` = ordine, `base` = attesa iniziale in secondi. */
const In = ({ c, k = 0, base, y, children }: { c: string; k?: number; base?: number; y?: number; children: ReactNode }) => (
  <g className={c} style={v({ "--k": k, ...(base !== undefined ? { "--lv-base": `${base}s` } : {}), ...(y !== undefined ? { "--lv-y": `${y}px` } : {}) })}>{children}</g>
);

/* ---------- Apertura: tre livelli per lo <Stage> (viewBox 1600x610). Il nucleo x 461-1139 resta sempre visibile (telefono: cornice 10/9) ---------- */
const HV = "0 90 1600 610";
const SV = "scene-svg";

// Scena (apertura, cielo): il sole sorge e i raggi girano piano, la nuvola va e viene, uno stormo attraversa il cielo alto.
export function HeroSky() {
  return (
    <Scene><Art viewBox={HV} className={SV}>
      <In c="lv-sun" base={0.45}><Sun cx={1240} cy={250} r={54} color="orange" rays={12} className="spin-slow" /></In>
      <Cloud x={300} y={232} s={1.2} color="green" className="lv-cloud" />
      <Birds x={980} y={190} s={1.3} x0={-520} x1={420} t={28} d={1.2} />
    </Art></Scene>
  );
}

// Scena (apertura, terra): il casolare riaperto è il SOGGETTO, al centro, porta spalancata, stagliato sul cielo (le colline
// lontane si abbassano dietro di lui). Due alberi lo affiancano; a sinistra qualcuno coglie un limone e lo lascia cadere
// nel cesto ai suoi piedi. Intro: colline, sentiero, alberi, casa; vita: il limone che cade, gli alberi al vento.
// Mano della raccoglitrice (reach, flip, s .74): 572 − 18·.74, 548 − 105·.74 = (558.7, 470.3).
export function HeroLand() {
  return (
    <Scene><Art viewBox={HV} className={SV}>
      <In c="lv-rise" k={0}><path d="M0 700V446C180 412 400 418 540 462C600 482 630 512 650 540H1050C1070 510 1110 478 1190 458C1330 424 1480 430 1600 452V700Z" fill={C.white} /></In>
      <In c="lv-rise" k={2}><Hill width={1600} y={512} amp={12} bottom={700} color="green" seed={3.4} /></In>
      <In c="lv-reveal" base={1}><path d="M784 524C774 580 720 640 640 700H740C790 640 812 580 816 524Z" fill={C.white} /></In>
      <In c="lv-pop" k={0} base={0.85}><OrangeTree x={526} y={532} s={1.02} fruit="yellow" className="sway" style={dl(0.4)} /></In>
      <In c="lv-pop" k={2} base={0.85}><OrangeTree x={1086} y={534} s={0.96} className="sway" style={dl(1.5)} /></In>
      <In c="lv-pop" k={1} base={0.7}><Casa open x={800} y={524} s={1.22} /></In>
      <In c="lv-in" base={1.6}>
        <Person x={572} y={548} s={0.74} color="orange" pose="reach" hair="bun" outfit="dress" flip />
        {/* il cesto ai piedi, il limone che cade dalla mano */}
        <g transform="translate(540 548)">
          <path d="M-13 -14 H13 L10 -2 C9.6 -0.6 8.8 0 7.6 0 H-7.6 C-8.8 0 -9.6 -0.6 -10 -2 Z" fill={C.white} />
          <path d="M-10 -8H10" {...det(INK.fine)} />
          <path d={disc(-4, -15, 4) + disc(4, -16, 4)} fill={C.yellow} />
        </g>
        <g transform="translate(558.7 470.3)"><g className="lv-drop" style={v({ "--dx": "-18px", "--dy": "62px", "--d": 2.6 })}><circle r="4.2" fill={C.yellow} /></g></g>
      </In>
    </Art></Scene>
  );
}

// Scena (apertura, persone): chi arriva con la valigia (protagonista) sale il sentiero, rimpicciolendo con la distanza, ed
// entra dalla porta; chi accoglie saluta dalla soglia. Fermo (reduced motion): il viaggiatore a metà sentiero.
export function HeroPeople() {
  return (
    <Scene><Art viewBox={HV} className={SV}>
      <In c="lv-in" base={1.5}><Person x={800} y={521} s={0.66} color="green" pose="wave" hair="short" className="lv-rock" style={v({ "--t": 1.3, "--d": 0.3 })} /></In>
      <g transform="translate(712 640)">
        <g className="st-lv-walk st-lv-walk-hero"><g className="lv-step">
          <Person s={1.12} color="orange" pose="walk" item="suitcase" itemColor="white" hair="curly" />
        </g></g>
      </g>
    </Art></Scene>
  );
}

/* ---------- Tappa 1 ---------- */
// Scena: il casolare chiuso, disegnato solo a linee (vuoto, senza colore), in fondo al viale, dietro un cancello di ferro con
// catena e lucchetto tra due muretti a secco. SOGGETTO: il casolare. Intro: la terra, il casolare, i muretti e il cancello
// si disegnano a linee, gli alberi spogli spuntano. Vita (poca, è un luogo chiuso): la nuvola, i corvi che passano alti,
// il lucchetto che dondola sulla catena, un albero spoglio nel vento.
export function ScenaCasolare() {
  return (
    <Scene><Art viewBox="0 0 600 480" className={SV} title="Un casolare bianco con le persiane chiuse e la porta sbarrata da assi, in fondo a un viale chiuso da un cancello di ferro con catena e lucchetto" desc="Disegno a sole linee: il luogo prima di essere aperto.">
      <CloudLine x={70} y={86} s={1.1} className="lv-cloud" />
      <Birds x={430} y={96} s={0.9} x0={-460} x1={200} t={24} d={2.4} />
      <path d="M0 300C110 284 200 294 300 290S490 282 600 298V480H0Z" fill={C.white} {...ln} className="lv-draw" pathLength={1} />
      <In c="lv-pop" k={0} base={0.9}><BareTree x={92} y={318} s={1.55} className="sway-s" style={dl(1)} /></In>
      <In c="lv-pop" k={1} base={0.9}><BareTree x={520} y={312} s={1.15} /></In>
      <Casa mode="sketch" draw x={286} y={296} s={0.92} />
      {/* il viale, dalla porta al cancello */}
      <path d="M272 300C268 314 262 326 256 336M300 300C306 314 314 326 322 336" {...det(2, true)} />
      <DryWall x={16} y={420} w={196} draw />
      <DryWall x={388} y={420} w={196} draw />
      <Gate x={300} y={420} s={1.08} draw swing />
      {[[60, 458, 1.2], [214, 452, 0.95], [404, 456, 1.05], [540, 452, 1.2]].map(([x, y, s], i) => <In key={i} c="lv-pop" k={i} base={1.3}><Weeds x={x} y={y} s={s} flip={i % 2 === 1} /></In>)}
    </Art></Scene>
  );
}

/* ---------- Tappa 2 ---------- */
// Scena: due persone sollevano il grande foglio delle firme e una terza ci firma sopra (la legge nasce da una raccolta di
// firme). La chiave di ferro indica la porta aperta del casolare. Intro: il prato, la casa, il foglio sollevato, la chiave,
// la scia di puntini che si stende. Vita: la chiave ondeggia, i puntini camminano verso la casa, chi firma scrive.
export function ScenaLegge() {
  // mani alzate (posa reach, s=1.05): x ± 18.9, y − 110
  return (
    <Scene><Art viewBox="0 0 600 480" className={SV} title="Due persone sollevano un grande foglio pieno di firme mentre una terza firma; una chiave di ferro indica un casolare con la porta aperta" desc="La legge 109 del 1996 nata da una raccolta di firme.">
      <In c="lv-rise" k={0}><path d="M0 378C120 364 230 374 320 370S500 360 600 372V480H0Z" fill={C.green} /></In>
      <In c="lv-pop" base={0.6}><Casa open wall="yellow" x={468} y={384} s={0.52} /></In>
      <In c="lv-reveal" base={1.7}><path d="M418 146C474 158 492 220 470 286" fill="none" stroke={C.orange} strokeWidth="4" strokeLinecap="round" strokeDasharray="1 14" className="st-lv-march" /></In>
      <In c="lv-in" base={1.4}><Key x={316} y={110} s={0.82} className="bob" style={dl(1)} /></In>
      {/* chi solleva e il foglio salgono insieme, un solo gruppo */}
      <In c="lv-rise" k={1} base={0.9} y={40}>
      <Person x={74} y={404} s={1.05} color="green" pose="reach" hair="long" />
      <Person x={346} y={404} s={1.05} color="orange" pose="reach" hair="cap" build="broad" flip />
      {/* il foglio: bianco, con il contorno sottile degli oggetti bianchi tenuti in mano */}
      <g>
        <rect x="88" y="168" width="240" height="158" rx="5" fill={C.white} {...ln} strokeWidth="2.2" />
        <path d="M108 194H226" {...det(INK.bold)} />
        <path d="M108 206H186" {...det(INK.fine)} />
        <path d={disc(290, 198, 13)} fill={C.orange} />
        <path d="M284 198l4 4l8 -8" stroke={C.white} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M108 236H300M108 264H300M108 292H300" {...det(1.2)} />
        {[230, 258, 286].map((y, i) => <path key={y} d={`M${112 + i * 14} ${y}c6-8 10 4 16-2s8 6 14 0s10 4 16-2${i === 1 ? "s8 6 14 0s10 4 14 -2" : ""}M${210 - i * 8} ${y}c6-6 10 4 14-1s8 5 14 -1s8 6 14 0`} fill="none" stroke={i === 1 ? C.orange : C.green} strokeWidth="2.4" strokeLinecap="round" />)}
      </g>
      </In>
      <In c="lv-in" base={1.6}><Person x={178} y={408} s={1.0} color="orange" pose="reach" hair="bun" outfit="dress" className="lv-rock" style={v({ "--t": 0.7, "--d": 0.2 })} hold={<path d="M0 0l-5 -11" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />} /></In>
    </Art></Scene>
  );
}

/* ---------- Tappa 3 ---------- */
// Scena: chi arriva con la valigia (protagonista) percorre il viale fino alla casa; sulla soglia della porta aperta qualcuno
// saluta. Un arancio davanti all'annesso dà profondità. Intro: sole, prato, viale, casa, albero, persone. Vita: il
// viaggiatore sale il viale ed entra, chi accoglie saluta, la nuvola, l'albero al vento, una farfalla sul prato.
export function ScenaAccoglienza() {
  return (
    <Scene><Art viewBox="0 0 600 480" className={SV} title="Una persona con la valigia cammina sul viale verso una casa; sulla soglia della porta aperta un'altra persona la saluta" desc="Dal 2008 l'accoglienza.">
      <In c="lv-sun" base={0.4}><Sun cx={96} cy={94} r={30} color="orange" rays={10} className="spin-slow" /></In>
      <Cloud x={340} y={92} s={0.8} color="green" className="lv-cloud" style={dl(2)} />
      <In c="lv-rise" k={0}><path d="M0 354C120 336 230 348 330 342S500 332 600 346V480H0Z" fill={C.green} /></In>
      <In c="lv-reveal" base={0.9}><path d="M40 496C150 448 296 404 334 352H368C356 410 300 462 262 496Z" fill={C.white} /></In>
      <In c="lv-pop" base={0.6}><Casa open x={346} y={352} s={1} /></In>
      <In c="lv-pop" base={0.95}><OrangeTree x={524} y={366} s={0.86} className="sway" style={dl(2.2)} /></In>
      <In c="lv-in" base={1.5}><Person x={346} y={351} s={0.52} color="green" pose="wave" hair="short" className="lv-rock" style={v({ "--t": 1.2, "--d": 0.5 })} /></In>
      <Butterfly x={470} y={420} s={0.9} color="yellow" t={6} d={1} dx={36} dy={-16} />
      <g transform="translate(180 452)">
        <g className="st-lv-walk st-lv-walk-3"><g className="lv-step">
          <Person s={1.1} color="orange" pose="walk" item="suitcase" itemColor="yellow" hair="long" />
        </g></g>
      </g>
    </Art></Scene>
  );
}

/* ---------- Tappa 4 ---------- */
// Scena: il campo prende colore e righe scorrendo (entrata), poi due bambini si passano la palla: la palla è la protagonista.
// In fondo la porta con la rete e un portiere pronto; dietro, due ulivi. Intro: il prato si stende, le righe si disegnano,
// ulivi e porta, poi i bambini. Vita: la palla va e viene girando, il portiere saltella, i raggi del sole girano.
export function ScenaCampo() {
  return (
    <Scene><Art viewBox="0 0 600 480" className={SV} title="Un campo da gioco verde con le righe bianche: due bambini si passano un pallone, in fondo un portiere davanti alla porta e due ulivi" desc="Il Campo Polivalente Unità d'Italia.">
      <In c="lv-sun" base={0.3}><Sun cx={510} cy={76} r={28} color="orange" rays={10} className="spin-slow" /></In>
      <g transform="translate(24 30) scale(0.92)">
        <In c="lv-pop" k={0} base={0.8}><OliveTree x={86} y={206} s={1.05} className="sway" style={dl(0.8)} /></In>
        <In c="lv-pop" k={1} base={0.8}><OliveTree x={510} y={204} s={0.9} /></In>
        <In c="lv-reveal" base={0.1}>
          <path d="M128 188H472Q484 188 489 199L582 414Q588 430 570 430H30Q12 430 18 414L111 199Q116 188 128 188Z" fill={C.green} />
        </In>
        <path className="lv-draw" style={v({ "--lv-base": "0.6s" })} pathLength={1} d="M134 200H466L566 418H34ZM68 309H532M236 309a64 24 0 1 0 128 0a64 24 0 1 0 -128 0M238 200L228 222H372L362 200M196 418L216 380H384L404 418" fill="none" stroke={C.white} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* la porta: pali bianchi, rete a maglie (ink sottile) */}
        <path d="M244 200V156H356V200M244 156L252 148H348L356 156M252 148V196M348 148V196" fill="none" stroke={C.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M260 154V198M276 152V198M292 152V198M308 152V198M324 152V198M340 154V198M246 170H354M246 184H354" fill="none" stroke={C.ink} strokeWidth="1" strokeLinecap="round" />
        <path d="M242 202V154H358V202" fill="none" stroke={C.white} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <In c="lv-in" base={1.3}><Person x={300} y={204} s={0.82} kid color="orange" pose="cheer" hair="curly" className="lv-hop" style={v({ "--t": 1.1, "--d": 0.4 })} /></In>
        <In c="lv-in" k={0} base={1.6}><Person x={150} y={398} kid s={1.5} color="yellow" pose="kick" hair="bun" /></In>
        <In c="lv-in" k={1} base={1.6}><Person x={338} y={398} kid s={1.5} color="white" pose="kick" hair="short" flip /></In>
        {/* la palla: dal piede di chi calcia a quello di chi riceve e ritorno, girando */}
        <g transform="translate(184 388)">
          <g className="lv-arc-x" style={v({ "--dx": "120px", "--t": 2.4, "--d": 2 })}><g className="lv-arc-y" style={v({ "--h": "54px", "--dy": "0px", "--t": 2.4, "--d": 2 })}><Ball /></g></g>
        </g>
      </g>
      <In c="lv-pop" base={1.1}><Weeds x={58} y={462} s={1.1} /></In>
      <In c="lv-pop" k={1} base={1.1}><Weeds x={540} y={462} s={1.1} flip /></In>
    </Art></Scene>
  );
}

/** Pallone: un solo gruppo che gira (.lv-spin). Bianco: contorno sottile ammesso. */
function Ball() {
  return (
    <g className="lv-spin" style={v({ "--t": 1.2 })}>
      <circle r="12" fill={C.white} stroke={C.ink} strokeWidth="1.6" />
      <polygon points="0,-5 4.8,-1.6 3,4.1 -3,4.1 -4.8,-1.6" fill={C.ink} />
    </g>
  );
}

/* ---------- Tappa 5: prima e adesso (stessa geometria nei due livelli, per il cursore) ---------- */
const GV = "0 0 800 500";
const HILL = "M0 318C140 292 260 314 400 304S660 294 800 314V500H0Z";
// Due file sfalsate: dietro (y 352) e davanti (y 452)
const TREES: [number, number, number][] = [[110, 352, 1], [250, 352, 1], [180, 452, 1.25], [330, 452, 1.25]];
const ROWS: [number, number][] = [[470, 410], [530, 410], [590, 410], [650, 410], [500, 455], [560, 455], [620, 455], [680, 455]];

// Scena (prima): stesso luogo, solo linee: alberi spogli, erbacce al posto dell'orto, casolare sbarrato. Intro: la collina e
// il casolare si disegnano; poi tutto fermo, è il luogo vuoto.
export function GiardinoPrima() {
  return (
    <Scene><Art viewBox={GV} className={SV} title="Il giardino prima: alberi spogli, erbacce, un casolare chiuso" desc="Disegno a sole linee su fondo bianco.">
      <rect width="800" height="500" fill={C.white} />
      <CloudLine x={120} y={84} s={1.1} />
      <path d={HILL} fill={C.white} {...ln} className="lv-draw" pathLength={1} />
      <Casa mode="sketch" draw x={560} y={330} s={0.9} />
      {TREES.map(([x, y, s], i) => <In key={i} c="lv-pop" k={i} base={0.8}><BareTree x={x} y={y} s={s * 1.3} flip={i % 2 === 1} /></In>)}
      {ROWS.map(([x, y], i) => <Weeds key={i} x={x} y={y} s={1.3} flip={i % 3 === 0} />)}
    </Art></Scene>
  );
}

// Scena (adesso): le stesse forme a colori: aranci carichi, orto di pomodori sulle canne, casolare aperto; davanti una
// persona coglie un'arancia e la mette nella cassetta. Intro: sole, alberi e piante spuntano, la casa, chi raccoglie.
// Vita: un'arancia dopo l'altra cade dalla mano nella cassetta, gli aranci dietro al vento, una farfalla sull'orto.
// Il cursore prima/adesso resta il gesto principale.
export function GiardinoDopo() {
  return (
    <Scene><Art viewBox={GV} className={SV} title="Il giardino adesso: aranci carichi di frutti, un orto di pomodori, una persona che coglie un'arancia accanto a una cassetta" desc="Le stesse forme, a colori.">
      <rect width="800" height="500" fill={C.white} />
      <In c="lv-sun" base={0.3}><circle cx="420" cy="92" r="30" fill={C.yellow} /></In>
      <In c="lv-rise" k={0}><path d={HILL} fill={C.green} /></In>
      <In c="lv-pop" base={0.6}><Casa open wall="yellow" x={560} y={330} s={0.9} /></In>
      {TREES.map(([x, y, s], i) => <In key={i} c="lv-pop" k={i} base={0.85}><OrangeTree x={x} y={y} s={s * 1.05} crown={i < 2 ? "green" : "yellow"} fruit={i < 2 && i % 2 ? "yellow" : "orange"} flip={i % 2 === 1} className={i < 2 ? "sway" : undefined} style={i < 2 ? dl(i * 1.7) : undefined} /></In>)}
      {ROWS.map(([x, y], i) => <In key={i} c="lv-pop" k={i} base={1.1}><Tomato x={x} y={y} h={i < 4 ? 66 : 78} fruit={i % 2 ? "yellow" : "orange"} /></In>)}
      <Butterfly x={590} y={350} s={1} color="orange" t={7} d={0.5} dx={60} dy={-18} />
      <In c="lv-pop" base={1.5}><Crate x={448} y={480} s={1.05} color="yellow" /></In>
      {/* la mano chiude sull'arancia del limone/arancio davanti (frutto basso a 365,384; bianca: la mano non sparisce sull'arancia e la testa sta sul prato, sotto la chioma; posa reach, flip: x − 18, y − 105) */}
      <In c="lv-in" base={1.6}><Person x={383} y={489} color="white" pose="reach" hair="cap" flip /></In>
      <g transform="translate(365.4 383.8)"><g className="lv-drop" style={v({ "--dx": "84px", "--dy": "68px", "--d": 2.4 })}><circle r="7" fill={C.orange} /></g></g>
    </Art></Scene>
  );
}

/* ---------- Tappa 6 ---------- */
// Scena: da sinistra a destra il percorso del cibo: l'orto di pomodori, chi porta la cassetta (protagonista), il sacco di
// farina, il banco coi barattoli. Intro: sole, terra, piante, banco e barattoli, la scia di puntini, chi porta la cassetta.
// Vita: chi porta la cassetta fa avanti e indietro tra l'orto e il sacco, una pianta al vento, un'ape sui pomodori.
export function ScenaAbes() {
  return (
    <Scene><Art viewBox="0 50 600 480" className={SV} title="Pomodori legati alle canne, una persona con una cassetta di frutta, un sacco di farina e barattoli su un banco" desc="ABES, agricoltura biologica sui terreni confiscati.">
      <In c="lv-sun" base={0.3}><circle cx="500" cy="112" r="32" fill={C.yellow} /></In>
      <In c="lv-rise" k={0}><path d="M0 384C110 368 220 380 320 380S470 404 600 404V560H0Z" fill={C.yellow} /></In>
      <In c="lv-reveal-x" base={1.4}><path d="M150 300C230 214 380 222 452 340" fill="none" stroke={C.white} strokeWidth="4" strokeLinecap="round" strokeDasharray="1 14" /></In>
      <In c="lv-pop" k={0} base={0.8}><Tomato x={78} y={436} h={96} /></In>
      <In c="lv-pop" k={1} base={0.8}><Tomato x={140} y={426} h={84} fruit="yellow" className="sway" style={dl(2)} /></In>
      <In c="lv-pop" k={2} base={0.8}><Tomato x={200} y={438} h={100} className="sway-s" style={dl(0.6)} /></In>
      <Butterfly x={140} y={340} s={0.7} color="yellow" t={5} d={1.5} dx={46} dy={-12} />
      <In c="lv-pop" k={0} base={1.0}><Sack x={354} y={452} s={0.95} color="green" /></In>
      {/* banco: piano con spessore e gambe, poi i barattoli */}
      <In c="lv-rise" k={1} base={0.9} y={30}>
        <rect x="402" y="414" width="6" height="40" rx="2" fill={C.green} />
        <rect x="540" y="414" width="6" height="40" rx="2" fill={C.green} />
        <rect x="392" y="404" width="164" height="12" rx="3" fill={C.green} />
        <path d="M396 410H552" {...det(1.4)} />
      </In>
      <In c="lv-pop" k={0} base={1.25}><Jar x={436} y={404} s={0.95} fill="orange" label="green" /></In>
      <In c="lv-pop" k={1} base={1.25}><Jar x={506} y={404} s={0.74} fill="yellow" label="orange" /></In>
      {/* chi porta la cassetta: va dall'orto al sacco, si gira e torna (fermo: a metà strada) */}
      <g transform="translate(278 452)">
        <g className="st-lv-carry"><g className="lv-step">
          <Person color="green" pose="carry" itemColor="orange" hair="long" />
        </g></g>
      </g>
    </Art></Scene>
  );
}

/* ---------- Tappa 7 ---------- */
// Scena: una tavola apparecchiata sotto l'arancio, due persone sedute alle panche; da destra arriva qualcuno con un cesto
// (protagonista). Intro: sole, prato, l'arancio, panche e tavola, la tavola si apparecchia, chi siede; chi porta il cesto
// entra da destra. Vita: l'arancio al vento, uno stormo nel cielo largo, chi porta il cesto respira.
export function ScenaOggi() {
  const s = 0.88;
  return (
    <Scene><Art viewBox="0 60 600 480" className={SV} title="Una tavola apparecchiata sotto un arancio con due persone sedute sulle panche; da destra arriva qualcuno con un cesto" desc="Oggi e domani: chi viene si siede.">
      <In c="lv-sun" base={0.3}><circle cx="510" cy="150" r="34" fill={C.orange} /></In>
      <Birds x={300} y={170} s={1.1} x0={-380} x1={360} t={30} d={3} />
      <In c="lv-rise" k={0}><path d="M0 420C120 410 240 418 340 414S520 408 600 416V560H0Z" fill={C.green} /></In>
      <In c="lv-pop" base={0.7}><OrangeTree x={104} y={452} s={1.75} className="sway" style={dl(3)} /></In>
      <In c="lv-rise" k={1} base={0.9} y={30}>
      <Bench x={192} y={448} s={s} />
      <Bench x={408} y={448} s={s} flip />
      {/* tavola: gambe, tovaglia gialla con le pieghe; il piano è all'altezza della mano di "sit-table" (y − 59 · s) */}
      <rect x="238" y="414" width="6" height="34" rx="2" fill={C.white} />
      <rect x="356" y="414" width="6" height="34" rx="2" fill={C.white} />
      <path d="M226 396Q226 393 229 393H371Q374 393 374 396V424Q374 428 370 428H230Q226 428 226 424Z" fill={C.yellow} />
      <path d="M226 401H374" {...det(INK.fine)} />
      <path d="M256 406V424M300 406V424M344 406V424" {...det(1.2)} />
      </In>
      <In c="lv-pop" k={0} base={1.3}>
      {/* sulla tavola: due piatti bianchi sotto le mani, la ciotola di arance, il barattolo */}
      <ellipse cx="242" cy="397" rx="14" ry="3.2" fill={C.white} stroke={C.ink} strokeWidth="1.4" />
      <ellipse cx="358" cy="397" rx="14" ry="3.2" fill={C.white} stroke={C.ink} strokeWidth="1.4" />
      <path d={disc(286, 378, 7) + disc(298, 375, 7.4) + disc(310, 379, 7)} fill={C.orange} />
      <path d="M286 371l1 -3M298 368l1 -3M310 372l1 -3" {...det(INK.fine)} />
      <path d="M274 381H322C322 390 310 393 298 393C286 393 274 390 274 381Z" fill={C.green} />
      {/* pagnotta: arancio sul giallo della tovaglia e sul bianco del cielo */}
      <path d="M326 393C326 382 334 377 342 377C350 377 358 382 358 393Z" fill={C.orange} />
      <path d="M335 384l3 -4M342 384l3 -4M349 384l3 -4" {...det(INK.fine)} />
      </In>
      {/* chi siede viene dopo la tavola: l'avambraccio passa sopra la tovaglia e la mano chiude sul bordo del piatto */}
      <In c="lv-in" k={0} base={1.1}><Person x={196} y={448} s={s} color="orange" pose="sit-table" hair="short" /></In>
      <In c="lv-in" k={1} base={1.1}><Person x={404} y={448} s={s} color="green" pose="sit-table" hair="long" flip /></In>
      <g className="st-lv-enter"><Person x={512} y={456} color="orange" pose="carry" item="basket" itemColor="green" hair="curly" build="broad" flip className="bob" style={dl(1.4)} /></g>
    </Art></Scene>
  );
}
