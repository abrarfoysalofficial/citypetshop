/**
 * Admin API authorization - SUPABASE ONLY.
 * No demo/local fallback. Requires:
 * - Supabase Auth (signInWithPassword)
 * - User in team_members by email (case-insensitive)
 * - role='admin' OR is_admin=true
 */
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/config/env";

export type AdminAuthResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: 401; message: string }
  | { ok: false; status: 403; message: string }
  | { ok: false; status: 500; message: string };

/** No demo mode - always requires Supabase auth. */
export function isDemoAuth(_auth: AdminAuthResult): boolean {
  return false;
}

export async function requireAdminAuth(): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, status: 500, message: "Supabase not configured" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[admin-auth] getUser error:", userError.message);
      return { ok: false, status: 500, message: "Auth check failed" };
    }

    if (!user) {
      return { ok: false, status: 401, message: "Sign in required" };
    }

    const email = user.email?.toLowerCase();
    if (!email) {
      return { ok: false, status: 403, message: "Access denied. No email on account." };
    }

    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .select("role, is_active, is_admin")
      .ilike("email", email)
      .maybeSingle();

    if (memberError) {
      console.error("[admin-auth] team_members query error:", memberError.message);
      return { ok: false, status: 500, message: "Access check failed" };
    }

    if (!member) {
      return { ok: false, status: 403, message: "Access denied. You are not authorized to access the admin panel." };
    }

    if (!member.is_active) {
      return { ok: false, status: 403, message: "Access denied. Your account is inactive." };
    }

    const role = (member.role ?? "").toLowerCase();
    const isAdmin = role === "admin" || role === "adm" || (member as { is_admin?: boolean }).is_admin === true;
    if (!isAdmin) {
      return { ok: false, status: 403, message: "Access denied. Admin role required." };
    }

    return { ok: true, userId: user.id, email: user.email ?? "" };
  } catch (err) {
    console.error("[admin-auth] Unexpected error:", err);
    return { ok: false, status: 500, message: "Internal error" };
  }
}
