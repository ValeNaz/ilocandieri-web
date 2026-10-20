# Foto e video da fornire (shot list)

Elenco degli spazi per foto e video VERI previsti dal sito, generato dal registro `src/lib/media-slots.ts` (se il registro cambia, va rigenerato: il test `tests/unit/media-slots.test.ts` controlla che ogni id sia qui). Niente foto di repertorio, niente scene in posa o pietistiche: persone che fanno cose vere, nei luoghi veri.

## Come si consegnano
- **Dal pannello (consigliato)**: carica la foto in **Media**, poi in **Foto e video reali** scegli lo spazio, la foto, e premi Salva. Vedi `docs/GUIDA_ADMIN.md`, sezione "Foto e video reali".
- **Da tecnico**: copia il file in `public/reali/` con il nome dell'id: `<id>.webp` (o `.jpg`, `.png`); per i video `<id>.mp4` (o `.webm`) più la copertina `<id>-poster.jpg`. Quello scelto dal pannello ha la precedenza.

## Specifiche tecniche
- **Foto**: JPG o WebP, lato lungo almeno 2400 px, al massimo 8 MB (limite della libreria Media), colori naturali, nessun filtro, nessun testo o logo sovrimpresso. Il sito ritaglia al formato indicato: lascia aria attorno al soggetto.
- **Video**: MP4 (H.264) o WebM, 1920x1080, 15-40 secondi, **senza audio** (il sito lo riproduce muto), al massimo 10-15 MB, riprese ferme o lente. Serve anche un fotogramma di copertina (stesse regole delle foto). Il video si avvia solo quando è visibile, ha sempre il pulsante pausa e resta fermo sulla copertina per chi ha chiesto meno movimento.
- **Testo alternativo e crediti**: per ogni file indicare cosa si vede (una frase) e l'autore, per la didascalia e per la pagina Crediti.

## Privacy, minori, liberatorie
- Adulti riconoscibili: liberatoria firmata, conservata dalla cooperativa.
- Minori: nessun volto riconoscibile senza liberatoria di chi esercita la responsabilità genitoriale; meglio di spalle, da lontano, o solo le mani al lavoro.
- Accoglienza: nessun ospite riconoscibile, nessun dettaglio che permetta di identificarlo (documenti, targhe, nomi).
- Drone: solo con operatore abilitato e nel rispetto delle regole di volo della zona.
- Foto d'archivio: verificare chi ne detiene i diritti e come va citato.

## Elenco per pagina

### Home (`/`)

| Sezione | Id | Tipo e formato | Cosa riprendere | Privacy e liberatorie |
|---|---|---|---|---|
| Luoghi: Giardino delle Arance | `home-giardino` | Foto, Orizzontale 4:3 | Agrumeto in luce piena, alberi carichi, casolare visibile in fondo. Orizzontale. | Se compaiono persone riconoscibili: liberatoria |
| Luoghi: Campo Unità d'Italia | `home-campo` | Foto, Orizzontale 4:3 | Il campo con un'attività in corso, ripreso da bordo campo. Nessun volto riconoscibile di minori senza liberatoria; meglio di spalle, da lontano o solo mani al lavoro. | Possibili minori: liberatoria dei genitori o volti non riconoscibili |
| Cosa facciamo (chiusura) | `home-video` | Video, Orizzontale 16:9 | Video 20-40 s, senza audio parlato: apertura del cancello, orto, raccolta arance, campo, laboratorio. Riprese ferme, luce naturale. | Adulti riconoscibili: liberatoria |

### Chi siamo (`/chi-siamo`)

| Sezione | Id | Tipo e formato | Cosa riprendere | Privacy e liberatorie |
|---|---|---|---|---|
| Missione | `chi-siamo-squadra` | Foto, Orizzontale 16:9 | Foto di gruppo di soci e operatori adulti (con liberatoria), naturale, all'aperto. | Adulti riconoscibili: liberatoria |
| ABES | `chi-siamo-lavoro` | Foto, Orizzontale 4:3 | Persone al lavoro nell'orto (adulti), gesto concreto: piantare, raccogliere, sistemare cassette. | Adulti riconoscibili: liberatoria |

### Accoglienza (`/accoglienza`)

