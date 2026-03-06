import { NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";
import { validateProductionEnv } from "@lib/env-validation";
import os from "os";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_MAX_AGE = 60; // seconds
let cached: { data: SystemHealthResponse; at: number } | null = null;

export type SystemHealthResponse = {
  database: "connected" | "disconnected" | "skipped";
  prismaStatus: "ok" | "error" | "skipped";
  env: "ok" | "error";
  envMessage?: string;
  emailConfigured: boolean;
  smsConfigured: boolean;
  memoryUsageMB: { heapUsed: number; rss: number; external: number };
  systemMemoryMB: { free: number; total: number };
  diskFreeMB: number | null;
  uptimeSeconds: number;
  nodeVersion: string;
  buildVersion: string;
  timestamp: string;
  courier?: {
    activeProvider: string;
    providerEnabled: Record<string, boolean>;
    providerConfigured: Record<string, boolean>;
    sandboxMode: boolean;
    lastBookingAt: string | null;
    lastFailureAt: string | null;
  };
};

async function fetchSystemHealth(): Promise<SystemHealthResponse> {
  const hasDb = !!process.env.DATABASE_URL?.trim();
  let database: SystemHealthResponse["database"] = "skipped";
  let prismaStatus: SystemHealthResponse["prismaStatus"] = "skipped";

  if (hasDb) {
    try {
      const { prisma } = await import("@lib/db");
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";
      prismaStatus = "ok";
    } catch {
      database = "disconnected";
      prismaStatus = "error";
    }
  }

  const envCheck = validateProductionEnv();
  const env = envCheck.ok ? "ok" : "error";

  const emailConfigured = !!process.env.RESEND_API_KEY?.trim();
  const smsConfigured = !!(
    process.env.BULK_SMS_BD_API_KEY?.trim() ||
    (process.env.TWILIO_ACCOUNT_SID?.trim() && process.env.TWILIO_AUTH_TOKEN?.trim())
  );

  const mem = process.memoryUsage();
  const memoryUsageMB = {
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    rss: Math.round(mem.rss / 1024 / 1024),
    external: Math.round((mem.external || 0) / 1024 / 1024),
  };

  const systemMemoryMB = {
    free: Math.round(os.freemem() / 1024 / 1024),
    total: Math.round(os.totalmem() / 1024 / 1024),
  };

  let diskFreeMB: number | null = null;
  if (os.platform() === "linux" || os.platform() === "darwin") {
    try {
      const { execSync } = await import("child_process");
      const out = execSync("df -BM . 2>/dev/null | tail -1 | awk '{print $4}'", {
        encoding: "utf8",
        timeout: 2000,
      });
      const val = parseInt(out.trim().replace("M", ""), 10);
      if (!Number.isNaN(val)) diskFreeMB = val;
    } catch {
      // df failed
    }
  }

  let buildVersion = "0.1.0";
  try {
    const path = await import("path");
    const fs = await import("fs");
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version?: string };
    buildVersion = pkg.version ?? buildVersion;
  } catch {
    // fallback
  }

  let courier: SystemHealthResponse["courier"];
  if (hasDb) {
    try {
      const { prisma } = await import("@lib/db");
      const { getDefaultTenantId } = await import("@lib/tenant");
      const { isProviderConfigured } = await import("@lib/courier/provider-config");
      const tenantId = getDefaultTenantId();

      const settings = await prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { advancedSettings: true },
      });
      const adv = (settings?.advancedSettings ?? {}) as {
        activeCourierProvider?: string;
        courier_sandbox?: boolean;
      };
      const activeProvider = adv.activeCourierProvider ?? "pathao";
      const sandboxMode = adv.courier_sandbox ?? true;

      const configs = await prisma.courierConfig.findMany({
        where: { provider: { in: ["pathao", "steadfast", "redx"] } },
      });
      const providerEnabled: Record<string, boolean> = { pathao: true, steadfast: true, redx: true };
      configs.forEach((c) => { providerEnabled[c.provider] = c.isActive; });

      const providerConfigured: Record<string, boolean> = {};
      for (const p of ["pathao", "steadfast", "redx"] as const) {
        providerConfigured[p] = await isProviderConfigured(tenantId, p);
      }

      const lastBooking = await prisma.courierBookingLog.findFirst({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });

      courier = {
        activeProvider,
        providerEnabled,
        providerConfigured,
        sandboxMode,
        lastBookingAt: lastBooking?.createdAt?.toISOString() ?? null,
        lastFailureAt: null,
      };
    } catch {
      courier = undefined;
    }
  } else {
    courier = undefined;
  }

  return {
    database,
    prismaStatus,
    env,
    envMessage: envCheck.ok ? undefined : envCheck.message,
    emailConfigured,
    smsConfigured,
    memoryUsageMB,
    systemMemoryMB,
    diskFreeMB,
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    buildVersion,
    timestamp: new Date().toISOString(),
    courier,
  };
}

/** GET: System health — admin only. 60s cache. No secrets. */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const now = Date.now();
  if (cached && now - cached.at < CACHE_MAX_AGE * 1000) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": `private, max-age=${CACHE_MAX_AGE}`,
      },
    });
  }

  try {
    const data = await fetchSystemHealth();
    cached = { data, at: now };
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `private, max-age=${CACHE_MAX_AGE}`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        database: "unknown",
        prismaStatus: "error",
        env: "unknown",
        error: "Failed to fetch system health",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
