#!/bin/bash
# Bootstrap first admin user (production-safe).
# Usage: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD="SecurePass12!" ./scripts/bootstrap-admin.sh

set -e
if [ -z "$ADMIN_PASSWORD" ]; then
  echo "ADMIN_PASSWORD is required"
  exit 1
fi
if [ ${#ADMIN_PASSWORD} -lt 12 ]; then
  echo "ADMIN_PASSWORD must be at least 12 characters"
  exit 1
fi
if [ "$ADMIN_PASSWORD" = "Admin@12345" ]; then
  echo "ADMIN_PASSWORD cannot be the default"
  exit 1
fi

npx prisma db seed
echo "Admin user ready. Login at /admin/login"
