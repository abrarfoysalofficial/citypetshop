# PostgreSQL Migration Runbook — City Pet Shop BD

Production-safe, non-destructive database migration and backup procedures.

---

## 1. DATABASE_URL Format (Connection Pool)

Use these query params for stable, pooled connections:

```
postgresql://USER:PASSWORD@HOST:5432/DATABASE?connection_limit=10&connect_timeout=10&pool_timeout=20
```

| Param | Recommended | Purpose |
|-------|-------------|---------|
| `connection_limit` | 10 | Max connections in Prisma pool. Keep below PostgreSQL `max_connections`. |
| `connect_timeout` | 10 | Seconds to wait when establishing a new connection. |
| `pool_timeout` | 20 | Seconds to wait for an available connection from the pool. |

**Example (citypetshop.bd):**
```
DATABASE_URL=postgresql://cityplus_app:PASSWORD@127.0.0.1:5432/cityplus_db?connection_limit=10&connect_timeout=10&pool_timeout=20
```

---

## 2. Backup Strategy (Before Migration)

**Always backup before running migrations.**

### Full database backup (pg_dump)

```bash
# Create backup directory
sudo mkdir -p /home/citypetshop/backups/db

# Full backup (custom format, compressed, includes schema + data)
sudo -u postgres pg_dump -Fc cityplus_db -f /home/citypetshop/backups/db/cityplus_db_$(date +%Y%m%d_%H%M%S).dump

# Or plain SQL (human-readable, larger)
sudo -u postgres pg_dump cityplus_db > /home/citypetshop/backups/db/cityplus_db_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from backup (if needed)

```bash
# From custom format (.dump)
sudo -u postgres pg_restore -d cityplus_db --clean --if-exists /path/to/backup.dump

# From plain SQL
sudo -u postgres psql cityplus_db < /path/to/backup.sql
```

### Pre-migration backup script (copy-paste)

```bash
#!/bin/bash
# Run before: npx prisma migrate deploy
BACKUP_DIR=/home/citypetshop/backups/db
mkdir -p "$BACKUP_DIR"
sudo -u postgres pg_dump -Fc cityplus_db -f "$BACKUP_DIR/cityplus_db_$(date +%Y%m%d_%H%M%S).dump"
echo "Backup saved to $BACKUP_DIR"
```

---

## 3. Migration Runbook (Non-Destructive)

Prisma `migrate deploy` applies pending migrations only. It does **not** drop data.

### Pre-flight checklist

```bash
# 1. Backup
sudo -u postgres pg_dump -Fc cityplus_db -f /home/citypetshop/backups/db/pre_migrate_$(date +%Y%m%d).dump

# 2. Check migration status (no changes applied)
cd /home/citypetshop/htdocs/citypetshop.bd
npx prisma migrate status

# 3. Ensure app is stopped (optional, recommended for major migrations)
pm2 stop cityplus
```

### Apply migrations

```bash
cd /home/citypetshop/htdocs/citypetshop.bd
npx prisma migrate deploy
```

**Expected output:**
```
X migration(s) applied
```
or
```
Database schema is up to date
```

### Post-migration

```bash
# Restart app
pm2 start cityplus

# Verify
curl -s http://127.0.0.1:3000/api/health/db | jq .
# {"status":"ok","database":"connected",...}
```

### Rollback (if migration fails)

1. Restore from backup (see above).
2. Fix migration SQL or revert the migration file in code.
3. Re-run `prisma migrate deploy` after fixing.

---

## 4. Recommended PostgreSQL Settings (VPS)

Edit `postgresql.conf` (often `/etc/postgresql/16/main/postgresql.conf` or similar):

| Setting | Recommended | Notes |
|---------|-------------|-------|
| `max_connections` | 100 | App pool (10) + admin tools + headroom. |
| `shared_buffers` | 256MB | 25% of RAM for small VPS (1–2GB). |
| `effective_cache_size` | 512MB | ~50% of RAM. |
| `work_mem` | 4MB | Per-query memory. |
| `maintenance_work_mem` | 64MB | For VACUUM, CREATE INDEX. |

**Connection math:** `connection_limit` × app instances + 10 for admin. Example: 10 × 1 + 10 = 20. Set `max_connections` ≥ 50 for safety.

### Apply and restart

```bash
sudo systemctl restart postgresql
```

---

## 5. Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Full health (env + DB). |
| `GET /api/health/db` | DB-only check (SELECT 1). |

```bash
# DB-only check
curl -s http://127.0.0.1:3000/api/health/db | jq .
```

---

## 6. Startup Checks (Fail-Fast)

On production startup, the app:

1. Validates required env vars (DATABASE_URL, NEXTAUTH_*, etc.).
2. Tests DB connectivity with `SELECT 1`.
3. Exits with code 1 if either fails (PM2 will restart).

**Logs to look for:**
```
[startup] Environment validated ✓
[startup] PostgreSQL connected ✓ (12ms)
```

**If DB fails:**
```
FATAL: Database connection failed at startup
Error: ...
process.exit(1)
```

Fix `DATABASE_URL`, PostgreSQL service, or `pg_hba.conf`, then `pm2 restart cityplus`.
