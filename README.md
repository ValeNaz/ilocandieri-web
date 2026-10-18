# I Locandieri - sito e pannello di amministrazione

Sito pubblico della cooperativa sociale I Locandieri (Castelvetrano) con pannello admin per gestire pagine, media, news, eventi con iscrizioni, candidature e vetrina dei prodotti ABES. Nessuna funzione AI, nessun e-commerce interno: carrello, ordini e pagamenti restano su https://abes.bio/.

## Stack (e perche')
- **Next.js 16 (App Router) + TypeScript + Server Actions**: un solo deploy per sito e admin, pagine renderizzate sul server (SEO), nessuna API separata da mantenere.
- **SQLite via libSQL + Drizzle ORM**: per i volumi di una cooperativa basta un file; zero servizi da gestire, backup semplice. Pronto anche per Turso (libSQL remoto).
- **Tailwind CSS v4**, **Zod** (validazione server di ogni input), **nodemailer** (SMTP) con registro invii, autenticazione propria (argon2id, sessioni a database).
- **pnpm**, **Vitest** (unit/integrazione), **Playwright** (e2e).

## Requisiti
Node.js 22 o superiore (consigliato 24), pnpm 9. Per la produzione: Docker (consigliato) oppure Node su VPS.

## Avvio locale in 5 comandi
```bash
pnpm install
cp .env.example .env        # poi compila almeno APP_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD (min 10 caratteri)
pnpm db:migrate             # crea/aggiorna il database in data/app.db
pnpm db:seed                # primo admin + contenuti iniziali (sicuro da rieseguire: non sovrascrive le modifiche)
pnpm dev                    # http://localhost:3000  -  admin: http://localhost:3000/admin
```
Genera il segreto con `openssl rand -base64 32`.

## Comandi
| Comando | Cosa fa |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | sviluppo / build di produzione / avvio in produzione |
| `pnpm lint` / `pnpm typecheck` | controlli statici |
| `pnpm test` | test unit e integrazione (Vitest) |
| `pnpm test:e2e` | test end-to-end (Playwright; usa DB e storage separati) |
| `pnpm db:generate` | genera una migrazione dopo una modifica allo schema |
| `pnpm db:migrate` | applica le migrazioni |
| `pnpm db:seed` | crea admin e contenuti iniziali mancanti (idempotente) |
| `pnpm tsx scripts/retention.ts [--dry-run]` | cancella candidature/iscrizioni oltre i giorni di conservazione |
| `scripts/backup.sh` / `scripts/restore.sh` | backup e ripristino di database e file |

## Struttura
```
src/app/(public)/      sito pubblico          src/app/admin/   pannello (login + area protetta)
src/lib/               dominio: events, abes, news, careers, content, auth, email, storage, security
src/components/        ui, public, admin
drizzle/               migrazioni SQL         scripts/         migrate, seed, retention, backup, restore
data/  storage/        database e file caricati (NON versionati; storage/private = CV, mai pubblico)
docs/                  documentazione         tests/           unit ed e2e
```

## Test
`pnpm test` per la logica (eventi/capienza/concorrenza, auth, email, ABES, candidature), `pnpm test:e2e` per i flussi dal browser. Esito e verifiche manuali: [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md).

## Documentazione
- [docs/CONSEGNA.md](docs/CONSEGNA.md) - riepilogo consegna e cosa serve dal cliente
- [docs/DEPLOY.md](docs/DEPLOY.md) - installazione su VPS/Docker, HTTPS, variabili, backup
- [docs/GUIDA_ADMIN.md](docs/GUIDA_ADMIN.md) - guida per chi gestisce il sito (non tecnica)
- [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md) - verifiche eseguite
- [docs/SECURITY.md](docs/SECURITY.md) - sicurezza e privacy
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/CONVENTIONS.md](docs/CONVENTIONS.md), [docs/CAREERS.md](docs/CAREERS.md) - note tecniche
