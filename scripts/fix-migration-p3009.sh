#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# fix-migration-p3009.sh
# Safely recovers from Prisma P3009 (failed migration) for:
#   20250221100000_enterprise_phases
# Root cause: ALTER TYPE "OrderStatus" failed because cityplus_app is not owner.
#
# Run order:
#   Step A–C  →  as abrar (sudo access needed)
#   Step D–F  →  as cityplus (app user)
#
# NEVER run this with --reset or prisma migrate dev.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/var/www/cityplus/app"
DB_NAME="cityplus_db"
DB_USER="cityplus_app"
MIGRATION_NAME="20250221100000_enterprise_phases"
BACKUP_DIR="/var/backups/cityplus"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Detect current user ───────────────────────────────────────────────────────
CURRENT_USER=$(whoami)
info "Running as: $CURRENT_USER"

# ─────────────────────────────────────────────────────────────────────────────
# STEP A — Secure database backup  (run as: abrar)
# ─────────────────────────────────────────────────────────────────────────────
step_a_backup() {
  info "=== STEP A: Pre-recovery database backup ==="
  if [ "$CURRENT_USER" != "abrar" ] && [ "$CURRENT_USER" != "root" ]; then
    warn "Skipping Step A — not running as abrar. Run manually:"
    echo "  sudo mkdir -p $BACKUP_DIR"
    echo "  sudo chown postgres:postgres $BACKUP_DIR"
    echo "  sudo chmod 700 $BACKUP_DIR"
    echo "  sudo -u postgres pg_dump -Fc -d $DB_NAME -f $BACKUP_DIR/pre_p3009_recovery_\$(date +%Y%m%d_%H%M%S).dump"
    return
  fi

  mkdir -p "$BACKUP_DIR"
  chown postgres:postgres "$BACKUP_DIR"
  chmod 700 "$BACKUP_DIR"

  BACKUP_FILE="$BACKUP_DIR/pre_p3009_recovery_$(date +%Y%m%d_%H%M%S).dump"
  sudo -u postgres pg_dump -Fc -d "$DB_NAME" -f "$BACKUP_FILE"

  # Verify backup is non-empty
  BACKUP_SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "0")
  if [ "$BACKUP_SIZE" -lt 1024 ]; then
    error "Backup file appears too small ($BACKUP_SIZE bytes). Aborting."
  fi
  info "Backup saved: $BACKUP_FILE ($(du -sh "$BACKUP_FILE" | cut -f1))"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP B — Inspect migration state  (run as: cityplus or abrar)
