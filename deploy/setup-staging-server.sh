#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-staging-server.sh — City Plus Pet Shop
# One-time staging server setup. Run as abrar (sudo).
#
# Usage: sudo bash deploy/setup-staging-server.sh
#
# What it creates:
#   - OS user: cityplus_staging
#   - App dir: /var/www/cityplus-staging/app
#   - PostgreSQL DB: cityplus_staging / user: cityplus_staging
#   - Log dir: /var/log/cityplus-staging
#   - SSH deploy key for GitHub Actions
#   - Sudoers entry (least-privilege pg_dump only)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

STAGING_USER="cityplus_staging"
STAGING_APP_DIR="/var/www/cityplus-staging/app"
STAGING_LOG_DIR="/var/log/cityplus-staging"
STAGING_BACKUP_DIR="/var/backups/cityplus-staging"
STAGING_DB="cityplus_staging"
STAGING_PORT=3002

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

[ "$(id -u)" -eq 0 ] || error "Must run as root (sudo)"

info "═══ City Plus Pet Shop — Staging Server Setup ═══"

# ─────────────────────────────────────────────────────────────────────────────
info "Creating OS user: $STAGING_USER"
# ─────────────────────────────────────────────────────────────────────────────
if id "$STAGING_USER" &>/dev/null; then
  warn "User $STAGING_USER already exists, skipping."
else
  useradd -m -s /bin/bash "$STAGING_USER"
  info "User created: $STAGING_USER"
fi

# ─────────────────────────────────────────────────────────────────────────────
info "Creating directories"
# ─────────────────────────────────────────────────────────────────────────────
mkdir -p "$STAGING_APP_DIR" "$STAGING_LOG_DIR" "$STAGING_BACKUP_DIR"
chown -R "$STAGING_USER:$STAGING_USER" "/var/www/cityplus-staging" "$STAGING_LOG_DIR"
chown root:root "$STAGING_BACKUP_DIR"
chmod 750 "$STAGING_BACKUP_DIR"
info "Directories created"

# ─────────────────────────────────────────────────────────────────────────────
info "Creating PostgreSQL database and user"
# ─────────────────────────────────────────────────────────────────────────────
DB_PASSWORD=$(openssl rand -hex 20)

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$STAGING_USER'" | grep -q 1; then
  warn "PostgreSQL user $STAGING_USER already exists"
else
  sudo -u postgres psql -c "CREATE USER $STAGING_USER WITH PASSWORD '$DB_PASSWORD';"
  info "PostgreSQL user created"
fi

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$STAGING_DB'" | grep -q 1; then
  warn "Database $STAGING_DB already exists"
else
  sudo -u postgres psql -c "CREATE DATABASE $STAGING_DB OWNER $STAGING_USER;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $STAGING_DB TO $STAGING_USER;"
  sudo -u postgres psql -d "$STAGING_DB" -c "GRANT ALL ON SCHEMA public TO $STAGING_USER;"
  sudo -u postgres psql -d "$STAGING_DB" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $STAGING_USER;"
  sudo -u postgres psql -d "$STAGING_DB" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $STAGING_USER;"
  info "Database created: $STAGING_DB"
fi

# ─────────────────────────────────────────────────────────────────────────────
info "Generating SSH deploy key for GitHub Actions"
# ─────────────────────────────────────────────────────────────────────────────
SSH_DIR="/home/$STAGING_USER/.ssh"
mkdir -p "$SSH_DIR"
chown "$STAGING_USER:$STAGING_USER" "$SSH_DIR"
chmod 700 "$SSH_DIR"

if [ ! -f "$SSH_DIR/id_ed25519" ]; then
  sudo -u "$STAGING_USER" ssh-keygen -t ed25519 -C "github-actions-staging" -f "$SSH_DIR/id_ed25519" -N ""
  cat "$SSH_DIR/id_ed25519.pub" >> "$SSH_DIR/authorized_keys"
  chown "$STAGING_USER:$STAGING_USER" "$SSH_DIR/authorized_keys"
  chmod 600 "$SSH_DIR/authorized_keys"
  info "SSH deploy key created"
else
  warn "SSH key already exists, skipping"
fi

# ─────────────────────────────────────────────────────────────────────────────
info "Creating sudoers entry (least-privilege pg_dump only)"
# ─────────────────────────────────────────────────────────────────────────────
SUDOERS_FILE="/etc/sudoers.d/cityplus-staging"
cat > "$SUDOERS_FILE" << SUDOERS
# City Plus Pet Shop — staging deploy user
# Allows pg_dump backup only. No other sudo rights.
$STAGING_USER ALL=(postgres) NOPASSWD: /usr/bin/pg_dump -Fc -d $STAGING_DB -f /var/backups/cityplus-staging/*.dump
SUDOERS
chmod 440 "$SUDOERS_FILE"
visudo -c -f "$SUDOERS_FILE" || error "Sudoers syntax check failed!"
info "Sudoers entry created: $SUDOERS_FILE"

# ─────────────────────────────────────────────────────────────────────────────
info "Creating .env.staging.local template"
# ─────────────────────────────────────────────────────────────────────────────
ENV_FILE="$STAGING_APP_DIR/.env.staging.local"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" << ENVEOF
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://staging.citypluspetshop.com
APP_URL=https://staging.citypluspetshop.com
DATABASE_URL=postgresql://${STAGING_USER}:${DB_PASSWORD}@127.0.0.1:5432/${STAGING_DB}
NEXTAUTH_URL=https://staging.citypluspetshop.com
NEXTAUTH_SECRET=$(openssl rand -hex 32)
UPLOAD_DIR=/var/www/cityplus-staging/uploads
ENVEOF
  chown "$STAGING_USER:$STAGING_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  info "Created: $ENV_FILE"
else
  warn "$ENV_FILE already exists, skipping"
fi

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN} Staging server setup complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}REQUIRED MANUAL STEPS:${NC}"
echo ""
echo "1. Copy the PRIVATE KEY to GitHub Secret STAGING_SSH_KEY:"
echo ""
echo "   ┌─ Copy this private key ──────────────────────────────────┐"
cat "$SSH_DIR/id_ed25519"
echo "   └──────────────────────────────────────────────────────────┘"
echo ""
echo "2. Clone the repo:"
echo "   sudo -u $STAGING_USER git clone https://github.com/YOUR_ORG/city-plus-pet-shop.git $STAGING_APP_DIR"
echo ""
echo "3. Copy ecosystem config:"
echo "   cp $STAGING_APP_DIR/deploy/ecosystem.staging.cjs /var/www/cityplus-staging/"
echo ""
echo "4. Fill in remaining env vars in: $ENV_FILE"
echo "   (SSLCOMMERZ keys, RESEND key, etc. — use staging/test values)"
echo ""
echo "5. Run initial deploy manually once:"
echo "   sudo -u $STAGING_USER bash $STAGING_APP_DIR/deploy/deploy-staging.sh"
echo ""
echo "6. Save PM2:"
echo "   sudo -u $STAGING_USER pm2 save"
echo "   sudo -u $STAGING_USER pm2 startup"
echo ""
echo -e "${YELLOW}GitHub Actions Secrets needed:${NC}"
echo "   STAGING_HOST     = $(hostname -I | awk '{print $1}')"
echo "   STAGING_SSH_KEY  = (private key printed above)"
echo "   STAGING_SSH_PORT = 22"
