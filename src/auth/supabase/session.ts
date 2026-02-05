/**
 * Supabase auth placeholder. Only active when AUTH_MODE=supabase.
 * Do not import Supabase client in client components when AUTH_MODE=demo.
 */
import { AUTH_MODE } from "@/src/config/runtime";

export type SessionUser = { id: string; email?: string; role?: string } | null;

export async function getSession(): Promise<{ user: SessionUser } | null> {
  if (AUTH_MODE !== "supabase") return null;
  // When AUTH_MODE=supabase: use Supabase server client to get session
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user as { id: string; email?: string } | null | undefined;
  if (!user) return null;
  return { user: { id: user.id, email: user.email ?? undefined } };
}
