# Piano di fix v3.1 (supervisione: coordinatore)

Richiesta dell'utente: animazioni allo scroll più fluide e morbide; SVG sistemati, soprattutto gli omini; le parti di ogni elemento SVG non devono staccarsi durante le animazioni (ogni oggetto resta un elemento unico composto da più pezzi); più bordi morbidi e arrotondati; testi meno "impact", meno confusionari, chiarezza al centro; mai distorcere il logo; migliorare gli SVG per portare il progetto al livello successivo.

## Già fatto dal coordinatore (non rifarlo, usalo)
- `kit.css`: scala tipografica calma (peso 700, larghezza 100%), Kinetic senza rotazioni, reveal a scroll con easing morbido e range larghi, ampiezze ridotte, loop più lenti, logo che entra intero (niente parti separate), pill senza oscillazione. Token `--ease-scroll`, `--ease-scroll-io`, `--ease-in-out-sine`, `--ease-out-quint`.
- `PinScene`: `--p` smussato a ogni frame.
- `parts.tsx`: `<Person>` v2 (figura unica: busto a casetta arrotondato, testa appoggiata, arti arrotondati attaccati; pose stand/walk/cheer/carry/sit/reach/wave/kick/bend, `kid`, `item`), `<Placed>` (posizione e animazione su due gruppi annidati), tutte le parti condivise annidate così.
- `DESIGN.md` v3.1: leggi le sezioni Typography, Motion, Logo law, Figures and objects, Layout.

## Checklist per ogni file che possiedi (tutti i punti)
1. **Omini**: sostituisci ogni persona disegnata a mano (o `Figure`/`Walker`/`PeopleLayer` locali) con `<Person>` v2. Scegli posa e `item` coerenti con l'azione. Le animazioni vanno sulla persona intera (via `className` di Person, che è già annidato), mai su testa/braccia. Bambini con `kid`.
2. **Coesione**: cerca ogni `className` animato (`bob`, `float`, `sway`, `pulse`, `pop`, `rise`, `depth`, `blink`, `flip`, `kick`, `drift`, `spin-*`, classi tue) dentro gli SVG. Se sta su un elemento con attributo `transform` o su un SOTTO-pezzo di un oggetto, sposta l'animazione su un gruppo che contiene tutto l'oggetto (usa `<Placed>` o `<g transform><g className>`). Un albero ondeggia intero, una casa entra intera, un barattolo sale intero.
3. **Logo**: elimina ogni ridisegno del logo (path copiati, "casa di persone" ricostruita a pezzi, punto verde dentro due figure arancio/gialla). Al suo posto `<LogoMark>` intero (scala uniforme, mai dentro un layer inclinato da `<Stage>`, entrata solo con `logo-build`/`logo-build-view`), oppure una casa diversa che non imiti il logo. Nessuna classe di animazione sul LogoMark oltre a quelle due. Nessun `scaleX/scaleY` diverso, nessuna rotazione.
4. **Morbidezza**: angoli arrotondati su ogni pannello/cornice (`rounded-[1.75rem]`+), `rx` sui rect SVG, `strokeLinejoin="round"` + stroke dello stesso colore sui poligoni con spigoli vivi, colline e sentieri con curve (`Q`/`C`), estremità tonde. Niente punte o seghettature.
5. **Testi**: togli `t-breathe`, `t-wide`, `t-tight`, pesi > 700, `font-stretch` ≠ 100%, `by="char"`, titoli giganti multipli nella stessa vista. Un titolo per stanza, breve e chiaro (accorcia i titoli lunghi; per i blocchi DB cambia il testo in `scripts/copy/*` tuo e lancia `pnpm copy:refresh`). Etichette maiuscole solo se informative (max una per stanza). Nessun testo sopra illustrazioni senza contrasto pieno. Paragrafi ≤ 62ch.
6. **Fluidità**: le tue animazioni CSS a scroll: niente `linear` sui reveal (usa `var(--ease-scroll)`), range ampi, spostamenti ≤ 32px, rotazioni ≤ 6°, scale ≥ 0.9; derive (`depth`) piccole. Loop ambientali ≥ 4s con `var(--ease-in-out-sine)`, sfasati. Al massimo ~25 elementi in movimento contemporaneo per vista. Nessuna animazione di proprietà di layout.
7. **SVG al livello successivo** (scegli i più efficaci per le tue scene):
   - composizione chiara con un soggetto principale per scena, piani ben separati (lontano piccolo e semplice, vicino grande e dettagliato);
   - cose appoggiate davvero a terra (ombra NO: usa la linea del suolo e il contatto), proporzioni coerenti tra persone, alberi, case;
   - dettagli che raccontano (finestre con persiane, tegole arrotondate, cassette con arance, foglie a due toni della palette, file dell'orto in prospettiva);
   - spessore linee ink uniforme (2.5-3 a scala 1), nessun colore fuori palette, nessuna forma che sparisce sul fondo dello stesso colore;
   - ritmo e varietà: dimensioni, pose, colori delle persone diversi; niente file di cloni.
8. **Verifica veloce** (l'utente non vuole perdere tempo nei test): `npx tsc --noEmit` pulito sui tuoi file, eslint sui tuoi file, UN giro di screenshot desktop 1440 + mobile 390 per pagina con `node scripts/shot.mjs <path> --url http://localhost:3101 --out <scratchpad>`, guardali, correggi i difetti evidenti. Basta.

## Report (breve)
File toccati, cosa è cambiato per punto 1-7, cosa non hai verificato, richieste al coordinatore.
