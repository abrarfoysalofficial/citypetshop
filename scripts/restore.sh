#!/bin/bash
# Restore DB (and optionally media) from backup.
# Usage: ./scripts/restore.sh <db_dump_path> [media_archive_path]
# Uses DATABASE_URL by default. For staging, use restore-to-staging.sh with STAGING_DATABASE_URL.
# WARNING: Overwrites target database. Use with caution.

set -e
if [ -z "$1" ]; then
  echo "Usage: $0 <db_dump_path> [media_archive_path]"
  echo "Example: $0 /var/backups/city-plus/db_20250221_120000.dump"
  echo "For staging: STAGING_DATABASE_URL=... ./scripts/restore-to-staging.sh <db_dump_path>"
  exit 1
fi

DB_DUMP="$1"
MEDIA_ARCHIVE="${2:-}"
TARGET_URL="${DATABASE_URL:-}"

if [ -z "$TARGET_URL" ]; then
  echo "Error: DATABASE_URL must be set"
  exit 1
fi

if [ ! -f "$DB_DUMP" ]; then
  echo "Error: DB dump not found: $DB_DUMP"
  exit 1
fi

echo "WARNING: This will overwrite the database at DATABASE_URL."
read -p "Type 'yes' to continue: " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

echo "[restore] Restoring DB..."
pg_restore -d "$TARGET_URL" --no-owner --no-acl --clean --if-exists "$DB_DUMP" || true
echo "[restore] DB restore complete."

if [ -n "$MEDIA_ARCHIVE" ] && [ -f "$MEDIA_ARCHIVE" ]; then
  UPLOAD_DIR="${UPLOAD_DIR:-/var/www/city-plus/uploads}"
  mkdir -p "$(dirname "$UPLOAD_DIR")"
  echo "[restore] Extracting media to $UPLOAD_DIR..."
  tar -xzf "$MEDIA_ARCHIVE" -C "$(dirname "$UPLOAD_DIR")"
  echo "[restore] Media restore complete."
fi

echo "[restore] Done."
