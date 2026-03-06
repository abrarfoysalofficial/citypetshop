# PR-10: Production Deployment Hardening & PR-10.5 Design System

**Status:** Complete  
**Date:** 2026-02-26

---

## PR-10: Deployment Hardening

### Summary

Deterministic, safe deployment with systemd → PM2 → Next.js standalone. Single canonical deploy script, rollback with DB restore option, PM2 ecosystem, and documentation alignment.

### File List

| File | Change |
|------|--------|
| `ecosystem.config.js` | New — PM2 config for standalone server.js, name cityplus |
| `deploy/deploy-production.sh` | Calls backup_postgres.sh, pm2 startOrReload, health gate, deploy marker |
| `deploy/rollback.sh` | Optional --restore-db, manual recovery instructions |
| `deploy/backup_postgres.sh` | Accepts output path, DATABASE_URL or sudo postgres |
| `deploy/restore_postgres.sh` | Accepts dump path, DATABASE_URL or sudo |
| `scripts/deploy-production.sh` | Delegates to deploy/deploy-production.sh |
| `docs/DEPLOY.md` | Runtime: systemd → PM2 → Next, exact deploy/rollback commands |
| `docs/OPS_RUNBOOKS.md` | Deploy/rollback table, no Docker |
| `app/api/health/route.ts` | Comment: load balancer / PM2 (not Docker) |
| `deploy/pm2.config.cjs` | Removed (replaced by ecosystem.config.js) |

### Exact Commands

| Action | Command |
|--------|---------|
| **Deploy** | `bash /var/www/cityplus/app/deploy/deploy-production.sh` |
| **Rollback (code only)** | `bash deploy/rollback.sh` |
| **Rollback (code + DB)** | `bash deploy/rollback.sh --restore-db` |

### Runtime

**systemd → pm2-cityplus.service → PM2 → Next.js standalone** (no Docker)

---

## PR-10.5: Design System Tokenization

### Summary

Replaced scattered HEX colors with stable tokens. Primary green, accent orange, page/card backgrounds, text colors.

### Palette (CSS Variables)

| Token | Value |
|-------|-------|
| Primary-900 | #13634F |
| Primary-700 | #1B7C63 |
| Primary-gradient | #58B084 → #318F6B |
| Accent-500 | #F39221 |
| Accent-300 | #FFB258 |
| Bg-page | #F8FAF9 |
| Bg-card | #FFFFFF |
| Text-primary | #2D3E39 |
| Text-secondary | #707A78 |

### File List

| File | Change |
|------|--------|
| `app/globals.css` | New tokens, aliases |
| `tailwind.config.ts` | primary-900/700, accent-500/300, bg-page, bg-card, primary-gradient |
| `components/home/Header.tsx` | bg-bg-card |
| `components/home/SearchStrip.tsx` | bg-primary-900/700 for search |
| `components/home/MainNavbar.tsx` | bg-accent, hover:bg-accent-300 |
| `components/home/HeroSlider.tsx` | primary-gradient, accent CTA |
| `components/HeroSection.tsx` | primary overlay, accent CTA |
| `components/Navbar.tsx` | bg-primary-900, accent |
| `components/Footer.tsx` | bg-primary-900 |
| `components/home/HomeFooter.tsx` | bg-primary-900 |
| `components/ProductCard.tsx` | Add to cart / Buy Now use accent |
| `components/FeaturedProducts.tsx` | primary-900 |
| `docs/DEPLOY.md` | Visual regression checklist |

### Visual Regression Checklist

See docs/DEPLOY.md §17.

---

## Verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run test:ci`
- [x] Deploy script: set -euo pipefail, backup, migrate, build, pm2 startOrReload, health gate
- [x] Rollback: optional DB restore, manual recovery instructions
