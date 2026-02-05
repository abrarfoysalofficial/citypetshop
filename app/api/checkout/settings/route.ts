import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET: Delivery charges, policy URLs. Falls back to defaults when Supabase not connected. */
export async function GET() {
  const defaults = {
    deliveryInsideDhaka: 70,
    deliveryOutsideDhaka: 130,
    termsUrl: "/terms",
    privacyUrl: "/privacy",
  };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(defaults);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("delivery_inside_dhaka, delivery_outside_dhaka, terms_url, privacy_url")
    .eq("id", "default")
    .single();
  const row = data as { delivery_inside_dhaka?: number; delivery_outside_dhaka?: number; terms_url?: string; privacy_url?: string } | null;
  return NextResponse.json({
    deliveryInsideDhaka: row?.delivery_inside_dhaka ?? defaults.deliveryInsideDhaka,
    deliveryOutsideDhaka: row?.delivery_outside_dhaka ?? defaults.deliveryOutsideDhaka,
    termsUrl: row?.terms_url || defaults.termsUrl,
    privacyUrl: row?.privacy_url || defaults.privacyUrl,
  });
}
