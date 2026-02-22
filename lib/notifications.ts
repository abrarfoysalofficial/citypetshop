/**
 * Notification adapter – unified interface for SMS + Email.
 * Providers are config-driven (env vars). No paid vendor required to build;
 * stub returns ok:false with a clear message when provider not configured.
 *
 * SMS providers supported (via adapter pattern):
 *   - BulkSMSBD (Bangladesh): BULK_SMS_BD_API_KEY + BULK_SMS_BD_SENDER_ID
 *   - Twilio: TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM
 *
 * Email provider:
 *   - Resend: RESEND_API_KEY (already in package.json)
 */

import { Resend } from "resend";

export interface NotificationResult {
  ok: boolean;
  provider?: string;
  messageId?: string;
  error?: string;
}

// ─── SMS ──────────────────────────────────────────────────────────────────────

async function sendSmsBulkBD(phone: string, message: string): Promise<NotificationResult> {
  const apiKey = process.env.BULK_SMS_BD_API_KEY;
  const senderId = process.env.BULK_SMS_BD_SENDER_ID ?? "CityPlus";
  if (!apiKey) return { ok: false, provider: "bulksmsbd", error: "BULK_SMS_BD_API_KEY not configured" };

  const url = `https://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${encodeURIComponent(phone)}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
  const res = await fetch(url, { method: "GET" });
  const text = await res.text();
  const ok = res.ok && text.includes("1001");
  return { ok, provider: "bulksmsbd", messageId: text.trim(), error: ok ? undefined : text };
}

async function sendSmsTwilio(phone: string, message: string): Promise<NotificationResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) {
    return { ok: false, provider: "twilio", error: "Twilio credentials not configured" };
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const body = new URLSearchParams({ To: phone, From: from, Body: message });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  const json = await res.json() as { sid?: string; message?: string };
  return {
    ok: res.ok,
    provider: "twilio",
    messageId: json.sid,
    error: res.ok ? undefined : json.message,
  };
}

/**
 * Send SMS via configured provider.
 * Provider priority: BULK_SMS_BD → Twilio → stub (logs to console in dev).
 */
export async function sendSms(phone: string, message: string): Promise<NotificationResult> {
  if (process.env.BULK_SMS_BD_API_KEY) {
    return sendSmsBulkBD(phone, message);
  }
  if (process.env.TWILIO_ACCOUNT_SID) {
    return sendSmsTwilio(phone, message);
  }
  // Dev fallback – log to console so developers can see what would be sent
  if (process.env.NODE_ENV !== "production") {
    console.log(`[SMS STUB] To: ${phone} | Message: ${message}`);
    return { ok: true, provider: "console-stub" };
  }
  return { ok: false, error: "No SMS provider configured. Set BULK_SMS_BD_API_KEY or TWILIO_ACCOUNT_SID." };
}

// ─── OTP SMS ──────────────────────────────────────────────────────────────────

export async function sendOtpSms(phone: string, code: string): Promise<NotificationResult> {
  const message = `Your City Plus Pet Shop verification code is: ${code}. Valid for 10 minutes. Do not share this code.`;
  return sendSms(phone, message);
}

// ─── Order status SMS ─────────────────────────────────────────────────────────

export async function sendOrderStatusSms(
  phone: string,
  orderId: string,
  status: string,
  trackingCode?: string
): Promise<NotificationResult> {
  const statusMessages: Record<string, string> = {
    confirmed: `Your order #${orderId.slice(-8).toUpperCase()} has been confirmed. City Plus Pet Shop.`,
    processing: `Your order #${orderId.slice(-8).toUpperCase()} is being processed. City Plus Pet Shop.`,
    shipped: `Your order #${orderId.slice(-8).toUpperCase()} has been shipped.${trackingCode ? ` Tracking: ${trackingCode}` : ""} City Plus Pet Shop.`,
    handed_to_courier: `Your order #${orderId.slice(-8).toUpperCase()} is on the way!${trackingCode ? ` Track: ${trackingCode}` : ""} City Plus Pet Shop.`,
    delivered: `Your order #${orderId.slice(-8).toUpperCase()} has been delivered. Thank you for shopping with City Plus Pet Shop!`,
    cancelled: `Your order #${orderId.slice(-8).toUpperCase()} has been cancelled. Contact us: ${process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "01XXXXXXXXX"}. City Plus Pet Shop.`,
  };
  const message = statusMessages[status] ?? `Your order #${orderId.slice(-8).toUpperCase()} status: ${status}. City Plus Pet Shop.`;
  return sendSms(phone, message);
}

// ─── Email ────────────────────────────────────────────────────────────────────

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@citypluspetshop.com";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<NotificationResult> {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[EMAIL STUB] To: ${opts.to} | Subject: ${opts.subject}`);
      return { ok: true, provider: "console-stub" };
    }
    return { ok: false, error: "RESEND_API_KEY not configured." };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (error) return { ok: false, provider: "resend", error: error.message };
    return { ok: true, provider: "resend", messageId: data?.id };
  } catch (err) {
    return { ok: false, provider: "resend", error: String(err) };
  }
}

export async function sendOrderConfirmationEmail(opts: {
  to: string;
  orderId: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: string;
  paymentMethod: string;
}): Promise<NotificationResult> {
  const { to, orderId, customerName, items, total, shippingAddress, paymentMethod } = opts;
  const shortId = orderId.slice(-8).toUpperCase();
  const itemsHtml = items
    .map((i) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">৳${i.price.toLocaleString()}</td></tr>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#0f172a;padding:20px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px">City Plus Pet Shop</h1>
  </div>
  <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none">
    <h2 style="color:#0f172a">Order Confirmed! 🎉</h2>
    <p>Dear ${customerName},</p>
    <p>Thank you for your order. We've received your order and will process it shortly.</p>
    <div style="background:#f8fafc;padding:15px;border-radius:8px;margin:20px 0">
      <strong>Order ID:</strong> #${shortId}<br>
      <strong>Payment:</strong> ${paymentMethod.toUpperCase()}<br>
      <strong>Delivery to:</strong> ${shippingAddress}
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#f1f5f9">
          <th style="padding:10px;text-align:left">Product</th>
          <th style="padding:10px;text-align:center">Qty</th>
          <th style="padding:10px;text-align:right">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:10px;text-align:right;font-weight:bold">Total:</td>
          <td style="padding:10px;text-align:right;font-weight:bold;color:#0f172a">৳${total.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
    <p style="margin-top:20px">You can track your order at: <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/track-order" style="color:#06b6d4">Track Order</a></p>
    <p>Questions? Contact us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@citypluspetshop.com"}</p>
  </div>
  <div style="text-align:center;padding:15px;color:#888;font-size:12px">
    © ${new Date().getFullYear()} City Plus Pet Shop. All rights reserved.
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `Order Confirmed #${shortId} – City Plus Pet Shop`,
    html,
    text: `Order #${shortId} confirmed. Total: ৳${total}. Track at: ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/track-order`,
  });
}
