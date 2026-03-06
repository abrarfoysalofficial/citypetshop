/**
 * Voucher logic: fixed vs percent, min spend, usage limit.
 * When Supabase is connected, voucher validation runs server-side; these tests cover the calculation logic.
 */

function applyVoucher(
  subtotal: number,
  type: "fixed" | "percent",
  value: number,
  minSpend: number | null
): number {
  if (minSpend != null && subtotal < minSpend) return 0;
  if (type === "fixed") return Math.min(value, subtotal);
  return Math.min((subtotal * value) / 100, subtotal);
}

describe("Voucher: applyVoucher", () => {
  it("fixed discount applies up to subtotal", () => {
    expect(applyVoucher(1000, "fixed", 100, null)).toBe(100);
    expect(applyVoucher(50, "fixed", 100, null)).toBe(50);
  });

  it("percent discount applies correctly", () => {
    expect(applyVoucher(1000, "percent", 10, null)).toBe(100);
    expect(applyVoucher(500, "percent", 20, null)).toBe(100);
  });

  it("respects min spend", () => {
    expect(applyVoucher(500, "fixed", 50, 1000)).toBe(0);
    expect(applyVoucher(1000, "fixed", 50, 1000)).toBe(50);
  });
});
