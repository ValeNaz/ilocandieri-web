# QA checklist (dossier 06) - esito

Ambiente: build di produzione (`next build` + `next start`) su DB e storage dedicati (`data/qa.db`), dati di prova SOLO li' (un evento per tipo, una news con cover). Suite automatica: `pnpm test` (Vitest, 214 test) e `pnpm test:e2e` (Playwright, config unica `playwright.config.ts`, 34 test). Script di supporto (non fanno parte della suite): `tests/qa/populate.mjs` (dati di prova nel DB qa), `tests/qa/shoot.mjs` (screenshot + audit layout).

Stati: **VERIFICATO** (come) / **DA CONFIGURARE** (dipendenza esterna) / **CORRETTO** (difetto trovato e risolto).

## Sito pubblico
| Voce | Stato | Evidenza |
|---|---|---|
| Menu, footer, link interni, responsive 1440/390/360 | VERIFICATO | `tests/qa/shoot.mjs`: 87 viste (9+ pagine x 3 viewport + admin), 0 overflow orizzontali, 0 immagini rotte; e2e `qa-checklist` (360px) |
| Home da contenuti amministrabili, nessun dato demo | VERIFICATO | e2e `content` (edit hero, nascondi blocco); seed senza news/eventi finti |
| Eventi/news reali o stati vuoti | VERIFICATO | e2e `abes-news` (stato vuoto news con copy dossier), `eventi` con dati qa |
| Vetrina ABES: >=4 schede vere, link al singolo prodotto, nessun checkout | VERIFICATO | e2e `abes-news` + `qa-checklist` (href distinti `https://abes.bio/products/...`); snapshot catalogo in `docs/abes-catalog-snapshot-2026-10-18.json` |
| Immagini card ABES sempre presenti | CORRETTO | le card senza foto negli screenshot fullPage erano solo lazy-loading del carosello; ora le prime 4 sono `eager`, verificato con scroll e senza |
| Shop coerente con Home, accesso al catalogo ABES | VERIFICATO | screenshot `pub-shop-*`, CTA verso `abes.bio/collections/all` (e2e) |
| News/eventi: slug, SEO, OG, alt, non pubblicati | VERIFICATO | curl: canonical, og:title/description/image/image:alt, JSON-LD (e2e); bozza/nascosto = 404 e fuori sitemap (e2e `qa-checklist`) |
| Informative legali raggiungibili; cookie coerenti | VERIFICATO | `/privacy`, `/cookie-policy` 200; nessun banner/GA senza ID, GA solo dopo consenso (e2e `content`) |
| Testi legali definitivi | DA CONFIGURARE | restano con avviso "bozza" finche' il titolare non li approva (`draftNotice`) |

## Pannello admin
| Voce | Stato | Evidenza |
|---|---|---|
| Login, sessione, logout, accessi diretti senza sessione | VERIFICATO | e2e `auth`, `content`, `events`, `abes-news`; curl: `/admin`, export CSV, CV, anteprime = 307 |
| CRUD, nascondi/ripubblica con effetto sul pubblico | VERIFICATO | e2e `abes-news` (news pubblica/ritira/elimina), `events`, `content` |
| Media: formato controllato, alt obbligatorio, uso protetto | VERIFICATO | e2e `content` + nuovo `qa-checklist` (PDF, txt, falso .png rifiutati) |
| File riservati non pubblici | VERIFICATO | e2e `auth` (traversal), curl `/storage`, `/data`, `/.env` = 404; CV solo da route admin (e2e `careers`) |
| Evidenza Home: scelta/ordine news, eventi, prodotti | VERIFICATO | e2e `abes-news` (riordino prodotti), `qa-checklist` (evento in evidenza per primo), `content` (blocchi) |
| Validazioni, messaggi, conferme eliminazione | VERIFICATO | e2e (ConfirmDialog usato per elimina/ripristina/approva) |
| Salvataggio modello email non aggiornava il pulsante "Ripristina" | CORRETTO | `revalidatePath` in `email/actions.ts`; test `careers` ora verde |

