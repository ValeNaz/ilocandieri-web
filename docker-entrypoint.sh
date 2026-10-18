#!/bin/sh
# Entrypoint: `start` (default) = migrate -> next start. Seed is NEVER automatic.
#   docker compose run --rm app seed        # first install: creates admin (from env) + initial content
#   docker compose run --rm app retention   # retention job (add --dry-run)
#   docker compose run --rm app migrate     # migrations only
set -e
cmd="${1:-start}"
[ $# -gt 0 ] && shift
case "$cmd" in
  start)
    if [ -z "$APP_SECRET" ] || [ "${#APP_SECRET}" -lt 16 ]; then
      echo "[entrypoint] ERRORE: APP_SECRET mancante o troppo corto (min 16 caratteri)." >&2
      exit 1
    fi
    echo "[entrypoint] migrazioni database..."
    node_modules/.bin/tsx scripts/migrate.ts
    echo "[entrypoint] avvio server su porta ${PORT:-3000}"
    exec node_modules/.bin/next start -H "${HOSTNAME:-0.0.0.0}" -p "${PORT:-3000}"
    ;;
  migrate)   exec node_modules/.bin/tsx scripts/migrate.ts ;;
  seed)      node_modules/.bin/tsx scripts/migrate.ts && exec node_modules/.bin/tsx scripts/seed.ts ;;
  retention) exec node_modules/.bin/tsx scripts/retention.ts "$@" ;;
  sh|bash)   exec "$cmd" "$@" ;;
  *)         exec "$cmd" "$@" ;;
esac
