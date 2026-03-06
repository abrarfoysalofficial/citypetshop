/**
 * Auth service: NextAuth (Prisma/PostgreSQL) only.
 */
import type { AuthService, AuthSession } from "./types";

/** NextAuth-backed auth service. Uses credentials provider. */
export function createNextAuthAuthService(): AuthService {
  return {
    async signIn(email, password) {
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = (await csrfRes.json()) as { csrfToken?: string };
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csrfToken: csrfToken ?? "",
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
          json: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!res.ok || data?.error) {
        return { error: data?.error ?? "Login failed" };
      }
      return {};
    },
    async signOut() {
      if (typeof window !== "undefined") {
        window.location.href = "/api/auth/signout?callbackUrl=/";
      } else {
        await fetch("/api/auth/signout", { method: "GET" });
      }
    },
    async signUp() {
      return { error: "Sign up is not available. Use the registration flow." };
    },
    async otpSignIn() {
      return { error: "OTP login is not available." };
    },
    async getSession(): Promise<AuthSession | null> {
      const res = await fetch("/api/auth/session");
      const data = (await res.json().catch(() => ({}))) as { user?: { id?: string; email?: string }; expires?: string };
      const user = data?.user;
      if (!user) return null;
      const role = (user as { role?: string }).role;
      return {
        user: {
          id: user.id ?? "",
          email: user.email,
          role: role === "admin" || role === "adm" || role === "super_admin" ? "admin" : undefined,
        },
      };
    },
  };
}
