# Vercel Deploy Fix – Dependency & Build

This doc explains what was changed to fix Vercel deployment and how to keep builds passing.

---

## What was changed and why

### 1. Dependency mismatch (next-sanity vs Next 14)

- **Problem:** `next-sanity@11.x` requires Next.js 15/16; the app uses **Next 14.2.18** (no major upgrade).
- **Fix:** Pinned **next-sanity@9.12.3** and **sanity@4.22.0** (and **@sanity/vision@4.22.0**) so they work with Next 14. `next-sanity@9` declares a peer on `sanity@3`, so we use **legacy-peer-deps** to allow `sanity@4` without breaking the install.

### 2. Install strategy

- **`.npmrc`** (committed): `legacy-peer-deps=true` so `npm install` succeeds on Vercel and locally.
- **`.nvmrc`**: Node **18** (or **20** if you set it) so local and CI use the same Node.
- **package.json** `engines`: `"node": ">=18 <21"` so Vercel and tooling use Node 18 or 20.

### 3. Sanity Studio and env safety

- Studio route is **`/studio`** (single optional catch-all `app/studio/[[...tool]]/page.tsx`). No Studio under `/admin` to avoid route conflicts.
- **sanity/env.ts** and **sanity/sanity.config.ts** use fallbacks instead of `assertValue()` so the build does not crash when `NEXT_PUBLIC_SANITY_*` are missing at build time.

### 4. Deterministic builds

- **package-lock.json** is committed and updated after any dependency change.
- Pinned versions (e.g. `next-sanity@9.12.3`, `sanity@4.22.0`) avoid drift; no new major upgrades were introduced.

### 5. Build memory (OOM)

- **package.json** `build` script sets `NODE_OPTIONS=--max-old-space-size=6144` (6GB) so `next build` has more heap while leaving RAM for Next.js worker processes. On Vercel the default memory is usually enough. If you see OOM on Vercel, set **Environment Variable** `NODE_OPTIONS=--max-old-space-size=4096`.

---

## Vercel project settings

Use these so Vercel deploys the latest commit and builds reliably.

| Setting | Value | Notes |
|--------|--------|--------|
| **Install Command** | `npm install` (default) | `.npmrc` already has `legacy-peer-deps=true`. Optionally set to `npm install --legacy-peer-deps` if you ever remove that from `.npmrc`. |
| **Build Command** | (default, i.e. `npm run build`) | Uses the script in package.json (with increased heap). |
| **Node.js Version** | **20.x** (recommended) or 18.x | In Vercel: **Settings → General → Node.js Version** → 20.x. Matches `engines` and `.nvmrc`. |
| **Redeploy without cache** | Use when fixing deploy issues | **Deployments** → … on latest deployment → **Redeploy** → check **Redeploy without using the build cache**. |

---

## Deploying the latest commit

If Vercel deployed an old commit (e.g. 8f70953):

1. Push the fix to your **main** (or production) branch:
   ```bash
   git add .
   git commit -m "chore: Vercel deploy fix - deps and build"
   git push origin main
   ```
2. In Vercel: **Deployments** → trigger a new deployment from the latest commit (or wait for auto-deploy).
3. If the build still fails or uses old code: **Redeploy** → enable **Redeploy without using the build cache**, then deploy.

---

## Local checks before pushing

Run these before pushing so Vercel build stays green:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

If `npm run build` hits an out-of-memory or "Jest worker" error locally (common on Windows with limited RAM), close other apps, or run the build on **Vercel** where Linux and build environment usually have enough memory. Local OOM does not mean the Vercel deploy will fail.

---

## Files changed (reference)

- **package.json** – next-sanity/sanity/@sanity/vision pinned; `engines`; build script with `NODE_OPTIONS`.
- **.npmrc** – `legacy-peer-deps=true`.
- **.nvmrc** – Node 18 (or 20 if you prefer).
- **package-lock.json** – regenerated and committed after dependency changes.
- **sanity/env.ts**, **sanity/sanity.config.ts** – build-safe env fallbacks.
- **app/studio/[[...tool]]/page.tsx** – single Studio route; duplicate `/admin` Studio route removed.
- **app/track-order/page.tsx** – escaped apostrophe for ESLint.

See **docs/BUILD_AND_DEPLOY_FIXES.md** for more detail on route and env changes.
