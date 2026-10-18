# Installazione e pubblicazione

Percorso consigliato: **VPS Linux con Docker + Caddy** (HTTPS automatico). Il sito e' un'unica applicazione Node con database SQLite su file: servono solo due cartelle persistenti, `data/` (database) e `storage/` (immagini e CV).

## 1. Requisiti del server
Ubuntu/Debian recente, 1 vCPU / 1-2 GB RAM, Docker + plugin compose, un dominio con record DNS A (e AAAA) verso il server, porte 80 e 443 aperte. Per i backup: `sqlite3` (`apt install sqlite3`).

## 2. Primo avvio (Docker)
```bash
git clone <repository> /srv/ilocandieri && cd /srv/ilocandieri      # oppure copia la cartella del progetto
cp .env.example .env && nano .env                                    # vedi sezione 4
mkdir -p data storage backups && sudo chown -R 1000:1000 data storage backups   # il container usa l'utente 1000
docker compose build
docker compose run --rm app seed       # SOLO la prima volta: crea l'admin (da .env) e i contenuti iniziali
docker compose up -d
docker compose logs -f app             # "Migrations applied" + "Ready"
```
All'avvio il container esegue **prima le migrazioni, poi il server**. Il seed non parte mai da solo: e' idempotente (non sovrascrive le modifiche fatte dall'admin) ma va lanciato esplicitamente. Se `APP_SECRET` manca o e' troppo corto, il container si rifiuta di partire. Il container ha un healthcheck (`docker compose ps` mostra `healthy`).

Comandi utili: `docker compose run --rm app migrate`, `docker compose run --rm app retention --dry-run`, `docker compose exec app sh`.

Senza Docker: `pnpm install --frozen-lockfile && pnpm build && pnpm db:migrate && pnpm db:seed && pnpm start` (con Node 22+; usa pm2 o systemd per tenerlo attivo).

## 3. Reverse proxy HTTPS (Caddy)
Il compose pubblica l'app solo su `127.0.0.1:3000`. Installa Caddy sul server e usa questo `/etc/caddy/Caddyfile`:
```
www.tuodominio.it {
    encode zstd gzip
    request_body { max_size 14MB }
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Forwarded-For {remote_host}
        header_up X-Real-IP {remote_host}
    }
}
tuodominio.it {
    redir https://www.tuodominio.it{uri} permanent
}
```
`header_up X-Forwarded-For` **sovrascrive** l'header: e' necessario perche' l'anti-spam e il limite di tentativi di login usano l'IP del visitatore (vedi [SECURITY.md](SECURITY.md)). Non esporre mai la porta 3000 direttamente su Internet. L'HTTPS e' indispensabile: cookie di sessione `Secure` e HSTS valgono solo cosi'. Dopo la modifica: `systemctl reload caddy`.

## 4. Variabili d'ambiente (`.env`)
| Variabile | Obbligatoria | Effetto |
|---|---|---|
| `SITE_URL` | si (produzione) | URL pubblico senza slash finale (es. `https://www.tuodominio.it`): link nelle email, sitemap, canonical, Open Graph. Letta a runtime. |
| `NEXT_PUBLIC_SITE_URL` | no | Alternativa a `SITE_URL` con precedenza, ma Next.js la "congela" nella build: in Docker usa `SITE_URL` e non impostarla. |
| `APP_SECRET` | **si** | Segreto (min 16, meglio 32+ byte casuali: `openssl rand -base64 32`) per firmare i token dei moduli e calcolare l'hash degli IP. Senza, in produzione il sito non parte. Cambiarlo invalida i moduli aperti, non le password. |
| `DATABASE_URL` | no | Default `file:./data/app.db` (in Docker `file:/app/data/app.db`). Per Turso: `libsql://...`. |
| `DATABASE_AUTH_TOKEN` | solo con libSQL remoto | Token del database remoto. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | solo al primo seed | Primo amministratore (password min 10 caratteri). Dopo il primo accesso cambia la password dal pannello e **togli `ADMIN_PASSWORD` dal `.env`**. |
| `ADMIN_NAME` | no | Nome mostrato (default "Amministratore"). |
| `SEED_RESET_ADMIN_PASSWORD` | no | `1` = al prossimo seed reimposta la password di un admin esistente a `ADMIN_PASSWORD` (recupero d'emergenza se la posta non funziona). Poi rimuovila. |
| `NOTIFY_EMAIL` | no | Destinatari iniziali (separati da virgola) di notifiche iscrizioni/candidature/messaggi. Default `ADMIN_EMAIL`. Poi si modificano in Impostazioni. Usata solo dal seed. |
| `SMTP_HOST` | no* | Server di posta in uscita. **Vuoto = nessuna email parte**: restano nel registro come "Email non configurata". |
| `SMTP_PORT` | no | Default 587. |
| `SMTP_SECURE` | no | `true` per TLS implicito (porta 465). Default: vero solo se la porta e' 465. |
| `SMTP_USER`, `SMTP_PASS` | secondo provider | Credenziali SMTP. |
| `SMTP_FROM` | consigliata | Mittente, es. `I Locandieri <noreply@tuodominio.it>`. |
| `STORAGE_DRIVER` | no | Solo `local` (default). |
| `STORAGE_DIR` | no | Default `./storage` (in Docker `/app/storage`). Contiene `public-media` (servito su `/media`) e `private` (CV, mai pubblico). |
| `NEXT_DIST_DIR` | no | Cartella di build alternativa (solo sviluppo/e2e). |
| `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN` | no | Se **entrambe** presenti si attiva la sincronizzazione ABES. Alias: `ABES_SHOPIFY_DOMAIN`, `ABES_SHOPIFY_STOREFRONT_TOKEN`. |
| `SHOPIFY_COLLECTION_HANDLE` | no | Sincronizza solo questa collezione. |
| `SHOPIFY_API_VERSION` | no | Default `2025-07`. |

\* Senza SMTP il sito funziona, ma niente conferme agli iscritti, nessuna notifica allo staff e nessuna email di recupero password.

## 5. Posta (SMTP)
Serve un account SMTP del dominio (provider di hosting, Brevo, Mailgun, Google Workspace con password per app...). Compila `SMTP_HOST/PORT/USER/PASS/FROM`, `docker compose up -d`. Verifica: invia un messaggio dal modulo Contatti e controlla in admin > Email > Registro degli invii che sia "Inviata". Le email rimaste "Email non configurata" o "Non riuscita" si rimandano dal registro con "Riprova". Configura SPF/DKIM/DMARC sul dominio del mittente per evitare lo spam.

## 6. Token Shopify Storefront (vetrina ABES sincronizzata)
Opzionale: senza, la vetrina funziona in modo manuale (nome, foto, link, nessun prezzo). Il token lo crea **ABES** (chi ha accesso admin al negozio Shopify):
1. Admin Shopify > Impostazioni > App e canali di vendita > **Sviluppa app** > (abilita lo sviluppo di app personalizzate) > **Crea un'app** (oppure installa il canale **Headless**/Hydrogen e crea uno storefront).
2. Configurazione > **API Storefront**: assegna i permessi **minimi di sola lettura**: "Leggi prodotti, varianti e collezioni" (`unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory` se serve la disponibilita'). Nessun permesso su clienti, checkout, ordini.
3. Installa l'app e copia il **token di accesso Storefront API** (pubblico per natura, ma trattalo come riservato).
4. Inserisci in `.env`: `SHOPIFY_STORE_DOMAIN=nomenegozio.myshopify.com` (o il dominio abes.bio se e' quello primario) e `SHOPIFY_STOREFRONT_TOKEN=...`, riavvia. In admin > Prodotti ABES comparira' "Sincronizza ora".
Se la sincronizzazione fallisce il sito continua a mostrare l'ultima copia valida (senza prezzi).

## 7. Google Analytics 4 e Search Console
Non servono variabili: si inseriscono in **admin > Impostazioni > Statistiche e Search Console**: ID di misurazione `G-XXXXXXXXXX` e codice di verifica Search Console (valore `content` del meta tag). Finche' il campo e' vuoto il sito non carica script esterni e non mostra il banner cookie; appena inserisci l'ID compare il banner e GA parte solo dopo il consenso. Dopo aver attivato GA verifica che la Cookie Policy sia completa (vedi CONSEGNA). Poi in Search Console invia `https://www.tuodominio.it/sitemap.xml`.

## 8. Backup e ripristino
Il backup salva in un unico `.tar.gz` una **copia consistente** del database (`sqlite3 .backup`, mai un semplice `cp`) piu' tutta la cartella `storage/` (immagini e CV).
```bash
scripts/backup.sh                                  # crea backups/ilocandieri-AAAAMMGG-HHMMSS.tar.gz, tiene 30 giorni
KEEP_DAYS=60 BACKUP_DIR=/mnt/backup scripts/backup.sh
scripts/backup.sh --docker                         # esegue dentro il container
```
Cron di esempio (`crontab -e` come utente del deploy):
```
# backup ogni notte alle 02:30
30 2 * * * cd /srv/ilocandieri && ./scripts/backup.sh >> backups/backup.log 2>&1
# pulizia dati scaduti (candidature, iscrizioni passate) ogni notte alle 03:30
30 3 * * * cd /srv/ilocandieri && docker compose run --rm -T app retention >> backups/retention.log 2>&1
```
`retention` usa i giorni impostati in admin > Impostazioni > Conservazione dei dati (0 = non toccare) e pota il registro email oltre 90 giorni. Prova prima con `docker compose run --rm app retention --dry-run`.
**Copia i backup fuori dal server** (rclone/rsync verso altro storage) e proteggili: contengono dati personali e CV.

Ripristino: `docker compose stop app && ./scripts/restore.sh backups/ilocandieri-....tar.gz && docker compose start app`. Lo stato precedente viene salvato in `data/pre-restore-<data>`. Verifica il ripristino su una copia prima di averne bisogno.

## 9. Aggiornamenti
```bash
./scripts/backup.sh                    # sempre prima
git pull                               # o sostituisci i file
docker compose build && docker compose up -d     # le migrazioni partono da sole all'avvio
docker compose logs --tail 50 app
```
Per tornare indietro: ripristina il backup e la versione precedente del codice. Non modificare a mano il database.

## 10. Verifica dopo la pubblicazione
`https://tuodominio/` e `/admin/login` rispondono; il certificato e' valido; login admin; invio di un messaggio di prova dal modulo Contatti; `/sitemap.xml` e `/robots.txt` (l'area `/admin` non e' indicizzabile); backup di prova eseguito e ripristinato altrove.
