# SECURITY CHECKLIST — Multi-Client VPS (CyberPanel)
> City Plus Pet Shop + Multi-tenant safe layout

---

## CRITICAL (Must complete before go-live)

- [ ] **NEXTAUTH_SECRET** — generated with `openssl rand -hex 32`, NOT a simple string
- [ ] **DATABASE_URL password** — minimum 24-char random string
- [ ] **PostgreSQL** — not accessible externally (only localhost:5432)
  - `sudo -u postgres psql -c "SHOW port;"` → should be 5432
  - Check `pg_hba.conf`: only `local` and `127.0.0.1/32` allowed
- [ ] **Environment file permissions** — `chmod 600 .env.production.local`
- [ ] **Uploads directory** — not world-readable: `chmod 750 /var/www/cityplus/uploads`
- [ ] **Admin credentials** — changed from defaults; admin@cityplus.local password updated
- [ ] **SSLCOMMERZ credentials** — real production keys, `SSLCOMMERZ_IS_LIVE=true`
- [ ] **Rate limiting** — verify `/api/checkout/order` is rate-limited (5 per IP)
- [ ] **CORS** — Next.js does not expose admin API to external origins by default
- [ ] **HTTP → HTTPS** redirect enabled in Cloudflare (Always HTTPS: On)

---

## SERVER HARDENING

```bash
# SSH: disable password auth, use key only
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Firewall (UFW)
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw deny 3000        # Block direct app port from outside
sudo ufw enable

# Fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# PostgreSQL: bind to localhost only
# Edit /etc/postgresql/14/main/postgresql.conf:
# listen_addresses = 'localhost'
```

---

## MULTI-TENANT ISOLATION (4–5 Client Sites)

| Rule | Implementation |
|------|---------------|
| Separate system user per client | `useradd -m -s /bin/bash client1` |
| Separate PostgreSQL role per client | `CREATE USER client1_app ...` |
| Separate database per client | `CREATE DATABASE client1_db ...` |
| Separate PM2 app name + port | `name: "client1"`, `PORT: 3000`; `PORT: 3002` etc. |
| No cross-DB access | Each role only has GRANT on own DB |
| Separate NEXTAUTH_SECRET per site | Never share secrets |
| Separate upload directory per site | `/var/www/client1/uploads/` |
| OLS vHost isolation | Each site gets own vHost in CyberPanel |

**Port Allocation (example)**:
- City Plus Pet Shop → Port 3000
- Client 2 → Port 3002
- Client 3 → Port 3003

---

## APPLICATION SECURITY

- [ ] **Admin login** — brute-force protection via rate-limit middleware
- [ ] **Fraud engine** — configured and active (`FraudPolicy` seeded)
- [ ] **RBAC** — admin users have roles assigned; no default superuser except `admin` role
- [ ] **Audit logs** — `AuditLog` model captures all admin mutations
- [ ] **Voucher anti-abuse** — usage count validated before applying
- [ ] **Payment IPN** — SSLCommerz webhook validates via `val_id` before marking paid
- [ ] **OTP** — expires in 10 minutes; single-use (deleted after verify)
- [ ] **Content Security Policy** — add via Next.js headers in `next.config.js`

### Recommended CSP Header (add to next.config.js):
```javascript
async headers() {
  return [{
    source: '/(.*)',
    headers: [{
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';"
    }, {
      key: 'X-Frame-Options',
      value: 'DENY'
    }, {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    }, {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    }]
  }];
}
```

---

## BACKUP VERIFICATION

- [ ] **Daily DB backup** running via cron
- [ ] **Backup restore tested** — restore to test DB works
- [ ] **Backup files in separate location** (not same disk as app)
- [ ] **Backup retention** — 30 days minimum

---

## ONGOING MONITORING

- [ ] PM2 monitoring enabled: `pm2 monit`
- [ ] Uptime check configured (UptimeRobot / Better Uptime)
- [ ] Error alerting (PM2 error log monitored)
- [ ] Monthly: `npm audit` to check for dependency vulnerabilities
- [ ] Monthly: rotate NEXTAUTH_SECRET (requires all users to re-login)
