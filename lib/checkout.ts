/**
 * Checkout logic: delivery charge, voucher, totals.
 * Delivery: Inside Dhaka 70 BDT, Outside Dhaka 130 BDT.
 * Admin can add weight-based logic later via site_settings.
 */

export const DELIVERY_INSIDE_DHAKA = 70;
export const DELIVERY_OUTSIDE_DHAKA = 130;

export type ShippingCity = "inside_dhaka" | "outside_dhaka";

export interface CheckoutSummary {
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  total: number;
  voucherCode: string | null;
  voucherError: string | null;
}

export function getDeliveryCharge(city: ShippingCity): number {
  return city === "inside_dhaka" ? DELIVERY_INSIDE_DHAKA : DELIVERY_OUTSIDE_DHAKA;
}

export function calculateCheckout(
  subtotal: number,
  city: ShippingCity,
  voucherDiscount: number = 0,
  overrides?: { inside?: number; outside?: number }
): Omit<CheckoutSummary, "voucherCode" | "voucherError"> {
  const inside = overrides?.inside ?? DELIVERY_INSIDE_DHAKA;
  const outside = overrides?.outside ?? DELIVERY_OUTSIDE_DHAKA;
  const deliveryCharge = city === "inside_dhaka" ? inside : outside;
  const total = Math.max(0, subtotal + deliveryCharge - voucherDiscount);
  return {
    subtotal,
    deliveryCharge,
    discountAmount: voucherDiscount,
    total,
  };
}
