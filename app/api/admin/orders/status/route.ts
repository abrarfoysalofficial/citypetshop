import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import type { OrderStatus } from "@/lib/schema";

/**
 * PATCH /api/admin/orders/status
 * Update order status and create a status event
 * Body: { orderId: string, status: OrderStatus, note?: string }
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { orderId, status, note } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "handed_to_courier",
      "delivered",
      "cancelled",
      "returned",
      "refund_requested",
      "refunded",
      "failed"
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const supabase = await createClient();

    // Update order status
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .update({ status: status as OrderStatus })
      .eq("id", orderId)
      .select()
      .single();

    if (orderError) {
      console.error("Failed to update order status:", orderError);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // Create status event
    const statusEventPayload: any = {
      order_id: orderId,
      status,
      provider: "admin",
      payload_summary: note ? { note } : null,
    };

    const { error: eventError } = await supabase
      .from("order_status_events")
      .insert(statusEventPayload);

    if (eventError) {
      console.error("Failed to create status event:", eventError);
      // Don't fail the request if event creation fails
    }

    return NextResponse.json(orderData);
  } catch (err) {
    console.error("order status PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
