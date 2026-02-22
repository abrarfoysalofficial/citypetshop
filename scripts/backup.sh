#!/bin/bash
# Daily backup: PostgreSQL + media uploads
# Usage: ./scripts/backup.sh [retention_days]
# Requires: DATABASE_URL in env, UPLOAD_DIR (default: /var/www/city-plus/uploads)

set -e
RETENTION_DAYS=${1:-7}
BACKUP_DIR="${BACKUP_DIR:-/var/backups/city-plus}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# PostgreSQL dump
if [ -n "$DATABASE_URL" ]; then
  echo "[backup] Dumping PostgreSQL..."
  pg_dump "$DATABASE_URL" --no-owner --no-acl -Fc -f "$BACKUP_DIR/db_$TIMESTAMP.dump"
  echo "[backup] DB dump: $BACKUP_DIR/db_$TIMESTAMP.dump"
else
  echo "[backup] DATABASE_URL not set, skipping DB backup"
fi

# Media uploads
UPLOAD_DIR="${UPLOAD_DIR:-/var/www/city-plus/uploads}"
if [ -d "$UPLOAD_DIR" ]; then
  echo "[backup] Archiving media..."
  tar -czf "$BACKUP_DIR/media_$TIMESTAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")" 2>/dev/null || true
  echo "[backup] Media archive: $BACKUP_DIR/media_$TIMESTAMP.tar.gz"
else
  echo "[backup] UPLOAD_DIR not found, skipping media backup"
fi

# Retention: keep last N days
echo "[backup] Pruning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "db_*.dump" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "media_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "[backup] Done."
