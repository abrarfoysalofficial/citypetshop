# Build and Deployment Fixes – Summary

All changes were made so the project **builds successfully on Vercel** and passes `npm install` and `npm run build` without removing features or downgrading Next.js.

---

## 1) Node version stability


| File             | Change                                    | Why                                                                   |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| **.nvmrc**       | Added with `18`                           | Pins Node to 18 for local and CI; Vercel can use 18 or 20.            |
| **package.json** | Added `"engines": { "node": ">=18 <21" }` | Ensures Node 18 or 20 (Vercel-compatible); avoids Node 21+ breakages. |


---

## 2) Sanity dependency alignment


| File             | Change                              | Why                                                                                                                                               |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **.npmrc**       | Already had `legacy-peer-deps=true` | Kept. Resolves peer conflict between `sanity@4` and `next-sanity@9` (next-sanity expects sanity@3). `npm install` succeeds on Vercel and locally. |
| **package.json** | No dependency version changes       | next-sanity@9 and sanity@4 kept; compatibility handled via `.npmrc`.                                                                              |


No duplicate or conflicting Sanity packages were removed; Studio remains embedded.

---

## 3) Vercel build compatibility


| File       | Change                       | Why                                                                                                                      |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **.npmrc** | Unchanged (legacy-peer-deps) | Vercel runs `npm install` in a Linux environment; this file is read and used. No Windows-only paths or logic were added. |


---

## 4) Sanity Studio safety


| File                                 | Change                                                                                                                                                      | Why                                                                                                                                                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **app/studio/[[...tool]]/page.tsx**  | Uses config from `sanity/sanity.config` (basePath `/studio`). Loads `NextStudio` via `next/dynamic` with `ssr: false`. Exports `dynamic = "force-dynamic"`. | Single Studio at `/studio` with basePath `/studio`. Avoids build-time load of `next-sanity/studio` (react-dom ESM/preloadModule issue). Studio works at runtime in the browser.                                 |
| **app/studio/[[...index]]/page.tsx** | **Deleted**                                                                                                                                                 | Next.js does not allow two optional catch-alls under the same path (`[[...index]]` and `[[...tool]]`). One catch-all `[[...tool]]` is enough for `/studio` and `/studio/*`.                                     |
| **app/admin/[[...tool]]/page.tsx**   | **Deleted**                                                                                                                                                 | Removed duplicate Studio under `/admin` to avoid route conflict with `/admin` (same specificity as optional catch-all). Studio is only at `/studio`; `/admin` stays for dashboard (orders, products, settings). |
| **sanity/sanity.config.ts**          | `basePath: "/studio"` unchanged. Env reads use fallbacks (see below).                                                                                       | Confirms Studio basePath is `/studio` and does not conflict with `/admin`.                                                                                                                                      |


---

## 5) Environment variable safety


| File                        | Change                                                    | Why                                                                                                                                          |
| --------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **sanity/env.ts**           | Replaced `assertValue()` with fallbacks: `projectId = env |                                                                                                                                              |
| **sanity/sanity.config.ts** | `projectId` and `dataset` use `?.trim()                   |                                                                                                                                              |
| **Existing code**           | No change                                                 | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DATA_SOURCE`, `NEXT_PUBLIC_AUTH_MODE` already have fallbacks in `src/config/runtime.ts` and where used. |


---

## 6) Build verification


| Check             | Result                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **npm install**   | Succeeds (with `.npmrc` and current dependencies).                                                                       |
| **npm run build** | Succeeds (110 static pages, studio dynamic).                                                                             |
| **ESLint**        | One error fixed: unescaped `'` in `app/track-order/page.tsx` (We'll → We&apos;ll). Remaining messages are warnings only. |


---

## 7) Other fixes


| File                         | Change                                       | Why                                                                                |
| ---------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| **app/track-order/page.tsx** | Escaped apostrophe in "We'll" → `We&apos;ll` | Satisfies `react/no-unescaped-entities` and avoids ESLint error failing the build. |


---

## Files changed (list)

1. **.nvmrc** – created
2. **package.json** – added `engines`, no dependency changes
3. **.npmrc** – comment updated only
4. **sanity/env.ts** – build-safe env fallbacks
5. **sanity/sanity.config.ts** – build-safe env fallbacks
6. **app/studio/[[...tool]]/page.tsx** – single Studio route, dynamic import, uses `sanity/sanity.config`
7. **app/studio/[[...index]]/page.tsx** – deleted (duplicate catch-all)
8. **app/admin/[[...tool]]/page.tsx** – deleted (route conflict; Studio only at `/studio`)
9. **app/track-order/page.tsx** – escaped apostrophe
10. **docs/BUILD_AND_DEPLOY_FIXES.md** – this file

---

## Confirmation

- **Build:** `npm install` and `npm run build` complete successfully.  
- **Features:** No routes or features removed except the duplicate Studio at `/admin`; Studio remains at `/studio`.  
- **Next.js:** Still 14.2.18; not downgraded.  
- **Production:** Safe to deploy on Vercel. Set env vars (e.g. `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DATA_SOURCE`, `NEXT_PUBLIC_AUTH_MODE`, and optional `NEXT_PUBLIC_SANITY_*` for Studio) in the Vercel project settings.

