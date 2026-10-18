# Consegna - sito I Locandieri

Data: 18 ottobre 2026. Progetto avviabile in `ilocandieri-web/`. Questo documento riassume cosa e' stato realizzato, come avviarlo e **cosa serve dal cliente** per pubblicare.

Documenti collegati: [README](../README.md) - [DEPLOY](DEPLOY.md) - [GUIDA_ADMIN](GUIDA_ADMIN.md) - [QA_CHECKLIST](QA_CHECKLIST.md) (verifiche superate) - [SECURITY](SECURITY.md) (sicurezza e privacy).

## 1. Cosa e' stato realizzato
**Sito pubblico**: Home, Chi siamo, Shop/ABES, Eventi (elenco e dettaglio), News (elenco e dettaglio), Lavora con noi, Contatti, Privacy, Cookie Policy; SEO (metadata, Open Graph, sitemap, robots, admin non indicizzabile), responsive e accessibile. Nessuna funzione AI, nessun carrello/checkout.

**Vetrina ABES**: in Home (4-8 prodotti, numero modificabile) e in Shop; ogni scheda porta alla pagina del prodotto su abes.bio. Catalogo manuale con 12 prodotti reali dallo snapshot del 18/10/2026 (`docs/abes-catalog-snapshot-2026-10-18.json`), senza prezzi ne' badge di disponibilita'; provider Shopify Storefront pronto (si attiva con due variabili), con fallback all'ultima copia valida.

**Eventi**: configurazione indipendente per evento (stato, immagine, categoria, CTA: nessuna / link / WhatsApp / email / contatti / iscrizione); iscrizione libera, posti limitati, su approvazione, riservata; form builder con versioni; capienza con controllo atomico (niente overbooking in caso di invii simultanei), anti-duplicato, richieste "in attesa" mai presentate come confermate, approvazione che non supera la capienza, annullamenti con liberazione posti, chiusura automatica/manuale, export CSV.

**News**: categorie, bozze, programmazione, evidenza, galleria, SEO e immagine social.

**Lavora con noi**: candidatura con CV (PDF/DOC/DOCX, 5 MB, controllo del contenuto reale del file), archivio protetto, stati, posizioni opzionali, conservazione con cancellazione automatica pianificabile.

