/**
 * Invoice access authorization logic (testable).
 * Used by /api/invoice route.
 */

const ADMIN_ROLES = ["admin", "adm", "super_admin"];

export interface InvoiceAuthContext {
  userId: string | null;
  userRole: string | null;
}

export interface OrderForAuth {
  userId: string | null;
}

/**
 * Returns true if the user may access the invoice for the given order.
 * - Admin (session role): always allowed (tenant scope enforced by caller)
 * - Non-admin: only if order.userId === session.userId
 */
export function canAccessInvoice(ctx: InvoiceAuthContext, order: OrderForAuth): boolean {
  if (ctx.userRole && ADMIN_ROLES.includes(ctx.userRole)) {
    return true;
  }
  if (!ctx.userId) {
    return false;
  }
  return order.userId === ctx.userId;
}
