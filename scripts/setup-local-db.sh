#!/usr/bin/env bash
# Sets up a local Homebrew Postgres on port 5433 (avoids conflict with
# EnterpriseDB / other installs on 5432) and creates the app database.
set -euo pipefail

export LC_ALL="${LC_ALL:-en_US.UTF-8}"
export LANG="${LANG:-en_US.UTF-8}"
export PATH="/usr/local/opt/postgresql@16/bin:/opt/homebrew/opt/postgresql@16/bin:$PATH"

if ! command -v pg_ctl >/dev/null 2>&1; then
  echo "postgresql@16 not found. Install with: brew install postgresql@16"
  exit 1
fi

# Homebrew Intel vs Apple Silicon data paths
if [[ -d /usr/local/var/postgresql@16 ]]; then
  DATA_DIR=/usr/local/var/postgresql@16
elif [[ -d /opt/homebrew/var/postgresql@16 ]]; then
  DATA_DIR=/opt/homebrew/var/postgresql@16
else
  echo "Could not find Postgres data directory."
  exit 1
fi

CONF="$DATA_DIR/postgresql.conf"
LOG_FILE="$(dirname "$DATA_DIR")/log/postgresql@16-tcs.log"
mkdir -p "$(dirname "$LOG_FILE")"

if grep -qE '^#?port\s*=' "$CONF"; then
  perl -i.bak -pe 's/^#?port\s*=.*/port = 5433/' "$CONF"
else
  echo "port = 5433" >> "$CONF"
fi

if ! pg_isready -h 127.0.0.1 -p 5433 >/dev/null 2>&1; then
  brew services stop postgresql@16 >/dev/null 2>&1 || true
  pg_ctl -D "$DATA_DIR" -l "$LOG_FILE" start
  sleep 1
fi

pg_isready -h 127.0.0.1 -p 5433

psql -h 127.0.0.1 -p 5433 -d postgres -v ON_ERROR_STOP=1 <<'SQL'
DO $$ BEGIN
  CREATE ROLE tcs LOGIN PASSWORD 'tcs' SUPERUSER;
EXCEPTION WHEN duplicate_object THEN
  ALTER ROLE tcs WITH LOGIN PASSWORD 'tcs' SUPERUSER;
END $$;
SELECT 'ok' WHERE EXISTS (SELECT 1 FROM pg_database WHERE datname = 'trading_card_studio');
SQL

if ! psql -h 127.0.0.1 -p 5433 -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='trading_card_studio'" | grep -q 1; then
  psql -h 127.0.0.1 -p 5433 -d postgres -c "CREATE DATABASE trading_card_studio OWNER tcs;"
fi

PGPASSWORD=tcs psql -h 127.0.0.1 -p 5433 -U tcs -d trading_card_studio -c 'SELECT current_user, 1 AS ok;'

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ ! -f "$ROOT/.env" ]]; then
  SECRET="$(openssl rand -base64 32)"
  cat > "$ROOT/.env" <<EOF
DATABASE_URL=postgresql://tcs:tcs@127.0.0.1:5433/trading_card_studio
AUTH_SECRET=$SECRET
EOF
  echo "Wrote $ROOT/.env"
else
  echo ".env already exists — leaving it unchanged."
fi

echo "Next: npm run db:push"
