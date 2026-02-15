import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DATA_SOURCE } from "@/src/config/runtime";

export const dynamic = "force-dynamic";
import { getAdminVouchers } from "@/src/data/provider";

/** POST: Validate voucher code, return discount amount. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const code = (body.code as string)?.trim()?.toUpperCase();
  const subtotal = Number(body.subtotal) || 0;
  if (!code || subtotal <= 0) {
    return NextResponse.json({ valid: false, discount: 0, error: "Invalid request" });
  }

  if (DATA_SOURCE === "local") {
    const vouchers = await getAdminVouchers();
    const v = vouchers.find((x) => x.code.toUpperCase() === code && x.active);
    if (!v) return NextResponse.json({ valid: false, discount: 0, error: "Invalid voucher code" });
    const minOk = !v.minPurchase || subtotal >= v.minPurchase;
    if (!minOk) return NextResponse.json({ valid: false, discount: 0, error: `Minimum purchase ৳${v.minPurchase}` });
    const discount = v.type === "percent" ? Math.round(subtotal * (v.value / 100)) : Math.min(v.value, subtotal);
    return NextResponse.json({ valid: true, discount, type: v.type, value: v.value });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("vouchers")
    .select("discount_type, discount_value, min_order_amount, is_active")
    .eq("code", code)
    .single();

  if (!data || !(data as { is_active: boolean }).is_active) {
    return NextResponse.json({ valid: false, discount: 0, error: "Invalid voucher code" });
  }
  const v = data as { discount_type: string; discount_value: number; min_order_amount?: number };
  if (v.min_order_amount && subtotal < v.min_order_amount) {
    return NextResponse.json({ valid: false, discount: 0, error: `Minimum purchase ৳${v.min_order_amount}` });
  }
  const discount = v.discount_type === "percent" ? Math.round(subtotal * (v.discount_value / 100)) : Math.min(v.discount_value, subtotal);
  return NextResponse.json({ valid: true, discount, type: v.discount_type, value: v.discount_value });
}
