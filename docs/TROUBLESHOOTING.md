# Troubleshooting — City Pet Shop BD

Common issues and fixes.

---

## 502 Bad Gateway

**Cause:** Nginx cannot reach the app.

**Fix:**
1. `pm2 status` — ensure `cityplus` is `online`
2. `pm2 restart cityplus`
3. `pm2 logs cityplus --err --lines 50` — check for startup errors
4. Verify app listens on 3000: `curl -s http://127.0.0.1:3000/api/health`

---

## 500 Internal Server Error

**Cause:** App crash or unhandled exception.

**Fix:**
1. `pm2 logs cityplus --lines 100` — find stack trace
2. Check DATABASE_URL, NEXTAUTH_SECRET, required env vars
3. Restart: `pm2 restart cityplus`

---

## Admin Login Loop (redirects to /login repeatedly)

**Cause:** Session cookie not set or wrong domain/protocol.

**Fix:**
1. Use **HTTPS** — secure cookies require HTTPS
2. Nginx must pass: `X-Forwarded-Proto: https`, `X-Forwarded-Host`
3. `.env.production.local`: `NEXTAUTH_URL=https://citypetshop.bd`, `AUTH_TRUST_HOST=true`
4. `NEXTAUTH_SECRET` must be 32+ characters
5. Access admin via https://citypetshop.bd/admin/login (not /login)

---

## Database Timeout / Disconnected

**Cause:** PostgreSQL down, wrong DATABASE_URL, or connection limit.

**Fix:**
1. `sudo systemctl status postgresql` — ensure running
2. Test: `psql -h 127.0.0.1 -U cityplus_app -d cityplus_db -c "SELECT 1"`
3. DATABASE_URL: use `127.0.0.1` not `localhost`
4. Add pool params: `?connection_limit=10&connect_timeout=10`
5. `npx prisma migrate deploy` if migrations pending

---

## Health Returns 503

**Cause:** Env validation or DB check failed.

**Fix:**
1. `curl -s http://127.0.0.1:3000/api/health | jq` — read `message` and `checks`
2. If `env: "fail"` — fix required env (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, AUTH_TRUST_HOST)
3. If `database: "fail"` — see Database Timeout above

---

## Build Fails (check:nodemo, check:secrets, check:domain)

- **check:nodemo:** Remove demo-related code (demo mode, demo_session, etc.)
- **check:secrets:** Remove hardcoded secrets; use .env
- **check:domain:** Replace old domains with https://citypetshop.bd

---

## Permission Denied (files)

```bash
sudo chown -R citypetshop:citypetshop /home/citypetshop/htdocs/citypetshop.bd
```

---

## Log Locations

| Source | Command / Path |
|--------|----------------|
| PM2 | `pm2 logs cityplus` |
| Nginx | `/var/log/nginx/error.log` |
| PostgreSQL | `sudo journalctl -u postgresql` |
