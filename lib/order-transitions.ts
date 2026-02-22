/**
 * Strict payment_status and order status transitions.
 * Prevents invalid state changes (e.g. marking paid order as cancelled without refund).
 */

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";
export type OrderStatus =
  | "draft"
  | "pending"
  | "processing"
  | "shipped"
  | "handed_to_courier"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refund_requested"
  | "refunded"
  | "failed";

/** Allowed payment_status transitions. Key = from, Value = allowed to[] */
const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ["paid", "failed", "cancelled"],
  paid: ["refunded"],
  failed: ["pending"],
  cancelled: ["pending"],
  refunded: [],
};

/** Allowed order status transitions for paid orders (payment_status=paid). */
const ORDER_TRANSITIONS_WHEN_PAID: OrderStatus[] = [
  "processing",
  "shipped",
  "handed_to_courier",
  "delivered",
  "returned",
  "refund_requested",
  "refunded",
];

/** Can we set payment_status to newStatus when current is currentStatus? */
export function canTransitionPaymentStatus(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus
): boolean {
  const allowed = PAYMENT_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

/** Can we set order status when payment is paid? (No cancel without refund flow) */
export function canTransitionOrderStatusWhenPaid(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  if (newStatus === "cancelled") return false;
  return ORDER_TRANSITIONS_WHEN_PAID.includes(newStatus);
}
