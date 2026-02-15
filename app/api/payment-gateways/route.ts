import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/config/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/payment-gateways
 * Fetch only ACTIVE payment gateways (public route for checkout page)
 * Returns: { gateway, display_name_en, display_name_bn }
 */
export async function GET() {
  // If backend unavailable, return COD only
  if (!isSupabaseConfigured()) {
    return NextResponse.json([
      { gateway: "cod", display_name_en: "Cash on Delivery", display_name_bn: null }
    ]);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_gateways")
      .select("gateway, display_name_en, display_name_bn")
      .eq("is_active", true)
      .order("gateway", { ascending: true });

    if (error) {
      console.error("Failed to fetch active payment gateways:", error);
      // Fallback to COD
      return NextResponse.json([
        { gateway: "cod", display_name_en: "Cash on Delivery", display_name_bn: null }
      ]);
    }

    // If no active gateways, return COD as fallback
    if (!data || data.length === 0) {
      return NextResponse.json([
        { gateway: "cod", display_name_en: "Cash on Delivery", display_name_bn: null }
      ]);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("payment_gateways public GET error:", err);
    // Fallback to COD
    return NextResponse.json([
      { gateway: "cod", display_name_en: "Cash on Delivery", display_name_bn: null }
    ]);
  }
}
