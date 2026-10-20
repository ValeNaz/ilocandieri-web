# Guida al pannello di amministrazione

Per chi gestisce il sito senza essere un tecnico. Il pannello e' su **https://tuo-sito/admin**. A sinistra c'e' il menu, diviso in quattro gruppi: Panoramica, Contenuti del sito, Richieste ricevute, Impostazioni. In fondo al menu trovi **Profilo** e **Esci**.

Regola d'oro: le modifiche ai testi sono **subito visibili** sul sito dopo "Salva". Le **bozze** e gli eventi "Nascosti" non li vede nessuno.

## 1. Primo accesso e password
1. Vai su `/admin` e accedi con email e password che ti ha dato chi ha installato il sito.
2. Apri **Profilo** (in fondo al menu) e cambia subito la password: scrivi quella attuale, poi la nuova (almeno 10 caratteri) due volte, e premi "Aggiorna password".
3. Se la dimentichi: nella pagina di accesso scegli "Password dimenticata", scrivi la tua email: se la posta del sito e' configurata ricevi un link valido 1 ora. Se la posta non e' configurata, chiedi a chi gestisce il server di reimpostarla.
4. Dopo troppi tentativi sbagliati l'accesso si blocca per alcuni minuti: aspetta e riprova.
5. Esci sempre con **Esci** se usi un computer condiviso.

## 2. Dashboard
E' la prima pagina. In "Da guardare" vedi quante **richieste di iscrizione in attesa**, **candidature nuove**, **messaggi da leggere** ed **email non partite** ci sono (clic sulla casella per aprire l'elenco). Sotto: eventi futuri e news pubblicate, gli iscritti per evento e la sezione **Collegamenti**, che dice se posta, Shopify/ABES e statistiche sono "Configurato" o "Da configurare".

