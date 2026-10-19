# Frontend (design system)

Sistema completo e vincolante in `DESIGN.md` (radice). Sito moderno e visivo: carta bianco caldo e sabbia, una sezione "notte" oliva scura, fascia finale agrume, foto reali ABES. Il contesto strategico è in `PRODUCT.md`.

## Token e tipografia
- Colori in OKLCH nel blocco `@theme static` di `src/app/globals.css`: `paper` (bianco caldo), `paper-deep` (sabbia), `card`, `ink`/`ink-soft`, `line`/`line-strong`, `terracotta` (l'arancio d'accento: bottoni, link, etichette), `olive-deep` (unica fascia scura: la chiamata finale). `cobalto`, `limone`, `kraft` restano solo per illustrazioni e badge dell'admin.
- Font (`next/font/google` in `src/app/layout.tsx`): **Bricolage Grotesque** per i titoli (mai corsivo), **Instrument Sans** per il testo.
- Bordi sottili (`border-line`), angoli arrotondati (`rounded-card`), ombre morbide (`shadow-card`, `shadow-pop`). Niente bordi neri spessi, ombre piene, timbri o stencil.
- Ogni coppia testo/sfondo è verificata in `tests/unit/contrast.test.ts` (WCAG AA): se aggiungi una combinazione, aggiungila lì.

## Dove sta cosa
| Cosa | File |
| --- | --- |
| Etichetta sopra i titoli (`.stamp`), link nav (`.marker`) | `src/app/globals.css` |
| Movimento (titolo, striscia foto, manifesto, aperture, barra) | `src/components/public/journey.css` |
| Blocchi delle pagine (Home, Chi siamo, Shop...) | `src/components/public/blocks/` |
| Foto reali ABES | `public/foto/` (mappa `FOTO` in `blocks/shared.tsx`) |

Le sezioni restano **blocchi modificabili da admin**: cambia solo come vengono disegnate.

## Movimento
Tutto CSS (`journey.css`), miglioramento progressivo: parole del titolo che entrano, striscia di foto che scorre (si ferma al passaggio del mouse), manifesto che si accende parola per parola, immagini che si aprono entrando, entrate leggere. Con `prefers-reduced-motion` o senza supporto tutto è visibile e fermo. Nessuna libreria, nessun blocco dello scroll.

## Immagini e video
- Foto reali ABES in `public/foto/` (prodotti e punto vendita).
- PROVVISORI, finché la cooperativa non fornisce i suoi: foto Wikimedia Commons (`public/foto/stock/`, licenze CC, crediti obbligatori) e video Mixkit (`public/video/`, licenza gratuita). Catalogo con testi alternativi e crediti in `src/components/public/media/stock.ts`; elenco pubblico su `/crediti`.
- Ogni scena deve corrispondere al testo accanto (es. "Beni confiscati" mostra un casale oltre un cancello, "Giardino delle Arance" gli agrumi).
- Se l'admin sceglie un'immagine, ha sempre la precedenza. Per sostituire definitivamente lo stock: caricare le foto vere dall'admin, poi togliere le voci non più usate da `stock.ts` e i file in `public/`.

## Regole da mantenere
- Al massimo una sezione `night` per pagina (oltre al footer); la fascia `citrus` solo in chiusura.
- Un'azione principale arancio per sezione; le altre come bottoni outline.
- Niente card tutte uguali con icona: le liste (attività, valori) sono elenchi numerati con righe sottili.
