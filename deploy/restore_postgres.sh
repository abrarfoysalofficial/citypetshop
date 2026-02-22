#!/bin/bash
# Restore PostgreSQL from backup
# Usage: DATABASE_URL=... ./deploy/restore_postgres.sh /path/to/db_YYYYMMDD_HHMMSS.dump

set -e
DUMP_FILE="${1:?Usage: ./restore_postgres.sh /path/to/dump.dump}"
if [ ! -f "$DUMP_FILE" ]; then
  echo "File not found: $DUMP_FILE"
  exit 1
fi
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set"
  exit 1
fi

echo "[restore] Restoring from $DUMP_FILE..."
pg_restore -d "$DATABASE_URL" --no-owner --no-acl --clean --if-exists "$DUMP_FILE" || true
echo "[restore] Done. Verify app and run migrations if needed."
