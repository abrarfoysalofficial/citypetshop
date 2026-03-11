/**
 * Status check endpoint for deployment verification.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@lib/db");
      await prisma.$queryRaw`SELECT 1`;
      checks.database = "ok";
    } catch {
      checks.database = "error";
    }
  } else {
    checks.database = "skipped";
  }
  checks.auth =
    process.env.CLERK_SECRET_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      ? "configured"
      : "not configured";
  checks.upload = process.env.UPLOAD_DIR ? "configured" : "default";
  return NextResponse.json({
    status: "self-hosted",
    checks,
    timestamp: new Date().toISOString(),
  });
}
