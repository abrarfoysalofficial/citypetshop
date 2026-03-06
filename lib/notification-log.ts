/**
 * Notification log – idempotency for order confirmation email/SMS.
 * Prevents duplicate sends on retries, webhook repeats, or request replays.
 */

import { prisma } from "@lib/db";

/** Truncate recipient for storage (no full email/phone). */
export function truncateRecipient(recipient: string, channel: "email" | "sms"): string {
  if (channel === "email") {
    const at = recipient.indexOf("@");
    if (at <= 0) return "***@***";
    const local = recipient.slice(0, Math.min(2, at));
    const domain = recipient.slice(at + 1).split(".")[0]?.slice(0, 2) ?? "**";
    return `${local}***@${domain}***`;
  }
  const digits = recipient.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `****${digits.slice(-4)}`;
}

export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMATION_EMAIL: "order_confirmation_email",
  ORDER_STATUS_SMS_CONFIRMED: "order_status_sms_confirmed",
} as const;

/**
 * Try to acquire the notification slot (create record). Returns true if we got it (proceed to send),
 * false if already taken (idempotent skip). Uses unique constraint for concurrency safety.
 * Create-first prevents duplicate sends under concurrent requests.
 */
export async function tryAcquireNotificationSlot(
  tenantId: string,
  orderId: string,
  type: string,
  channel: "email" | "sms",
  recipientTruncated: string
): Promise<boolean> {
  try {
    await prisma.notificationLog.create({
      data: {
        tenantId,
        orderId,
        type,
        channel,
        recipient: recipientTruncated,
      },
    });
    return true;
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") return false;
    throw e;
  }
}

/**
 * Update notification log with send result (provider, messageId).
 */
export async function updateNotificationLog(
  tenantId: string,
  orderId: string,
  type: string,
  data: { provider?: string; messageId?: string }
): Promise<void> {
  await prisma.notificationLog.updateMany({
    where: { tenantId, orderId, type },
    data: {
      provider: data.provider ?? undefined,
      messageId: data.messageId ?? undefined,
    },
  });
}
