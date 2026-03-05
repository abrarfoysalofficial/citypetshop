/**
 * Site-wide constants. Change in one place for easy updates.
 * Email values can be overridden via env (NEXT_PUBLIC_CONTACT_EMAIL, etc.).
 */

/** Contact email for footer, contact page, support links. Override via NEXT_PUBLIC_CONTACT_EMAIL. */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@citypluspetshop.com";

/** Support email fallback when NEXT_PUBLIC_SUPPORT_EMAIL not set. */
export const DEFAULT_SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@citypetshop.bd";

/** Default from address when EMAIL_FROM not set. */
export const DEFAULT_EMAIL_FROM =
  process.env.EMAIL_FROM ?? "noreply@citypetshop.bd";
