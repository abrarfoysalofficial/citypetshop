import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone-bd";
import { getAdminOrders, getAdminCustomers } from "@/src/data/provider";
import { DATA_SOURCE } from "@/src/config/runtime";

function getQueryParams(searchParams: URLSearchParams) {
  const q = searchParams.get("q")?.trim();
  const orderId = searchParams.get("orderId")?.trim();
  const phone = searchParams.get("phone")?.trim();
  if (q) return { q, isPhone: /^[\d+\s\-()]+$/.test(q) && q.replace(/\D/g, "").length >= 10 };
  if (orderId) return { q: orderId, isPhone: false };
  if (phone) return { q: phone, isPhone: true };
  return null;
}

/** GET: Lookup orders by orderId or phone (q, orderId, or phone param). Returns list + notes/events. When OTP required and not verified, returns masked orders + requiresOtp. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = getQueryParams(searchParams);
  if (!params?.q) {
    return NextResponse.json({ error: "Order ID or phone required (use q, orderId, or phone)" }, { status: 400 });
  }

  const { q, isPhone } = params;
  if (isPhone && !isValidBdPhone(q)) {
    return NextResponse.json({ error: "Invalid Bangladesh phone format (e.g. 01XXXXXXXXX or +8801XXXXXXXXX)" }, { status: 400 });
  }

  const otpToken = searchParams.get("otp_token")?.trim();

  if (DATA_SOURCE === "local") {
    const orders = await getAdminOrders();
    const customers = await getAdminCustomers();
    let matches: { id: string; status: string; total: number; createdAt: string; customerName?: string; phone?: string }[] = [];

    if (isPhone) {
      const norm = normalizeBdPhone(q).replace(/\D/g, "").slice(-10);
      const cust = (customers as { phone?: string; name: string; email?: string }[]).find(
        (c) => (c.phone || "").replace(/\D/g, "").slice(-10) === norm
      );
      if (cust) {
        matches = orders
          .filter((o) => o.customerName === cust.name || (cust.email && o.email?.includes(cust.email)))
          .map((o) => ({ id: o.id, status: o.status, total: o.total, createdAt: o.createdAt, customerName: o.customerName }));
      }
    } else {
      const o = orders.find((x) => x.id === q || x.id.toLowerCase() === q.toLowerCase());
      if (o) matches = [{ id: o.id, status: o.status, total: o.total, createdAt: o.createdAt, customerName: o.customerName }];
    }

    return NextResponse.json({
      orders: matches,
      notes: [],
      events: [],
      source: "local",
    });
  }

  const supabase = await createClient();
  const { data: settingsRow } = await supabase.from("site_settings").select("require_otp_phone_tracking").eq("id", "default").single();
  const requireOtp = (settingsRow as { require_otp_phone_tracking?: boolean } | null)?.require_otp_phone_tracking === true;

  let otpVerified = false;
  if (isPhone && requireOtp && otpToken) {
    const { data: tokenRow } = await supabase
      .from("track_verified_tokens")
      .select("phone_normalized")
      .eq("token", otpToken)
      .gt("expires_at", new Date().toISOString())
      .single();
    const phoneNormalized = normalizeBdPhone(q).replace(/\D/g, "").slice(-10);
    otpVerified = !!(tokenRow && (tokenRow as { phone_normalized: string }).phone_normalized === phoneNormalized);
  }

  if (isPhone && requireOtp && !otpVerified) {
    const normalized = normalizeBdPhone(q).replace(/\D/g, "").slice(-10);
    const { data: ordersDataMask } = await supabase.from("orders").select("id, status, total, created_at, shipping_phone, guest_phone");
    const list = (ordersDataMask || []) as { id: string; status: string; total: number; created_at: string; shipping_phone?: string; guest_phone?: string }[];
    const maskedOrders = list
      .filter((o) => (o.shipping_phone || o.guest_phone || "").replace(/\D/g, "").slice(-10) === normalized)
      .map((o) => ({ id: o.id, status: o.status, total: o.total, createdAt: o.created_at }));
    return NextResponse.json({
      orders: maskedOrders,
      notes: [],
      events: [],
      source: "supabase",
      requiresOtp: true,
    });
  }

  const { data: ordersData } = await supabase.from("orders").select("id, status, total, created_at, shipping_name, shipping_phone, guest_phone");

  if (!ordersData || ordersData.length === 0) {
    return NextResponse.json({ orders: [], notes: [], events: [], source: "supabase" });
  }

  let orderIds: string[] = [];
  if (isPhone) {
    const normalized = normalizeBdPhone(q).replace(/\D/g, "").slice(-10);
    orderIds = (ordersData as { id: string; shipping_phone?: string; guest_phone?: string }[])
      .filter((o) => {
        const p = (o.shipping_phone || o.guest_phone || "").replace(/\D/g, "").slice(-10);
        return p === normalized;
      })
      .map((o) => o.id);
  } else {
    const found = (ordersData as { id: string }[]).find((o) => o.id === q || String(o.id).toLowerCase().includes(q.toLowerCase()));
    if (found) orderIds = [found.id];
  }

  if (orderIds.length === 0) {
    return NextResponse.json({ orders: [], notes: [], events: [], source: "supabase" });
  }

  const ordersList = (ordersData as { id: string; status: string; total: number; created_at: string; shipping_name?: string; shipping_phone?: string }[])
    .filter((o) => orderIds.includes(o.id))
    .map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.created_at,
      customerName: o.shipping_name,
      phone: o.shipping_phone,
    }));

  const [{ data: notes }, { data: events }] = await Promise.all([
    supabase.from("order_notes").select("*").in("order_id", orderIds).order("created_at", { ascending: false }),
    supabase.from("order_status_events").select("*").in("order_id", orderIds).order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    orders: ordersList,
    notes: notes || [],
    events: events || [],
    source: "supabase",
  });
}
