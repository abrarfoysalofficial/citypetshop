import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { isValidBdPhone, normalizeBdPhone } from "@lib/phone-bd";
import { z } from "zod";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ phone: z.string().min(10), code: z.string().length(6) });

/** POST: Verify OTP; returns token to pass as otp_token when calling GET /api/track-order. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Phone and 6-digit code required" }, { status: 400 });
  }
  const { phone, code } = parsed.data;
  if (!isValidBdPhone(phone)) {
    return NextResponse.json({ error: "Invalid Bangladesh phone format" }, { status: 400 });
  }

  const phoneNormalized = normalizeBdPhone(phone).replace(/\D/g, "").slice(-10);

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Order tracking is temporarily unavailable" }, { status: 503 });
  }

  const row = await prisma.trackOtpVerification.findFirst({
    where: {
      phoneNormalized,
      code,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!row) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.$transaction([
    prisma.trackVerifiedToken.create({
      data: { token, phoneNormalized, expiresAt },
    }),
    prisma.trackOtpVerification.delete({ where: { id: row.id } }),
  ]);

  return NextResponse.json({ token });
}
