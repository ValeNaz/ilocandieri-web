# Sicurezza e privacy - I Locandieri

Audit di fine progetto. Il sito tratta dati personali (iscrizioni eventi, candidature con CV, messaggi di contatto): vale il GDPR.

## Modello di minaccia (breve)
| Minaccia | Contromisura principale |
|---|---|
| Accesso non autorizzato a pannello, CV, iscrizioni | `requireAdmin()` / `requireAdminRoute()` in ogni pagina, server action e route sotto `/admin`; il proxy e' solo un filtro ottimistico |
| Brute force / enumerazione account | Rate limit login (IP + email), argon2 anche per utenti inesistenti, reset password con risposta uniforme e invio email in background |
| Furto sessione | Cookie `il_session` httpOnly, SameSite=Lax, Secure in produzione; in DB solo hash SHA-256; revoca di tutte le sessioni a reset/cambio password; utente disattivato = sessione non valida |
| Spam / bot sui form pubblici | Honeypot, token di tempo firmato HMAC, rate limit per hash IP, validazione zod lato server |
| XSS / injection | HTML ricco solo da `sanitizeHtml` (scrittura e render); template email con escape; JSON-LD con `<` escapato; CTA e link validati (`https:`, `mailto:`, `tel:`, path noti); query Drizzle parametrizzate |
| Upload malevoli | Validazione per magic bytes (immagini JPG/PNG/WebP/AVIF, CV PDF/DOC/DOCX), limiti 8 MB / 5 MB, SVG rifiutato, estensione dal contenuto, nome salvato casuale |
| Path traversal / file privati esposti | `resolveInside()` su ogni accesso; `/media` serve solo lo scope pubblico e solo estensioni immagine; `storage/private` raggiungibile solo dalla route admin del CV |
| Race su capienza eventi | UPDATE condizionali atomici + transazioni `BEGIN IMMEDIATE`; transizioni di stato con `WHERE status = ...` (niente doppio decremento) |
| Fuga di dati personali | Audit senza PII, IP mai salvato (HMAC con `APP_SECRET`), il registro email admin non mostra il testo, CSV con difesa da formula injection e `no-store` |

## Controlli presenti
- Header (`next.config.ts`): CSP (`frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`, `base-uri 'self'`), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS in produzione. `/admin/**`: `X-Robots-Tag: noindex` e `Cache-Control: no-store`; `robots.txt` esclude `/admin`; la sitemap elenca solo contenuti pubblicati.
- Download CV: `Content-Disposition: attachment`, `nosniff`, `no-store, private`, tipo dal DB (whitelist), nome sanificato.
- Redirect: `?next=` del login accetta solo path `/admin/...`; `back` delle iscrizioni solo `/admin/iscrizioni...`.
- Errori: in produzione Next non espone stack; i log applicativi non contengono dati personali.
- Segreti: nessun `process.env` nei componenti client; `.env.example` senza valori reali; `pnpm audit --prod` senza vulnerabilita' note.
- Eliminazione completa: candidatura = riga + CV + email collegate; iscrizione singola (nuova azione "Elimina definitivamente", libera i posti) = riga + email collegate; messaggio di contatto = riga + email di notifica. Retention automatica: `scripts/retention.ts` (candidature, iscrizioni a eventi passati, registro email oltre 90 giorni).

## Problemi trovati e corretti nell'audit
1. **Media - privacy**: nessun modo di cancellare una singola iscrizione (diritto all'oblio). Aggiunta `deleteRegistration` + azione admin con conferma.
2. **Media - privacy**: il registro `email_outbox` conservava per sempre nome/email/testi anche dopo l'eliminazione dei dati. Ora purge mirato alla cancellazione e retention a 90 giorni.
3. **Bassa - enumerazione utenti**: il reset password attendeva l'SMTP solo per gli account esistenti (differenza di tempo). Ora l'invio e' in background.
4. **Bassa - token di reset**: dopo un reset riuscito restavano validi altri link emessi in precedenza (fino a 1 h). Ora vengono invalidati.
5. Igiene: `storage-*/` (storage degli e2e) aggiunto a `.gitignore` per evitare di versionare CV di test.
Test: `tests/unit/privacy-integrity.test.ts`, `tests/unit/auth.test.ts`.

## Rischi residui e raccomandazioni di deploy
- **HTTPS obbligatorio** (cookie `Secure` e HSTS valgono solo in produzione con TLS). Terminare TLS sul reverse proxy.
- **IP del client**: `getClientIp` usa il primo valore di `X-Forwarded-For`. Il reverse proxy deve SOVRASCRIVERE l'header (non accodarlo), altrimenti un attaccante puo' aggirare i rate limit per IP (resta il limite per email sul login). Non esporre Node direttamente su Internet.
- **CSP**: `script-src 'unsafe-inline'` e' necessario per gli script inline di Next; migliorabile con nonce. Il layer di difesa principale resta la sanificazione HTML.
- **Ruoli**: esiste solo di fatto il ruolo admin (nessuna UI per creare editor). Se si introducono editor, limitare con `requireAdmin({ role: "admin" })` impostazioni, retention, export CSV ed eliminazioni.
- **Lockout**: 6 tentativi errati bloccano per 15 minuti il login di quell'email (anche per chi tenta a vuoto): compromesso accettato contro il brute force.
- **Token del form**: il token di tempo non e' monouso (valido 2 h); l'abuso e' limitato dal rate limit e dal dedupe per email.
- **Backup**: dati e `storage/` contengono dati personali. Cifrarli (es. `age`/GPG), conservarli fuori dal server, con retention coerente con quella dichiarata nell'informativa (un backup conserva anche cio' che e' stato cancellato).
- **APP_SECRET**: minimo 32 byte casuali, mai nel repository. Ruotarlo invalida i token dei form (innocuo) e cambia gli `ipHash` (si perde solo la continuita' dei rate limit); le sessioni NON dipendono dal secret. Dopo rotazione riavviare l'app.
- **SMTP**: usare un provider con TLS e configurare SPF, DKIM e DMARC sul dominio mittente, altrimenti le email (reset password incluse) finiscono in spam o vengono falsificate.
- **Permessi file**: l'utente del processo deve poter scrivere solo `data/` e `storage/`; `storage/private` con permessi 700.
- **Aggiornamenti**: eseguire `pnpm audit` a ogni rilascio e aggiornare Node/Next regolarmente.
- **Antivirus CV**: i CV sono validati per formato ma non scansionati; sono scaricabili solo come allegato da admin autenticati. Valutare ClamAV se il volume cresce.
