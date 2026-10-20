# Design — I Locandieri (v3.1, "La casa fatta di persone")

Locked design system for the PUBLIC site. Strategic context: `PRODUCT.md`. Verified facts and forbidden claims: `docs/FATTI.md`. Read both before writing anything. The admin keeps its structure and only inherits tokens/fonts.

## Concept
The logo is a **house made of people**: an orange figure (roof + left wall), a yellow figure (right wall), a green dot (the person welcomed inside), a green bar (foundation). The whole site is that house, built room by room while you scroll. Every section is a **room**: a full-bleed field in one logo color (or white) with a big hand-built SVG scene in it. Characters are always **people drawn like the logo** (round head, angular house-like body): `Person` in `src/components/public/art/parts.tsx`. The story the pages tell: *a place nobody could use → people arrive → a place that lives (garden, field, home, kitchen, shop)*.

Aesthetic lane (named, so nobody drifts): **Matisse cut-outs meets a 1960s Olivetti/Italian civic poster meets Memphis-light**: flat colour shapes, huge stretched type, generous colour blocks, playful but rigorous. NOT: editorial magazine (no serif italics, no hairline-rule columns), NOT SaaS (no gradients, no icon-circle cards), NOT folklore (no trinacria, coppole, cartwheels, puppet knights), NOT non-profit pathos (no hands, hearts, "salviamo").

## Colour law (hard)
- **Backgrounds: ONLY white and the three logo colours.** `--c-white #fff` · `--c-orange #f16842` · `--c-yellow #f1cc26` · `--c-green #0a7d5f`. No sand, no cream, no black/ink/dark-green fields, no gradients, no tinted greys, no photos as full-bleed backgrounds.
- `--c-ink` (oklch(19% 0.04 168), a green-black) is for **text, line art, and small pill buttons only**, never a section background.
- Contrast pairs (enforced, see `tests/unit/contrast.test.ts`): ink on white / yellow / orange ✔ · white on green ✔ · green text on white ✔ · yellow text on green: display sizes (≥24px bold) only · orange text on white: display sizes only (3.0:1) · **never** white text on orange or yellow, ink text on green, orange text on green, yellow text on white.
- Rooms: `<Room tone="white|orange|yellow|green">` sets `--fg` (text) and `--pop` (accent for tiny details). Pick the tone per idea, not per rhythm: alternate so no two neighbouring rooms share a tone; the page's first room and last room differ.
- SVG fills use `var(--c-*)` via the `C` map in `parts.tsx`. Add `--c-ink` strokes ≤ 3px for fine detail. No opacity tricks that create off-palette tints (small `opacity` on ink lines is OK; never on fills).
- Allowed in illustrations only: white shapes on any tone, and the other logo colours as shapes. Shapes touching a same-colour room vanish: check each shape against its room.

## Typography (v3.1: clarity first)
- Display: **Anybody** at weight **700**, width **100%** only. Classes in `kit.css`: `.t-mega` (one per page, the opening title), `.t-giant`, `.t-scene`, `.t-head`, `.t-label` (small caps label in Hanken, max one per room). No weight above 700, no `font-stretch` other than 100%, no width/letter-spacing effects on hover, no letter-by-letter entrances. `.t-breathe` / `.t-wide` / `.t-tight` are retired (no-ops): remove them when you touch a file.
- Text: **Hanken Grotesk** 400/500/700, 1.094rem/1.7, max 62ch (`.t-body`, `.t-lead`).
- Clarity rules: one big title per room, max ~8 words (shorter is better); one supporting paragraph; a label only when it adds information. Titles never overlap illustrations or other text. Never more than two type sizes competing in one view. Sentence case, no italics, never gradient text.
- Kinetic type: `<Kinetic text as by="word">` (gentle fade-up, words only) for the opening title; `<LitWords>` for one manifesto per page at most.

