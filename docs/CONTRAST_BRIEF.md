# Brief contrasti (illustrazioni)

Problem: some illustration objects vanish on what is right behind them (same colour) or are too weak (white/yellow on
yellow/white on SMALL objects, contrast < 1.6:1). The user wants every such case fixed.

## Input
- Your list: `/private/tmp/claude-501/-Users-vale/d10b71f1-d507-44c9-84a9-4455292ed120/scratchpad/contrast/areas/<your-area>.json` (objects grouped: key = outermost transformed group + scene label; `kinds`
  = what was flagged, e.g. "SAME yellow/yellow": yellow shape on yellow; x,y = page coordinates at 1440px wide).
- Annotated screenshots (red box = same colour, blue = weak): `/private/tmp/claude-501/-Users-vale/d10b71f1-d507-44c9-84a9-4455292ed120/scratchpad/contrast/annot/parts/` (named by page).
- Audit tool (rerun after fixing, desktop and mobile):
  `node scripts/contrast-audit.mjs /tmp/contrast-<area> 1440 /path1,/path2` then `... 390 ...`; it writes
  report-<width>.json (shapes[] with kind/fill/on/x/y/chain/html). Do NOT edit this script.

## Rules
1. **SAME colour = always a bug** (a person, fruit, crate, window, tool, house that disappears into the shape or room
   behind it). Fix it. The only acceptable SAME cases are deliberate merges of one continuous mass (two overlapping
   hills of one colour, a tree crown touching the same hill colour at its very edge only): skip them and list why.
2. **WEAK (white on yellow / yellow on white) on small objects** (people, fruit, plates, flowers, tools, jars): fix when
   the object carries meaning. Large fields (roads, walls, big panels) are fine.
3. Also look with your eyes at your scenes for pairs that look bad even if not flagged: orange fruit on an orange
   shirt, green person on a green tree crown, ink detail on ink, a white cloud on a white sky.
4. How to fix (in order of preference): change the OBJECT's colour to another logo colour that contrasts with what is
   behind it and still makes sense (people can be any of the four; oranges orange/yellow; crates any; houses white with
   orange roof on coloured grounds); or move the object so it stands on a contrasting ground; or change the shape
   behind it. Never add outlines (outline rule, DESIGN.md v4), never new colours, never opacity tints. A Person's head is
   always the body colour; just change `color`. Watch out: Person picks crate/fruit colours to differ from the body
   only, so check the crate against the ground too (`itemColor`).
5. Keep the scene's colour balance: don't turn everything white. Neighbouring people should still differ.
6. Keep animations, layout, structure. Edit only the files of your area (same ownership as the previous v4 brief).
7. Light checks only: tsc + eslint on your files, audit tool at 1440 and 390 on your pages, look at the zoomed
   screenshots of the changed scenes. No full test suite, no build, no commits.

## Report (short, Italian)
Per scene: what you changed (object → new colour). Remaining flags with reason. Audit counts before → after.
