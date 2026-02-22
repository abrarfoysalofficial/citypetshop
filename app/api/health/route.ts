/**
 * Health check endpoint for Docker/load balancer.
 * Skips DB check when DATABASE_URL is not set (Supabase/local mode).
 * In production, validates NEXTAUTH_SECRET.
 */
import { NextResponse } from "next/server";
import { validateProductionEnv } from "@/lib/env-validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    const envCheck = validateProductionEnv();
    if (!envCheck.ok) {
      return NextResponse.json(
        { status: "error", message: envCheck.message },
        { status: 503 }
      );
    }
  }

  const hasDb = !!process.env.DATABASE_URL;
  if (!hasDb) {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "skipped",
    });
  }
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (e) {
    console.error("[health] DB check failed:", e);
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 503 }
    );
  }
}
