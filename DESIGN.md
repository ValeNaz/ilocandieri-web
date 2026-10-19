# Design — I Locandieri

A locked design system for the public site. Every page redesign reads this file before emitting code. Extend or amend this file when the system needs to grow; do not override it page by page. Strategic context (audience, tone, principles) is in `PRODUCT.md`; implementation map in `docs/FRONTEND.md`.

## The story
The official logo (public/brand/logo-originale.svg, redrawn as vector in `src/components/brand/Logo.tsx`) is **a house made of people**: an orange figure forms the roof and left wall, a yellow figure the right wall, a green dot is the person welcomed inside, a green bar the foundation. The whole site tells that: the mark assembles itself in the opening and again in the closing scene, line drawings in the three logo colors trace themselves as you scroll (house, gate and key, sprout, ball, route between places, rising sun), and every photo/video matches the words next to it.

## Genre
Custom (bespoke). Vibe: "Sicilian land coming back to life, full light, contemporary". Modern and visual, never folkloric, never retro packaging, never newspaper.

## Macrostructure family
- Home: opening on the Belice valley (slow camera move, logo assembles, title enters word by word, scene folds into a rounded window when leaving) · manifesto that lights up word by word beside the logo drawn as a line, Selinunte with parallax · "Cosa facciamo" as a story: activities with their drawings on the left, a fixed window on the right that changes scene (sprout, gate of an old farmhouse, ball, wheat at sunset) · places: a dotted route draws between two video scenes · ABES: grain video + real product grid · events / news · closing scene: sunset video, rising sun drawing, logo assembles.
- Inner pages open on a full-bleed scene with a dark veil (Chi siamo: hands offering a sprout; Shop: hands in grain; Eventi: Castelvetrano at dusk; News: Sicilian countryside; Lavora con noi: sowing). Chi siamo / Shop sections: Text sections without a photo use a reading layout (title held on the left, text on the right); values/activities use the night rows. Photos only where the section is about ABES or farming.
- Pages without a scene fall back to a typographic sand title band.
- List pages: compact heading + list/cards.
- Content pages (Privacy, Cookie, articles): typography only.

## Theme (tokens in `src/app/globals.css`, `@theme static`)
- Logo colors: `--color-brand-orange` #f16842 · `--color-brand-yellow` #f1cc26 · `--color-brand-green` #0a7d5f (drawings, mark, accents on night).
- `--color-paper`      oklch(97.8% 0.007 85)  warm white
- `--color-paper-deep` oklch(94.4% 0.016 80)  sand
- `--color-ink`        oklch(19% 0.014 55)
- `--color-ink-soft`   oklch(44% 0.014 60)
- `--color-line`       oklch(91% 0.01 75)
- `--color-night`      oklch(23% 0.036 168)   immersive dark field (logo green at night)
- `--color-night-soft` oklch(80% 0.02 120)    secondary text on night
- `--color-citrus`     oklch(70% 0.175 40)    bright accent (logo orange): fills and text on night only
- `--color-terracotta` oklch(55% 0.17 37)     accent for buttons/links on light surfaces
- `--color-terracotta-deep` oklch(48.5% 0.155 36) accent text on light surfaces
- Focus ring: 2px `--color-terracotta`.

## Typography
- Display: Bricolage Grotesque, weight 650–680, roman only, optical size 96, tracking −0.026 to −0.032em.
- Body: Instrument Sans 400, 1.0625rem / 1.6.
- Scale anchors: opening title clamp(2.6rem, 6.6vw, 6.4rem); scene clamp(2.1rem, 4.4vw, 3.8rem); section clamp(1.9rem, 3.6vw, 3rem).

## Spacing
Tailwind's 4-point scale. One page column for every section: `max-w-[88rem]` with `px-5 sm:px-8` (`Container`). Sections breathe at `py-20 sm:py-32` on the Home, `py-12 sm:py-24` elsewhere.

## Motion
All CSS except two small client pieces (`AmbientVideo`, `PillarsStory`), progressive enhancement (`src/components/public/journey.css`): logo assembles (`.logo-build` on load, `.logo-build-view` on scroll); line drawings trace (`.draw`, strokes with pathLength=1); title words enter (from 768px); manifesto words go from the 3:1 color to ink; photos drift (`.parallax`); scenes fold into a window when leaving (`.hero-shrink`); images open (`.unveil`); small shapes breathe (`.float`). Videos load only near the viewport, play only while visible, stay on the poster with reduced motion and always have a pause button. Reduced motion: everything visible and still. Easing `--ease-out-expo`. No libraries, no scroll-jacking.

## CTA voice
- Primary: pill, solid terracotta (also on video scenes); paper on night when needed.
- Secondary: pill outline.
- Header: floating pill; "Shop ABES" as a solid ink pill.

## What pages MUST share
Wordmark (orange slice + "I Locandieri"), the two fonts, the palette, the pill CTA voice, hairline rules instead of card borders where possible, rounded photos (1.5rem).

## What pages MAY differ on
Section sequence and which sections use the night field (at most one night section per page besides the footer and the closing scene).

## Rules
- Media: real ABES product photos in `public/foto/`. TEMPORARY stock (until the cooperative's own photos and videos): Wikimedia Commons photos in `public/foto/stock/`, Mixkit videos in `public/video/`, catalogued with alt text and credits in `src/components/public/media/stock.ts` and listed on `/crediti` (required by CC BY / BY-SA). Admin images always win. Every scene must match the words beside it.
- No italic headings, no hard offset shadows, no thick black borders, no stencil/slab.
- Every text/background pair in `tests/unit/contrast.test.ts`.

## Exports
### tokens (Tailwind v4 `@theme`, as shipped)
```css
@theme static {
  --color-paper: oklch(97.8% 0.007 85);
  --color-paper-deep: oklch(94.4% 0.016 80);
  --color-ink: oklch(19% 0.014 55);
  --color-ink-soft: oklch(44% 0.014 60);
  --color-night: oklch(21% 0.022 145);
  --color-night-soft: oklch(80% 0.02 120);
  --color-citrus: oklch(72% 0.165 55);
  --color-terracotta: oklch(56% 0.165 42);
  --color-terracotta-deep: oklch(49% 0.15 40);
  --font-display: var(--font-bricolage), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-instrument), ui-sans-serif, system-ui, sans-serif;
  --radius-card: 1.25rem;
}
```
