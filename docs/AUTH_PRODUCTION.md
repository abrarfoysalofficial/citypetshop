# Admin Auth Production Guide — City Pet Shop BD

Production-safe configuration for admin login and sessions behind Nginx (CloudPanel).

---

## 1. Environment Variables Checklist

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `NODE_ENV` | Yes | `production` | Enables secure cookies, prod validation |
| `NEXTAUTH_URL` | Yes | `https://citypetshop.bd` | Auth callbacks, redirects. Must match public URL. |
| `NEXTAUTH_SECRET` | Yes | 32+ char hex | JWT signing. `openssl rand -hex 32` |
| `AUTH_TRUST_HOST` | Yes | `true` | Trust X-Forwarded-* from proxy |
| `DATABASE_URL` | Yes | `postgresql://user:pass@127.0.0.1:5432/db?connection_limit=10` | Prisma/PostgreSQL |
| `APP_URL` | Recommended | `https://citypetshop.bd` | Fallback base URL |
| `NEXT_PUBLIC_SITE_URL` | Recommended | `https://citypetshop.bd` | Client-side base URL |
| `COOKIE_DOMAIN` | Optional | `.citypetshop.bd` | Share cookies between www and non-www |
| `MASTER_SECRET` | If using SecureConfig | 32+ char hex | Encrypted config decryption |

**Example `.env.production.local`:**

```bash
NODE_ENV=production
NEXTAUTH_URL=https://citypetshop.bd
NEXT_PUBLIC_SITE_URL=https://citypetshop.bd
APP_URL=https://citypetshop.bd
NEXTAUTH_SECRET=<32+ chars from: openssl rand -hex 32>
AUTH_TRUST_HOST=true
DATABASE_URL=postgresql://cityplus_app:PASSWORD@127.0.0.1:5432/cityplus_db?connection_limit=10

# Optional: if you serve both www.citypetshop.bd and citypetshop.bd
COOKIE_DOMAIN=.citypetshop.bd
```

---

## 2. Nginx Reverse Proxy Config

**Required header snippet** (add inside your `location /` block). NextAuth needs these to detect HTTPS and set secure cookies correctly behind the proxy:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header Host $host;
```

**Full location block** for HTTPS detection and session cookies:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

**Critical:** `X-Forwarded-Proto` must be `https` when the client uses HTTPS. Nginx sets `$scheme` correctly when SSL terminates at Nginx.

**www redirect (optional):** To avoid cookie domain issues, redirect www to non-www:

```nginx
server {
    listen 443 ssl;
    server_name www.citypetshop.bd;
    return 301 https://citypetshop.bd$request_uri;
}
```

---

## 3. Cookie Configuration

| Attribute | Value | Reason |
|-----------|-------|--------|
| `secure` | `true` | HTTPS only in production |
| `sameSite` | `lax` | CSRF protection, allows top-level redirects |
| `path` | `/` | Available for all routes |
| `httpOnly` | `true` | Not accessible from JS |
| `domain` | Optional `.citypetshop.bd` | Share between www and non-www |

---

## 4. Smoke Test Plan

### Prerequisites
- App running behind Nginx with HTTPS
- Admin user exists (e.g. `admin@citypetshop.bd`)

### Test 1: Login success
1. Open **https://citypetshop.bd/admin/login** (HTTPS required).
2. Enter valid admin email and password.
3. Submit.
4. **Pass:** Redirect to `/admin` dashboard.

### Test 2: Session persists
1. After logging in (Test 1), navigate to `/admin/orders` or `/admin/products`.
2. Refresh the page.
3. **Pass:** Still on admin page, no redirect to login.
4. Open a new tab, go to `https://citypetshop.bd/admin`.
5. **Pass:** Still authenticated.

### Test 3: Logout works
1. While logged in, click "Sign Out" (or visit `/admin/logout`).
2. **Pass:** Redirected to `/admin/login`.
3. Try to visit `https://citypetshop.bd/admin`.
4. **Pass:** Redirected to `/admin/login`.

### Test 4: Protected routes blocked without auth
1. In an incognito/private window, visit `https://citypetshop.bd/admin`.
2. **Pass:** Redirected to `/admin/login`.
3. Visit `https://citypetshop.bd/admin/orders`.
4. **Pass:** Redirected to `/admin/login`.
5. Call `GET https://citypetshop.bd/api/admin/dashboard` (no cookies).
6. **Pass:** 401 Unauthorized.

### Quick curl checks
```bash
# Health (no auth)
curl -s https://citypetshop.bd/api/health | jq .status
# "ok"

# Admin API without auth → 401
curl -s -o /dev/null -w "%{http_code}" https://citypetshop.bd/api/admin/dashboard
# 401
```

---

## 5. Troubleshooting

| Symptom | Check |
|---------|-------|
| Redirect to `/login` instead of `/admin` | Use `/admin/login` directly. Verify `NEXTAUTH_URL` matches the URL in the browser. |
| Session not persisting | Ensure `X-Forwarded-Proto: https`. Secure cookies are rejected over HTTP. |
| "Invalid email or password" (valid creds) | `pm2 logs cityplus` for `auth` scope errors. Check DB connectivity. |
| Cookie not sent on www | Set `COOKIE_DOMAIN=.citypetshop.bd` or redirect www → non-www. |
| 502 Bad Gateway | `pm2 status`, `pm2 logs cityplus`. App may have crashed. |
