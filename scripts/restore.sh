#!/usr/bin/env bash
# Ripristina un backup creato da backup.sh. FERMA PRIMA L'APP (docker compose stop app).
#   scripts/restore.sh backups/ilocandieri-20261018-030000.tar.gz
# Il database e lo storage attuali vengono spostati in ./data/pre-restore-<data> prima di essere sostituiti.
set -euo pipefail
ARCHIVE="${1:?Uso: scripts/restore.sh <archivio.tar.gz>}"
DATA_DIR="${DATA_DIR:-./data}"; DB_FILE="${DB_FILE:-app.db}"; STORAGE_DIR="${STORAGE_DIR:-./storage}"
STAMP="$(date +%Y%m%d-%H%M%S)"; SAVE="$DATA_DIR/pre-restore-$STAMP"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
tar -xzf "$ARCHIVE" -C "$TMP"
[ -f "$TMP/$DB_FILE" ] || { echo "L'archivio non contiene $DB_FILE" >&2; exit 1; }
mkdir -p "$SAVE"
for f in "$DB_FILE" "$DB_FILE-wal" "$DB_FILE-shm"; do [ -e "$DATA_DIR/$f" ] && mv "$DATA_DIR/$f" "$SAVE/"; done
[ -d "$STORAGE_DIR" ] && mv "$STORAGE_DIR" "$SAVE/storage"
mkdir -p "$DATA_DIR" "$STORAGE_DIR"
cp "$TMP/$DB_FILE" "$DATA_DIR/$DB_FILE"
cp -R "$TMP/storage/." "$STORAGE_DIR/"
echo "Ripristino completato. Copia precedente in $SAVE. Riavvia: docker compose start app"
