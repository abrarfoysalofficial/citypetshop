#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# backup_postgres.sh — City Plus Pet Shop
# PostgreSQL backup for deploy and manual use.
#
# Usage:
#   ./deploy/backup_postgres.sh [output_path]
#   BACKUP_DIR=/var/backups/cityplus ./deploy/backup_postgres.sh
#
# If output_path given: write dump to that path.
# Else: write to $BACKUP_DIR/pre_deploy_YYYYMMDD_HHMMSS.dump
# Requires: DATABASE_URL (or sudo postgres access for -d cityplus_db)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/cityplus}"
DB_NAME="${DB_NAME:-cityplus_db}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

if [ -n "${1:-}" ]; then
  OUT_FILE="$1"
else
  OUT_FILE="$BACKUP_DIR/pre_deploy_${TIMESTAMP}.dump"
fi

# Prefer DATABASE_URL (from .env); else use sudo postgres
if [ -n "${DATABASE_URL:-}" ]; then
  echo "[backup] Dumping via DATABASE_URL..."
  pg_dump "$DATABASE_URL" --no-owner --no-acl -Fc -f "$OUT_FILE"
else
  echo "[backup] Dumping as postgres user (sudo)..."
  sudo -u postgres pg_dump -Fc -d "$DB_NAME" -f "$OUT_FILE"
fi

SIZE=$(stat -c%s "$OUT_FILE" 2>/dev/null || echo "0")
if [ "$SIZE" -lt 1024 ]; then
  echo "[backup] ERROR: Backup suspiciously small ($SIZE bytes)"
  exit 1
fi
echo "[backup] Saved: $OUT_FILE ($(du -sh "$OUT_FILE" | cut -f1))"
