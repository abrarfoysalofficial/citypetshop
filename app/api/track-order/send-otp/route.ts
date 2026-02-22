import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone-bd";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ phone: z.string().min(10) });
const OTP_PER_IP_LIMIT = 10;
const OTP_PER_PHONE_LIMIT = 3;

/** Send SMS via Twilio if configured */
async function sendSmsTwilio(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !from) return false;

  const toE164 = to.startsWith("+") ? to : `+88${to}`;
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: toE164,
        From: from,
        Body: body,
      }),
    }
  );
  return res.ok;
}

/** Send SMS via generic webhook (POST with phone, message) */
async function sendSmsWebhook(phone: string, message: string): Promise<boolean> {
  const url = process.env.SMS_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** POST: Send OTP for phone-based tracking. Stores code in DB; sends via Twilio or webhook if configured. */
export async function POST(request: NextRequest) {
  const ipKey = getRateLimitKey("otp:ip", request);
  const ipLimit = rateLimit(ipKey, OTP_PER_IP_LIMIT);
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
  const phoneLimit = rateLimit(phoneKey, OTP_PER_PHONE_LIMIT, 15 * 60 * 1000); // 15 min window
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

  // Store in Prisma if configured
  if (process.env.DATABASE_URL) {
    try {
      await prisma.trackOtpVerification.create({
        data: {
          phoneNormalized,
          code,
          expiresAt,
        },
      });
    } catch (err) {
      console.error("[track-order send-otp] DB error:", err);
      return NextResponse.json({ error: "Failed to store OTP" }, { status: 500 });
    }
  }

  // Send SMS: Twilio first, then webhook
  const message = `Your City Plus Pet Shop verification code is: ${code}. Valid for 10 minutes.`;
  let sent = await sendSmsTwilio(phoneNormalized.startsWith("88") ? `+${phoneNormalized}` : `+88${phoneNormalized}`, message);
  if (!sent) sent = await sendSmsWebhook(phone, message);

  if (!sent && process.env.NODE_ENV !== "production") {
    console.info("[track-order send-otp] SMS not configured. phone:", phoneNormalized, "code:", code);
  }

  return NextResponse.json({ sent });
}
