/**
 * Invoice authorization tests: cross-user 404, owner access, admin access.
 */
import { canAccessInvoice } from "@/lib/invoice-auth";

describe("canAccessInvoice", () => {
  it("denies when userId is null (unauthenticated)", () => {
    const ctx = { userId: null, userRole: null };
    const order = { userId: "user-a" };
    expect(canAccessInvoice(ctx, order)).toBe(false);
  });

  it("denies when user requests another user's order (returns 404 in API)", () => {
    const ctx = { userId: "user-a", userRole: null };
    const order = { userId: "user-b" };
    expect(canAccessInvoice(ctx, order)).toBe(false);
  });

  it("allows when user requests own order", () => {
    const ctx = { userId: "user-a", userRole: null };
    const order = { userId: "user-a" };
    expect(canAccessInvoice(ctx, order)).toBe(true);
  });

  it("allows admin by role", () => {
    const ctx = { userId: "admin-1", userRole: "admin" };
    const order = { userId: "user-b" };
    expect(canAccessInvoice(ctx, order)).toBe(true);
  });

  it("allows super_admin role", () => {
    const ctx = { userId: "super-1", userRole: "super_admin" };
    const order = { userId: "user-x" };
    expect(canAccessInvoice(ctx, order)).toBe(true);
  });

  it("denies non-owner when order has no userId (guest order)", () => {
    const ctx = { userId: "user-a", userRole: null };
    const order = { userId: null };
    expect(canAccessInvoice(ctx, order)).toBe(false);
  });
});
