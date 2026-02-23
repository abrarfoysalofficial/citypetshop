#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# validate-env.sh — Pre-deploy environment validation
# Ensures required env vars are set before deployment.
# Usage: source .env.production.local && bash scripts/validate-env.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

ERR=0

check() {
  local name="$1"
  local val="${!name:-}"
  local minlen="${2:-0}"
  if [ -z "$val" ]; then
    echo -e "${RED}ERROR: $name is not set${NC}"
    ERR=1
    return
  fi
  if [ "$minlen" -gt 0 ] && [ ${#val} -lt "$minlen" ]; then
    echo -e "${RED}ERROR: $name must be at least $minlen characters${NC}"
    ERR=1
    return
  fi
  echo -e "${GREEN}OK: $name is set${NC}"
}

echo "Validating production environment..."
check "NODE_ENV"
check "DATABASE_URL"
check "NEXTAUTH_SECRET" 32
check "NEXTAUTH_URL"
check "NEXT_PUBLIC_SITE_URL"
check "AUTH_TRUST_HOST"
check "UPLOAD_DIR"

if [ $ERR -eq 1 ]; then
  echo -e "\n${RED}Validation failed. Fix .env.production.local before deploying.${NC}"
  exit 1
fi

echo -e "\n${GREEN}All required environment variables are set.${NC}"
