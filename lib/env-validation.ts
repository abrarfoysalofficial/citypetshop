/**
 * Strict env validation for production.
 * Call at app startup or in critical API routes.
 */
export function validateProductionEnv(): { ok: boolean; message?: string } {
  if (process.env.NODE_ENV !== "production") return { ok: true };

  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false, message: "DATABASE_URL is required in production" };
  }
  if (!process.env.NEXTAUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET.length < 32) {
    return { ok: false, message: "NEXTAUTH_SECRET must be set and at least 32 characters in production" };
  }
  if (!process.env.NEXTAUTH_URL?.trim()) {
    return { ok: false, message: "NEXTAUTH_URL is required in production" };
  }
  if (process.env.NODE_ENV === "production" && process.env.AUTH_TRUST_HOST !== "true") {
    return { ok: false, message: "AUTH_TRUST_HOST=true is required in production (reverse proxy)" };
  }
  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE ?? process.env.NEXT_PUBLIC_AUTH_SOURCE;
  if (authMode === "demo") {
    return { ok: false, message: "NEXT_PUBLIC_AUTH_MODE=demo is not allowed in production" };
  }
  return { ok: true };
}

/**
 * Validate MASTER_SECRET when SecureConfig is used (encrypted secrets).
 * Required in production for admin integrations (courier, etc.).
 */
export function validateMasterSecret(): { ok: boolean; message?: string } {
  if (process.env.NODE_ENV !== "production") return { ok: true };

  const raw = process.env.MASTER_SECRET?.trim();
  if (!raw || raw.length < 32) {
    return { ok: false, message: "MASTER_SECRET must be set and at least 32 characters in production" };
  }
  return { ok: true };
}
