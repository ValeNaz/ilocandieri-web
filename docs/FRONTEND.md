# Frontend (design system)

Il sito pubblico è fatto di scene a colore pieno con foto reali dove esistono. Il riferimento visivo è il packaging artigianale mediterraneo: carta, colori pieni sovrapposti, lettering da cassetta di agrumi. Il contesto strategico è in `PRODUCT.md` (radice del progetto).

## Token e tipografia
- Colori in OKLCH nel blocco `@theme static` di `src/app/globals.css`: `paper` (crema), `terracotta` (pomodoro), `cobalto` (maiolica), `limone`, `kraft`, `olive`, `ink`. I nomi storici (`paper`, `ink`, `terracotta`, `olive`, `sage`...) sono rimasti, quindi anche l'admin ha preso la nuova identità senza modifiche alla sua struttura.
- Font (via `next/font/google` in `src/app/layout.tsx`): **Hepta Slab** per i titoli (slab pesante, `font-extrabold`), **Atkinson Hyperlegible Next** per il testo (pensato per la leggibilità), **Stardos Stencil** solo per etichette timbrate e numeri (`font-stencil`).
- Ogni coppia testo/sfondo usata è verificata in `tests/unit/contrast.test.ts` (WCAG AA). Se aggiungi una combinazione nuova, aggiungila lì: il test legge gli OKLCH direttamente dal CSS.

## Dove sta cosa
| Cosa | File |
| --- | --- |
| Utility di marca (`.stamp`, `.marker`, `.misprint`) | `src/app/globals.css` |
| Movimento (entrate, barra di avanzamento, ticker) | `src/components/public/journey.css` |
| Illustrazioni originali (SVG piatti, `aria-hidden`) | `src/components/public/art/` (`emblems`, `plates`, `primitives`) |
| Foto reali ABES | `public/foto/` |
| Scene dei blocchi (Home, Chi siamo, Shop...) | `src/components/public/blocks/` |

Le sezioni restano **blocchi modificabili da admin**: cambiano solo come vengono disegnate. Il blocco `hero` con `size: "large"` è l'hero della Home (testo + foto); gli altri hero hanno il colore della pagina (`toneForPage` in `blocks/shared.tsx`).

## Movimento
Sobrio: entrate leggere (`.rise`, 24px) e barra di avanzamento in header, con CSS `animation-timeline` come miglioramento progressivo (`src/components/public/journey.css`). Senza supporto o con `prefers-reduced-motion` tutto è già visibile. Nessuna libreria, nessun blocco dello scroll.

## Immagini
Nessuna foto stock o inventata. Le foto in `public/foto/` sono scatti reali di ABES (abes.bio) e fanno da default (`Foto` in `blocks/shared.tsx`); se l'admin sceglie un'immagine, quella ha la precedenza. Le foto di ilocandieri.it non sono usate: sono stock non riferite ai loro luoghi. Per i luoghi e le attività senza foto reale restano le illustrazioni in `art/` (`emblems`, `plates`). Le foto dei prodotti sono quelle reali di ABES.

## Regole da mantenere
- Titoli: Hepta Slab pesante e grande; non usare serif corsivo, righe sottili o card tutte uguali (anti-riferimenti di `PRODUCT.md`).
- Testo di scena in `text-paper` su `terracotta`/`cobalto`/`olive-deep`/`ink`, in `text-ink` su `limone`/`kraft`/`paper`.
- Nuove scene: un campo di colore pieno, un'illustrazione onesta, una sola azione chiara.
