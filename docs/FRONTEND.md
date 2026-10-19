# Frontend (design system)

Sito pulito e luminoso: superfici bianco caldo e sabbia alternate, testo grigio caldo, un solo accento arancio agrume, foto reali protagoniste. Il contesto strategico è in `PRODUCT.md` (radice del progetto).

## Token e tipografia
- Colori in OKLCH nel blocco `@theme static` di `src/app/globals.css`: `paper` (bianco caldo), `paper-deep` (sabbia), `card`, `ink`/`ink-soft`, `line`/`line-strong`, `terracotta` (l'arancio d'accento: bottoni, link, etichette), `olive-deep` (unica fascia scura: la chiamata finale). `cobalto`, `limone`, `kraft` restano solo per illustrazioni e badge dell'admin.
- Un solo font, **Instrument Sans** (`next/font/google` in `src/app/layout.tsx`): titoli semibold con tracking stretto, testo regular. La gerarchia nasce da dimensione e peso.
- Bordi sottili (`border-line`), angoli arrotondati (`rounded-card`), ombre morbide (`shadow-card`, `shadow-pop`). Niente bordi neri spessi, ombre piene, timbri o stencil.
- Ogni coppia testo/sfondo è verificata in `tests/unit/contrast.test.ts` (WCAG AA): se aggiungi una combinazione, aggiungila lì.

## Dove sta cosa
| Cosa | File |
| --- | --- |
| Etichetta sopra i titoli (`.stamp`), link nav (`.marker`) | `src/app/globals.css` |
| Movimento (entrate, barra di avanzamento, ticker) | `src/components/public/journey.css` |
| Blocchi delle pagine (Home, Chi siamo, Shop...) | `src/components/public/blocks/` |
| Foto reali ABES | `public/foto/` (mappa `FOTO` in `blocks/shared.tsx`) |
| Illustrazioni dei luoghi (finché non ci sono foto) | `src/components/public/art/plates.tsx` |

Le sezioni restano **blocchi modificabili da admin**: cambia solo come vengono disegnate.

## Movimento
Sobrio: entrate leggere (`.rise`, `.reveal`) e barra di avanzamento in header, con CSS `animation-timeline` come miglioramento progressivo. Senza supporto o con `prefers-reduced-motion` tutto è già visibile. Nessuna libreria, nessun blocco dello scroll.

## Immagini
Nessuna foto stock o inventata. Le foto in `public/foto/` sono scatti reali di ABES (abes.bio) e compaiono solo dove si parla di ABES/agricoltura (hero, identità, sezioni ABES, news senza copertina); altrove, senza immagine scelta dall'admin, il testo sta da solo. Se l'admin sceglie un'immagine, ha sempre la precedenza. Le foto di ilocandieri.it non sono usate: sono stock non riferite ai loro luoghi.

## Regole da mantenere
- Sfondi alternati `paper` / `paper-deep`; una sola fascia scura per pagina (la chiamata finale).
- Un'azione principale arancio per sezione; le altre come bottoni outline.
- Niente card tutte uguali con icona: le liste (attività, valori) sono elenchi numerati con righe sottili.
