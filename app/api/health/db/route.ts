/**
 * Dedicated DB health check endpoint.
 * Use for load balancers, monitoring, or DB-only probes.
 * Runs a simple SELECT 1 query.
 */
import { NextResponse } from "next/server";
import { checkDbConnectivity } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const hasDb = !!process.env.DATABASE_URL?.trim();
  if (!hasDb) {
    return NextResponse.json(
      { status: "skipped", message: "DATABASE_URL not set" },
      { status: 200 }
    );
  }

  const result = await checkDbConnectivity();

  if (result.ok) {
    return NextResponse.json({
      status: "ok",
      ok: true,
      database: "connected",
      latencyMs: result.ms,
      pingMs: result.ms,
      timestamp: new Date().toISOString(),
    });
  }

  const safeError =
    process.env.NODE_ENV === "production"
      ? "Database unreachable"
      : (result.error ?? "Unknown").replace(/postgresql:\/\/[^@]+@/i, "postgresql://***@");

  return NextResponse.json(
    {
      status: "error",
      ok: false,
      database: "disconnected",
      message: safeError,
      timestamp: new Date().toISOString(),
    },
    { status: 503 }
  );
}
