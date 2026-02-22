import { NextRequest, NextResponse } from "next/server";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone-bd";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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

  // Enforce OTP when requireOtpPhoneTracking is true and query is by phone
  if (isPhone && process.env.DATABASE_URL) {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    const requireOtp = settings?.requireOtpPhoneTracking ?? false;
    if (requireOtp) {
      if (!otpToken) {
        return NextResponse.json({
          orders: [],
          requiresOtp: true,
          message: "Phone verification required. Request OTP first.",
        });
      }
      const phoneNormalized = normalizeBdPhone(q).replace(/\D/g, "").slice(-10);
      const tokenRow = await prisma.trackVerifiedToken.findFirst({
        where: {
          token: otpToken,
          phoneNormalized,
          expiresAt: { gt: new Date() },
        },
      });
      if (!tokenRow) {
        return NextResponse.json({
          orders: [],
          requiresOtp: true,
          error: "Invalid or expired verification. Please request a new OTP.",
        }, { status: 401 });
      }
    }
  }

  let where: Record<string, unknown> = {};
  if (isPhone) {
    const normalized = normalizeBdPhone(q).replace(/\D/g, "").slice(-10);
    where.OR = [
      { shippingPhone: { contains: normalized } },
      { guestPhone: { contains: normalized } }
    ];
  } else {
    where.id = q;
  }

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      shippingName: true,
      shippingPhone: true,
      guestName: true,
      guestPhone: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const matches = orders.map(o => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    customerName: o.shippingName || o.guestName,
    phone: o.shippingPhone || o.guestPhone,
  }));

  return NextResponse.json({
    orders: matches,
    notes: [],
    events: [],
    source: "prisma",
  });
}
