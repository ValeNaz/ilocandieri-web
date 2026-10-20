# Regole del team (redesign pubblico v3)

Progetto: Next.js 16 (App Router, React 19, Tailwind v4, TS strict). **Node/Next non sono quelli che conosci**: se usi API non ovvie, leggi `node_modules/next/dist/docs/`. Working dir: questa cartella (`ilocandieri-web`). Dev server già attivo su http://localhost:3000 (NON avviarne altri, NON lanciare `next build`, NON toccare `.next`). Altri agenti lavorano in parallelo su altri file: errori temporanei di tipo/HMR in file non tuoi vanno ignorati.

## Leggi prima di scrivere
`PRODUCT.md`, `DESIGN.md` (legge vincolante: colori, tipografia, movimento, illustrazioni, copy), `docs/FATTI.md` (unici fatti usabili), `src/components/public/kit/*` (Room, Wrap, Stage/Layer, PinScene, Kinetic, Marquee, kit.css), `src/components/public/art/parts.tsx`, e i file che possiedi.

## Proprietà dei file
Modifichi SOLO i file che il tuo brief elenca. Condivisi e vietati (chiedi al coordinatore nel report se serve una modifica): `DESIGN.md`, `globals.css`, `kit/*`, `art/parts.tsx`, `blocks/index.tsx`, `slots/index.ts`, `paths.ts`, `nav.ts`, `layout.tsx`. Se ti serve una classe CSS nuova: crea un tuo file CSS (`<area>.css`) e importalo dal tuo componente. Parti SVG nuove riutilizzabili: nel tuo `art/<area>/`. Puoi leggere/importare da `parts.tsx` e `kit`.

## Qualità (bar: premio di design, non template)
- Rispetta alla lettera: palette (sfondi SOLO bianco + arancio/giallo/verde logo), contrasti, no gradienti, no glow, no em dash (nemmeno `--`), no italics, no card identiche, no icone in cerchi, no pathos/folklore, nessun dato inventato.
- Illustrazioni SVG vere, complesse e narrative (persone nello stile del logo che FANNO cose, a livelli per il parallax 3D), non decorazioni. Ogni scena accanto al testo che la riguarda. Nel codice, scene componibili e leggibili (componenti nominati per livello), niente raster.
- Movimento ricco ma sobrio: usa il vocabolario di `kit.css` + animazioni tue in CSS. Solo transform/opacity/clip-path/stroke-dashoffset. `prefers-reduced-motion`: tutto visibile, completo, fermo. Nessun blocco dello scroll. Pochi nodi animati contemporaneamente.
- Testi: voce di DESIGN.md. Italiano curato, frasi corte, concrete, ogni parola guadagna il posto. Rileggi ogni titolo: deve dire qualcosa di vero e specifico.
- Accessibilità: h1 unico per pagina, gerarchia h2/h3, landmark, `alt`/`title` per SVG informativi e `aria-hidden` per i decorativi, focus visibile, target ≥ 44px, link con nome chiaro, contrasto AA su ogni coppia testo/sfondo.
- Responsive: prima mobile (390px e 360px), poi 768, 1440. Nessun overflow orizzontale. Le scene devono ritagliarsi bene su telefono.
- Prestazioni: SVG inline leggeri (< ~60 KB per scena), niente librerie nuove, niente immagini remote, client component solo se serve (`"use client"` minimo).
- Link interni via `paths` (`@/lib/paths`); pagine nuove con `export const metadata` (title, description in italiano). Mai hardcodare telefono/email/indirizzo: usa `getSetting("org")`.

## Verifica OBBLIGATORIA (non dichiarare "fatto" senza)
1. `npx tsc --noEmit` senza errori nei tuoi file; `npx eslint <tuoi file>` pulito.
2. Screenshot reali: `node scripts/shot.mjs <path> --w 1440 --out <dir>` e `--w 390 --h 844`, poi guarda i PNG con lo strumento Read (usa come `<dir>` una cartella dentro lo scratchpad della tua sessione). Il tool fa scroll reale e cattura più viewport (le animazioni dipendono dallo scroll). Controlla anche `--reduced`. Ripeti **almeno 2 cicli** critica → correzione: sovrapposizioni, testo illeggibile, scene tagliate male, spazi vuoti senza funzione, colori fuori palette, overflow, errori console.
3. Controlla che la pagina risponda 200 e non abbia errori in console.
Se una cosa non riesci a verificare, dillo nel report.

## Copy dei blocchi DB
I blocchi della Home/Chi siamo/Shop/ecc. sono nel DB. Il tuo testo riscritto va in `scripts/copy/<file>.ts` (override per slot, solo campi esistenti nello schema `src/lib/content/blocks.ts`, rispetta i max di lunghezza). Poi applica al DB locale: `pnpm copy:refresh` (o `npx tsx scripts/copy-refresh.ts`). Idee/concetti originali di `05_COPY_SITO.md` restano, parole nuove.

## Report finale (breve, in italiano)
File creati/modificati; rotte; cosa hai verificato (e come); cosa NON hai verificato; richieste al coordinatore. Niente lunghe descrizioni.
