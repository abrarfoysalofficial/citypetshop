import { NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notifications/status
 * Returns provider config status (configured/not) without exposing secrets.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const smsProvider = process.env.BULK_SMS_BD_API_KEY
    ? "bulksmsbd"
    : process.env.TWILIO_ACCOUNT_SID
      ? "twilio"
      : null;
  const emailProvider = process.env.RESEND_API_KEY ? "resend" : null;

  return NextResponse.json({
    sms: { configured: !!smsProvider, provider: smsProvider },
    email: { configured: !!emailProvider, provider: emailProvider },
    envVars: {
      sms: smsProvider === "bulksmsbd"
        ? ["BULK_SMS_BD_API_KEY", "BULK_SMS_BD_SENDER_ID"]
        : smsProvider === "twilio"
          ? ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM"]
          : ["BULK_SMS_BD_API_KEY or TWILIO_*"],
      email: ["RESEND_API_KEY", "EMAIL_FROM"],
    },
  });
}
