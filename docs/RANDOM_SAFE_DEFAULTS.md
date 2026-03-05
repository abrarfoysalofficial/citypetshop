# Random Safe Defaults

**Version:** 1.0  
**Last Updated:** February 28, 2026  
**Purpose:** Safe placeholder values where random/placeholder is acceptable. Use for dev, demo, or fallbacks.

---

## 1. When to Use

- Development environment
- Demo mode
- Fallback when real config is missing
- Non-sensitive defaults

---

## 2. Safe Defaults (Copy-Paste Ready)

### 2.1 NEXTAUTH_SECRET (Dev Only)

```
dev-secret-change-in-production-min-32-chars
```

Generate production: `openssl rand -base64 32`

### 2.2 Site URL (Dev)

```
http://localhost:3000
```

### 2.3 Database (Local Dev)

```
postgresql://postgres:postgres@localhost:5432/citypluspetshop
```

### 2.4 Placeholder Images

- Product: `https://placehold.co/400x400?text=Product`
- Logo: `public/brand/logonobg.png` (ensure file exists)
- Category: `https://placehold.co/200x200?text=Category`

### 2.5 Default Colours (Tailwind)

| Token | Value | Use |
|-------|-------|-----|
| primary | `#0d6b2c` | Green (colour reference) |
| secondary | `#06b6d4` | Cyan |
| accent | `#f97316` | Orange |

### 2.6 Default Site Name

```
City Plus Pet Shop
```

### 2.7 Default Tagline

```
Your pet, our passion.
```

### 2.8 Default Contact (Placeholder)

| Field | Value |
|-------|-------|
| Phone | +880 1643-390045 |
| WhatsApp | wa.me/8801643390045 |
| Email | admin@citypetshop.bd |
| Address | Mirpur 2, Borobag, Dhaka, Bangladesh |

**Note:** Replace with real contact before production.

---

## 3. What NOT to Put Here

- Real API keys
- Real passwords
- Real payment credentials
- Real user emails (for auth)
- Production database URLs

See `MUST_REPLACE_SECRETS.md` for those.

---

## 4. Usage in Code

Example fallback:

```ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const secret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-production-min-32-chars";
```

**Warning:** Never use safe defaults for `NEXTAUTH_SECRET` in production.
