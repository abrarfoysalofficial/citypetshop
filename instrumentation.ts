/**
 * Next.js Instrumentation hook — runs once at server startup.
 * Validates required environment variables before accepting any requests.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NODE_ENV !== "production") return;

  const { validateProductionEnv } = await import("@/lib/env-validation");
  const result = validateProductionEnv();

  if (!result.ok) {
    // Log clearly — PM2 will capture this in error logs
    console.error("═══════════════════════════════════════════════════");
    console.error("  FATAL: Production environment validation failed");
    console.error(`  Reason: ${result.message}`);
    console.error("  Fix the missing env variables and restart the app.");
    console.error("═══════════════════════════════════════════════════");
    // Allow PM2 to restart; do NOT crash so health endpoint can still respond
  } else {
    console.info("[startup] Environment validated ✓");
  }
}
