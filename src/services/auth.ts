/**
 * Auth service: Clerk-backed identity with local Prisma session facade.
 */
import type { AuthService, AuthSession } from "./types";

export function createClerkAuthService(): AuthService {
  return {
    async signIn() {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
        return {};
      }
      return { error: "Use /login route for Clerk sign-in." };
    },
    async signOut() {
      if (typeof window !== "undefined") {
        window.location.href = "/logout";
      } else {
        await fetch("/logout", { method: "GET" });
      }
    },
    async signUp(_email, _password) {
      if (typeof window !== "undefined") {
        window.location.href = "/sign-up";
        return {};
      }
      return { error: "Use /sign-up route for Clerk registration." };
    },
    async otpSignIn() {
      return { error: "OTP login is not available." };
    },
    async getSession(): Promise<AuthSession | null> {
      const res = await fetch("/api/auth/session");
      const data = (await res.json().catch(() => ({}))) as { session?: { id?: string; email?: string; role?: string } };
      const user = data?.session;
      if (!user) return null;
      return {
        user: {
          id: user.id ?? "",
          email: user.email,
          role: user.role,
        },
      };
    },
  };
}