## 3. Modificare la Home
Menu **Home**. La pagina e' fatta di **sezioni** in elenco (apertura, ambiti, luoghi, vetrina ABES, eventi, news, invito finale...).
- **Modificare**: clicca "Modifica" su una sezione, cambia titolo, testo, pulsanti (testo + destinazione) e premi **Salva** in quella sezione. Ogni sezione si salva da sola.
- **Immagini**: dove c'e' il campo "Immagine" scegli una foto tra quelle caricate in **Media** (prima caricala li'). Senza immagine il sito mostra un disegno decorativo.
- **Nascondere/mostrare**: bottone "Nascondi dal sito" / "Mostra sul sito" dentro la sezione. Una sezione nascosta resta salvata.
- **Cambiare ordine**: frecce "Su" / "Giu'" dentro la sezione.
- **Sezioni con "nota per chi modifica"**: sono testi da verificare prima della pubblicazione (vedi sotto).
- In fondo, **SEO e condivisione**: titolo e descrizione che compaiono su Google e quando il link viene condiviso, piu' l'immagine di anteprima.
- La sezione "Vetrina prodotti ABES" regola solo i testi e **quanti prodotti mostrare** (1-12, consigliato 4-8). I prodotti si scelgono in "Prodotti ABES". Le sezioni Eventi e News mostrano automaticamente gli ultimi pubblicati: se non ce ne sono, mostrano il messaggio che scrivi tu (se lo lasci vuoto la sezione sparisce).

## 4. Pagine (Chi siamo, Shop, Contatti, Privacy, Cookie, testi di Eventi/News/Lavora con noi)
Menu **Pagine**: scegli la pagina e usa lo stesso editor a sezioni della Home. Per **Privacy** e **Cookie Policy** c'e' un testo formattato; i segnaposto come `{{org.name}}` si riempiono con i dati di Impostazioni. Finche' il testo e' una bozza, spunta "Mostra l'avviso testo in bozza": toglilo solo quando titolare/consulente hanno approvato il testo. Gli indirizzi, telefono ed email **non** si cambiano qui ma in Impostazioni.

## 5. Media (immagini)
Menu **Media**.
- **Carica**: scegli il file (JPG, PNG, WebP o AVIF, max 8 MB), scrivi la **descrizione dell'immagine** (testo alternativo, obbligatoria) e i crediti/autore, poi "Carica immagine".
- **Testo alternativo**: una frase che dice cosa si vede ("Ragazzi che giocano nel campo polivalente"). Serve a chi non vede lo schermo e a Google. Non scrivere "immagine di...".
- Puoi modificare descrizione e crediti in ogni momento ("Salva" sotto l'immagine).
- Sotto ogni foto vedi **dove e' usata**. Si puo' eliminare solo se non e' usata: prima sostituiscila nei punti indicati.
- Carica solo foto di cui hai i diritti e il consenso delle persone ritratte (specialmente minori).

## 5 bis. Foto e video reali
Menu **Foto e video reali**. Ogni pagina del sito ha degli **spazi** pensati per una foto o un video veri (il casolare, il campo, la raccolta...). Sono elencati per pagina; per ognuno trovi **cosa riprendere**, il formato e cosa si vede ora sul sito. Uno spazio vuoto **non compare** sul sito: nessun buco.
1. Carica prima la foto in **Media** (con descrizione e crediti).
2. Torna in **Foto e video reali**, trova lo spazio, premi "Scegli immagine", scegli la foto e premi **Salva** in quello spazio. Ogni spazio si salva da solo e la foto è subito sul sito ("Apri la pagina" per controllare).
3. **Descrizione per chi non vede**: se la lasci vuota il sito usa quella predefinita, scritta sotto il campo. Se la tua foto mostra altro, scrivi cosa si vede davvero.
4. **Didascalia**: facoltativa, breve (luogo, momento, autore).
5. **Video**: negli spazi video scegli un'immagine di copertina e incolla l'indirizzo diretto del file video (deve iniziare con `https://` e finire con `.mp4` o `.webm`; non funzionano i link di pagine YouTube, Instagram o Facebook). Il video è muto, parte da solo solo quando è visibile, ha sempre il pulsante pausa e resta fermo sulla copertina per chi ha chiesto meno movimento. Senza indirizzo, la copertina compare come foto. I file video non si caricano dal pannello: chiedi al tecnico di metterli online.
6. **Togliere**: "Rimuovi" sotto la foto, svuota gli altri campi e premi Salva. Se il tecnico aveva messo un file nella cartella del sito, torna a vedersi quello.
7. Prima di pubblicare: diritti sulle foto, liberatorie per gli adulti riconoscibili, per i minori liberatoria dei genitori (meglio di spalle, da lontano o solo le mani), nessun ospite dell'accoglienza riconoscibile. L'elenco completo per il fotografo è in `docs/FOTO_DA_FORNIRE.md`.

## 6. Prodotti ABES
Menu **Prodotti ABES**. Qui scegli quali prodotti reali di abes.bio compaiono in Home e nella pagina Shop. Ogni scheda del sito apre **la pagina di quel prodotto su ABES**: vendita, carrello e spedizione restano li'.
- **Aggiungere da un link**: incolla il link del prodotto (es. `https://abes.bio/products/caponata-melanzane`) nella casella "Importa da un link ABES" e premi Importa: vengono letti nome e foto una sola volta; controlla e premi **Salva**. Oppure "Aggiungi prodotto" per compilare a mano (nome, link alla scheda, categoria, foto: indirizzo immagine di ABES oppure file caricato, descrizione della foto).
- **Il link deve essere una scheda prodotto** (`https://abes.bio/products/...`), non la home ne' il catalogo.
- **Ordinare**: frecce su/giu': l'ordine della lista e' l'ordine sul sito.
- **Nascondere/Mostrare**: toglie il prodotto da Home e Shop senza cancellarlo.
- **Metti in Home / Togli dalla Home**: la Home mostra i prodotti segnati, nell'ordine della lista, fino al numero massimo impostato nella sezione vetrina della Home. Un'etichetta "Oltre il limite della Home" avvisa se ce ne sono di piu'.
- **Prezzi**: sono facoltativi e **sconsigliati**. In catalogo manuale non si aggiornano da soli: il sito li mostra solo se la data "Verificato il" e' degli ultimi 30 giorni, altrimenti li nasconde. Per non dare informazioni vecchie ai clienti lascia il campo vuoto; il prezzo ufficiale e' quello su ABES. Il badge "Disponibile" non compare mai per i prodotti manuali.
- **Cambiare i prodotti veri** (prezzi, descrizioni, giacenze) si fa su ABES, non qui.
- Se e' collegato Shopify, in alto compare "Sincronizza ora" e nome/link/foto/prezzo si aggiornano da soli; se la sincronizzazione fallisce resta l'ultima copia valida.
- Usa solo foto di ABES per cui hai l'autorizzazione.

## 7. News
Menu **News**.
1. **Nuova news**: titolo, introduzione (2 righe per l'elenco), testo con editor (titoli, grassetto, elenchi, link), categoria (gestibile da "Categorie").
2. **Copertina e galleria**: carica o scegli le foto e scrivi sempre la descrizione. Una news con copertina non si pubblica senza la sua descrizione.
3. **Salva bozza**: la news resta invisibile. Con **Anteprima** vedi come verra'.
4. **Pubblica**: la news appare sul sito. Se metti una **data di pubblicazione futura** viene programmata (etichetta "Programmata"). **Ritira (torna bozza)** la toglie dal sito.
5. **In evidenza**: compare per prima in Home e in cima all'elenco.
6. **Indirizzo della pagina** (slug): si crea dal titolo; non cambiarlo dopo la pubblicazione, o i link gia' condivisi smettono di funzionare.
7. **SEO**: titolo e descrizione per Google (facoltativi, altrimenti si usano titolo e introduzione) e immagine per i social.
Filtri per stato, categoria, ricerca nel titolo.

## 8. Eventi
Menu **Eventi** > "Nuovo evento". Ogni evento ha regole proprie.

**Dati comuni**: titolo, indirizzo pagina, sintesi, descrizione, inizio e fine (ora italiana), luogo, "a chi e' rivolto", categoria, copertina, "in evidenza nella Home". **Stato**: *Bozza* e *Nascosto* non sono visibili; solo *Pubblicato* e' sul sito. Senza data di fine l'evento diventa "concluso" all'ora d'inizio. Un evento concluso resta nell'elenco "esperienze condivise" e non accetta iscrizioni. "Duplica" crea una copia in bozza (utile per eventi ricorrenti).

**Azione principale** (cosa puo' fare il visitatore) - scegli una voce e compila solo cio' che compare:
| Voce | Cosa fare |
|---|---|
| Nessuna azione (informativo) | Solo informazioni: nessun pulsante. |
| Link esterno | Scrivi il testo del pulsante e l'indirizzo `https://...` (solo https). |
| WhatsApp | Numero con prefisso (+39...) e, se vuoi, il messaggio gia' scritto; il pulsante apre la chat. |
| Email | Indirizzo; il pulsante apre la posta con oggetto compilato. |
| Pagina Contatti | Il pulsante porta al modulo Contatti. |
| Iscrizione online | Compare il modulo nel sito: scegli la modalita' qui sotto. |

**Modalita' di iscrizione** (solo con "Iscrizione online"):
1. **Iscrizione libera**: chi compila e' subito *confermato*, nessun limite di posti. Riceve una email di conferma.
2. **Posti limitati**: imposta la **Capienza** (posti totali). Confermato subito finche' ci sono posti; quando sono finiti il sito mostra "posti esauriti" e le iscrizioni si chiudono da sole. Due persone che si iscrivono insieme sull'ultimo posto: una sola passa.
3. **Su approvazione**: ogni richiesta resta **In attesa** (il sito dice chiaramente "non ancora confermata") finche' non la approvi o rifiuti in Iscrizioni. La capienza e' facoltativa. Decidi se "Le richieste in attesa occupano i posti": se *attivo* i posti sono bloccati subito (piu' sicuro, e il sito lo dichiara); se *spento* si controlla la disponibilita' solo all'approvazione e potresti non riuscire ad approvare tutti. Finche' ci sono richieste in attesa questa opzione e la capienza non si cambiano.
4. **Riservata (categoria con verifica)**: come "su approvazione", ma scrivi **a chi e' riservata e come verifichi** (testo mostrato ai visitatori). Il modulo ha un campo "requisito dichiarato": e' solo informativo, **non conferma mai** nulla. Verifichi tu e approvi a mano.
- **Posti per richiesta (massimo)**: 1 = una persona. Se piu' di 1, nel modulo serve il campo "Numero di partecipanti".
- **Apertura/chiusura iscrizioni** (date facoltative) e **"Iscrizioni chiuse manualmente"** per fermare subito le nuove richieste (anche dalla pagina dell'evento: bottone "Chiudi le iscrizioni" / "Riapri").
- **Informativa breve nel modulo**: testo sopra la casella privacy (obbligatoria per chi si iscrive), da concordare con il titolare.
- **Messaggi personalizzati**: facoltativi; se vuoti il sito usa i testi standard (modificabili in Pagine > Eventi).

**Form builder (modulo di iscrizione)**: nome ed email ci sono sempre. Aggiungi campi: testo breve, testo lungo, email, telefono, elenco a scelta (una opzione per riga, almeno 2), casella da spuntare, numero di partecipanti. Per ogni campo: etichetta, testo di aiuto, obbligatorio si/no; ordine con le frecce; "Rimuovi". Chiedi solo cio' che serve: niente dati sensibili (salute, religione...). Se modifichi il modulo dopo che qualcuno si e' iscritto, nasce una **nuova versione** e le iscrizioni precedenti restano com'erano. Ogni evento ha il suo modulo.

Nella pagina dell'evento vedi "Situazione iscrizioni" (confermati, in attesa, capienza) e "Riallinea i contatori" se qualcosa non torna. **Elimina** non e' possibile se ci sono iscrizioni attive: usa "Nascosto".
**Categorie** (bottone in alto): crea/rinomina/elimina; gli eventi di una categoria eliminata restano senza categoria.

## 9. Iscrizioni
Menu **Iscrizioni** (o "Iscrizioni" dentro un evento). Riepilogo per stato: *In attesa*, *Confermate*, *Rifiutate*, *Annullate*, con i posti. Filtra per evento, stato, nome o email.
- **Apri una iscrizione** per vedere le risposte, i posti disponibili e le azioni:
  - **Approva** (solo se in attesa): conferma e invia email. Se la **capienza** sarebbe superata, l'approvazione viene bloccata con un messaggio.
  - **Rifiuta** (solo se in attesa): l'iscritto riceve l'esito.
  - **Annulla iscrizione** (in attesa o confermata): i posti si liberano, l'iscritto riceve la mail di annullamento.
  - **Nota** privata (non inviata all'iscritto), ad esempio l'esito della verifica per un evento riservato.
  - **Elimina definitivamente**: cancella i dati della persona, senza email.
- Una persona non puo' iscriversi due volte allo stesso evento con la stessa email finche' la prima iscrizione e' attiva.
- **Scarica CSV**: elenco (anche filtrato) apribile con Excel. Contiene dati personali: usalo e conservalo con cautela.
- I dati delle iscrizioni a eventi gia' conclusi vengono cancellati dopo i giorni indicati in Impostazioni > Conservazione.

## 10. Candidature
Menu **Candidature**: arrivano dal modulo "Lavora con noi" (CV in PDF, DOC o DOCX, max 5 MB).
- **Stati**: *Nuova*, *In esame*, *Archiviata* (bottoni nel dettaglio e schede di filtro in alto). Filtri anche per **ambito** (accoglienza, educazione e formazione, agricoltura biologica, iniziative sociali, sport, comunicazione ed eventi, amministrazione, altro) e ricerca.
- **Dettaglio**: dati, messaggio, posizione (o "candidatura spontanea"), presa visione della privacy con data e versione, e il **download del CV**: funziona solo da loggato, il file non e' mai pubblico.
- **Elimina**: cancella dati e CV, definitivamente.
- **Conservazione**: in fondo alla pagina imposti dopo quanti giorni cancellare le candidature (e le iscrizioni a eventi passati); il pulsante di eliminazione ti dice quante sono scadute. La pulizia automatica la fa un'operazione notturna configurata da chi gestisce il server ([DEPLOY.md](DEPLOY.md)). 0 = non cancellare nulla. Non tenere CV a tempo indeterminato: il periodo va concordato nell'informativa.
- **Posizioni aperte** (facoltativo): crea annunci con titolo e descrizione e stato *Bozza / Pubblicata / Chiusa*. Solo le pubblicate compaiono; senza posizioni il sito invita alla candidatura spontanea.

## 11. Messaggi contatti
Menu **Messaggi contatti**: i messaggi del modulo Contatti. Filtra *Nuovi / Gestiti*. Nel dettaglio: "Rispondi via email" (apre la tua posta), "Segna come gestito" / "da gestire", "Elimina". Se la posta del sito e' configurata, i destinatari indicati in Impostazioni ricevono un avviso a ogni nuovo messaggio.

## 12. Email
Menu **Email**, due schede:
- **Modelli dei messaggi**: i testi automatici (conferma iscrizione, richiesta in attesa, approvata, rifiutata, annullata, candidatura ricevuta, avvisi allo staff, recupero password...). Apri un modello per cambiare **oggetto** e **testo**. Le parti tra doppie graffe, come `{{iscritto.nome}}`, sono riempite in automatico: l'elenco disponibile e' sotto il testo. Usa "Anteprima" prima di salvare, "Ripristina il testo originale" per annullare le modifiche. Non scrivere il testo "finale" al posto dei segnaposto.
- **Registro degli invii**: ogni email che il sito ha provato a inviare, con stato:
  - *Inviata*: consegnata al server di posta.
  - *In coda*: in attesa.
  - *Non riuscita*: errore (password SMTP errata, server irraggiungibile...). Apri il dettaglio, leggi l'errore e usa **Riprova**.
  - ***Email non configurata***: **il server di posta (SMTP) non e' ancora stato collegato**. Nessuna email e' partita, ma non e' persa: resta nel registro. Quando chi gestisce il server inserisce le credenziali SMTP ([DEPLOY.md](DEPLOY.md)), apri ogni voce e premi **Riprova**. Fino ad allora gli iscritti non ricevono conferme: i dati e le iscrizioni sono comunque salvati nel pannello.
  Il testo dei messaggi non e' mostrato nel registro (privacy), e le voci piu' vecchie di 90 giorni vengono eliminate.

## 13. Impostazioni
Menu **Impostazioni**, cinque blocchi (ognuno con il proprio "Salva"):
1. **Recapiti della cooperativa**: nome, telefono, email, WhatsApp, partita IVA, indirizzo, social, frase del footer. Compaiono in footer, Contatti e testi legali. La casella **"Da verificare con la cooperativa"** e' un promemoria interno: lasciala spuntata finche' il dato non e' confermato. Se WhatsApp e' vuoto, il pulsante non compare.
2. **Chi riceve le notifiche**: indirizzi (uno per riga) per nuovi messaggi, iscrizioni, candidature. Vuoto = nessuna notifica (i dati restano nel pannello).
3. **Statistiche e Search Console**: ID Google Analytics 4 (`G-...`) e codice di verifica Search Console. Vuoti = nessuno script esterno e nessun banner cookie. Compilato = compare il banner cookie e le statistiche partono solo con il consenso. Se attivi GA, controlla che la Cookie Policy lo menzioni.
4. **Conservazione dei dati**: giorni per candidature/CV e per iscrizioni a eventi passati (min 30). Compaiono nell'informativa privacy.
5. **SEO predefinita**: nome del sito, modello del titolo (`%s | I Locandieri`), descrizione e immagine di condivisione usate quando una pagina non ne ha di proprie.

## 14. Cose da non fare
Non pubblicare foto senza diritti o consenso; non chiedere nei moduli dati sensibili; non condividere la password; non cambiare l'indirizzo di una news/evento gia' condiviso; non tenere dati personali oltre il necessario; non usare il CSV come archivio.
