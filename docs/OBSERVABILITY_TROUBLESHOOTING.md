# Observability & Troubleshooting — City Pet Shop BD

Where to find logs and how to debug common production issues.

---

## 1. Where to Check Logs (CloudPanel)

| Source | Location | Command |
|--------|----------|---------|
| **PM2 stdout** | `~/.pm2/logs/cityplus-out.log` | `pm2 logs cityplus` |
| **PM2 stderr** | `~/.pm2/logs/cityplus-error.log` | `pm2 logs cityplus --err` |
| **PM2 (all)** | — | `pm2 logs cityplus --lines 200` |
| **Nginx access** | CloudPanel → Sites → Logs | Or `/home/citypetshop/logs/` |
| **Nginx error** | CloudPanel → Sites → Error Log | Or `sudo tail -f /var/log/nginx/error.log` |
| **PostgreSQL** | `/var/log/postgresql/` | `sudo tail -f /var/log/postgresql/postgresql-*-main.log` |

### Log format (structured JSON)

```
{"ts":"2025-03-06T12:00:00.000Z","level":"error","scope":"auth","message":"authorize failed","errorType":"PrismaClientKnownRequestError","errorCode":"P1001"}
{"ts":"2025-03-06T12:00:01.000Z","level":"error","scope":"db","message":"connectivity check failed","errorCode":"ECONNREFUSED"}
{"ts":"2025-03-06T12:00:02.000Z","level":"error","scope":"api","message":"request failed","requestId":"abc-123","path":"/api/admin/dashboard","method":"GET","errorType":"Error"}
```

**Correlation:** Use `requestId` to trace a request across logs. Pass `X-Request-ID` in requests to propagate your own id.

---

## 2. Environment Variables (Observability)

| Variable | Required | Purpose |
|----------|----------|---------|
| `SENTRY_DSN` | No | Enable Sentry for uncaught errors. Leave unset to disable. |
| `NODE_ENV` | Yes | `production` for structured logs, no query logging. |

---

## 3. Common Issues & Debug Steps

### 502 Bad Gateway

**Cause:** Nginx can't reach the app. App may be down or not listening.

**Check:**
```bash
pm2 status cityplus
# Expect: online

pm2 logs cityplus --lines 50
# Look for: FATAL, exit, crash

curl -s http://127.0.0.1:3000/api/health
# Expect: {"status":"ok",...}
```

**Fix:**
- If app is stopped: `pm2 start cityplus`
- If app crashed: Check logs for FATAL (env/DB). Fix config, then `pm2 restart cityplus`
- If port wrong: Ensure Nginx proxies to `127.0.0.1:3000`

---

### 500 Internal Server Error

**Cause:** Unhandled error in API route or server component.

**Check:**
```bash
pm2 logs cityplus --err --lines 100
# Look for: scope "api", "admin/dashboard", "auth", "db"
# Note requestId if present
```

**Fix:**
- Match `requestId` in logs to trace the request
- Check `errorType` and `errorCode` (e.g. `P1001` = DB connection)
- For DB: `sudo systemctl status postgresql`, verify `DATABASE_URL`

---

### Login loop (redirect to /admin/login repeatedly)

**Cause:** Session/cookie not persisting. Usually proxy headers or HTTPS.

**Check:**
```bash
# 1. Nginx headers
curl -sI -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: citypetshop.bd" http://127.0.0.1:3000/api/health

# 2. Env
grep -E "NEXTAUTH_URL|AUTH_TRUST_HOST|NEXTAUTH_SECRET" .env.production.local
# NEXTAUTH_URL=https://citypetshop.bd
# AUTH_TRUST_HOST=true
# NEXTAUTH_SECRET=... (32+ chars)

# 3. Auth logs
pm2 logs cityplus | grep -E "auth|authorize"
```

**Fix:**
- Ensure Nginx sets `X-Forwarded-Proto: https` and `X-Forwarded-Host`
- Use HTTPS in browser (not HTTP)
- Ensure `NEXTAUTH_URL` matches the URL in the address bar
- Clear cookies and try again

---

### DB timeout / connection refused

**Cause:** PostgreSQL down, wrong `DATABASE_URL`, or pool exhausted.

**Check:**
```bash
# 1. PostgreSQL
sudo systemctl status postgresql

# 2. Health
curl -s http://127.0.0.1:3000/api/health/db
# Expect: {"status":"ok","database":"connected"}

# 3. Logs
pm2 logs cityplus | grep -E "db|connectivity|P1001|ECONNREFUSED"
```

**Fix:**
- Start PostgreSQL: `sudo systemctl start postgresql`
- Verify `DATABASE_URL` in `.env.production.local` (host, port, password)
- Check `pg_hba.conf` allows local connections
- Add `?connection_limit=10&connect_timeout=10&pool_timeout=20` to `DATABASE_URL`

---

### Rate limit (429) on login

**Cause:** Too many failed login attempts from same IP.

**Check:**
```bash
pm2 logs cityplus | grep "429\|rate"
```

**Fix:**
- Wait 15 minutes, or
- Use a different IP / network

---

## 4. Grep Cheat Sheet

```bash
# Errors only
pm2 logs cityplus --err --lines 200

# By scope
pm2 logs cityplus | grep '"scope":"auth"'
pm2 logs cityplus | grep '"scope":"db"'
pm2 logs cityplus | grep '"scope":"api"'

# By request id
pm2 logs cityplus | grep 'requestId":"abc-123'

# By error code
pm2 logs cityplus | grep 'P1001'
pm2 logs cityplus | grep 'ECONNREFUSED'
```

---

## 5. Sentry (Optional)

If `SENTRY_DSN` is set and `@sentry/nextjs` is installed:

- Uncaught exceptions and unhandled rejections are sent to Sentry
- Install: `npm install @sentry/nextjs`
- Configure: Add `SENTRY_DSN` to `.env.production.local`
- Full setup: See [Sentry Next.js docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
