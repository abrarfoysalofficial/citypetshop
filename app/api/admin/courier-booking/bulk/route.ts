import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";
import { getDefaultTenantId } from "@lib/tenant";
import { bookCourier } from "@lib/courier/booking";
import { z } from "zod";
import type { CourierProvider } from "@lib/courier/key-registry";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderIds: z.array(z.string().min(1)).min(1).max(50),
  provider: z.enum(["pathao", "steadfast", "redx"]),
});

/** POST: Bulk book courier for multiple orders. Idempotent per order. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });

  const { orderIds, provider } = parsed.data as { orderIds: string[]; provider: CourierProvider };

  const tenantId = getDefaultTenantId();
  const results: { orderId: string; success: boolean; trackingCode?: string; error?: string }[] = [];

  for (const orderId of orderIds) {
    const result = await bookCourier(tenantId, orderId, provider);
    if (result.success) {
      results.push({ orderId, success: true, trackingCode: result.trackingCode });
    } else {
      results.push({ orderId, success: false, error: result.error });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  return NextResponse.json({ results, successCount, failCount: results.length - successCount });
}
