# Phase 8 — Settings + Ops Hardening

**Date:** 2026-02-22  
**Status:** Complete

---

## 1. What Changed

### Menu Settings
- **/admin/menus** — wire to SiteSettings.navbarLinks, footerLinks. Add/edit/remove links.

### Contact Settings
- Already in /admin/settings (phone, email, address)

### IP Restrictions
- Already in /admin/fraud. Block/unblock IPs.

### Ops Runbooks
- **docs/OPS_RUNBOOKS.md** — Backups, Migration, Rate limiting, Monitoring checklist

---

## 2. UI Routes

| Path | Purpose |
|------|---------|
| /admin/settings | Website + Contact |
| /admin/menus | Menu settings |
| /admin/fraud | IP restrictions |
| /admin/shipping | Shipping |
| /admin/global-ai | Global AI |

---

## 3. Verification

1. Visit /admin/menus — add navbar link, save
2. Visit /admin/fraud — block IP
3. Review docs/OPS_RUNBOOKS.md
