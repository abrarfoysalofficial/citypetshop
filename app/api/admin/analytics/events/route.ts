import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const META_EVENT_NAMES = ["ViewContent", "Search", "AddToCart", "InitiateCheckout", "AddPaymentInfo", "Purchase"];

/** GET: Fetch analytics events (Meta Events Manager style). Returns events, counts by date range, last received, diagnostics, source/dedup. */
export async function GET(request: NextRequest) {
  const empty = {
    events: [] as unknown[],
    counts: {} as Record<string, number>,
    lastReceivedByEvent: {} as Record<string, string>,
    diagnostics: { pixelConfigured: false, capiConfigured: false, warnings: [] as string[] },
  };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(empty);
  }
  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const eventName = searchParams.get("event");
  const source = searchParams.get("source");

  const supabase = await createClient();
  let q = supabase
    .from("analytics_events")
    .select("id, event_name, event_id, source, page_url, created_at, has_email_hash, has_phone_hash, has_fbp, has_fbc, payload_summary")
    .order("created_at", { ascending: false })
    .limit(200);

  if (fromDate) q = q.gte("created_at", fromDate);
  if (toDate) q = q.lte("created_at", toDate);
  if (eventName) q = q.eq("event_name", eventName);
  if (source) q = q.eq("source", source);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rangeStart = fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const rangeEnd = toDate || new Date().toISOString();
  const countQ = supabase.from("analytics_events").select("event_name, created_at").gte("created_at", rangeStart).lte("created_at", rangeEnd);
  const { data: countRows } = await countQ;
  const byName: Record<string, number> = {};
  const lastReceived: Record<string, string> = {};
  (countRows || []).forEach((r) => {
    const row = r as { event_name: string; created_at: string };
    byName[row.event_name] = (byName[row.event_name] || 0) + 1;
    if (!lastReceived[row.event_name] || row.created_at > lastReceived[row.event_name]) lastReceived[row.event_name] = row.created_at;
  });
  const eventsData = data || [];
  eventsData.forEach((e) => {
    const ev = e as { event_name: string; created_at: string };
    if (!lastReceived[ev.event_name] || ev.created_at > lastReceived[ev.event_name]) lastReceived[ev.event_name] = ev.created_at;
  });

  const { data: settingsRow } = await supabase.from("site_settings").select("facebook_pixel_id, facebook_capi_token").eq("id", "default").single();
  const settings = settingsRow as { facebook_pixel_id?: string; facebook_capi_token?: string } | null;
  const pixelConfigured = !!(settings?.facebook_pixel_id?.trim() || process.env.NEXT_PUBLIC_FB_PIXEL_ID);
  const capiConfigured = !!(settings?.facebook_capi_token?.trim() || process.env.FACEBOOK_CAPI_TOKEN);
  const warnings: string[] = [];
  if (!pixelConfigured) warnings.push("Meta Pixel ID not configured (site_settings or NEXT_PUBLIC_FB_PIXEL_ID).");
  if (!capiConfigured) warnings.push("Meta CAPI token not configured (site_settings or FACEBOOK_CAPI_TOKEN).");

  return NextResponse.json({
    events: eventsData,
    counts: byName,
    lastReceivedByEvent: lastReceived,
    diagnostics: {
      pixelConfigured,
      capiConfigured,
      warnings,
    },
    metaEventNames: META_EVENT_NAMES,
  });
}
