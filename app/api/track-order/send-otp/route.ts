import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { isValidBdPhone, normalizeBdPhone } from "@lib/phone-bd";
import { rateLimit, getRateLimitKey } from "@lib/rate-limit";
import { sendOtpSms } from "@lib/notifications";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ phone: z.string().min(10) });
const OTP_PER_IP_LIMIT = 10;
const OTP_PER_PHONE_LIMIT = 3;
const OTP_PHONE_WINDOW_MS = 15 * 60 * 1000;

/** POST: Send OTP for phone-based tracking. Uses notification adapter (BulkSMS BD / Twilio / stub). */
export async function POST(request: NextRequest) {
  const ipKey = getRateLimitKey("otp:ip", request);
  const ipLimit = await rateLimit(ipKey, OTP_PER_IP_LIMIT);
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter ?? 60) } }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }
  const phone = parsed.data.phone.trim();

  const phoneKey = `otp:phone:${phone.replace(/\D/g, "").slice(-10)}`;
  const phoneLimit = await rateLimit(phoneKey, OTP_PER_PHONE_LIMIT, OTP_PHONE_WINDOW_MS);
  if (!phoneLimit.ok) {
    return NextResponse.json(
      { error: "Too many OTP requests for this phone. Try again later." },
      { status: 429, headers: { "Retry-After": String(phoneLimit.retryAfter ?? 900) } }
    );
  }
  if (!isValidBdPhone(phone)) {
    return NextResponse.json({ error: "Invalid Bangladesh phone format" }, { status: 400 });
  }

  const phoneNormalized = normalizeBdPhone(phone).replace(/\D/g, "").slice(-10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  if (process.env.DATABASE_URL) {
    try {
      await prisma.trackOtpVerification.create({
        data: { phoneNormalized, code, expiresAt },
      });
    } catch (err) {
      console.error("[track-order send-otp] DB error:", err);
      return NextResponse.json({ error: "Failed to store OTP" }, { status: 500 });
    }
  }

  const phoneE164 = phoneNormalized.startsWith("88") ? `+${phoneNormalized}` : `+88${phoneNormalized}`;
  const result = await sendOtpSms(phoneE164, code);

  if (!result.ok && process.env.NODE_ENV !== "production") {
    console.info("[track-order send-otp] SMS not configured. phone:", phoneNormalized, "code:", code);
  }

  return NextResponse.json({ sent: result.ok });
}
