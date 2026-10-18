# Candidature, email e dashboard (modulo CAREERS)

- Pagina pubblica `/lavora-con-noi`: testi dai blocchi pagina (slot `hero`, `collab`, `form`, messaggi `confirmation`, `no_openings`), con copy del dossier 05 come fallback. Antispam: honeypot + token a tempo + rate limit (5/ora per IP hash). CV pdf/doc/docx max 5 MB validato sui magic bytes, salvato in `storage/private` (mai servito pubblicamente).
- Admin: `/admin/candidature` (filtri, ricerca, dettaglio, stato, elimina), `/admin/candidature/posizioni` (opzionale), `/admin/email` (modelli + registro invii), `/admin` (dashboard).
- Download CV: solo `GET /admin/candidature/<id>/cv` (richiede sessione admin, `Content-Disposition: attachment`, `no-store`).

## Conservazione dei dati (retention)
Giorni impostati in Admin > Candidature > Conservazione (`settings.retention`; 0 = non impostato, nulla viene toccato).
Pulizia automatica da cron (candidature con CV e iscrizioni a eventi conclusi da piu' di N giorni):

    pnpm tsx scripts/retention.ts --dry-run   # conta soltanto
    pnpm tsx scripts/retention.ts             # elimina
    # cron, ogni notte alle 03:30:
    30 3 * * * cd /srv/ilocandieri-web && pnpm tsx scripts/retention.ts >> logs/retention.log 2>&1

## Email
Template default registrati in `src/lib/careers/emails.ts`; l'elenco admin unisce quelli registrati in `src/lib/email/register-all.ts` (aggiungere li' una riga per ogni modulo) e quelli presenti in DB.
Con SMTP assente le email restano `not_configured` e si rimandano da Admin > Email > Registro.

## Test
`pnpm test` (unit) e `pnpm test:e2e` (config unica `playwright.config.ts`: DB `data/e2e.db`, storage `data/e2e-storage`, dist `.next-e2e`).
