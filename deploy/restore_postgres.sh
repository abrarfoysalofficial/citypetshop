#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# restore_postgres.sh — City Plus Pet Shop
# Restore PostgreSQL from backup.
#
# Usage:
#   ./deploy/restore_postgres.sh /path/to/pre_deploy_YYYYMMDD_HHMMSS.dump
#   DATABASE_URL=... ./deploy/restore_postgres.sh /path/to/dump.dump
#
# Requires: DATABASE_URL or DB connection
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DUMP_FILE="${1:?Usage: ./restore_postgres.sh /path/to/dump.dump}"
[ -f "$DUMP_FILE" ] || { echo "File not found: $DUMP_FILE"; exit 1; }

if [ -n "${DATABASE_URL:-}" ]; then
  echo "[restore] Restoring via DATABASE_URL..."
  pg_restore -d "$DATABASE_URL" --no-owner --no-acl --clean --if-exists "$DUMP_FILE" || true
else
  DB_NAME="${DB_NAME:-cityplus_db}"
  echo "[restore] Restoring as postgres user..."
  sudo -u postgres pg_restore -d "$DB_NAME" --no-owner --no-acl --clean --if-exists "$DUMP_FILE" || true
fi
echo "[restore] Done. Verify app and run migrations if needed."
