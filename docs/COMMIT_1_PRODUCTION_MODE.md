# Commit 1: Production Mode

## Files Changed

| File | Why |
|------|-----|
| `src/config/runtime.ts` | Default `AUTH_MODE` and `DATA_SOURCE` to `supabase` when `NODE_ENV=production`; added `IS_DEMO_MODE` |
| `middleware.ts` | Same production default for `AUTH_MODE` |
| `app/login/page.tsx` | Hide demo credentials hint when `NODE_ENV=production`; improved Supabase-mode error message |
| `app/admin/login/page.tsx` | Same as login |
| `app/api/auth/demo-login/route.ts` | Return 404 when `AUTH_MODE !== "demo"` so demo route is disabled in production |
| `app/admin/orders/page.tsx` | Remove "demo" wording from empty state |

## Behavior

- **Development**: `AUTH_MODE=demo`, `DATA_SOURCE=local` by default
- **Production**: `AUTH_MODE=supabase`, `DATA_SOURCE=supabase` by default
- **Override**: Set `NEXT_PUBLIC_AUTH_MODE=demo` or `NEXT_PUBLIC_DATA_SOURCE=local` to use demo/local
- **Demo hints**: Shown only when `AUTH_MODE=demo` AND `NODE_ENV !== "production"`
- **Demo-login API**: Returns 404 when not in demo mode

## Next (Commit 2)

- Implement Supabase Auth (Google, Facebook, Phone OTP)
- Add Supabase session verification in middleware when `AUTH_MODE=supabase` and Supabase URL is set