# ─────────────────────────────────────────────────────────────────────────────
step_b_inspect() {
  info "=== STEP B: Inspect _prisma_migrations table ==="
  echo ""
  echo "--- All migrations (last 15) ---"
  sudo -u postgres psql -d "$DB_NAME" -c \
    "SELECT migration_name, applied_steps_count, finished_at IS NOT NULL AS finished, logs IS NOT NULL AS has_logs FROM _prisma_migrations ORDER BY started_at DESC LIMIT 15;"

  echo ""
  echo "--- Failed migration detail ---"
  sudo -u postgres psql -d "$DB_NAME" -c \
    "SELECT migration_name, applied_steps_count, finished_at, left(logs, 500) AS logs_preview FROM _prisma_migrations WHERE migration_name = '$MIGRATION_NAME';"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP C — Fix enum ownership  (run as: abrar via postgres)
# ─────────────────────────────────────────────────────────────────────────────
step_c_fix_ownership() {
  info "=== STEP C: Fix OrderStatus enum ownership ==="

  echo "--- Current enum owner ---"
  sudo -u postgres psql -d "$DB_NAME" -c \
    "SELECT typname, rolname AS owner FROM pg_type JOIN pg_roles ON pg_type.typowner = pg_roles.oid WHERE typname = 'OrderStatus';"

  info "Transferring ownership of all postgres-owned objects to $DB_USER..."
  # REASSIGN OWNED is non-destructive — changes ownership only, no data modification
  sudo -u postgres psql -d "$DB_NAME" -c "REASSIGN OWNED BY postgres TO $DB_USER;"

  echo ""
  echo "--- Enum owner after fix ---"
  sudo -u postgres psql -d "$DB_NAME" -c \
    "SELECT typname, rolname AS owner FROM pg_type JOIN pg_roles ON pg_type.typowner = pg_roles.oid WHERE typtype = 'e';"

  info "Step C complete. Ownership transferred."
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP D — Check what the migration actually did  (inspect before deciding)
# ─────────────────────────────────────────────────────────────────────────────
step_d_check_objects() {
  info "=== STEP D: Check which objects from the migration exist ==="

  echo "--- Tables created by this migration (sample) ---"
  sudo -u postgres psql -d "$DB_NAME" -c \
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('order_tags','inventory_logs','collections','flash_sale_rules','landing_pages','landing_blocks','customers','reminders','draft_orders','fraud_flags','blocked_ips','conversations') ORDER BY tablename;"

  echo ""
  echo "--- Check if 'draft' value exists in OrderStatus ---"
  sudo -u postgres psql -d "$DB_NAME" -c \
    "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'OrderStatus' ORDER BY enumsortorder;"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP E — Resolve the migration  (run as: cityplus)
# Decision logic:
#   If the tables exist AND 'draft' enum value exists → mark --applied
#   If tables are missing OR 'draft' value is missing  → mark --rolled-back
# ─────────────────────────────────────────────────────────────────────────────
step_e_resolve() {
  info "=== STEP E: Resolve failed migration ==="

  if [ "$CURRENT_USER" != "cityplus" ]; then
    warn "This step must run as cityplus. Switch user first:"
    echo "  sudo -u cityplus bash"
    echo "  cd $APP_DIR"
    echo ""
    warn "Then decide based on Step D output:"
    echo ""
    echo "  Option 1 — Tables exist AND 'draft' enum value exists:"
    echo "    npx prisma migrate resolve --applied $MIGRATION_NAME"
    echo ""
    echo "  Option 2 — Tables missing OR 'draft' enum value missing:"
    echo "    npx prisma migrate resolve --rolled-back $MIGRATION_NAME"
    echo ""
    echo "  After resolving, verify:"
    echo "    npx prisma migrate status"
    return
  fi

  cd "$APP_DIR"

  # Auto-detect state: count tables that should exist
  TABLES_FOUND=$(sudo -u postgres psql -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('order_tags','inventory_logs','collections','draft_orders','fraud_flags');" | tr -d ' ')

  DRAFT_ENUM_EXISTS=$(sudo -u postgres psql -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'OrderStatus' AND pg_enum.enumlabel = 'draft';" | tr -d ' ')

  info "Tables found from migration: $TABLES_FOUND/5"
  info "Draft enum value exists: $DRAFT_ENUM_EXISTS"

  if [ "$TABLES_FOUND" -ge 4 ] && [ "$DRAFT_ENUM_EXISTS" -eq 1 ]; then
    info "Migration appears COMPLETE. Marking as --applied."
    npx prisma migrate resolve --applied "$MIGRATION_NAME"
  else
    warn "Migration appears INCOMPLETE. Marking as --rolled-back."
    warn "migrate deploy will re-run this migration from scratch."
    npx prisma migrate resolve --rolled-back "$MIGRATION_NAME"
  fi

  info "Verifying migration status..."
  npx prisma migrate status
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP F — Run migrate deploy  (run as: cityplus)
# ─────────────────────────────────────────────────────────────────────────────
step_f_deploy() {
  info "=== STEP F: Run prisma migrate deploy ==="

  if [ "$CURRENT_USER" != "cityplus" ]; then
    warn "Switch to cityplus user first: sudo -u cityplus bash"
    echo "  cd $APP_DIR"
    echo "  npx prisma migrate deploy"
    return
  fi

  cd "$APP_DIR"

  # Final check: no failed migrations should remain
  FAILED_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM _prisma_migrations WHERE finished_at IS NULL AND started_at IS NOT NULL;" | tr -d ' ')

  if [ "$FAILED_COUNT" -gt 0 ]; then
    error "$FAILED_COUNT migration(s) still marked as failed. Resolve them before deploying."
  fi

  npx prisma migrate deploy

  info "=== Migration recovery complete ==="
  info "Verify the live app is healthy:"
  echo "  curl -sf http://127.0.0.1:3001/api/health"
  echo "  pm2 logs cityplus --lines 30"
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN — Run all steps in order
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
echo " City Plus Pet Shop — Prisma P3009 Recovery"
echo " Migration: $MIGRATION_NAME"
echo " Database:  $DB_NAME"
echo " $(date)"
echo "════════════════════════════════════════════════════════════"
echo ""

case "${1:-all}" in
  a) step_a_backup ;;
  b) step_b_inspect ;;
  c) step_c_fix_ownership ;;
  d) step_d_check_objects ;;
  e) step_e_resolve ;;
  f) step_f_deploy ;;
  all)
    step_a_backup
    step_b_inspect
    step_c_fix_ownership
    step_d_check_objects
    step_e_resolve
    step_f_deploy
    ;;
  *)
    echo "Usage: $0 [a|b|c|d|e|f|all]"
    echo "  a   Backup database (abrar)"
    echo "  b   Inspect migration table (abrar)"
    echo "  c   Fix enum ownership (abrar)"
    echo "  d   Check migration objects (abrar)"
    echo "  e   Resolve migration (cityplus)"
    echo "  f   Run migrate deploy (cityplus)"
    echo "  all Run all steps"
    ;;
esac
