# Brief "scene vive": every scene animated like the Home hero

The user loves the new Home hero (`src/components/public/art/home/hero-live.tsx` + the `.hh-*` part of
`home-a.css`) and wants EVERY illustration scene of the site animated exactly like it: more dynamic, alive.
Study the hero first (open http://localhost:3101/ and watch it for 15 s; read both files). Then read the kit:
`src/components/public/kit/Live.tsx` and `src/components/public/kit/live.css` (all classes documented at the top).

## What "like the hero" means (per scene)
1. **Intro, once, when the scene enters the view** (wrap the scene's art in `<Live>`): the land builds itself in
   order: ground/hills rise layer by layer (`.lv-rise` with --k), the sun comes up (`.lv-sun`), trees and plants pop
   up from their foot (`.lv-pop`, --lv-base ≈ 0.85s, staggered), paths/roads/fields reveal (`.lv-reveal`), lines draw
   (`.lv-draw`), then the people/objects arrive (`.lv-in`/`.lv-rise`, --lv-base ≈ 1.6s). Total ≈ 2–2.5 s.
2. **Life, looping, after the intro**: 2–5 small stories that fit THE MEANING of the scene, each in its own zone with
   its own rhythm: someone walking a path (`.lv-move` + `.lv-step`), a vehicle/boat crossing (`.lv-move` + `.lv-spin`
   wheels), a ball passed between two people (`.lv-arc-x/.lv-arc-y` + `.lv-spin`), fruit picked and dropped in a
   basket (`.lv-drop`), digging/kneading/stirring (`.lv-rock`), kids cheering (`.lv-hop`), birds crossing the sky
   (`.lv-fly` + `.lv-flap`), a butterfly (`.lv-flutter`), clouds (`.lv-cloud`), smoke from a chimney or steam from a
   pot (`.lv-puff` ×3 staggered), a lantern/sign swinging (`.lv-swing`), sun rays turning (kit `.spin-slow`), trees and
   flowers swaying (kit `.sway`/`.sway-s`). Write your own keyframes in your area CSS for special paths (like the
   hero's walk up the winding path, shrinking with distance) when a straight move is not enough.
3. **Depth on scroll** where the scene has layers: kit `.depth` with `--depth` on HTML layer wrappers (far layers
   larger values), as the hero does. Never on a node that also has an intro animation (nest: outer depth, inner intro).

## Rules (the user hates confusion)
- Readable, not busy: every moving thing has a reason in the story and its own place; no two loops in unison (vary
  --d and --t); nothing moves over text; ≤ ~30 animated nodes per scene.
- Integrity: a Person and what they hold move as ONE group; hands stay on what they touch while moving; never animate
  a Person's parts; animate the inner `<g>` of `<Placed>` (never an element that has a `transform` attribute); the logo
  only with its own `logo-build` (never moved by your loops).
- REST position = final, sensible still frame (it's what reduced motion and no-JS show): moving groups rest at
  translate(0,0) in a good spot; design x0..x1 around it.
- Replace, don't stack: if a scene already has scroll-driven reveals (`.rise`, `.pop`, `.grow-scroll`, `.draw-scroll`…)
  on its INTERNAL drawing, convert them to the Live intro; keep text/section reveals and `PinScene` scroll scripts as
  they are (inside a PinScene you may add life loops, the scroll script stays the subject).
- Contrast fixes already done stay valid: moving things must not pass in front of a same-colour shape for long
  (e.g. a green walker across a green crown). Re-run `node scripts/contrast-audit.mjs /tmp/live-<area> 1440 <paths>`
  at the end (it checks the still frame) and look at a few timed frames.
- Only transform / clip-path / stroke-dashoffset. No opacity fades. Same file ownership as before. Don't edit kit files,
  `art/parts.tsx`, the hero, DESIGN.md: if you need something there, write it in your report.
- Light checks (user's request): tsc + eslint on your files; screenshots: reduced (`node scripts/shot.mjs <path>
  --url http://localhost:3101 --reduced`) for the still frame, plus 2–3 timed frames of each scene in motion (small
  playwright script: scroll the scene into view, wait 0.3 s / 1.2 s / 3 s / 8 s, screenshot). Look at them.
  No full test suite, no build, no commits.

## Report (short, Italian)
Per scene: intro sequence + the life loops you added (who/what moves and why). Anything left out and why.