## Motion vocabulary (`kit.css`, all CSS / progressive; reduced motion = still and complete)
- Scroll-driven (view timeline): `.rise`, `.rise-x`, `.pop`, `.depth` (+`--depth` -1..1), `.depth-x`, `.spin-scroll` (+`--spin`), `.grow-scroll`, `.draw-scroll` (stroke paths with `pathLength="1"`), `.wipe`, `.tilt-scroll` (3D tilt of a panel), `.room-shrink`, `.lit-word`.
- Ambient loops: `.sway`, `.sway-s`, `.bob`, `.drift` (+`--t`,`--d`), `.spin-slow`, `.pulse`, `.flip`, `.blink`, `.march`, `.rain-up`, `.kick`. Always give neighbours different `--d` so nothing moves in unison.
- 3D: `<Stage>` + `<Layer z>` (pointer/idle parallax with real CSS perspective; far layers z<0, near z>0). `<PinScene steps>` pins a viewport-height stage and exposes `--p` (0..1) for scroll-scripted scenes (build the house, a sun crossing the sky, a route being walked): derive transforms in CSS with `calc(var(--p) * …)`. `.tilt-scroll` for panels swinging in 3D. Use `transform-style: preserve-3d` and `translateZ` freely inside a stage.
- **Smoothness (v3.1):** scroll reveals use the eased kit classes (`--ease-scroll`), wide ranges (`entry 0% cover 40%+`), short travel (≤ 32px, scale ≥ 0.9, rotations ≤ 6°). Never `linear` for a reveal; `linear` only for continuous depth drifts with small amplitude (≤ 7vh). Ambient loops are slow (≥ 4s) with `--ease-in-out-sine`. `<PinScene>` already smooths `--p`; derive with `calc()` and keep each step's motion short. Custom keyframes in your CSS follow the same rules.
- **Live scenes (v4, the Home hero language):** every illustration scene is wrapped in `<Live>` (`kit/Live.tsx`, classes in `kit/live.css`): a timed intro once when it enters the view (land rises layer by layer, sun up, trees pop from their foot, paths reveal, people arrive, about 2.5 s), then 2–5 life loops that tell the scene's story, each in its own place and rhythm (walks, vehicles, a ball passed, fruit dropped in a basket, digging, birds, smoke, swaying), and `.depth` layers on scroll. Loops pause off screen. Reduced motion and no-JS show the final still frame. Brief: `docs/LIVE_BRIEF.md`; reference: `art/home/hero-live.tsx`.
- Easing tokens: `--ease-out-quint`, `--ease-scroll`, `--ease-scroll-io`, `--ease-in-out-sine`. Only transform/opacity/clip-path/stroke-dashoffset animate. No scroll-jacking (PinScene is sticky, never captures wheel). No bounce/elastic. Max 1 PinScene per page; never more than ~60 animated SVG nodes in view at once; pause nothing that conveys information.
- Every page opens with something that moves on load (Kinetic title + a living scene) and ends with the closing room (logo assembles with `.logo-build-view`).

## Logo law (absolute)
The logo appears ONLY through `<LogoMark>` / `<Logo>` (`src/components/brand/Logo.tsx`), at uniform scale, flat, in its exact colours, whole. Never redraw it, never split it into parts that move separately, never rotate, skew, stretch, recolour, outline, extrude or 3D-tilt it (no `<Stage>` tilt on a layer that contains it). It enters only with `.logo-build` / `.logo-build-view` (whole mark fades and rises). A house that is NOT the logo may appear in scenes, but must not imitate it (no orange/yellow figure walls with a green dot inside).

