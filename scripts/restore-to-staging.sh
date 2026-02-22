#!/bin/bash
# Restore to staging: DB + media from backup
# Usage: ./scripts/restore-to-staging.sh <db_dump_path> [media_archive_path]
# WARNING: Overwrites STAGING_DATABASE_URL. Use only for staging/DR drill.

set -e
if [ -z "$1" ]; then
  echo "Usage: $0 <db_dump_path> [media_archive_path]"
  echo "Example: STAGING_DATABASE_URL=postgresql://... $0 /var/backups/city-plus/db_20250221_120000.dump"
  exit 1
fi

DB_DUMP="$1"
MEDIA_ARCHIVE="${2:-}"

if [ ! -f "$DB_DUMP" ]; then
  echo "Error: DB dump not found: $DB_DUMP"
  exit 1
fi

if [ -z "$STAGING_DATABASE_URL" ]; then
  echo "Error: STAGING_DATABASE_URL must be set"
  exit 1
fi

echo "[restore] Restoring DB to staging..."
pg_restore -d "$STAGING_DATABASE_URL" --no-owner --no-acl --clean --if-exists "$DB_DUMP" || true
echo "[restore] DB restore complete."

if [ -n "$MEDIA_ARCHIVE" ] && [ -f "$MEDIA_ARCHIVE" ]; then
  STAGING_UPLOAD_DIR="${STAGING_UPLOAD_DIR:-/var/www/city-plus-staging/uploads}"
  mkdir -p "$(dirname "$STAGING_UPLOAD_DIR")"
  echo "[restore] Extracting media to $STAGING_UPLOAD_DIR..."
  tar -xzf "$MEDIA_ARCHIVE" -C "$(dirname "$STAGING_UPLOAD_DIR")"
  echo "[restore] Media restore complete."
fi

echo "[restore] Done. Run verification checklist."
