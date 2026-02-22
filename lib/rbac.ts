/**
 * Role-Based Access Control (RBAC) system for admin operations.
 * Checks user permissions against required actions on resources.
 */
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface Permission {
  resource: string;
  action: string;
}

export interface UserPermissions {
  userId: string;
  roles: string[];
  permissions: Permission[];
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true }
          }
        }
      }
    }
  });

  const roles = userRoles.map(ur => ur.role.name);
  const permissions: Permission[] = [];

  for (const userRole of userRoles) {
    for (const rolePermission of userRole.role.permissions) {
      permissions.push({
        resource: rolePermission.permission.resource,
        action: rolePermission.permission.action
      });
    }
  }

  return {
    userId,
    roles,
    permissions
  };
}

/**
 * Check if user has permission for a specific action on a resource.
 * Supports both (userId, "admin.view") and (userId, "admin", "view") formats.
 */
export async function hasPermission(userId: string, resourceOrPerm: string, action?: string): Promise<boolean> {
  let resource: string;
  let act: string;
  if (action !== undefined) {
    resource = resourceOrPerm;
    act = action;
  } else {
    const parts = resourceOrPerm.split(".");
    resource = parts[0] ?? resourceOrPerm;
    act = parts[1] ?? "view";
  }
  const userPermissions = await getUserPermissions(userId);
  return userPermissions.permissions.some(p =>
    p.resource === resource && p.action === act
  );
}

/**
 * Check if user has any of the required permissions
 */
export async function hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return permissions.some(required =>
    userPermissions.permissions.some(userPerm =>
      userPerm.resource === required.resource && userPerm.action === required.action
    )
  );
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return userPermissions.roles.includes(roleName);
}

/**
 * Require authentication and permission check
 */
export async function requirePermission(resource: string, action: string) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    throw new Error("Authentication required");
  }

  const hasPerm = await hasPermission(userId, resource, action);
  if (!hasPerm) {
    throw new Error(`Permission denied: ${action} on ${resource}`);
  }

  return session!.user;
}

/**
 * Require authentication and any of the permissions
 */
export async function requireAnyPermission(permissions: Permission[]) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    throw new Error("Authentication required");
  }

  const hasPerm = await hasAnyPermission(userId, permissions);
  if (!hasPerm) {
    const permStrings = permissions.map(p => `${p.action}:${p.resource}`);
    throw new Error(`Permission denied: requires one of ${permStrings.join(', ')}`);
  }

  return session!.user;
}

function getIpFromHeaders(headers: Headers): string | null {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? headers.get("x-real-ip")
    ?? null;
}

/**
 * Log admin action to audit log.
 * Pass requestOrMeta to capture ip/userAgent from request headers.
 */
export async function logAdminAction(
  userId: string,
  action: "create" | "update" | "delete",
  resource: string,
  resourceId: string,
  oldValues?: unknown,
  newValues?: unknown,
  requestOrMeta?: { headers?: Headers } | { ip?: string; userAgent?: string }
) {
  try {
    let ip: string | null = null;
    let userAgent: string | null = null;
    if (requestOrMeta) {
      if ("headers" in requestOrMeta && requestOrMeta.headers) {
        ip = getIpFromHeaders(requestOrMeta.headers);
        userAgent = requestOrMeta.headers.get("user-agent");
      } else if ("ip" in requestOrMeta || "userAgent" in requestOrMeta) {
        ip = (requestOrMeta as { ip?: string }).ip ?? null;
        userAgent = (requestOrMeta as { userAgent?: string }).userAgent ?? null;
      }
    }
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : undefined,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : undefined,
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // Don't throw - audit logging failure shouldn't break the operation
  }
}