| Sezione | Id | Tipo e formato | Cosa riprendere | Privacy e liberatorie |
|---|---|---|---|---|
| La casa | `accoglienza-casa` | Foto, Orizzontale 4:3 | Spazi della casa: tavola apparecchiata, cucina, aula. Nessun ospite riconoscibile. Nessun volto riconoscibile di minori senza liberatoria; meglio di spalle, da lontano o solo mani al lavoro. | Possibili minori: liberatoria dei genitori o volti non riconoscibili; Accoglienza: nessun ospite riconoscibile |

### Giardino delle Arance (`/luoghi/giardino-delle-arance`)

| Sezione | Id | Tipo e formato | Cosa riprendere | Privacy e liberatorie |
|---|---|---|---|---|
| Il casolare | `giardino-casolare` | Foto, Orizzontale 4:3 | Facciata del casolare ristrutturato, luce radente del mattino. | Se compaiono persone riconoscibili: liberatoria |
| I tre ettari | `giardino-agrumeto` | Foto, Panoramica 21:9 | Panoramica dell'agrumeto (anche da drone, se possibile). | Drone: rispettare le regole di volo |
| Il laboratorio | `giardino-laboratorio` | Foto, Orizzontale 4:3 | Il laboratorio in attività: pentole, barattoli in preparazione, piani di lavoro. | Se compaiono persone riconoscibili: liberatoria |
| Apertura o chiusura | `giardino-video` | Video, Orizzontale 16:9 | Video 15-30 s: camminata tra gli agrumi, raccolta, orto. Senza audio parlato. | Adulti riconoscibili: liberatoria |

### Campo Polivalente Unità d'Italia (`/luoghi/campo-polivalente`)

| Sezione | Id | Tipo e formato | Cosa riprendere | Privacy e liberatorie |
|---|---|---|---|---|
| Il campo | `campo-panoramica` | Foto, Panoramica 21:9 | Il campo intero, vuoto o con attività lontana, cielo pulito. | Se compaiono persone riconoscibili: liberatoria |
| Pallavolo / primi passi | `campo-attivita` | Foto, Orizzontale 4:3 | Allenamento di pallavolo o avviamento allo sport. Nessun volto riconoscibile di minori senza liberatoria; meglio di spalle, da lontano o solo mani al lavoro. | Possibili minori: liberatoria dei genitori o volti non riconoscibili |

### Storia (`/storia`)

| Sezione | Id | Tipo e formato | Cosa riprendere | Privacy e liberatorie |
|---|---|---|---|---|
| Il casolare chiuso | `storia-prima` | Foto, Orizzontale 4:3 | Foto d'archivio del bene prima del recupero (se esiste). | Archivio: verificare chi detiene i diritti |
| Il giardino | `storia-dopo` | Foto, Orizzontale 4:3 | Stessa inquadratura di storia-prima, oggi. | Se compaiono persone riconoscibili: liberatoria |

### Tradizione (`/tradizione`)

| Sezione | Id | Tipo e formato | Cosa riprendere | Privacy e liberatorie |
|---|---|---|---|---|
| Tumminia | `tradizione-grano` | Foto, Orizzontale 4:3 | Campo di grano Tumminia (spighe mature o mietitura). | Se compaiono persone riconoscibili: liberatoria |
| Pane nero | `tradizione-pane` | Foto, Orizzontale 4:3 | Pagnotta di pane nero tagliata, su tavolo di legno, luce naturale. | Se compaiono persone riconoscibili: liberatoria |

### ABES (`/abes`)

| Sezione | Id | Tipo e formato | Cosa riprendere | Privacy e liberatorie |
|---|---|---|---|---|
| Raccolta | `abes-raccolta` | Foto, Orizzontale 4:3 | Raccolta con cassette piene (arance, ortaggi), persone adulte al lavoro. | Adulti riconoscibili: liberatoria |
| Dal seme al barattolo | `abes-video` | Video, Orizzontale 16:9 | Video 20-40 s: campo, raccolta, laboratorio, barattoli etichettati. | Adulti riconoscibili: liberatoria |

### Lavora con noi (`/lavora-con-noi`)

| Sezione | Id | Tipo e formato | Cosa riprendere | Privacy e liberatorie |
|---|---|---|---|---|
| Collaborazioni | `lavora-squadra` | Foto, Orizzontale 16:9 | Operatori adulti al lavoro in contesti diversi (orto, laboratorio, ufficio, campo). | Adulti riconoscibili: liberatoria |
