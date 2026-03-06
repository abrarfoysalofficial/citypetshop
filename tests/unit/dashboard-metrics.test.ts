/**
 * Dashboard metrics: percentChange helper tests.
 */
import { percentChange } from "@lib/dashboard-metrics";

describe("percentChange", () => {
  it("returns 0 when both prev and current are 0", () => {
    expect(percentChange(0, 0)).toBe(0);
  });

  it("returns 100 when prev is 0 and current > 0", () => {
    expect(percentChange(100, 0)).toBe(100);
    expect(percentChange(1, 0)).toBe(100);
  });

  it("returns -100 when prev is 0 and current < 0", () => {
    expect(percentChange(-50, 0)).toBe(-100);
  });

  it("returns 10 when current is 10% higher than prev", () => {
    expect(percentChange(110, 100)).toBe(10);
  });

  it("returns -10 when current is 10% lower than prev", () => {
    expect(percentChange(90, 100)).toBe(-10);
  });

  it("returns 0 when current equals prev", () => {
    expect(percentChange(100, 100)).toBe(0);
  });

  it("rounds to 1 decimal place", () => {
    expect(percentChange(105, 100)).toBe(5);
    expect(percentChange(106, 100)).toBe(6);
    expect(percentChange(106.4, 100)).toBe(6.4);
    expect(percentChange(106.45, 100)).toBe(6.5);
  });
});
