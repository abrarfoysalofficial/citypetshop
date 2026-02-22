/**
 * NextAuth v4 configuration - self-hosted credentials auth.
 * Used when Supabase is not configured (fallback in admin-auth).
 */
import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { getAuthBaseUrl } from "@/lib/site-url";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const valid = await compare(credentials.password as string, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const authBase = getAuthBaseUrl();
      if (url.startsWith("/")) return `${authBase}${url}`;
      try {
        const u = new URL(url);
        if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return `${authBase}/admin`;
        if (u.origin === authBase) return url;
      } catch {
        return `${authBase}/admin`;
      }
      return `${authBase}/admin`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/** Get session (for admin-auth fallback when Supabase not configured). */
export async function auth() {
  return getServerSession(authOptions);
}

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
};
