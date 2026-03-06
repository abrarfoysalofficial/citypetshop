/**
 * Admin API authorization – NextAuth with Prisma.
 * Uses RBAC for granular permissions.
 */
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import type { AdminAuthResult } from "./admin-auth-types";

export type { AdminAuthResult };

export async function requireAdminAuth(): Promise<AdminAuthResult> {
  try {
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
