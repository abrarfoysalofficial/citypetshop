/**
 * Admin API authorization - supports demo (cookie) and Supabase auth.
 * When NEXTAUTH_SECRET is set, also supports Auth.js credentials.
 * Now uses RBAC (Role-Based Access Control) for granular permissions.
 */
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AUTH_MODE } from "@/src/config/runtime";
import { isSupabaseConfigured } from "@/src/config/env";
import { getUserPermissions, hasPermission } from "@/lib/rbac";
import type { AdminAuthResult } from "./admin-auth-types";

export type { AdminAuthResult };

export function isDemoAuth(auth: AdminAuthResult): boolean {
  return auth.ok && (auth as { _demo?: boolean })._demo === true;
}

export async function requireAdminAuth(): Promise<AdminAuthResult> {
  try {
    // Prisma mode: NextAuth credentials only
    if (AUTH_MODE === "prisma") {
      const session = await auth();
      const user = session?.user;
      if (!user) {
        return { ok: false, status: 401, message: "Sign in required" };
      }
      const userId = (user as { id?: string }).id ?? "";
      if (!userId) {
        return { ok: false, status: 401, message: "Invalid user session" };
      }

      // Check if user has admin panel access permission
      const hasAdminAccess = await hasPermission(userId, "admin.view");
      if (!hasAdminAccess) {
        return { ok: false, status: 403, message: "Access denied. Admin access required." };
      }

      return {
        ok: true,
        userId,
        email: user.email ?? "",
      };
    }

    // Demo mode: check demo_session cookie
    if (AUTH_MODE === "demo") {
      const cookieStore = await cookies();
      const session = cookieStore.get("demo_session")?.value;
      if (session === "admin") {
        return {
          ok: true,
          userId: "demo-admin",
          email: "admin@cityplus.local",
          _demo: true,
        } as AdminAuthResult & { _demo?: boolean };
      }
      return { ok: false, status: 401, message: "Sign in required" };
    }

    // Supabase mode: use Supabase auth
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          ok: true,
          userId: user.id,
          email: user.email ?? "",
        };
      }
      return { ok: false, status: 401, message: "Sign in required" };
    }

    // Fallback: Auth.js (self-hosted credentials when Supabase not configured)
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { ok: false, status: 401, message: "Sign in required" };
    }
    const userId = (user as { id?: string }).id ?? "";
    if (!userId) {
      return { ok: false, status: 401, message: "Invalid user session" };
    }

    // Check if user has admin panel access permission
    const hasAdminAccess = await hasPermission(userId, "admin.view");
    if (!hasAdminAccess) {
      return { ok: false, status: 403, message: "Access denied. Admin access required." };
    }

    return {
      ok: true,
      userId,
      email: user.email ?? "",
    };
  } catch {
    return { ok: false, status: 500, message: "Authentication error" };
  }
}

export async function requirePermission(userId: string, permission: string): Promise<{ ok: boolean; status?: number; message?: string }> {
  const hasPerm = await hasPermission(userId, permission);
  if (!hasPerm) {
    return { ok: false, status: 403, message: `Access denied. Permission '${permission}' required.` };
  }
  return { ok: true };
}

export async function requireAdminAuthAndPermission(permission: string): Promise<AdminAuthResult> {
  const authResult = await requireAdminAuth();
  if (!authResult.ok) {
    return authResult;
  }

  const permResult = await requirePermission(authResult.userId, permission);
  if (!permResult.ok) {
    return { ok: false, status: (permResult.status ?? 403) as 401 | 403 | 500, message: permResult.message ?? "Access denied" };
  }

  return authResult;
}
