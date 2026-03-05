# Environment Variables Template

**Keys only. Set values in `.env` or `.env.production.local` (never commit).**

## Required

| Key | Description |
|-----|-------------|
| NODE_ENV | `production` for live |
| DATABASE_URL | PostgreSQL connection string |
| NEXTAUTH_SECRET | 32+ chars (openssl rand -hex 32) |
| NEXTAUTH_URL | Canonical URL (https://citypetshop.bd) |
| AUTH_TRUST_HOST | `true` behind reverse proxy |
| NEXT_PUBLIC_SITE_URL | Public site URL |
| APP_URL | App base URL |

## Admin Seed (db:seed)

| Key | Description |
|-----|-------------|
| ADMIN_EMAIL | Admin login email |
| ADMIN_PASSWORD | Initial admin password (change after first login) |

## Integrations

| Key | Description |
|-----|-------------|
| MASTER_SECRET | 32+ chars for encrypted credentials |
| RESEND_API_KEY | Email (order confirmation) |
| EMAIL_FROM | Sender email |
| BULK_SMS_BD_API_KEY | SMS provider (optional) |
| BULK_SMS_BD_SENDER_ID | SMS sender ID |

## Storage

| Key | Description |
|-----|-------------|
| UPLOAD_DIR | Absolute path for uploads |

## Optional

| Key | Description |
|-----|-------------|
| REDIS_URL | Rate limiting (in-memory fallback if unset) |
| COOKIE_DOMAIN | e.g. .citypetshop.bd for www+non-www |
| SENTRY_DSN | Error tracking |
| CSP_ALLOW_UNSAFE_EVAL | `true` only if needed for legacy scripts |
