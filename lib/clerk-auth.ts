import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getDefaultTenantId } from "@/lib/tenant";

export type LocalClerkUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  clerkUserId: string;
};

function deriveDisplayName(user: Awaited<ReturnType<typeof currentUser>>): string | null {
  if (!user) return null;
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (fullName) return fullName;
  if (user.username?.trim()) return user.username.trim();
  return null;
}

function derivePrimaryEmail(user: Awaited<ReturnType<typeof currentUser>>): string | null {
  if (!user) return null;
  const primary = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
  const candidate = primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  return candidate?.trim().toLowerCase() ?? null;
}

/**
 * Sync Clerk identity into local Prisma user table.
 * Role + RBAC stay in local DB and are never downgraded during sync.
 */
export async function syncClerkUserToLocalUser(): Promise<LocalClerkUser | null> {
  const { userId } = await clerkAuth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email = derivePrimaryEmail(clerkUser);
  if (!email) return null;

  const name = deriveDisplayName(clerkUser);
  const tenantId = getDefaultTenantId();

  const local = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      role: "user",
      tenantId,
      // Credentials login is deprecated after Clerk migration.
      // Keep a deterministic non-empty value for legacy schema compatibility.
      passwordHash: `clerk:${userId}`,
    },
    update: {
      // Never mutate role automatically; role remains admin-managed.
      name: name ?? undefined,
      tenantId: tenantId ?? undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return {
    ...local,
    clerkUserId: userId,
  };
}

