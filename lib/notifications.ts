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
import { DEFAULT_EMAIL_FROM, DEFAULT_SUPPORT_EMAIL } from "@/lib/constants";

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
  trackingCode?: string,
  tenantId?: string
): Promise<NotificationResult> {
  let siteName = "City Plus Pet Shop";
  if (tenantId && process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/db");
      const settings = await prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { siteNameEn: true },
      });
      if (settings?.siteNameEn) siteName = settings.siteNameEn;
    } catch {
      // Use default on error
    }
  }
  const shortId = orderId.slice(-8).toUpperCase();
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "01XXXXXXXXX";
  const statusMessages: Record<string, string> = {
    confirmed: `Your order #${shortId} has been confirmed. ${siteName}.`,
    processing: `Your order #${shortId} is being processed. ${siteName}.`,
    shipped: `Your order #${shortId} has been shipped.${trackingCode ? ` Tracking: ${trackingCode}` : ""} ${siteName}.`,
    handed_to_courier: `Your order #${shortId} is on the way!${trackingCode ? ` Track: ${trackingCode}` : ""} ${siteName}.`,
    delivered: `Your order #${shortId} has been delivered. Thank you for shopping with ${siteName}!`,
    cancelled: `Your order #${shortId} has been cancelled. Contact us: ${supportPhone}. ${siteName}.`,
  };
  const message = statusMessages[status] ?? `Your order #${shortId} status: ${status}. ${siteName}.`;
  return sendSms(phone, message);
}

// ─── Email ────────────────────────────────────────────────────────────────────

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function getFromEmail(): string {
  return process.env.EMAIL_FROM ?? DEFAULT_EMAIL_FROM;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<NotificationResult> {
  const resend = getResend();
  if (!resend) {
    const { logWarn } = await import("@/lib/logger");
    logWarn("notifications", "RESEND_API_KEY not configured. Email not sent.");
    return { ok: false, error: "RESEND_API_KEY not configured." };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: opts.from ?? getFromEmail(),
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
  tenantId: string;
  to: string;
  orderId: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: string;
  paymentMethod: string;
}): Promise<NotificationResult> {
  const { tenantId, to, orderId, customerName, items, total, shippingAddress, paymentMethod } = opts;
  const shortId = orderId.slice(-8).toUpperCase();

  let siteName = "City Plus Pet Shop";
  let supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? DEFAULT_SUPPORT_EMAIL;
  let primaryColor = "#5cd4ff";
  let secondaryColor = "#06b6d4";

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/db");
      const settings = await prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { siteNameEn: true, email: true, primaryColor: true, secondaryColor: true },
      });
      if (settings?.siteNameEn) siteName = settings.siteNameEn;
      if (settings?.email) supportEmail = settings.email;
      if (settings?.primaryColor) primaryColor = settings.primaryColor;
      if (settings?.secondaryColor) secondaryColor = settings.secondaryColor;
    } catch {
      // Use defaults on error
    }
  }

  const itemsHtml = items
    .map((i) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">৳${i.price.toLocaleString()}</td></tr>`)
    .join("");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:${primaryColor};padding:20px;text-align:center;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:24px">${siteName}</h1>
  </div>
  <div style="background:#fff;padding:30px;border:1px solid #eee;border-top:none">
    <h2 style="color:${primaryColor}">Order Confirmed! 🎉</h2>
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
          <td style="padding:10px;text-align:right;font-weight:bold;color:${primaryColor}">৳${total.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
    <p style="margin-top:20px">You can track your order at: <a href="${siteUrl}/track-order" style="color:${secondaryColor}">Track Order</a></p>
    <p>Questions? Contact us at ${supportEmail}</p>
  </div>
  <div style="text-align:center;padding:15px;color:#888;font-size:12px">
    © ${new Date().getFullYear()} ${siteName}. All rights reserved.
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `Order Confirmed #${shortId} – ${siteName}`,
    html,
    text: `Order #${shortId} confirmed. Total: ৳${total}. Track at: ${siteUrl}/track-order`,
  });
}
