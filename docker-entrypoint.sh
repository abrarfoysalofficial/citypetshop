#!/bin/sh
set -e
mkdir -p /app/uploads
chown -R nextjs:nodejs /app/uploads 2>/dev/null || true
cd /app
exec runuser -u nextjs -- sh -c "npx prisma migrate deploy; exec node server.js"
