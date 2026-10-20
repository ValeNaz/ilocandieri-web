# Regole scene SVG v3.2 (vincolanti) + metodo di revisione

Feedback dell'utente: troppe animazioni SVG che si sovrappongono, confusionarie; SVG costruiti in modo banale; omini con testa di colore diverso, un braccio in meno, testa mozzata. Non deve MAI accadere, né negli omini né in nessun altro elemento.

## Già fatto dal coordinatore
- `Person` (parts.tsx) v3.2: un solo colore per tutta la figura (il prop `head` è ignorato: toglilo dove lo trovi, anche nei tuoi wrapper come `Holding`, `Bender`, `CrewIcon`), entrambe le braccia sempre davanti e visibili, cassetta tenuta davanti con due mani, colore dell'oggetto portato scelto automaticamente in contrasto. Non disegnare persone a mano: solo `<Person>`.
- `RealMedia` (`src/components/public/real/RealMedia.tsx`) + registro `src/lib/media-slots.ts`: spazi per foto/video REALI legati a sezioni precise. In sviluppo mostrano un riquadro tratteggiato con la descrizione dello scatto; in produzione spariscono finché non c'è il file. Uso: `<RealMedia id="giardino-casolare" className="..." />`.

## Metodo: per OGNI scena, una per una
1. Scrivi sopra il componente un commento di una riga "Scena:" = cosa mostra, qual è il SOGGETTO, cosa si muove e perché.
2. Chiediti: si capisce in 2 secondi? C'è un soggetto solo? Cosa posso togliere? Cosa la renderebbe più bella e meno banale (composizione, scala, dettaglio significativo, prospettiva coerente)?
3. Applica le regole sotto. Se la scena non regge, ridisegnala da capo piuttosto che aggiungere decorazioni.

## Regole
**Integrità (zero tolleranza)**
- Ogni figura/oggetto è completo e leggibile: nessun pezzo mancante, nessun pezzo tagliato dal bordo della cornice o coperto da un altro elemento (teste, braccia, ruote, tetti, chiome). Lascia margine ≥ 8% dal bordo per i soggetti; solo il terreno e il cielo possono uscire dal riquadro.
- Ogni elemento contrasta con ciò che ha DIRETTAMENTE dietro: mai arancio su arancio, giallo su giallo, verde su verde, bianco su bianco (testa, corpo, oggetto, finestra, frutto). Controllalo zoomando.
- Un oggetto = un gruppo: si muove, entra ed esce tutto intero (`<Placed>`). Nessuna parte si stacca, si sposta o lampeggia da sola.
- Proporzioni coerenti nella stessa scena: persone ~ 1/2 di una porta più alta, alberi più alti delle persone, bambini (`kid`) più piccoli degli adulti vicini. Tutto appoggia su una linea di suolo (niente piedi sospesi, niente oggetti che galleggiano).

**Movimento (meno, ma meglio)**
- Al massimo **3 elementi animati per scena**, e uno solo è "protagonista". Il resto è fermo. Niente animazioni decorative ripetute (stelle, uccellini, puntini, nuvole tutte in moto).
- Nessun elemento in movimento passa sopra o dietro un altro elemento in movimento, né sopra/dietro un testo.
- Loop ambientali solo minimi (oscillazione ≤ 3°, bob ≤ 3px, durata ≥ 5s). Reveal a scroll solo con le classi del kit. Entrate una volta sola, non loop.
- Le scene in `<Stage>`: massimo 3 livelli di profondità, spostamenti piccoli; mai testo dentro lo Stage.

**Costruzione (non banale)**
- Una scena = un soggetto chiaro + un contesto essenziale (suolo, orizzonte, 1-2 elementi che dicono il luogo). Togli il rumore.
- Forme pensate: silhouette riconoscibili (casolare con volumi giusti, rete di pallavolo con pali, barattolo con coperchio e etichetta), dettagli che significano qualcosa (persiane, tegole, foglie a due toni, solchi in prospettiva) e non riempitivi.
- Prospettiva e orizzonte coerenti in tutta la scena; luce/ombra NO (palette piatta), profondità con scala e sovrapposizione.
- Angoli morbidi, linee ink 2.5-3 a scala 1, nessun colore fuori palette, nessuna opacità sulle superfici colorate.

**Testo e scene**
- Il testo non sta mai sopra un'illustrazione: ha sempre dietro il colore pieno della stanza. Se una scena e un testo condividono lo spazio, separali in zone (colonne o fasce) che non si toccano a nessuna larghezza (360-1920 px) e altezza (600-1100 px).

**Foto e video reali**
- Inserisci gli slot `RealMedia` assegnati alla tua area (vedi `page` in media-slots.ts) accanto alla sezione giusta, come elemento di pari dignità con l'illustrazione (non in fondo, non minuscolo): es. illustrazione che racconta + foto che prova. Cornice arrotondata 2rem, nessun filtro sulla foto, didascalia breve opzionale. Layout che funziona sia con la foto sia senza (in produzione lo slot vuoto sparisce: niente buchi).

## Verifica (veloce)
tsc + eslint sui tuoi file; un giro di screenshot desktop 1440 e mobile 390 (`node scripts/shot.mjs <path> --url http://localhost:3101 --out <scratchpad>`), guardando zoomato le figure. Report breve: per ogni scena, la riga "Scena:" e cosa hai cambiato.
