#!/bin/bash
# PostgreSQL backup for City Plus Pet Shop
# Usage: ./deploy/backup_postgres.sh [retention_days]
# Requires: DATABASE_URL in env

set -e
RETENTION_DAYS=${1:-7}
BACKUP_DIR="${BACKUP_DIR:-/var/backups/city-plus}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set"
  exit 1
fi

echo "[backup] Dumping PostgreSQL..."
pg_dump "$DATABASE_URL" --no-owner --no-acl -Fc -f "$BACKUP_DIR/db_$TIMESTAMP.dump"
echo "[backup] Saved: $BACKUP_DIR/db_$TIMESTAMP.dump"

echo "[backup] Pruning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "db_*.dump" -mtime +$RETENTION_DAYS -delete
echo "[backup] Done."
