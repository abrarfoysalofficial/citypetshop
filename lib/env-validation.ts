/**
 * Strict env validation for production.
 * Call at app startup or in critical API routes.
 */
export function validateProductionEnv(): { ok: boolean; message?: string } {
  if (process.env.NODE_ENV !== "production") return { ok: true };

  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: false, message: "DATABASE_URL is required in production" };
  }
  const publishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  if (!publishable && !secret) {
    return {
      ok: false,
      message:
        "Clerk is not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY (or keyless-compatible envs) in production.",
    };
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
