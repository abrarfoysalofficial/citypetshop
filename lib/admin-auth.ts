/**
 * Admin API authorization - Prisma (NextAuth) or demo (cookie) only.
 * Uses RBAC for granular permissions.
 */
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { AUTH_MODE } from "@/src/config/runtime";
import { hasPermission } from "@/lib/rbac";
import type { AdminAuthResult } from "./admin-auth-types";

export type { AdminAuthResult };

export function isDemoAuth(auth: AdminAuthResult): boolean {
  return auth.ok && (auth as { _demo?: boolean })._demo === true;
}

export async function requireAdminAuth(): Promise<AdminAuthResult> {
  try {
    // Demo mode: check demo_session cookie (dev only)
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

    // Prisma mode: NextAuth credentials
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return { ok: false, status: 401, message: "Sign in required" };
    }
    const userId = (user as { id?: string }).id ?? "";
    if (!userId) {
      return { ok: false, status: 401, message: "Invalid user session" };
    }

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
