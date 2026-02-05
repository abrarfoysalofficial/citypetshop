# Commit 2: Auth Upgrades (Google / Facebook / Phone OTP)

## Summary

Implement Supabase Auth providers (Google OAuth, Facebook OAuth, Phone OTP for Bangladesh) with Admin-configurable toggles, real Supabase client, middleware session refresh, and login UI with provider buttons.

## Files Changed

| File | Why |
|------|-----|
| `supabase/migrations/004_auth_providers.sql` | Add `auth_providers` JSONB column to `site_settings` |
| `lib/schema.ts` | Add `AuthProvidersConfig` and `auth_providers` to `SiteSettingsRow` |
| `context/SiteSettingsContext.tsx` | Add `auth_providers: null` to `DEFAULT_SETTINGS` |
| `lib/supabase/client.ts` | Use real `createBrowserClient` when env set, else stub |
| `lib/supabase/server.ts` | Use real `createServerClient` with cookies when env set, else stub |
| `lib/supabase/middleware.ts` | New: create Supabase client for middleware (cookie refresh) |
| `app/auth/callback/route.ts` | New: OAuth callback – exchange code for session |
| `app/api/auth/providers/route.ts` | New: return enabled providers (env or `site_settings.auth_providers`) |
| `app/api/auth/session/route.ts` | Use Supabase `getUser()` when `AUTH_MODE=supabase` |
| `app/login/page.tsx` | Wrap in `Suspense` for `useSearchParams` |
| `app/login/LoginForm.tsx` | New: login form with Google/Facebook/Phone OTP buttons |
| `lib/phone-bd.ts` | New: BD phone validation and normalization |
| `app/admin/settings/page.tsx` | Add Auth Providers section in Integrations tab |
| `middleware.ts` | Supabase session refresh, protect `/admin` and `/account` when `AUTH_MODE=supabase` |
| `.env.local.example` | Document `NEXT_PUBLIC_AUTH_GOOGLE`, `_FACEBOOK`, `_PHONE` |

## Behavior

- **Demo mode** (`AUTH_MODE=demo`): unchanged; demo credentials and `demo_session` cookie.
- **Supabase mode** (`AUTH_MODE=supabase`): login page shows Google, Facebook, Phone OTP based on toggles; OAuth redirects to `/auth/callback`; middleware refreshes Supabase session and protects routes.
- **Phone OTP**: BD format validation (01XXXXXXXXX); 60s resend throttle; `signInWithOtp` → `verifyOtp`.
- **Admin**: Auth provider toggles in Admin → Settings → Integrations (UI only until Supabase persists `site_settings.auth_providers`).

## Env Variables

- `NEXT_PUBLIC_AUTH_GOOGLE` = `true` | `false`
- `NEXT_PUBLIC_AUTH_FACEBOOK` = `true` | `false`
- `NEXT_PUBLIC_AUTH_PHONE` = `true` | `false`

## Supabase Configuration

Configure Google and Facebook OAuth in Supabase Dashboard → Authentication → Providers. For Phone OTP, configure Twilio in Supabase Auth → Phone. Set Site URL and Redirect URLs (e.g. `https://yoursite.com/auth/callback`).
