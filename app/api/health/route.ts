/**
 * Health check endpoint for load balancer / PM2 / CloudPanel.
 * Production: validates env, DB connectivity, auth config.
 * No PII or secrets in response.
 */
import { NextResponse } from "next/server";
import { validateProductionEnv } from "@lib/env-validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();

  if (process.env.NODE_ENV === "production") {
    const envCheck = validateProductionEnv();
    if (!envCheck.ok) {
      return NextResponse.json(
        {
          status: "error",
          ok: false,
          message: envCheck.message,
          timestamp,
          checks: { env: "fail", database: "skipped" },
        },
        { status: 503 }
      );
    }
  }

  const hasDb = !!process.env.DATABASE_URL?.trim();
  if (!hasDb) {
    return NextResponse.json({
      status: "ok",
      ok: true,
      timestamp,
      database: "skipped",
      checks: { env: "ok", database: "skipped" },
    });
  }

  try {
    const { checkDbConnectivity } = await import("@lib/db");
    const dbCheck = await checkDbConnectivity();
    if (!dbCheck.ok) throw new Error(dbCheck.error);

    return NextResponse.json({
      status: "ok",
      ok: true,
      timestamp,
      database: "connected",
      checks: { env: "ok", database: "ok" },
      dbPingMs: dbCheck.ms,
    });
  } catch (e) {
    const { logError } = await import("@lib/logger");
    const errName = e instanceof Error ? e.name : "Error";
    const errMsg = e instanceof Error ? e.message : String(e);
    logError("health", "DB check failed", {
      requestId: request.headers.get("x-request-id"),
      errorType: errName,
      errorCode: (e as { code?: string }).code ?? "unknown",
    });

    const safeMessage =
      process.env.NODE_ENV === "production"
        ? "Database unreachable"
        : errMsg.replace(/postgresql:\/\/[^@]+@/i, "postgresql://***@");

    return NextResponse.json(
      {
        status: "error",
        ok: false,
        database: "disconnected",
        timestamp,
        checks: { env: "ok", database: "fail" },
        message: safeMessage,
      },
      { status: 503 }
    );
  }
}
