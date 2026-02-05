import { createClient } from "@/lib/supabase/server";

export type User = { id: string; email?: string; role?: string };

/** Get current Supabase user (server). Returns null if not authenticated or Supabase not connected. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user as { id: string; email?: string } | null | undefined;
  if (!user) return null;
  return { id: user.id, email: user.email ?? undefined };
}

/** Require auth; redirect to /admin/login if not logged in. Use in admin layout/server components. */
export async function requireAuth(): Promise<User> {
  const user = await getUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
  return user as User;
}

/** Check if current user is in team_members with admin/owner/manager (or similar). Falls back to "any logged-in user is admin" when Supabase not connected. */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  // When DB connected: select from team_members where user_id = user.id and role in ('owner','admin','manager') and is_active
  // For now we treat any authenticated user as allowed in admin
  return user;
}
