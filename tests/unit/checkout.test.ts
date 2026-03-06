import { getDeliveryCharge, calculateCheckout, type ShippingCity } from "@lib/checkout";

describe("Checkout: delivery charge", () => {
  it("returns 70 for inside Dhaka", () => {
    expect(getDeliveryCharge("inside_dhaka")).toBe(70);
  });

  it("returns 130 for outside Dhaka", () => {
    expect(getDeliveryCharge("outside_dhaka")).toBe(130);
  });
});

describe("Checkout: calculateCheckout", () => {
  it("computes total = subtotal + delivery - voucher", () => {
    const r = calculateCheckout(1000, "inside_dhaka", 0);
    expect(r.subtotal).toBe(1000);
    expect(r.deliveryCharge).toBe(70);
    expect(r.discountAmount).toBe(0);
    expect(r.total).toBe(1070);
  });

  it("applies voucher discount", () => {
    const r = calculateCheckout(500, "outside_dhaka", 50);
    expect(r.subtotal).toBe(500);
    expect(r.deliveryCharge).toBe(130);
    expect(r.discountAmount).toBe(50);
    expect(r.total).toBe(580);
  });

  it("does not go below zero", () => {
    const r = calculateCheckout(100, "inside_dhaka", 200);
    expect(r.total).toBe(0);
  });
});