## 10 test eventi
| # | Stato | Evidenza |
|---|---|---|
| 1 Informativo con CTA email/WhatsApp/link, senza form | VERIFICATO | e2e `qa-checklist` (3 CTA, nessun `<form>`) + unit T1 |
| 2 Form pubblico, invio email reale | VERIFICATO (form, outbox) / DA CONFIGURARE (SMTP) | e2e `events`, unit T2; senza SMTP stato `not_configured`, mai "inviato" |
| 3 Capienza 2, terza rifiutata, concorrenza | VERIFICATO | unit T3 (anche connessioni DB separate) |
| 4 Approvazione: "in attesa" non "confermato" | VERIFICATO | e2e `events` + unit T4 |
| 5 Approvazione con limite | VERIFICATO | unit T5 (6 approvazioni concorrenti su 5 posti) |
| 6 Riservato: nessuna conferma da auto-selezione | VERIFICATO | unit T6 |
| 7 Annullamento e posti liberati | VERIFICATO | unit T7 |
| 8 Form diversi tra due eventi | VERIFICATO | e2e `qa-checklist` + unit T8 (versioni del form) |
| 9 Evento scaduto/chiuso/nascosto | VERIFICATO | e2e `events` (chiusura, nascosto = 404), unit T9 |
| 10 Concorrenza, duplicati, retry | VERIFICATO | unit T10, `idempotencyKey` outbox |

## Candidature
| Voce | Stato | Evidenza |
|---|---|---|
| Modulo con CV, limiti formato/dimensione, CV solo in admin | VERIFICATO | e2e `careers`, unit `careers` (magic bytes) |
| Registrazione, filtri/stato, download sicuro, cancellazione | VERIFICATO | e2e `careers` |
| Notifica email all'azienda | DA CONFIGURARE | richiede SMTP; in outbox con stato corretto |
| Privacy e retention (nessuna archiviazione illimitata inconsapevole) | VERIFICATO | e2e `careers` (retention), `scripts/retention.ts` (cron da attivare in produzione) |

## Integrazione ABES
| Voce | Stato | Evidenza |
|---|---|---|
| URL schede = prodotto pertinente | VERIFICATO | e2e: regex `abes.bio/products/<handle>`, tutti distinti; validazione server (rifiuta `/collections/all`) |
| Catalogo manuale: crea/riordina/nascondi | VERIFICATO | e2e `abes-news` |
| Feed/API Shopify | DA CONFIGURARE | provider predisposto, serve accesso Storefront non fornito; errori non rompono la Home (unit `abes`) |
| Link reali raggiungibili su abes.bio | VERIFICATO | 2026-10-19, orchestratore: `curl` su tutti i 12 handle seminati -> HTTP 200 (ricontrollare prima del lancio: il catalogo può cambiare) |

## Sicurezza, qualita', consegna
| Voce | Stato | Evidenza |
|---|---|---|
| Validazione server, antispam, rate limit | VERIFICATO | unit `security`, `contact`, e2e (honeypot); login limitato 15/15 min per IP: la suite e2e riusa la sessione (`tests/e2e/helpers.ts`) |
| Header di sicurezza + CSP | VERIFICATO | curl: CSP, XFO DENY, nosniff, HSTS, Referrer/Permissions-Policy |
| Tastiera, label, alt, contrasto | VERIFICATO | Tab su Home/Eventi/Contatti/Lavora/Login: focus sempre visibile (25 stop ciascuna); alt presente ovunque (audit); contrasti AA (unit `contrast`) |
| h1 unico per pagina, gerarchia | VERIFICATO | audit su 87 viste: 1 h1 ciascuna |
| Lighthouse mobile (build prod) | VERIFICATO | Home 92/100/100/100, /eventi 94/100/100/100 (perf/a11y/best-practices/SEO); LCP ~3,2 s (font + hero) |
| SEO: metadata, sitemap, robots, admin noindex | VERIFICATO | e2e `qa-checklist`: `X-Robots-Tag` + meta robots, `Disallow: /admin`, sitemap senza bozze |
| Favicon | CORRETTO | 404 su `/favicon.ico`: aggiunto `src/app/icon.svg` |
| `/admin/iscrizioni` non completava il caricamento | CORRETTO | il link "Scarica CSV" era un `<Link>` verso un route handler (prefetch RSC pendente): ora `<a>` semplice |
| Analytics / Search Console | DA CONFIGURARE | ID vuoti = nessuno script |
| Logo ufficiale | DA CONFIGURARE | wordmark tipografico provvisorio |
| Documentazione di consegna | VEDI README/docs | a cura DELIVERY |
