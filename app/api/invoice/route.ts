import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/config/env";
import { generateInvoicePDF } from "@/lib/pdf-invoice";

/** GET /api/invoice?orderId=xxx – generate and return PDF invoice */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId?.trim()) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }

  try {
    const supabase = await createClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, created_at, status, subtotal, delivery_charge, discount_amount, total, shipping_name, shipping_phone, shipping_address, shipping_city, voucher_code")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price, total_price")
      .eq("order_id", orderId);

    const invoiceOrder = {
      id: (order as { id: string }).id,
      created_at: (order as { created_at: string }).created_at,
      status: (order as { status: string }).status,
      subtotal: Number((order as { subtotal: number }).subtotal ?? 0),
      delivery_charge: Number((order as { delivery_charge: number }).delivery_charge ?? 0),
      discount_amount: Number((order as { discount_amount: number }).discount_amount ?? 0),
      total: Number((order as { total: number }).total ?? 0),
      shipping_name: (order as { shipping_name: string }).shipping_name ?? "",
      shipping_phone: (order as { shipping_phone: string }).shipping_phone ?? "",
      shipping_address: (order as { shipping_address: string }).shipping_address ?? "",
      shipping_city: (order as { shipping_city: string }).shipping_city ?? "",
      voucher_code: (order as { voucher_code?: string | null }).voucher_code ?? null,
    };

    const invoiceItems = (items ?? []).map((i: { product_name: string; quantity: number; unit_price: number; total_price: number }) => ({
      product_name: i.product_name ?? "Item",
      quantity: i.quantity ?? 1,
      unit_price: i.unit_price ?? 0,
      total_price: i.total_price ?? 0,
    }));

    const pdfBytes = await generateInvoicePDF(invoiceOrder, invoiceItems);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${orderId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Invoice generation error:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
