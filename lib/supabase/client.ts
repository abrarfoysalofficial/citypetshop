"use client";

import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Stub – local preview works without Supabase; returns empty/safe data */
function createStubClient() {
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
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
      signInWithOtp: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
      verifyOtp: () => Promise.resolve({ data: null, error: { message: "Supabase not connected" } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
}

/** Returns real Supabase client when env is set, otherwise stub for local preview. */
export function createClient() {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return createStubClient() as unknown as ReturnType<typeof createBrowserClient>;
}
