# Deployment Report — City Plus Pet Shop

**Date:** _______________  
**Deployed by:** _______________

---

## Summary

| Item | Value |
|------|-------|
| Commit hash | `git rev-parse --short HEAD` |
| Migration status | Applied / Skipped / Failed |
| PM2 status | Running / Stopped |
| Health check | OK / Failed |

---

## Pre-deploy (Phase A)

- [ ] whoami, pwd, ls confirmed
- [ ] df -h, free -h OK
- [ ] node -v, npm -v OK
- [ ] pm2 status OK

---

## Backup (Phase B)

- [ ] DB backup: `/backups/cityplus/cityplus_db_YYYYMMDD_HHMMSS.dump`
- [ ] App backup: `/var/www/cityplus/releases/app_backup_YYYYMMDD_HHMMSS.tgz`

---

## Build + Migrate (Phases C–E)

- [ ] git pull OK
- [ ] npm ci OK
- [ ] npm run build OK
- [ ] Standalone assets copied
- [ ] prisma generate OK
- [ ] prisma migrate deploy OK

---

## Restart (Phase F)

- [ ] pm2 restart cityplus OK
- [ ] pm2 save OK
- [ ] Port 3000 listening
- [ ] curl http://127.0.0.1:3000/api/health → 200
- [ ] systemctl restart lsws OK

---

## End-to-end (Phase G)

- [ ] curl -I https://citypetshop.bd/ → 200
- [ ] curl -I https://citypetshop.bd/admin → 302 (redirect to login) or 200
- [ ] curl -I https://citypetshop.bd/admin/login → 200
- [ ] No Location header points to localhost

---

## Notes

_Add any issues encountered and fixes applied._
