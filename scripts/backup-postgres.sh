#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# backup-postgres.sh — City Plus Pet Shop
# Safe PostgreSQL backup using pg_dump -Fc (binary format, faster restore)
#
# Cron (as cityplus user):
#   0 2 * * * /var/www/cityplus/app/scripts/backup-postgres.sh >> /var/log/cityplus/backup.log 2>&1
#
# Env vars (set in crontab or .env):
#   DB_NAME, DB_USER, DB_HOST, DB_PORT, BACKUP_DIR, RETENTION_DAYS
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DB_NAME="${DB_NAME:-cityplus_db}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/cityplus}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup: $BACKUP_FILE"

# Use -f flag (never redirect — avoids silent permission errors)
# Runs as postgres via sudoers rule (no password needed)
sudo -u postgres pg_dump -Fc -d "$DB_NAME" -f "$BACKUP_FILE"

# Verify the backup is non-empty
BACKUP_SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "0")
if [ "$BACKUP_SIZE" -lt 4096 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Backup appears empty ($BACKUP_SIZE bytes). Check DB connection."
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete: $BACKUP_FILE ($(du -sh "$BACKUP_FILE" | cut -f1))"

# Prune old backups
PRUNED=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.dump" -mtime +"$RETENTION_DAYS" -print -delete | wc -l)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pruned $PRUNED backup(s) older than ${RETENTION_DAYS} days"
