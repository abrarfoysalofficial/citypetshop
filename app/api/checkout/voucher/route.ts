import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";

export const dynamic = "force-dynamic";

/** POST: Validate voucher code, return discount amount. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const code = (body.code as string)?.trim()?.toUpperCase();
  const subtotal = Number(body.subtotal) || 0;
  if (!code || subtotal <= 0) {
    return NextResponse.json({ valid: false, discount: 0, error: "Invalid request" });
  }

  const tenantId = getDefaultTenantId();
  const voucher = await prisma.voucher.findFirst({
    where: {
      tenantId,
      code: code,
      isActive: true,
      OR: [
        { expiryAt: null },
        { expiryAt: { gte: new Date() } }
      ]
    }
  });

  if (!voucher) {
    return NextResponse.json({ valid: false, discount: 0, error: "Invalid voucher code" });
  }

  const minOk = !voucher.minOrderAmount || subtotal >= Number(voucher.minOrderAmount);
  if (!minOk) {
    return NextResponse.json({ valid: false, discount: 0, error: `Minimum purchase ৳${voucher.minOrderAmount}` });
  }

  const discount = voucher.discountType === "percent"
    ? Math.round(subtotal * (Number(voucher.discountValue) / 100))
    : Math.min(Number(voucher.discountValue), subtotal);

  return NextResponse.json({
    valid: true,
    discount,
    type: voucher.discountType,
    value: Number(voucher.discountValue)
  });
}
