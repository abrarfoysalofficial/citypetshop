# Phase 5 — QA Gates

## TypeScript & ESLint

```bash
npm run typecheck
npm run lint
```

## Build

```bash
npm run build
```

## Playwright E2E (minimal)

```bash
npx playwright install
npx playwright test
```

### Test Scenarios

1. **Home → Product → Cart → Checkout → COD → Order complete**
2. **Admin login → Edit product → Save**
3. **Track order OTP flow** (mock: no real SMS)

See `e2e/` folder for test files.

## Go-Live Checklist

- [ ] DATABASE_URL set and migrations applied
- [ ] NEXTAUTH_SECRET set (32+ chars)
- [ ] ADMIN_PASSWORD changed from default
- [ ] SSL enabled
- [ ] /api/health returns OK
- [ ] Admin login works
- [ ] Checkout (COD) completes
- [ ] Track order works (or OTP disabled if not configured)
