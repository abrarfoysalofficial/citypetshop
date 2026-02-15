import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/config/env";

const orderItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(1),
  qty: z.number().int().min(1),
  price: z.number().min(0),
});

const checkoutOrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, "customerName is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  subtotal: z.number().min(0).optional(),
  deliveryCharge: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  total: z.number().min(0),
  items: z.array(orderItemSchema).min(1, "At least one item required"),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  paymentMethod: z.string().optional(),
  voucherCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutOrderSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Validation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const input = parsed.data;
  const {
    customerName,
    email,
    phone,
    subtotal,
    deliveryCharge,
    discountAmount,
    total,
    items,
    shippingAddress,
    shippingCity,
    paymentMethod,
    voucherCode,
  } = input;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;
  const shippingName = customerName.trim();
  const shippingEmail = typeof email === "string" && email.trim() ? email.trim() : "guest@checkout.local";
  const shippingPhone = typeof phone === "string" ? phone.trim() || "N/A" : "N/A";
  const shippingAddressText =
    typeof shippingAddress === "string" ? shippingAddress.trim() : "";
  const shippingCityText = typeof shippingCity === "string" ? shippingCity.trim() : "N/A";
  const paymentMethodValue =
    typeof paymentMethod === "string" && paymentMethod
      ? paymentMethod
      : "cod";

  const itemsSubtotal = items.reduce((s, i) => s + (i.qty ?? 1) * (i.price ?? 0), 0);
  const orderSubtotal = typeof subtotal === "number" ? subtotal : itemsSubtotal;
  const orderDeliveryCharge = typeof deliveryCharge === "number" ? deliveryCharge : 0;
  const orderDiscountAmount = typeof discountAmount === "number" ? discountAmount : 0;

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      guest_email: userId ? null : shippingEmail,
      guest_phone: userId ? null : shippingPhone,
      guest_name: userId ? null : shippingName,
      status: "pending",
      subtotal: orderSubtotal,
      delivery_charge: orderDeliveryCharge,
      discount_amount: orderDiscountAmount,
      total,
      voucher_code: typeof voucherCode === "string" ? voucherCode.trim() || null : null,
      payment_method: paymentMethodValue,
      payment_status: "pending",
      shipping_name: shippingName,
      shipping_phone: shippingPhone,
      shipping_email: shippingEmail,
      shipping_address: shippingAddressText || "N/A",
      shipping_city: shippingCityText || "N/A",
      shipping_area: null,
      shipping_notes: null,
    })
    .select("id")
    .single();

  if (orderError || !orderRow?.id) {
    return NextResponse.json(
      { error: orderError?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }

  const orderId = orderRow.id as string;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.productId && uuidRegex.test(item.productId) ? item.productId : null,
    product_name: item.name ?? "Item",
    quantity: item.qty ?? 1,
    unit_price: item.price ?? 0,
    total_price: (item.qty ?? 1) * (item.price ?? 0),
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    return NextResponse.json(
      { error: itemsError.message ?? "Failed to create order items" },
      { status: 500 }
    );
  }

  return NextResponse.json({ orderId });
}
