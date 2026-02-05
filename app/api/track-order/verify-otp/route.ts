import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone-bd";
import { z } from "zod";
import { randomUUID } from "crypto";

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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ token: "demo-token", message: "Demo: use this token with ?otp_token=demo-token" });
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("track_otp_verification")
    .select("id")
    .eq("phone_normalized", phoneNormalized)
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!row) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await supabase.from("track_verified_tokens").insert({
    token,
    phone_normalized: phoneNormalized,
    expires_at: expiresAt,
  });
  await supabase.from("track_otp_verification").delete().eq("id", (row as { id: string }).id);

  return NextResponse.json({ token });
}
