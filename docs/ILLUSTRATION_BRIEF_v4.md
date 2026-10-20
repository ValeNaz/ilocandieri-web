# Brief illustrazioni v4: "lo stesso illustratore"

Goal: move every illustration from a set of elementary geometric pictograms to an original, editorial illustration
system that looks drawn by ONE illustrator, with more intention and personality, readable at a glance. Keep identity:
logo palette (orange #f16842, yellow #f1cc26, green #0a7d5f, white) + ink, flat fills, soft shapes, warmth (community,
welcome, training, agriculture). Keep meaning, content and narrative role of every scene. Keep page layout and texts.

## Read first (mandatory)
1. `DESIGN.md` section **"Illustration language (v4)"** (the law) + "Figures and objects" + "Motion".
2. `src/components/public/art/parts.tsx`: new `Person` (poses stand/walk/cheer/carry/sit/reach/wave/kick/bend/climb/dig;
   `hair`, `build`, `outfit`, `item` crate/basket/suitcase/book/spade, `hold` = custom object in the near hand,
   `handAt()`), new `OrangeTree`, `OliveTree`, `INK`. `src/components/public/art/home/geo.tsx`: `Citrus` (= OrangeTree),
   `Crate` (no outline). These are the reference drawings: match their language.
3. Reference sheet (temporary page): http://localhost:3101/dev-tavola and the Home hero at http://localhost:3101/.

## Process (per scene, do not stop at the first)
1. Inventory the scenes of your area and where they appear (page + section), and their animations (classes, keyframes
   in your area CSS, transform-origins).
2. Screenshot BEFORE (final state): `node scripts/shot.mjs <path> --url http://localhost:3101 --reduced --w 1440 --h 900 --out /tmp/shots/<area>-before` (and `--w 390 --h 844`). Open the PNGs with Read and look.
3. Critique each scene: subject? secondary elements? intentional empty space? scale relations? things floating or
   scattered like icons? contact (feet on ground, sitters on a seat, hands on objects)? outlines consistent with the
   outline rule? objects generic (square house + triangle, circle tree) instead of specific?
4. Redraw: replace generic bespoke objects in YOUR area files with specific ones (houses with roof overhang, door step,
   mullioned windows, shutters, gutter/chimney; tools with real shapes; benches/tables with legs and seat thickness;
   jars with lid band and label; books with spines). Remove outer ink contours from masses (outline rule). Make people
   DO the action with the right pose + item/hold (crate passed between two people, someone climbing a ladder with hands
   on the rungs via `handAt`, picking a fruit that is really at the hand, digging with `dig`). Vary hair/build/outfit
   where a crowd looks cloned. Build depth by occlusion and planes. Fewer, better shapes: never fill every gap.
5. Preserve animations: keep animation classes on the inner `<g>` of `Placed` (never on an element with a `transform`
   attribute), update transform-origins/pivots if geometry moved, keep `prefers-reduced-motion` behaviour. Quality must
   be evident in the still frame.
6. Screenshot AFTER at 1440 and 390 (`--reduced` for the final state, plus one normal run). Check: nothing cropped,
   no accidental overlaps, no detail illegible at real size (people smaller than ~28px tall on mobile: give them fewer
   details or make the scene crop tighter), heads never differ from body colour, two arms, two legs, every hand/foot.
7. Iterate max 3 rounds per scene, keep the best.

## Constraints
- Edit ONLY the files listed in your task. Never edit `art/parts.tsx`, `art/home/geo.tsx`, `DESIGN.md`, kit files or
  another area. If you need a shared change (a new pose, a new item), write it in your final report instead.
- Dev server is live on :3101 (hot reload): make import changes atomically (add export before using it; never leave a
  file importing something missing).
- SVG only: no rasters, no filters, no gradients, no blur, no shadows, unique ids, viewBox unchanged unless needed
  (if you change it, keep the layout box ratio). ≤ ~250 elements per scene.
- Tests are light (user's request): only `npx tsc --noEmit` and `npx eslint <your files>`. No full test suite, no build.
- No git commits. Italian copy untouched (aria-labels/titles may be updated to describe the new drawing truthfully).

## Report (short, Italian)
Scenes updated (file:component → what changed), screenshots paths of the final state, anything left unresolved, shared
changes you would need.