## Illustration language (v4, "lo stesso illustratore") — overrides the figure lines of v3.1 below where they differ
Editorial flat illustration, not pictograms. One hand draws everything:
- **Outline rule.** Never an outer contour around a mass (people, trees, houses, crates, hills, furniture). `--c-ink` is used ONLY for: (1) hair, trousers, shoes; (2) things that ARE dark: iron (gates, railings, tools' shafts), trunks and branches, olives, pans; (3) interior detail lines at two weights, `INK.fine` 1.8 and `INK.bold` 2.6 (object units, object ≈ 100 tall): slat gaps, window mullions, roof tiles rows, book spines, seams, stalks. Exception: small WHITE handheld objects (ball, plates, paper, jars) may carry a fine ink contour, because white is also the background.
- **People** = `<Person>` only (parts.tsx). About 5.5 heads, three-quarter view facing the `flip` direction (nose + eye), elbows and knees, round hands that close OVER what they hold, both feet with shoes on the ground line. Head always the body colour. Variety is automatic (hair/build/outfit derived from position) or explicit: `hair` short|bun|long|curly|cap|none, `build` slim|regular|broad, `outfit` trousers|dress|apron. Poses: stand, walk, cheer, carry, sit, sit-table (seated, near hand forward at table height y ≈ −59), reach, place (near hand forward at shoulder height, to put something on a shelf), present (both hands at mid-chest; `hold` is drawn centred between them, under the fingers: a map, a sheet, a sheaf), point (near arm straight forward at eye level), wave, kick, bend, climb, dig. Items: crate, basket (both hands), suitcase, book, spade (near hand). Custom object in the near hand: `hold={<g>…</g>}` drawn with its grip at (0,0), under the fingers (`holdBack` = same for the far hand); `handAt(pose, "front"|"back")` gives hand coordinates for things that must touch a hand (ladder rungs, a branch, another person's hand).
- **Contact.** `sit` sits on a seat whose top is at y ≈ −40 person units (draw a bench/chair/wall/step there, never on air). `climb` stands with the near foot on a rung at y ≈ −20 and hands at `handAt("climb", …)`. `reach` touches the fruit/branch it reaches. `bend`/`dig` touch the soil. Two people interacting share a point (hand to hand, crate passed between them).
- **Objects** describe their subject in few, specific details: citrus = `OrangeTree` (forked ink trunk, lobed crown with leaves breaking the edge, fruit with stalks); olive = `OliveTree` (twisted trunk, wide low crown, white silver leaves, ink olives); crate = slats + end posts; houses = real proportions (roof overhang, door with step, windows with mullions/shutters, a chimney or a gutter), never a square with a triangle; books with spine line; jars with lid band and label.
- **Composition.** One subject (largest, highest contrast, nearest), two or three secondary groups, and intentional empty space (at least a third of the frame quiet). Depth by occlusion (things overlap, people stand in front of trees, a tree in front of a house), by planes (far hills smaller and higher), by scale. No icon scatter: every object rests on something and relates to a person or a place.
- **Curves and terminals.** Round caps and joins everywhere; corner radii ≈ 3 at 100-unit scale; Bézier curves for organic things, straight lines only for built things.
- Not allowed: 3D, gloss highlights, gradients, glass, heavy shadows, caricature, childish faces (no smiles, no cheeks, no big eyes).

## Figures and objects (v3.1)
- People: ONLY `<Person>` from `parts.tsx` (poses: stand, walk, cheer, carry, sit, reach, wave, kick, bend; `kid`; `item`: crate, suitcase, basket). One solid figure: never animate its head, arms or legs separately, never rebuild people by hand.
- Every multi-part object (tree, house, crate, jar, ball, cloud, cart) is ONE group. Position on an outer `<g transform>`, animation class on an inner `<g>`: use `<Placed>` from `parts.tsx`. A CSS animation on an element with a `transform` attribute makes it jump: never do it.
- Things stand on things: feet on the ground line, objects on surfaces, nothing floating unless it flies (sun, cloud, bird, ball in the air).
- Soft shapes: rounded corners everywhere (`rx` on rects, `strokeLinejoin="round"` with a same-colour stroke on polygons, curves (`Q`/`C`) for hills and paths, round caps on lines). No sharp spikes, no jagged polylines.
- Flat vector only: shapes in the four fills + ink line art. Rounded caps/joins. No gradients, filters, blurs, shadows (depth comes from layering, scale and parallax).
- Compose in **layers** (sky / far hills / mid / near / foreground / people) so a `<Stage>` can separate them. Wrap in `<Art viewBox title desc>`; informative scenes get `title`, decorative ones are `aria-hidden`.
- Every scene tells something true (see `docs/FATTI.md`) and sits beside text about it. People do things (carry crates, pick oranges, kick a ball, cook, knead, sit and talk): never stand in rows posing. Vary poses, sizes, colours.
- Complex is welcome, heavy is not: keep each scene under ~250 elements, ≤ 60 KB of TSX, no embedded rasters. Reuse parts from `parts.tsx`; add new reusable parts to your own `art/<area>/parts.tsx`, not to the shared file.
- Real photos: only the genuine ABES product photos in `public/foto/` (shop, ABES pages). No stock photos/videos anywhere on the public site; remove `media/stock.ts`/`AmbientVideo` usage you encounter in files you own. Illustrations are declared as original on `/crediti`.

## Layout
- Column: `<Wrap>` (max 96rem, `px-5 sm:px-10`). Break the grid on purpose: oversized type bleeding off the edge, scenes overflowing their room (`overflow-x-clip` is on Room), overlapping text and art (z-index discipline, text always readable on its tone).
- Vary vertical rhythm: some rooms are one full viewport (`min-h-[100svh]`), some are tight bands, one per page can be a pinned scene.
- Panels and frames are soft: `rounded-[1.75rem]` to `rounded-[2.5rem]` (pills fully round). No square corners on any coloured panel, image or illustration frame.
- Cards are the exception. Prefer: big numerals, rows separated by colour changes, rounded **cut-out panels** (`rounded-[2rem]`) in a contrasting logo colour. Never identical icon cards, never nested cards.
- Phone first: every scene must crop gracefully (`preserveAspectRatio="xMidYMid slice"` or a separate mobile viewBox), text ≥ 16px, touch targets ≥ 44px, no horizontal scroll.

## CTA voice
Pills (`.pill .pill-solid` / `.pill .pill-line`, in kit.css; or `ButtonLink` from ui). Solid ink pill on white/yellow/orange, white pill on green. One primary per room. Arrow glyph `→` inside `<span className="arrow">`.

## Copy voice (Italian)
Short. Concrete nouns, verbs of work (coltivare, costruire, aprire, restituire). One idea per sentence. Name places, ingredients, ages, gestures. No pathos, no slogans about "cambiare il mondo", no "sogni", no rhetorical questions in a row, no stacked adjectives. **No em dashes, no `--`**: use commas, colons, full stops. Never invent numbers, quotes, dates, people, events, prices (`docs/FATTI.md` lists what is safe). Headlines can be bold and surprising, but must state something true. Every room ends in an action or a next place to go.
Existing concepts of the copy dossier (`05_COPY_SITO.md`) stay: each block keeps its meaning, but the wording is rewritten to this voice. Editable copy of DB blocks lives in `scripts/copy/<page>.ts` (override by slot; applied to the DB with `pnpm copy:refresh`). Copy of new pages lives in the page files (static, editorial).

## Page families
| Page | Route | Notes |
|---|---|---|
| Home | `/` | Opening room + story pin + places + ABES + events + news + closing. DB blocks, custom views in `blocks/slots/home.tsx`. |
| Chi siamo | `/chi-siamo` | DB blocks, views in `slots/about.tsx`. |
| Storia | `/storia` | New, static. Timeline as a drawn route. |
| Luoghi | `/luoghi`, `/luoghi/giardino-delle-arance`, `/luoghi/campo-polivalente` | New, static. |
| Accoglienza | `/accoglienza` | New, static. |
| Tradizione | `/tradizione` | New, static: the territory (Belice, Selinunte, grano, olive, pane nero). |
| ABES | `/abes` | New, static: from seed to jar. Links to `/shop`. |
| Shop | `/shop` | DB blocks, `slots/shop.tsx`. Real product photos allowed. |
| Eventi, News, Lavora, Contatti, 404, Crediti, legal | existing routes | restyled to this system; forms keep all logic. |

## Tokens
Public: `--c-*` and `.room-*` in `kit.css`/`globals.css`. Legacy Tailwind tokens (`paper`=white, `ink`, `night`=brand green, `citrus`=brand orange, `terracotta`) remain for the admin and shared `ui/*`; **public code must not use `paper-deep`, `sage`, `kraft`, `olive`, `cobalto`, `limone`**.
