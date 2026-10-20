/**
 * Scena: tre prodotti ABES veri (cipollata, caponata, busiate di Tumminia) in fila sul bordo del campo da cui vengono.
 * Soggetto: il barattolo grande di caponata. Contesto: collina verde, un arancio, un ciuffo di grano Tumminia.
 * Colori: la collina verde tocca il bordo del pannello sulla stanza gialla (si vede); nulla di verde sopra il verde.
 * Scena viva (kit Live, come l'hero della Home). Intro, una volta: la collina sale, il sole spunta, il campo arancio
 * sale, l'arancio e le spighe crescono dal piede, poi arrivano i tre prodotti uno dopo l'altro.
 * Vita: le spighe ondeggiano, l'arancio respira al vento, due uccelli attraversano il cielo bianco, una farfalla gira
 * sopra il grano. Piu il parallasse leggero dello Stage (3 livelli). Reduced motion: tutto fermo nel quadro finale.
 */
import { Live } from "@/components/public/kit/Live";
import { Layer, Stage } from "@/components/public/kit/Stage";
import { C, Hill, OrangeTree, Sun } from "../parts";
import { Bird, Butterfly, v } from "./life";
import { Ear, Jar, PastaPack } from "./parts";

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 110 1000 800" className="size-full overflow-visible" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">{children}</svg>
);

/** Far: white sky, a still sun, the green hill (high enough that every jar top stands in front of it, never white on white). */
function Far() {
  return (
    <Svg>
      <g className="lv-sun" style={v({ "--k": 2, "--lv-y": "160px" })}><Sun cx={830} cy={240} r={52} color="orange" /></g>
      <Bird x={300} y={250} s={1.6} x0={-420} x1={820} y0={20} y1={-30} t={24} d={2.5} />
      <Bird x={340} y={290} s={1.2} x0={-420} x1={820} y0={10} y1={-40} t={24} d={3.4} />
      <g className="lv-rise" style={v({ "--k": 0, "--lv-y": "90px" })}><g transform="translate(-400 0)"><Hill width={1800} y={520} amp={22} bottom={900} color="green" seed={0.8} waves={1.6} /></g></g>
    </Svg>
  );
}

/** Mid: the orange field, an orange tree standing in it (yellow crown on the green hill), a clump of Tumminia (one group, the only loop). */
function Mid() {
  return (
    <Svg>
      <rect className="lv-rise" style={v({ "--k": 1, "--lv-y": "70px" })} x="-400" y="790" width="1800" height="200" fill={C.orange} />
      <g transform="translate(170 846)"><g className="lv-pop" style={v({ "--k": 0, "--lv-base": "0.85s" })}><g className="sway-s" style={v({ "--d": 1.3 })}><OrangeTree s={2} crown="yellow" /></g></g></g>
      <g className="lv-pop" style={v({ "--k": 2, "--lv-base": "0.85s" })}>
        <g className="sway" style={{ ["--d" as string]: 0.6 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => <Ear key={i} x={262 + i * 20} y={830} h={150 + ((i * 29) % 36)} color="orange" />)}
        </g>
      </g>
      <Butterfly x={300} y={640} s={1.8} dx={90} dy={-60} t={7.5} d={1.2} color="white" />
    </Svg>
  );
}

/** Near: the three products standing on the field edge, side by side, none covering another. */
function Near() {
  return (
    <Svg>
      <Jar x={475} y={828} s={1.45} label="yellow" content="white" lid="orange" name={["Cipollata", "agrodolce"]} className="lv-rise" style={v({ "--k": 0, "--lv-base": "1.5s", "--lv-y": "120px" })} />
      <Jar x={655} y={834} s={2.05} label="white" content="orange" lid="yellow" name={["Caponata", "siciliana"]} className="lv-rise" style={v({ "--k": 2, "--lv-base": "1.5s", "--lv-y": "120px" })} />
      <PastaPack x={846} y={828} s={1.3} label="yellow" name={["Busiate", "Tumminia"]} className="lv-rise" style={v({ "--k": 4, "--lv-base": "1.5s", "--lv-y": "120px" })} />
    </Svg>
  );
}

export function HeroScene() {
  return (
    <Live className="abes-hero-frame">
      <Stage className="abes-hero-stage">
        <Layer z={-24}><Far /></Layer>
        <Layer z={-8}><Mid /></Layer>
        <Layer z={20}><Near /></Layer>
      </Stage>
    </Live>
  );
}
