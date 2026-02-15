import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getAdminAnalyticsEvents } from "@/src/data/supabase/adminData";

export const dynamic = "force-dynamic";

const META_EVENT_NAMES = ["ViewContent", "Search", "AddToCart", "InitiateCheckout", "AddPaymentInfo", "Purchase"];

/** GET: Fetch analytics events. Admin Supabase only. */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const params = {
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    event: searchParams.get("event") ?? undefined,
    source: searchParams.get("source") ?? undefined,
  };

  try {
    const result = await getAdminAnalyticsEvents(params);
    return NextResponse.json({
      ...result,
      metaEventNames: META_EVENT_NAMES,
    });
  } catch (err) {
    console.error("[api/admin/analytics/events] error:", err);
    return NextResponse.json({
      events: [],
      counts: {},
      lastReceivedByEvent: {},
      diagnostics: { pixelConfigured: false, capiConfigured: false, warnings: ["Failed to load analytics"] },
      metaEventNames: META_EVENT_NAMES,
    });
  }
}
