/**
 * Admin API authorization helper.
 * - Demo mode: no auth required (returns { demo: true })
 * - Supabase mode: requires logged-in user in team_members with admin role
 */
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, getResolvedAuthSource } from "@/src/config/env";

export type AdminAuthResult =
  | { ok: true; demo: true }
  | { ok: true; userId: string; email: string }
  | { ok: false; status: 401; message: string }
  | { ok: false; status: 403; message: string }
  | { ok: false; status: 500; message: string };

/** True when auth passed in demo mode (no Supabase required). */
export function isDemoAuth(auth: AdminAuthResult): boolean {
  return auth.ok && "demo" in auth;
}

export async function requireAdminAuth(): Promise<AdminAuthResult> {
  const authSource = getResolvedAuthSource();
  const configured = isSupabaseConfigured();

  // Demo mode or Supabase not configured: allow without auth
  if (authSource === "demo" || !configured) {
    if (process.env.NODE_ENV === "development") {
      console.log("[admin-auth] Demo mode or Supabase not configured, allowing access");
    }
    return { ok: true, demo: true };
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
      .select("role, is_active")
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
    if (role !== "admin" && role !== "adm") {
      return { ok: false, status: 403, message: "Access denied. Admin role required." };
    }

    return { ok: true, userId: user.id, email: user.email ?? "" };
  } catch (err) {
    console.error("[admin-auth] Unexpected error:", err);
    return { ok: false, status: 500, message: "Internal error" };
  }
}
