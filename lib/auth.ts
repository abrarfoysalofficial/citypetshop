/**
 * Clerk-backed auth facade.
 * Keeps a stable `auth()` API for existing business logic while migrating provider.
 */
import { syncClerkUserToLocalUser } from "@lib/clerk-auth";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
  clerkUserId?: string;
};

export type AppSession = {
  user: SessionUser;
} | null;

/**
 * Returns a local app session derived from Clerk identity.
 * Source of truth for roles/permissions remains Prisma.
 */
export async function auth(): Promise<AppSession> {
  const localUser = await syncClerkUserToLocalUser();
  if (!localUser) return null;
  return {
    user: {
      id: localUser.id,
      email: localUser.email,
      name: localUser.name,
      role: localUser.role,
      clerkUserId: localUser.clerkUserId,
    },
  };
}
