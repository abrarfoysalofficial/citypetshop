import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AuthProvidersConfig } from "@/lib/schema";

const AUTH_MODE =
  (process.env.NEXT_PUBLIC_AUTH_MODE as "demo" | "supabase") ??
  (process.env.NODE_ENV === "production" ? "supabase" : "demo");

/** Returns enabled auth providers. Env overrides: NEXT_PUBLIC_AUTH_GOOGLE, NEXT_PUBLIC_AUTH_FACEBOOK, NEXT_PUBLIC_AUTH_PHONE */
export async function GET() {
  if (AUTH_MODE !== "supabase") {
    return NextResponse.json({ google: false, facebook: false, phone: false });
  }

  // Env overrides (for quick toggle without DB)
  const g = process.env.NEXT_PUBLIC_AUTH_GOOGLE;
  const f = process.env.NEXT_PUBLIC_AUTH_FACEBOOK;
  const p = process.env.NEXT_PUBLIC_AUTH_PHONE;
  if (g !== undefined || f !== undefined || p !== undefined) {
    return NextResponse.json({
      google: g === "true",
      facebook: f === "true",
      phone: p === "true",
    });
  }

  // Read from site_settings.auth_providers when Supabase connected
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("auth_providers")
      .eq("id", "default")
      .single();

    const ap = (data as { auth_providers?: AuthProvidersConfig } | null)?.auth_providers;
    if (ap && typeof ap === "object") {
      return NextResponse.json({
        google: !!ap.google,
        facebook: !!ap.facebook,
        phone: !!ap.phone,
      });
    }
  } catch {
    // Fall through to defaults
  }

  return NextResponse.json({
    google: true,
    facebook: true,
    phone: true,
  });
}
