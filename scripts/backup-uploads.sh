#!/usr/bin/env bash
# Uploads backup script for City Plus Pet Shop
# Run via cron: 0 3 * * * /var/www/cityplus/app/scripts/backup-uploads.sh
set -euo pipefail

UPLOAD_DIR="${UPLOAD_DIR:-/var/www/cityplus/uploads}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/cityplus}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"

echo "[$(date)] Starting uploads backup: $FILENAME"
tar -czf "$FILENAME" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
echo "[$(date)] Uploads backup complete: $FILENAME ($(du -sh "$FILENAME" | cut -f1))"

# Remove old upload backups
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Pruned upload backups older than ${RETENTION_DAYS} days"
