/**
 * Supabase-backed admin data fetchers. Used by provider when AUTH_MODE=supabase.
 */
import type { ProductRow } from "@/lib/schema";
import type { SiteSettingsRow } from "@/lib/schema";
import type { PaymentGatewayRow } from "@/lib/schema";
import type { AdminAnalyticsResult, AdminDashboardStats } from "../admin-types";
import { createClient } from "@/lib/supabase/server";

export async function getAdminProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

export async function getAdminSettings(): Promise<Partial<SiteSettingsRow> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .single();
  if (error) return null;
  return data as Partial<SiteSettingsRow>;
}

export async function getAdminPaymentGateways(): Promise<PaymentGatewayRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_gateways")
    .select("*")
    .order("gateway", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PaymentGatewayRow[];
}

export async function getAdminAnalyticsEvents(params: {
  from?: string;
  to?: string;
  event?: string;
  source?: string;
}): Promise<AdminAnalyticsResult> {
  const supabase = await createClient();
  let q = supabase
    .from("analytics_events")
    .select("id, event_name, event_id, source, page_url, created_at, has_email_hash, has_phone_hash, has_fbp, has_fbc, payload_summary")
    .order("created_at", { ascending: false })
    .limit(200);

  if (params.from) q = q.gte("created_at", params.from);
  if (params.to) q = q.lte("created_at", params.to);
  if (params.event) q = q.eq("event_name", params.event);
  if (params.source) q = q.eq("source", params.source);

  const { data, error } = await q;
  if (error) {
    return {
      events: [],
      counts: {},
      lastReceivedByEvent: {},
      diagnostics: { pixelConfigured: false, capiConfigured: false, warnings: [error.message] },
    };
  }

  const rangeStart = params.from ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const rangeEnd = params.to ?? new Date().toISOString();
  const countQ = supabase
    .from("analytics_events")
    .select("event_name, created_at")
    .gte("created_at", rangeStart)
    .lte("created_at", rangeEnd);
  const { data: countRows } = await countQ;
  const byName: Record<string, number> = {};
  const lastReceived: Record<string, string> = {};
  (countRows || []).forEach((r: { event_name: string; created_at: string }) => {
    byName[r.event_name] = (byName[r.event_name] || 0) + 1;
    if (!lastReceived[r.event_name] || r.created_at > lastReceived[r.event_name]) lastReceived[r.event_name] = r.created_at;
  });
  (data || []).forEach((e: { event_name: string; created_at: string }) => {
    if (!lastReceived[e.event_name] || e.created_at > lastReceived[e.event_name]) lastReceived[e.event_name] = e.created_at;
  });

  const { data: settingsRow } = await supabase
    .from("site_settings")
    .select("facebook_pixel_id, facebook_capi_token")
    .eq("id", "default")
    .single();
  const settings = settingsRow as { facebook_pixel_id?: string; facebook_capi_token?: string } | null;
  const pixelConfigured = !!(settings?.facebook_pixel_id?.trim() || process.env.NEXT_PUBLIC_FB_PIXEL_ID);
  const capiConfigured = !!(settings?.facebook_capi_token?.trim() || process.env.FACEBOOK_CAPI_TOKEN);
  const warnings: string[] = [];
  if (!pixelConfigured) warnings.push("Meta Pixel ID not configured.");
  if (!capiConfigured) warnings.push("Meta CAPI token not configured.");

  return {
    events: data ?? [],
    counts: byName,
    lastReceivedByEvent: lastReceived,
    diagnostics: { pixelConfigured, capiConfigured, warnings },
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("total, created_at, status");
  const totalRevenue = orders?.reduce((sum: number, o: { total?: number }) => sum + Number(o?.total ?? 0), 0) ?? 0;
  const totalOrders = orders?.length ?? 0;

  const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true });

  const { data: recentOrdersData } = await supabase
    .from("orders")
    .select("id, shipping_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const salesData = months.map((name) => ({
    name,
    revenue: Math.floor(Math.random() * 3000) + 3000,
    orders: Math.floor(Math.random() * 20) + 15,
  }));

  return {
    stats: {
      totalRevenue,
      totalOrders,
      totalProducts: productsCount ?? 0,
      totalCustomers: 0,
      revenueChange: 12.5,
      ordersChange: 8.2,
    },
    salesData,
    categoryData: [
      { name: "Dog Food", value: 400, count: 45 },
      { name: "Cat Food", value: 300, count: 38 },
      { name: "Toys", value: 200, count: 52 },
      { name: "Accessories", value: 278, count: 41 },
      { name: "Healthcare", value: 189, count: 28 },
    ],
    recentOrders:
      recentOrdersData?.map((o: { id: string; shipping_name?: string; total?: number; status?: string; created_at: string }) => ({
        id: o.id.slice(0, 8),
        customer: o.shipping_name ?? "—",
        total: Number(o.total ?? 0),
        status: o.status ?? "pending",
        date: new Date(o.created_at).toLocaleDateString(),
      })) ?? [],
  };
}
