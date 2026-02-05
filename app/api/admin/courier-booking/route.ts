import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DATA_SOURCE } from "@/src/config/runtime";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  provider: z.enum(["pathao", "steadfast", "redx"]),
});

/** POST: Book courier for one order. Writes to courier_bookings; updates orders; inserts order_status_events. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { orderId, provider } = parsed.data;

  const requestPayload = { orderId, provider };
  const consignmentId = `book-${orderId.slice(0, 8)}-${Date.now()}`;
  const trackingCode = `TRK-${provider.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const labelUrl = DATA_SOURCE === "local" ? undefined : `https://example.com/labels/${consignmentId}.pdf`;
  const waybillUrl = labelUrl;

  if (DATA_SOURCE === "local") {
    return NextResponse.json({
      success: true,
      trackingCode,
      provider,
      consignmentId,
      labelUrl: undefined,
      waybillUrl: undefined,
    });
  }

  const supabase = await createClient();

  const responsePayload = {
    success: true,
    tracking_code: trackingCode,
    consignment_id: consignmentId,
    label_url: labelUrl,
  };

  const { error: bookingError } = await supabase.from("courier_bookings").insert({
    order_id: orderId,
    provider,
    consignment_id: consignmentId,
    tracking_code: trackingCode,
    label_url: labelUrl ?? null,
    waybill_url: waybillUrl ?? null,
    request_payload: requestPayload,
    response_payload: responsePayload,
    status: "booked",
    updated_at: new Date().toISOString(),
  });

  if (bookingError) {
    const errMsg = bookingError.message;
    await supabase.from("courier_bookings").insert({
      order_id: orderId,
      provider,
      request_payload: requestPayload,
      response_payload: { error: errMsg },
      status: "failed",
      error_message: errMsg,
      updated_at: new Date().toISOString(),
    });
    return NextResponse.json({ error: errMsg, success: false }, { status: 500 });
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      courier_provider: provider,
      courier_booking_id: consignmentId,
      tracking_code: trackingCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (orderError) {
    return NextResponse.json(
      { error: orderError.message, success: false, trackingCode, consignmentId },
      { status: 500 }
    );
  }

  await supabase.from("order_status_events").insert({
    order_id: orderId,
    provider,
    status: "booked",
    payload_summary: { tracking_code: trackingCode, consignment_id: consignmentId },
  });

  return NextResponse.json({
    success: true,
    trackingCode,
    provider,
    consignmentId,
    labelUrl: labelUrl ?? undefined,
    waybillUrl: waybillUrl ?? undefined,
  });
}
