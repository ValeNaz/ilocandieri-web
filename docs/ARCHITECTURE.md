# I Locandieri — Contratto architetturale (vincolante per tutti gli agenti)

Specifica funzionale: `../../0*_*.md` (dossier). Questo file fissa le scelte tecniche e i confini tra i moduli.
Ogni agente legge PRIMA il dossier completo e questo file. Non cambiare scelte qui fissate senza segnalarlo nel report finale.

## Stack (motivazione)
- **Next.js 16 App Router + TypeScript strict + React Server Components + Server Actions.** Un solo deploy per sito pubblico e admin, SSR per SEO, nessuna API separata da mantenere.
- **Drizzle ORM + libSQL (`@libsql/client`)**: file SQLite in locale (`data/app.db`), Turso/libSQL remoto o file su VPS in produzione. Volume dati di una cooperativa = SQLite più che sufficiente; zero servizi da gestire. Transazioni `db.transaction(fn, { behavior: "immediate" })` per scritture critiche.
- **Tailwind CSS v4** con design tokens in `src/app/globals.css` (`@theme`). Niente librerie UI pesanti; componenti propri in `src/components/ui`.
- **Zod** per validazione server-side di OGNI input (server actions e route handlers).
- **Auth propria**: password `@node-rs/argon2`, sessioni in DB (token random 32B, in DB solo hash SHA-256), cookie `httpOnly; Secure (prod); SameSite=Lax; Path=/`, scadenza 7gg sliding, logout = delete riga. Reset password via token monouso (hash in DB, 1h). Rate limit login.
- **Email**: tabella `email_outbox` + `nodemailer` SMTP da env. Ogni messaggio ha `idempotencyKey` UNIQUE → niente doppioni su retry. Se SMTP non configurato lo stato è `NOT_CONFIGURED` (mai "inviato" falso); admin vede e può riprovare.
- **Storage file**: interfaccia `src/lib/storage` con driver locale (`storage/public-media` servito da `/media/[...path]`, `storage/private` MAI servito pubblicamente; CV scaricabili solo via route admin autenticata). Driver S3 predisposto come stub documentato.
- **Test**: Vitest (unit/integrazione su DB temporaneo) + Playwright (e2e). `pnpm` come package manager.
- **Deploy consigliato**: Node 22+ su VPS/Docker (Dockerfile incluso) con volume per `data/` e `storage/`.

## Struttura cartelle
```
ilocandieri-web/
  src/app/(public)/...            sito pubblico (layout con header/footer)
  src/app/admin/(auth)/login ...   login, reset
  src/app/admin/(panel)/...        pannello (layout con sidebar, guard sessione)
  src/app/media/[...path]/route.ts media pubblici
  src/app/sitemap.ts, robots.ts
  src/components/ui/               primitive (Button, Input, Card, Badge, Dialog/confirm, EmptyState, Toast)
  src/components/public/           componenti sito
  src/components/admin/            componenti pannello
  src/lib/db/{index.ts,schema.ts}  Drizzle
  src/lib/auth/                    sessioni, guard `requireAdmin()`
  src/lib/email/                   outbox, templates, sender
  src/lib/storage/                 driver file
  src/lib/security/                rateLimit, honeypot+timing token, sanitize HTML
  src/lib/content/                 lettura/scrittura blocchi pagina
  src/lib/events/                  dominio eventi (stati, capienza, iscrizioni)
  src/lib/abes/                    vetrina prodotti, provider manual/shopify
  src/lib/news/, src/lib/careers/
  src/lib/seo.ts                   helper metadata
  scripts/seed.ts                  seed contenuti iniziali (copy dossier 05) + admin da env
  tests/unit, tests/e2e
  docs/
```
`next.config.ts`: `distDir: process.env.NEXT_DIST_DIR || ".next"` (agenti in parallelo usano dist dir e porte diverse).

## Schema dati (Drizzle, sqlite). Tutti gli id = text (cuid2/nanoid). Timestamp = integer ms.
- `users`: id, email UNIQUE, name, passwordHash, role ('admin'|'editor'), active, createdAt, lastLoginAt
- `sessions`: id, userId FK, tokenHash UNIQUE, expiresAt, createdAt, userAgent
- `password_resets`: id, userId, tokenHash UNIQUE, expiresAt, usedAt
- `rate_limits`: key PK, count, windowStart
- `audit_log`: id, userId, action, entity, entityId, createdAt (NO dati personali nel payload)
- `settings`: key PK, value JSON — chiavi: `org` (nome, telefono, email, indirizzo, whatsapp, social, p.iva), `notifications` (email destinatari iscrizioni/candidature/contatti), `analytics` (gaMeasurementId, searchConsoleVerification — vuoti = non attivi), `retention` (giorni conservazione candidature, iscrizioni passate), `seo_defaults`, `footer`
- `pages`: id, key UNIQUE ('home','chi-siamo','shop','eventi','news','lavora-con-noi','contatti','privacy','cookie'), title, seoTitle, seoDescription, ogImageId, updatedAt
- `page_blocks`: id, pageId FK, type (es. 'hero','intro','pillars','places','abes_showcase','events_highlight','news_highlight','cta','rich_text','values','contact'), position, visible, data JSON (testi/immagini/CTA validati da zod per type), updatedAt
- `media`: id, path, mime, size, width, height, alt, credit, createdAt (solo immagini pubbliche)
- `news_categories`: id, name, slug UNIQUE
- `news`: id, slug UNIQUE, title, excerpt, body (HTML sanitizzato da editor), coverId, categoryId, status ('draft'|'published'), featured, publishedAt, seoTitle, seoDescription, ogImageId, createdAt, updatedAt
- `news_images`: newsId, mediaId, position
- `event_categories`: id, name, slug UNIQUE
- `events`: id, slug UNIQUE, title, summary, body, startsAt, endsAt, location, coverId, categoryId, audience (testo "a chi è rivolto"), status ('draft'|'published'|'hidden'), featured,
  ctaType ('none'|'external_link'|'whatsapp'|'email'|'contact'|'registration'), ctaLabel, ctaTarget,
  registrationMode ('open'|'limited'|'approval'|'reserved') nullable, capacity int nullable, maxSeatsPerRequest int default 1,
  pendingHoldsSeats bool default false, reservedCriteria text, reservedVerification ('manual') ,
  registrationOpensAt, registrationClosesAt, registrationManuallyClosed bool,
  seatsConfirmed int default 0, seatsHeld int default 0,
  privacyNote, successMessage overrides (JSON messages), seoTitle, seoDescription, createdAt, updatedAt
