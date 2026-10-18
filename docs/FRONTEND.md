# Frontend: "Il viaggio" (design system)

Il sito pubblico è un percorso: si parte da un luogo chiuso (un cancello), lo si apre, e si attraversano le scene fino al prodotto ABES e agli inviti a partecipare. Il riferimento visivo è il packaging artigianale mediterraneo: carta, colori pieni sovrapposti, lettering da cassetta di agrumi. Il contesto strategico è in `PRODUCT.md` (radice del progetto).

## Token e tipografia
- Colori in OKLCH nel blocco `@theme static` di `src/app/globals.css`: `paper` (crema), `terracotta` (pomodoro), `cobalto` (maiolica), `limone`, `kraft`, `olive`, `ink`. I nomi storici (`paper`, `ink`, `terracotta`, `olive`, `sage`...) sono rimasti, quindi anche l'admin ha preso la nuova identità senza modifiche alla sua struttura.
- Font (via `next/font/google` in `src/app/layout.tsx`): **Hepta Slab** per i titoli (slab pesante, `font-extrabold`), **Atkinson Hyperlegible Next** per il testo (pensato per la leggibilità), **Stardos Stencil** solo per etichette timbrate e numeri (`font-stencil`).
- Ogni coppia testo/sfondo usata è verificata in `tests/unit/contrast.test.ts` (WCAG AA). Se aggiungi una combinazione nuova, aggiungila lì: il test legge gli OKLCH direttamente dal CSS.

## Dove sta cosa
| Cosa | File |
| --- | --- |
| Utility di marca (`.stamp`, `.marker`, `.misprint`) | `src/app/globals.css` |
| Coreografia di scroll (cancello, entrate, rail) | `src/components/public/journey.css` |
| Illustrazioni originali (SVG piatti, `aria-hidden`) | `src/components/public/art/` (`hero-scene`, `emblems`, `plates`, `poster`, `primitives`) |
| Scene dei blocchi (Home, Chi siamo, Shop...) | `src/components/public/blocks/` |
| Rail dei capitoli (desktop) | `src/components/public/JourneyRail.tsx` |

Le sezioni restano **blocchi modificabili da admin**: cambiano solo come vengono disegnate. Il cancello compare solo nel blocco `hero` con `size: "large"`; gli altri hero sono "poster" con il colore della pagina (`toneForPage` in `blocks/shared.tsx`).

## Movimento
Tutto il movimento legato allo scroll usa CSS `animation-timeline` (nessuna libreria, nessun JS per l'animazione) ed è miglioramento progressivo:
- Se il browser non lo supporta, oppure con `prefers-reduced-motion: reduce`, ogni scena mostra lo stato finale leggibile: il cancello è già aperto, i pannelli "Cosa facciamo" non si sovrappongono, nessun contenuto è nascosto.
- Niente blocco dello scroll. L'unico JS del percorso è il rail dei capitoli (evidenzia la scena corrente).
- Il movimento di profondità dei "luoghi" è attivo solo da 768px in su.

## Immagini
Nessuna foto stock o inventata. Dove l'admin non ha caricato una foto si usano le illustrazioni in `art/`; se carica una foto reale, quella sostituisce l'illustrazione (hero, luoghi, sezioni Chi siamo). Le foto dei prodotti sono quelle reali di ABES.

## Regole da mantenere
- Titoli: Hepta Slab pesante e grande; non usare serif corsivo, righe sottili o card tutte uguali (anti-riferimenti di `PRODUCT.md`).
- Testo di scena in `text-paper` su `terracotta`/`cobalto`/`olive-deep`/`ink`, in `text-ink` su `limone`/`kraft`/`paper`.
- Nuove scene: un campo di colore pieno, un'illustrazione onesta, una sola azione chiara.
