/**
 * Illustrated covers for news without a photo (never a stock image). Four small scenes, picked from the article slug.
 * In a grid of cards the life is light (one or two slow loops, no intro), so the titles stay the thing to read. `media` is the colour of the field
 * behind the tile: every shape uses white or the two logo colours that differ from it, checked against what is behind.
 * Illustration language v4: no outer contours on masses, people with their hands on what they do.
 */
import type { CSSProperties } from "react";
import { Live } from "@/components/public/kit/Live";
import { C, handAt, OrangeTree, Person, type Fill } from "../parts";
import { Bench, Crate, Ground, House, Paper, Scene, Smoke, Sunny, ink } from "./parts";

const css = (o: Record<string, string | number>) => o as CSSProperties;

type Media = "orange" | "yellow" | "green";
const others = (m: Media): [Fill, Fill] => (m === "orange" ? ["yellow", "green"] : m === "yellow" ? ["orange", "green"] : ["yellow", "orange"]);
const G = 214;

export const TILE_COUNT = 4;

export function NewsTile({ variant, media }: { variant: number; media: Media }) {
  const [a, b] = others(media);
  // a tree crown that differs from the sky (media) and from the ground (b)
  const crown: Fill = (["green", "white"] as const).find((c) => c !== media && c !== b)!;
  const fruit: Fill = crown === "white" ? (media === "orange" ? "yellow" : "orange") : media === "orange" ? "yellow" : "orange";
  // the slug hash can be negative: keep the index in 0..TILE_COUNT-1, or no scene would match and the cover stays empty
  const v = ((variant % TILE_COUNT) + TILE_COUNT) % TILE_COUNT;
  const crop: Fill = media === "orange" ? "yellow" : "orange";
  const [px, py] = handAt("point", "front");
  const sheet = (
    <g transform="rotate(-14)">
      <rect x="-3" y="-21" width="17" height="22" rx="1.6" fill={C[b]} />
      <path d="M1 -15H10M1 -10.5H10M1 -6H7" stroke={C.white} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
  return (
    <Live className="absolute inset-0">
    <Scene viewBox="0 0 400 250" slice className="sc">
      <Ground x={24} y={G - 3} w={352} h={30} color={b} />
      {/* Scena: la bacheca con due avvisi; una persona appoggia il dito sull'avviso. */}
      {v === 0 && (
        <>
          <path d={`M186 ${G} V150 M290 ${G} V150`} {...ink(6)} />
          <rect x="150" y="62" width="176" height="96" rx="5" fill={C.white} />
          <path d="M140 64 L238 40 L336 64 Z" fill={C[a]} stroke={C[a]} strokeWidth="5" strokeLinejoin="round" />
          <Paper x={202} y={Math.round(G + py * 0.9) - 22} w={52} h={70} lines={4} fill={a} rot={-3} />
          <g className="lv-swing" style={css({ "--t": 3.6 })}><Paper x={276} y={104} w={50} h={56} lines={3} fill={b} rot={2} /></g>
          <circle cx={201} cy={Math.round(G + py * 0.9) - 52} r="4" fill={C[b]} />
          <circle cx={276} cy={79} r="4" fill={C[a]} />
          <Person x={196 - px * 0.9} y={G} s={0.9} color={b} pose="point" hair="long" />
        </>
      )}
      {/* Scena: qualcuno arriva con la valigia alla casa, l'arancio accanto. */}
      {v === 1 && (
        <>
          <Sunny cx={350} cy={46} r={18} color={a} />
          <OrangeTree x={92} y={G} s={1.05} crown={crown} fruit={fruit} />
          <House x={282} y={G} s={0.95} wall="white" roof={a} door={b} />
          <Smoke x={309} y={92} s={0.8} color={media === "green" ? "white" : "green"} />
          <Person x={178} y={G} s={0.8} color="white" pose="walk" item="suitcase" itemColor={a} hair="cap" />
        </>
      )}
      {/* Scena: una persona seduta sulla panchina sotto l'albero legge il foglio. */}
      {v === 2 && (
        <>
          <Sunny cx={70} cy={56} r={22} color="white" />
          <OrangeTree x={286} y={G} s={1.15} crown={crown} fruit={fruit} className="sway" style={css({ "--d": 0.8 })} />
          <Bench x={198} y={G} w={64} h={42} fill={b} />
          <Person x={196} y={G} s={1.05} color={a} pose="sit" hair="bun" hold={sheet} />
        </>
      )}
      {/* Scena: le cassette del raccolto impilate e chi ne porta un'altra. */}
      {v === 3 && (
        <>
          <Sunny cx={70} cy={56} r={20} color={a} />
          <Crate x={256} y={G} s={0.95} color={media === "green" ? "yellow" : "white"} fruitColor={crop} />
          <Crate x={314} y={G} s={0.95} color={media === "yellow" ? "orange" : "white"} fruit={false} />
          <Crate x={314} y={G - 25} s={0.95} color={media === "orange" ? "green" : media === "green" ? "yellow" : "white"} fruitColor={crop} />
          <Person x={170} y={G} s={0.98} color={media === "orange" ? "green" : "orange"} pose="carry" itemColor={media === "orange" ? "yellow" : "white"} hair="curly" className="lv-step" />
        </>
      )}
    </Scene>
    </Live>
  );
}
