#!/bin/bash
# Media uploads backup
# Usage: ./deploy/backup_uploads.sh [retention_days]

set -e
RETENTION_DAYS=${1:-7}
BACKUP_DIR="${BACKUP_DIR:-/var/backups/city-plus}"
UPLOAD_DIR="${UPLOAD_DIR:-/var/www/city-plus/uploads}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

if [ ! -d "$UPLOAD_DIR" ]; then
  echo "UPLOAD_DIR not found: $UPLOAD_DIR"
  exit 0
fi

echo "[backup] Archiving media..."
tar -czf "$BACKUP_DIR/media_$TIMESTAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
echo "[backup] Saved: $BACKUP_DIR/media_$TIMESTAMP.tar.gz"

echo "[backup] Pruning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "media_*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "[backup] Done."
