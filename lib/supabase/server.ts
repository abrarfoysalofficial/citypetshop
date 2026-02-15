import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Stub – local preview without Supabase */
async function createStubClient() {
  const noData = { data: null, error: { message: "Supabase not connected" } };
  const emptyList = { data: [] as unknown[], error: null };
  return {
    from(_table: string) {
      return {
        select(_cols?: string) {
          return {
            eq(_key: string, _val: unknown) {
              return { single: () => Promise.resolve(noData) };
            },
            then: (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
              Promise.resolve(emptyList).then(resolve as (v: unknown) => unknown),
            catch: (reject: (e: unknown) => unknown) => Promise.resolve(emptyList).catch(reject),
          };
        },
      };
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  };
}

/** Returns real Supabase server client when env is set, otherwise stub. */
export async function createClient() {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const cookieStore = await cookies();
    return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from Server Component – middleware refreshes session
          }
        },
      },
    });
  }
  return createStubClient() as unknown as Awaited<ReturnType<typeof createServerClient>>;
}

/**
 * Anon client for public/storefront data (no cookies).
 * Use for cached fetches (unstable_cache) - avoids "cookies inside cache" error.
 * Public RLS policies allow reads without auth.
 */
export function createAnonClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return createStubClient() as unknown as ReturnType<typeof createSupabaseClient>;
  }
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Service-role client for admin operations (bypasses RLS).
 * Use ONLY after requireAdminAuth has validated the user.
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 */
export function createServiceRoleClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for admin storage");
  }
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}
