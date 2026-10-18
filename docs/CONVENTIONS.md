# Convenzioni (FOUNDATION) - obbligatorie per tutti i moduli

Codice/commenti in inglese, testi UI in italiano. Contratto: `ARCHITECTURE.md`. Schema DB **non modificabile** salvo aggiunte minime dichiarate (nuova migrazione: `pnpm db:generate && pnpm db:migrate`).

## Comandi
`pnpm dev | build | start | lint | typecheck | test | test:e2e | db:generate | db:migrate | db:seed`.
Setup: `cp .env.example .env` (impostare `APP_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) -> `pnpm db:migrate && pnpm db:seed && pnpm dev`.
Agenti in parallelo: `NEXT_DIST_DIR=.next-<nome> DATABASE_URL=file:./data/<nome>.db pnpm dev --port <porta>` (e2e usa `.next-e2e`, `data/e2e.db`, porta 3100).
Unit test: `tests/unit/*.test.ts` (Vitest). `tests/unit/setup.ts` crea un DB SQLite temporaneo con tutte le migrazioni: usate `db` da `@/lib/db` normalmente.

## Percorsi e helper
- URL: SEMPRE `paths` / `adminPaths` da `@/lib/paths` (mai stringhe hardcoded). Aggiungete le vostre voci li' (additivo).
- DB: `import { db, schema, newId } from "@/lib/db"`. Id = `newId()` (cuid2). Timestamp = ms (`Date.now()`). Transazioni critiche: `db.transaction(fn, { behavior: "immediate" })`.
- Impostazioni: `getSetting("org" | "footer" | ...)`, `setSetting(key, value)` (`@/lib/settings`, tipizzate, merge su default).
- SEO pagine istituzionali: `pageMetadata(key, path)` (`@/lib/seo`) in `generateMetadata`; `noIndex` per aree riservate.
- Utilita': `cn`, `slugify`, `formatDate`, `formatDateTime` (`@/lib/utils`, fuso Europe/Rome).
- Le pagine pubbliche sono dinamiche (`force-dynamic` nel layout) perche' leggono il DB.

## Server action admin PROTETTA (pattern obbligatorio)
```ts
"use server";
import { requireAdmin } from "@/lib/auth/session";
import { actionError, actionOk, zodFieldErrors, type ActionState } from "@/lib/actions";
import { flash } from "@/lib/flash";

export async function saveThing(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();              // PRIMA RIGA, sempre (redirect a login se non autenticato)
  const parsed = schema.safeParse(Object.fromEntries(formData));   // zod su OGNI input
  if (!parsed.success) return actionError("Controlla i campi.", zodFieldErrors(parsed.error));
  // ... scrittura DB ... audit(user.id, "thing_saved", "thing", id)  (mai dati personali nell'audit)
  return actionOk("Salvato.");                    // oppure: await flash("success", "..."); redirect(adminPaths.x)
}
```
- Il proxy (`src/proxy.ts`) e' solo un filtro ottimistico sul cookie: la protezione vera e' `requireAdmin()`. Va chiamato in **ogni** `page.tsx`, server action e route handler sotto `/admin` (anche se il layout `(panel)` lo fa gia').
- `requireAdmin({ role: "admin" })` limita ai soli admin (gli `editor` ricevono 404). `getCurrentUser()` non lancia mai.
- Route handler admin (download CV, JSON): `const auth = await requireAdminRoute(); if (auth instanceof NextResponse) return auth;`
- Form lato client: `useActionState(action, null)` + `<SaveBar state={state} />` (dentro il `<form>`) + errori campo `state?.fieldErrors?.nome` passati a `<Input error=...>`.
- Eliminazioni: `<ConfirmDialog triggerLabel="Elimina" title="..." action={deleteAction} fields={{ id }} />` (mai `alert/confirm`).

## Toast / flash
- Server: `await flash("success" | "error" | "info", "Messaggio")` subito prima di `redirect()` (cookie 30s, letto da `ToastProvider`). Nessun dato personale nei messaggi.
- Client: `const toast = useToast(); toast.push("success", "Fatto")`.

## Form pubblici (antispam)
1. Server component: `<input type="hidden" name={FORM_TOKEN_FIELD} value={issueFormToken(Date.now(), "contact")} />` + campo honeypot nascosto (`name={HONEYPOT_FIELD}`, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`, fuori schermo con classe `sr-only` + wrapper `aria-hidden`).
2. Action: `checkBot(formData, { scope: "contact", minMs: 3000 })` -> se `!ok` rispondere con messaggio generico; poi `rateLimit({ key: `contact:${hashIp(getClientIp(await headers()))}`, limit: 5, windowMs: 3600_000 })`; salvare `ipHash: hashIp(ip)` (mai l'IP).
3. Zod su tutto; HTML ricco solo tramite `sanitizeHtml()` (`@/lib/security`) in scrittura.

## Email
- `sendTemplatedEmail({ template, to, idempotencyKey: `${template}:${entityId}:${state}`, ctx })` (`@/lib/email`): carica il template dal DB (override admin) o dal default registrato, rende `{{a.b}}` (valori escapati nell'html), salva in outbox e prova l'invio. Senza SMTP -> stato `not_configured` (mai "sent").
- Registrare i default del proprio modulo: `registerDefaultTemplates({ chiave: { subject, body } })` in un file del modulo importato dalla action E dal proprio `scripts/seed/NN-*.ts` (cosi' il seed li inserisce in `email_templates`, solo se mancanti).
- Admin: `retryEmail(id)` per "Riprova". `enqueueAndSend` / `enqueue` / `deliver` per usi diretti.

## Storage / media
- `getStorage().put("public" | "private", relPath, buffer)`; `relPath = newStoredPath(ext)`. URL pubblico: `mediaUrl(media.path)` -> `/media/...`.
- Validare SEMPRE con `validateImage(buffer)` / `validateCv(buffer)` (magic bytes + limiti 8 MB immagini, 5 MB CV) e usare `kind.ext` ricavato dal contenuto, mai l'estensione del client. `safeDisplayName(name)` per i nomi originali.
- `private` non e' mai servito: i CV si scaricano solo da una route admin con `requireAdminRoute()` che legge con `getStorage().get("private", path)`.
- Il body limit delle server action e' 12 MB (`next.config.ts`).

## Seed
- `scripts/seed.ts` (admin, settings, pages, email template di base) poi esegue ogni `scripts/seed/*.ts` in ordine alfabetico (prefissate `10-content.ts`, `20-events.ts`...; i file che iniziano con `_` sono ignorati).
- Ogni file: `import type { SeedFn } from "../seed-types"; const seed: SeedFn = async ({ db, schema, newId, log }) => {...}; export default seed;`
- Devono essere **idempotenti** (`onConflictDoNothing` o controllo esistenza) e non sovrascrivere modifiche dell'admin. Niente news/eventi/candidature finti.

## UI / design system
- Token in `src/app/globals.css` (`@theme`): `paper, paper-deep, card, ink, ink-soft, line, line-strong, terracotta(-deep/-soft), arancio (solo decorativo), olive(-deep), sage(-soft), danger/success/warning(-soft)`; font `font-display` (Fraunces) e `font-sans` (Geist); raggi `rounded-card`, `rounded-control`; `shadow-card`, `shadow-pop`.
- Coppie colore testo/sfondo verificate AA da `tests/unit/contrast.test.ts`: se aggiungete combinazioni, aggiungetele al test.
- Primitive: `@/components/ui` (Button/ButtonLink/buttonClasses, Input/Textarea/Select/Checkbox, Card, Badge, EmptyState, ConfirmDialog, ToastProvider/useToast, Container/Section/Eyebrow/Heading, Pattern). Admin: `@/components/admin` (PageHeader, DataTable, FormField, SaveBar, StatusBadge, AdminPlaceholder).
- Niente immagini finte: dove manca la foto usare `<Pattern variant="agrumi|maiolica|campi" />`.
- Motion sobrio: classe `.reveal`; `prefers-reduced-motion` e' gestito globalmente. Focus visibile globale (outline terracotta). Rich text: wrapper `.prose-it`.
- Link esterni: `<ButtonLink>` aggiunge `target=_blank rel=noopener noreferrer` e testo per screen reader.

## Sostituire i segnaposto
Le pagine pubbliche (`src/app/(public)/**/page.tsx`) e admin (`src/app/admin/(panel)/**/page.tsx`) sono segnaposto tecnici (`PlaceholderPage`, `AdminPlaceholder`): sovrascrivere l'intero file. Non cambiare i layout senza dichiararlo. Voci della sidebar admin: `src/lib/admin-nav.ts`.

## Sicurezza (riepilogo)
Cookie sessione `il_session` (httpOnly, SameSite=Lax, Secure in prod), sessioni in DB (hash SHA-256), scadenza scorrevole 7 gg; login con rate limit (IP + email); reset password via token monouso 1h (hash in DB) con email in outbox; header di sicurezza + CSP in `next.config.ts` (immagini consentite da `self`, `data:`, `blob:`, `cdn.shopify.com`; aggiungere domini esterni li').
