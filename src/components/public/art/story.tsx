import { cn } from "@/lib/utils";

/**
 * Line drawings that tell the story while you scroll. Every stroke has pathLength=1 so journey.css (.draw) can trace it
 * as it enters the screen; static (fully drawn) without scroll-driven animation or with reduced motion.
 * Colors are the three logo colors. All decorative (aria-hidden): the text next to them says the same thing.
 */
type P = { className?: string };
const line = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength: 1 };
const O = "var(--color-brand-orange)";
const Y = "var(--color-brand-yellow)";
const G = "var(--color-brand-green)";

function Frame({ viewBox, className, children }: { viewBox: string; className?: string; children: React.ReactNode }) {
  return <svg aria-hidden="true" viewBox={viewBox} className={cn("draw overflow-visible", className)}>{children}</svg>;
}

/** The logo as a line: two people make a roof and walls around a third, on a foundation. The welcome. */
export function StoryHouse({ className, stroke = 3 }: P & { stroke?: number }) {
  return (
    <Frame viewBox="-4 -4 134 164" className={className}>
      <circle cx="14" cy="22" r="12.5" stroke={O} strokeWidth={stroke} {...line} />
      <path d="M71 3H78V36L27 75V122H1V66Z" stroke={O} strokeWidth={stroke} {...line} />
      <circle cx="110" cy="22" r="13" stroke={Y} strokeWidth={stroke} {...line} style={{ animationDelay: "60ms" }} />
      <path d="M79 40L124 71V122H96V84L79 69Z" stroke={Y} strokeWidth={stroke} {...line} />
      <circle cx="62" cy="99" r="13.5" stroke={G} strokeWidth={stroke} {...line} />
      <path d="M28 125H96V154H28Z" stroke={G} strokeWidth={stroke} {...line} />
      <circle className="float" cx="62" cy="99" r="5" fill={G} />
    </Frame>
  );
}

/** A gate that opens and a key: places taken back and given a new use. */
export function StoryGate({ className }: P) {
  return (
    <Frame viewBox="0 0 200 140" className={className}>
      <path d="M20 130V40M180 130V40" stroke={G} strokeWidth="3" {...line} />
      <path d="M20 46l52 -14v98l-52 0M180 46l-52 -14v98l52 0" stroke={O} strokeWidth="3" {...line} />
      <path d="M36 60v58M52 54v64M164 60v58M148 54v64" stroke={O} strokeWidth="2" {...line} />
      <path d="M8 130h184" stroke={G} strokeWidth="3" {...line} />
      <g className="float">
        <circle cx="100" cy="62" r="11" stroke={Y} strokeWidth="3" {...line} />
        <path d="M100 73v34M100 92h9M100 101h7" stroke={Y} strokeWidth="3" {...line} />
      </g>
    </Frame>
  );
}

/** A seed in the soil that becomes a plant. Organic farming, ABES. */
export function StorySprout({ className }: P) {
  return (
    <Frame viewBox="0 0 160 160" className={className}>
      <path d="M10 130c30-8 50-8 70 0s42 8 70 0" stroke={O} strokeWidth="3" {...line} />
      <path d="M80 128C80 100 78 78 82 52" stroke={G} strokeWidth="3" {...line} />
      <path d="M81 86C62 84 50 70 48 54c18 0 30 12 33 32" stroke={G} strokeWidth="3" {...line} />
      <path d="M82 66c4-20 20-30 38-30 0 20-16 30-38 30" stroke={G} strokeWidth="3" {...line} />
      <circle className="float" cx="118" cy="22" r="10" stroke={Y} strokeWidth="3" {...line} />
    </Frame>
  );
}

/** A ball in flight over a pitch line: sport as a common language. */
export function StoryBall({ className }: P) {
  return (
    <Frame viewBox="0 0 220 140" className={className}>
      <path d="M10 124h200" stroke={G} strokeWidth="3" {...line} />
      <path d="M20 118C60 30 120 20 176 70" stroke={O} strokeWidth="2.5" strokeDasharray="0.02 0.03" className="dots" {...line} />
      <g className="float">
        <circle cx="186" cy="84" r="16" stroke={Y} strokeWidth="3" {...line} />
        <path d="M172 78c8 4 20 4 28 0M176 96c6-4 14-4 20 0M186 68v32" stroke={Y} strokeWidth="2" {...line} />
      </g>
    </Frame>
  );
}

/** The route between the places: a winding line with two pins. */
export function StoryRoute({ className }: P) {
  return (
    <Frame viewBox="0 0 600 120" className={className}>
      <path d="M20 90C120 20 200 110 300 60S470 10 580 50" stroke={O} strokeWidth="2.5" strokeDasharray="0.012 0.018" className="dots" {...line} />
      <g className="float">
        <path d="M20 90c0-14 18-14 18 0 0 10-9 18-9 18s-9-8-9-18z" transform="translate(-9 -24)" stroke={G} strokeWidth="2.5" {...line} />
      </g>
      <g className="float" style={{ animationDelay: "1.2s" }}>
        <path d="M580 50c0-14 18-14 18 0 0 10-9 18-9 18s-9-8-9-18z" transform="translate(-9 -24)" stroke={G} strokeWidth="2.5" {...line} />
      </g>
    </Frame>
  );
}

/** Horizon and a rising sun: the future the closing scene talks about. */
export function StorySun({ className }: P) {
  return (
    <Frame viewBox="0 0 300 140" className={className}>
      <path d="M10 120h280" stroke="var(--color-paper)" strokeOpacity=".7" strokeWidth="2" {...line} />
      <path d="M90 120a60 60 0 0 1 120 0" stroke={Y} strokeWidth="3" {...line} />
      <path d="M150 40v-24M96 60 80 44M204 60l16-16M70 104H46M230 104h24" stroke={O} strokeWidth="3" {...line} />
    </Frame>
  );
}

/** Pick the drawing for an activity from its title (so editing the text keeps the right picture). */
export function storyFor(title: string, index: number): (p: P) => React.ReactElement {
  const t = title.toLowerCase();
  if (/accogl|inclus|persone/.test(t)) return StoryHouse;
  if (/confisc|beni|luogh/.test(t)) return StoryGate;
  if (/sport|campo|gioc/.test(t)) return StoryBall;
  if (/agric|abes|terra|coltiv/.test(t)) return StorySprout;
  return [StoryHouse, StoryGate, StoryBall, StorySprout][index % 4]!;
}
