/**
 * Auth service implementations: Supabase (real) and Demo (cookie-based).
 */
import type { AuthService, AuthSession } from "./types";
import { createClient } from "@/lib/supabase/client";

/** Supabase Auth: uses browser client. When env missing, client is stub (no crash). */
export function createSupabaseAuthService(): AuthService {
  const getSupabase = () => createClient();
  return {
    async signIn(email, password) {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password });
      return { error: error?.message };
    },
    async signOut() {
      await getSupabase().auth.signOut();
    },
    async signUp(email, password, options) {
      const { error } = await getSupabase().auth.signUp({
        email,
        password,
        options: options?.name ? { data: { name: options.name } } : undefined,
      });
      return { error: error?.message };
    },
    async otpSignIn(phone) {
      const { error } = await getSupabase().auth.signInWithOtp({ phone });
      return { error: error?.message };
    },
    async getSession(): Promise<AuthSession | null> {
      const { data } = await getSupabase().auth.getSession();
      const session = data?.session;
      const user = session?.user;
      if (!user) return null;
      return {
        user: {
          id: user.id,
          email: user.email ?? undefined,
          role: (user as { role?: string }).role,
        },
      };
    },
  };
}

/** Demo auth: cookie-based via /api/auth/demo-login and /api/auth/session. */
export function createDemoAuthService(): AuthService {
  return {
    async signIn(email, password) {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, type: "user" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: (data as { error?: string }).error ?? "Login failed" };
      return {};
    },
    async signOut() {
      if (typeof window !== "undefined") window.location.href = "/api/auth/demo-logout?next=/";
      else await fetch("/api/auth/demo-logout", { method: "GET" });
    },
    async signUp() {
      return { error: "Sign up is not available in demo mode. Use Supabase for registration." };
    },
    async otpSignIn() {
      return { error: "OTP login is not available in demo mode. Use Supabase for OTP." };
    },
    async getSession(): Promise<AuthSession | null> {
      const res = await fetch("/api/auth/session");
      const data = await res.json().catch(() => ({}));
      const session = (data as { session?: string; isLoggedIn?: boolean }).session;
      const isLoggedIn = (data as { isLoggedIn?: boolean }).isLoggedIn;
      if (!isLoggedIn || !session) return null;
      const role = session === "admin" ? "admin" : undefined;
      const id = typeof session === "object" && session !== null && "id" in session
        ? (session as { id: string }).id
        : "demo-user";
      const email = typeof session === "object" && session !== null && "email" in session
        ? (session as { email?: string }).email
        : undefined;
      return { user: { id, email, role } };
    },
  };
}