- `event_form_versions`: id, eventId FK, version int, fields JSON [{id,type:'text'|'textarea'|'email'|'phone'|'select'|'checkbox'|'seats',label,required,options?,min?,max?,help?}], createdAt. UNIQUE(eventId,version). Modifica form = NUOVA versione; registrazioni puntano alla versione usata.
- `registrations`: id, eventId FK, formVersionId FK, status ('pending'|'confirmed'|'rejected'|'cancelled'), seats int, name, email, emailNormalized, phone, answers JSON (snapshot {fieldId,label,value}), dedupeKey UNIQUE nullable (= eventId:emailNormalized finché attiva; NULL se rejected/cancelled), adminNote, decidedAt, decidedBy, createdAt, ipHash
- `products` (vetrina ABES): id, source ('manual'|'shopify'), externalId, handle, title, url (DEVE iniziare con https://abes.bio/products/), imageUrl, imageAlt, category, priceText nullable, priceCheckedAt nullable, available nullable, visible, featuredHome bool, position, syncStatus, lastSyncedAt, createdAt, updatedAt
- `job_openings` (opzionale, solo se inserite): id, slug, title, description, status, createdAt
- `applications`: id, firstName, lastName, email, phone, area, openingId nullable, message, cvPath (storage privato), cvName, cvMime, cvSize, privacyAcceptedAt, privacyVersion, status ('new'|'reviewing'|'archived'), createdAt, ipHash
- `contact_messages`: id, name, email, subject, message, status ('new'|'handled'), createdAt, ipHash
- `email_templates`: key PK (es. 'registration_confirmed','registration_pending','registration_approved','registration_rejected','registration_cancelled','admin_new_registration','application_received','admin_new_application','admin_new_contact','password_reset'), subject, body (testo con placeholder {{evento.titolo}} ecc.), updatedAt
- `email_outbox`: id, idempotencyKey UNIQUE, to, subject, text, html, status ('queued'|'sent'|'failed'|'not_configured'), attempts, lastError, sentAt, createdAt

## Regole di dominio critiche (eventi)
- Visibile al pubblico solo `status='published'`. Passato = `(endsAt ?? startsAt) < now`.
- Stato iscrizioni calcolato da funzione pura `getRegistrationState(event, now)` → 'not_applicable'|'not_yet_open'|'open'|'closed'|'full'|'past'. Usata sia in UI sia nel server action (mai fidarsi del client).
- Capienza: aggiornamento ATOMICO `UPDATE events SET seats_confirmed = seats_confirmed + :n WHERE id=:id AND seats_confirmed + seats_held + :n <= capacity` (rowsAffected=0 → completo). Stessa logica all'approvazione. Annullo/rifiuto → decremento con `MAX(0, ...)`. Funzione `recount(eventId)` di riconciliazione.
- `pending` non occupa posti salvo `pendingHoldsSeats=true` (dichiarato in admin e testo pubblico).
- `reserved`: sempre `pending` + approvazione manuale; il campo requisito dichiarato è raccolto ma NON conferma.
- Anti-duplicato: `dedupeKey` UNIQUE; anti-bot: honeypot + token tempo minimo (HMAC firmato) + rate limit per IP hash.
- Email: idempotencyKey = `${template}:${registrationId}:${status}`.

## Confini moduli (chi possiede cosa)
- FOUNDATION: config, db schema+migrazioni, auth, layout pubblico/admin, ui primitives, lib/security, lib/email (core), lib/storage, seed base, sidebar admin con TUTTE le voci.
- CONTENT: pagine istituzionali + blocchi Home/Chi siamo/Shop/Contatti/legali, media library, settings, SEO/sitemap/robots, cookie banner, contatti form.
- EVENTS: lib/events, pagine eventi pubbliche, admin eventi + form builder + iscrizioni, template email eventi.
- ABES+NEWS: lib/abes, componente vetrina, admin prodotti, provider shopify, lib/news, pagine news e admin news.
- CAREERS: lib/careers, pagina Lavora con noi, admin candidature+download CV+retention, admin template email, dashboard admin.
Modifiche a file di un altro modulo/a schema: minime, additive, e dichiarate nel report.