**Admin**: dashboard, Home e Pagine a sezioni (modifica/ordine/visibilita'), media con testo alternativo, prodotti ABES, news, eventi, iscrizioni, candidature, messaggi, modelli email e registro invii (con "Riprova"), impostazioni (recapiti, notifiche, GA4/Search Console, conservazione, SEO), profilo e cambio password, recupero password.

**Email**: registro con stato onesto (`Email non configurata` finche' non c'e' SMTP, mai "inviata" falsa), nessun doppione sui tentativi ripetuti.

**Sicurezza/consegna**: validazione server di ogni input, rate limit e anti-spam, sessioni su database, CV non pubblici, header di sicurezza e CSP, Dockerfile e docker-compose, script di backup/ripristino e retention.

## 2. Come avviarlo
- **Sviluppo**: `pnpm install`, `cp .env.example .env`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev` (dettagli nel README).
- **Produzione**: Docker + Caddy, passo-passo in [DEPLOY.md](DEPLOY.md). L'avvio del container applica le migrazioni; il seed va lanciato una volta (`docker compose run --rm app seed`).
- Verifiche tecniche eseguite: vedi [QA_CHECKLIST.md](QA_CHECKLIST.md). Ricorda: i flussi che dipendono da servizi esterni (invio email reale, sincronizzazione Shopify, Google) **non sono verificabili senza le credenziali** e sono segnalati "da configurare", non come completati.

## 3. Cosa richiede materiali, credenziali o approvazioni del cliente
### A. Credenziali e accessi
| # | Cosa serve | Chi | Dove si inserisce | Senza, cosa succede |
|---|---|---|---|---|
| 1 | **Server di posta SMTP** (host, porta, utente, password, mittente) | I Locandieri / provider del dominio | `.env`: `SMTP_*` | Nessuna email parte (iscritti senza conferma, nessun avviso allo staff, niente recupero password). Restano nel registro come "Email non configurata" e si rimandano. |
| 2 | **Token Shopify Storefront ABES** (sola lettura prodotti) + dominio del negozio | ABES (admin Shopify) | `.env`: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN` | La vetrina resta manuale, senza prezzi/disponibilita'. Procedura in DEPLOY.md par. 6. |
| 3 | **Google Analytics 4** (ID `G-...`) e **Search Console** (codice verifica) | I Locandieri | admin > Impostazioni > Statistiche | Nessuna statistica, nessun banner cookie, sito non verificato in Search Console. |
| 4 | **Dominio e hosting/VPS** (DNS, accesso al server) | I Locandieri | DEPLOY.md; `SITE_URL` | Il sito non e' pubblico; link nelle email/sitemap non corretti. |
| 5 | Primo admin: email e password iniziale | I Locandieri | `.env` `ADMIN_EMAIL`/`ADMIN_PASSWORD` al seed | Nessun accesso al pannello. Cambiare la password al primo accesso. |

### B. Materiali
| # | Cosa serve | Stato attuale nel sito |
|---|---|---|
| 6 | **Autorizzazione di ABES all'uso delle foto prodotto** (immagini caricate dal CDN Shopify di ABES) | In uso i 12 prodotti dello snapshot. Da confermare per iscritto. |
| 7 | **Foto reali de I Locandieri** (Giardino delle Arance, Campo Polivalente, attivita', persone con consenso, copertine) | Il sito mostra disegni decorativi dove mancano. Nessuna foto inventata. |
| 8 | **Logo ufficiale** (vettoriale, versioni chiaro/scuro) | Da fornire e sostituire. |
| 9 | **Prima news e primi eventi reali** | Volutamente vuoti: il sito mostra "Nuove storie in arrivo" / calendario in preparazione. Nessun dato demo. |
| 10 | **Categorie degli eventi** | Non create (nessuna inventata): da concordare e inserire in Eventi > Categorie. |
| 11 | **Ambiti delle candidature** | Elenco proposto: Accoglienza; Educazione e formazione; Agricoltura biologica; Iniziative sociali e territoriali; Sport e attivita' all'aperto; Comunicazione ed eventi; Amministrazione e organizzazione; Altro. Da confermare (modifica nel codice: `src/lib/careers/constants.ts`). |
| 12 | Eventuali **posizioni aperte** | Nessuna inserita; il sito invita alla candidatura spontanea. |

### C. Dati e testi "da verificare" (flag reali presenti nel sito/seed)
| # | Elemento | Valore attuale | Dove si corregge |
|---|---|---|---|
| 13 | **Indirizzo sede** | Via S. Quasimodo 21/d, Castelvetrano (TP) - flag "da verificare" | Impostazioni > Recapiti |
| 14 | **Email di contatto** | ilocandieri.progettazione@gmail.com - flag "da verificare" | Impostazioni > Recapiti |
| 15 | **WhatsApp** | vuoto - flag "da verificare" (il pulsante non compare finche' e' vuoto) | Impostazioni > Recapiti |
| 16 | **Partita IVA** | vuota - flag "da verificare" (usata nei testi legali via `{{org.vatId}}`) | Impostazioni > Recapiti |
| 17 | **Telefono** | +39 331 8586827 (dal dossier; non marcato ma da confermare con gli altri recapiti) | Impostazioni > Recapiti |
| 18 | **Social** | non inseriti | Impostazioni > Recapiti |
| 19 | **Privacy** (titolare, finalita', basi giuridiche, fornitori, conservazione) | **Bozza** con avviso pubblico "in bozza" | Pagine > Privacy; far validare da consulente/DPO, poi togliere l'avviso |
| 20 | **Cookie Policy** (da riverificare se si attiva GA4) | **Bozza** con avviso pubblico | Pagine > Cookie |
| 21 | **`PRIVACY_VERSION`** (oggi `2026-10-informativa-bozza`) | Registrata su ogni candidatura come versione dell'informativa accettata. Va aggiornata a ogni nuova versione approvata | `src/lib/careers/constants.ts` (richiede nuova build) |
| 22 | **Informativa breve nei moduli evento** | Vuota: da scrivere per ogni evento con iscrizione, d'accordo con il titolare | Eventi > evento > Regole di iscrizione |
| 23 | **Tempi di conservazione** (candidature, iscrizioni passate) | Default 365 giorni; compaiono nell'informativa | Impostazioni > Conservazione |
| 24 | **Stato attuale di CAS Locanda e della comunita' per minori stranieri non accompagnati**, e relative convenzioni | NON inseriti nel testo: nota "da verificare" nella sezione Accoglienza di Chi siamo; se confermati, aggiungere la frase indicata nella nota | Pagine > Chi siamo > Accoglienza |
| 25 | **"Dal 2008"** (anno di avvio attivita' di accoglienza) | Presente nel testo di Chi siamo; da verificare | Pagine > Chi siamo > Accoglienza |
| 26 | **Prodotto ABES `passata-di-pomodoro`** | Su abes.bio il titolo e' "Ceci", foto generica: **nascosto**, da chiarire con ABES | Prodotti ABES |
| 27 | **Prodotto ABES `pate-di-melanzane`** | Il link `/products/pate-di-melanzane` e' in realta' la scheda "PASSATA DI POMODORO BIO - 680 gr" (verificato 18/10/2026): mostrata con il titolo reale; se ABES corregge i link, ricontrollare | Prodotti ABES |
| 28 | **Ceste delle Feste ABES** | Prodotto reale ma nascosto (stagionale): decidere quando mostrarlo | Prodotti ABES |
| 29 | **Prezzi e disponibilita' ABES** | Non mostrati (nessuna fonte aggiornata senza token Shopify) | Collegando Shopify (#2) |
| 30 | **Convenzioni/servizi attivi** citati nei testi, testi istituzionali del dossier | Copy iniziale da dossier 05: far approvare prima della pubblicazione | Home e Pagine |

### D. Prima della pubblicazione (checklist breve)
1. Ottenere #1-#5; configurare `.env`; avvio e verifica con DEPLOY.md par. 10.
2. Sostituire/confermare recapiti (#13-#18) e togliere i flag "da verificare" in Impostazioni.
3. Far validare Privacy e Cookie (#19-#20), aggiornare `PRIVACY_VERSION` (#21), togliere l'avviso "bozza".
4. Caricare logo e foto (#7-#8) con testo alternativo; verificare il permesso ABES (#6).
5. Pubblicare le prime news/eventi reali oppure lasciare gli stati vuoti.
6. Cambiare la password dell'admin, rimuovere `ADMIN_PASSWORD` dal `.env`, attivare backup notturni e copia esterna.
7. Inviare la sitemap a Search Console.
