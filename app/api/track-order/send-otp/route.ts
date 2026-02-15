import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone-bd";

export const dynamic = "force-dynamic";
import { z } from "zod";

const bodySchema = z.object({ phone: z.string().min(10) });

/** POST: Send OTP for phone-based tracking. Stores code in DB; in production wire to SMS provider. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }
  const phone = parsed.data.phone.trim();
  if (!isValidBdPhone(phone)) {
    return NextResponse.json({ error: "Invalid Bangladesh phone format" }, { status: 400 });
  }

  const phoneNormalized = normalizeBdPhone(phone).replace(/\D/g, "").slice(-10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ sent: true, message: "Demo: OTP not sent (no DB). Use any 6 digits in verify." });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("track_otp_verification").insert({
    phone_normalized: phoneNormalized,
    code,
    expires_at: expiresAt,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: send SMS via Twilio/etc; for now log only (do not log code in production)
  if (process.env.NODE_ENV !== "production") {
    console.info("[track-order send-otp] phone_normalized:", phoneNormalized, "code:", code);
  }

  return NextResponse.json({ sent: true });
}
