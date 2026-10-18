#!/usr/bin/env bash
# Backup consistente de I Locandieri: database SQLite + file caricati (storage/).
#
#   scripts/backup.sh                 # backup in ./backups
#   BACKUP_DIR=/mnt/backup KEEP_DAYS=30 scripts/backup.sh
#   scripts/backup.sh --docker        # esegue dentro il container "app" di docker compose
#
# Variabili (tutte facoltative):
#   DATA_DIR     cartella del database           (default ./data)
#   DB_FILE      nome del file database          (default app.db)
#   STORAGE_DIR  cartella file caricati          (default ./storage)
#   BACKUP_DIR   dove salvare gli archivi        (default ./backups)
#   KEEP_DAYS    cancella backup piu' vecchi     (default 30, 0 = non cancellare)
#
# Il database NON viene copiato con cp (in modalita' WAL sarebbe incoerente): si usa
# `sqlite3 .backup` (o VACUUM INTO se .backup non e' disponibile).
# L'archivio contiene: app.db (copia consistente) + storage/ (public-media e private con i CV).
# ATTENZIONE: contiene dati personali (CV, iscrizioni). Conservalo in un luogo protetto, meglio cifrato.
set -euo pipefail

if [ "${1:-}" = "--docker" ]; then
  exec docker compose exec -T app sh -c 'DATA_DIR=/app/data STORAGE_DIR=/app/storage BACKUP_DIR=/app/backups KEEP_DAYS='"${KEEP_DAYS:-30}"' /app/scripts/backup.sh'
fi

DATA_DIR="${DATA_DIR:-./data}"
DB_FILE="${DB_FILE:-app.db}"
STORAGE_DIR="${STORAGE_DIR:-./storage}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${KEEP_DAYS:-30}"

command -v sqlite3 >/dev/null || { echo "sqlite3 non installato (apt install sqlite3)" >&2; exit 1; }
[ -f "$DATA_DIR/$DB_FILE" ] || { echo "Database non trovato: $DATA_DIR/$DB_FILE" >&2; exit 1; }

STAMP="$(date +%Y%m%d-%H%M%S)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$BACKUP_DIR"

sqlite3 "$DATA_DIR/$DB_FILE" ".timeout 10000" ".backup '$TMP/$DB_FILE'" 2>/dev/null \
  || { rm -f "$TMP/$DB_FILE"; sqlite3 "$DATA_DIR/$DB_FILE" ".timeout 10000" "VACUUM INTO '$TMP/$DB_FILE'"; }
[ "$(sqlite3 "$TMP/$DB_FILE" 'PRAGMA integrity_check;')" = "ok" ] || { echo "Controllo integrita' fallito" >&2; exit 1; }

mkdir -p "$TMP/storage"
[ -d "$STORAGE_DIR" ] && cp -R "$STORAGE_DIR/." "$TMP/storage/"

OUT="$BACKUP_DIR/ilocandieri-$STAMP.tar.gz"
tar -czf "$OUT" -C "$TMP" "$DB_FILE" storage
chmod 600 "$OUT"
echo "Backup creato: $OUT ($(du -h "$OUT" | cut -f1))"

if [ "$KEEP_DAYS" -gt 0 ]; then
  find "$BACKUP_DIR" -maxdepth 1 -name 'ilocandieri-*.tar.gz' -mtime "+$KEEP_DAYS" -print -delete | sed 's/^/Eliminato backup vecchio: /'
fi
