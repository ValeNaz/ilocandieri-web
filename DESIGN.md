# Design — I Locandieri

A locked design system for the public site. Every page redesign reads this file before emitting code. Extend or amend this file when the system needs to grow; do not override it page by page. Strategic context (audience, tone, principles) is in `PRODUCT.md`; implementation map in `docs/FRONTEND.md`.

## Genre
Custom (bespoke). Vibe: "Sicilian land coming back to life, full light, contemporary". Modern and visual, never folkloric, never retro packaging, never newspaper.

## Macrostructure family
- Home: bespoke sequence. Opening (very large title, offset text, drifting strip of real ABES photos) · manifesto that lights up word by word · activities on the night field as full-width rows · places that open up as they enter · ABES showcase (featured photo + product grid) · events / news · citrus closing band.
- Inner marketing pages (Chi siamo, Shop): sand title band with photo. Text sections without a photo use a reading layout (title held on the left, text on the right); values/activities use the night rows. Photos only where the section is about ABES or farming.
- Other inner pages (Eventi, News, Lavora con noi, Contatti): typographic sand title band (very large title, text offset right), never an unrelated product photo.
- List pages: compact heading + list/cards.
- Content pages (Privacy, Cookie, articles): typography only.

## Theme (tokens in `src/app/globals.css`, `@theme static`)
- `--color-paper`      oklch(97.8% 0.007 85)  warm white
- `--color-paper-deep` oklch(94.4% 0.016 80)  sand
- `--color-ink`        oklch(19% 0.014 55)
- `--color-ink-soft`   oklch(44% 0.014 60)
- `--color-line`       oklch(91% 0.01 75)
- `--color-night`      oklch(21% 0.022 145)   immersive dark field
- `--color-night-soft` oklch(80% 0.02 120)    secondary text on night
- `--color-citrus`     oklch(72% 0.165 55)    bright accent: fills and text on night only
- `--color-terracotta` oklch(56% 0.165 42)    accent for buttons/links on light surfaces
- `--color-terracotta-deep` oklch(49% 0.15 40) accent text on light surfaces
- Focus ring: 2px `--color-terracotta`.

## Typography
- Display: Bricolage Grotesque, weight 650–680, roman only, optical size 96, tracking −0.026 to −0.032em.
- Body: Instrument Sans 400, 1.0625rem / 1.6.
- Scale anchors: opening title clamp(2.6rem, 6.6vw, 6.4rem); scene clamp(2.1rem, 4.4vw, 3.8rem); section clamp(1.9rem, 3.6vw, 3rem).

## Spacing
Tailwind's 4-point scale. One page column for every section: `max-w-[88rem]` with `px-5 sm:px-8` (`Container`). Sections breathe at `py-20 sm:py-32` on the Home, `py-12 sm:py-24` elsewhere.

## Motion
All CSS, progressive enhancement (`src/components/public/journey.css`): title words enter once; photo strip drifts (pauses on hover/focus); manifesto words light up on scroll; large images open from an inset window; gentle rises. Reduced motion: everything visible and still. Easing `--ease-out-expo`. No libraries, no scroll-jacking.

## CTA voice
- Primary: pill, solid terracotta (on light), paper (on night), ink (on citrus).
- Secondary: pill outline.
- Header: floating pill; "Shop ABES" as a solid ink pill.

## What pages MUST share
Wordmark (orange slice + "I Locandieri"), the two fonts, the palette, the pill CTA voice, hairline rules instead of card borders where possible, rounded photos (1.5rem).

## What pages MAY differ on
Section sequence and which sections use the night field (at most one night section per page besides the footer) or the citrus band (closing only).

## Rules
- No stock or invented photos. Real ABES photos in `public/foto/`; admin images always win.
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
