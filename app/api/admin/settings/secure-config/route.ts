import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuthAndPermission } from "@lib/admin-auth";
import { encryptSecret, maskSecret } from "@lib/crypto/secrets";
import { validateMasterSecret } from "@lib/env-validation";
import { logError } from "@lib/logger";
import { assertBodySize } from "@lib/request-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BODY_LIMIT_BYTES = 16 * 1024; // 16KB

import { ALLOWED_SECURE_KEYS } from "@lib/courier/key-registry";

const ALLOWED_KEYS = ALLOWED_SECURE_KEYS;

const updateSchema = z.object({
  key: z.enum(ALLOWED_KEYS as unknown as [string, ...string[]]),
  value: z.string().min(1),
});

/** GET: List masked secure config keys. Never returns decrypted values. */
export async function GET() {
  const auth = await requireAdminAuthAndPermission("settings.edit");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const masterCheck = validateMasterSecret();
  if (!masterCheck.ok) {
    return NextResponse.json(
      { error: "Secure config unavailable", details: masterCheck.message },
      { status: 503 }
    );
  }

  try {
    const tenantId = getDefaultTenantId();
    const configs = await prisma.secureConfig.findMany({
      where: { tenantId },
      select: { key: true, valueLen: true, updatedAt: true },
    });

    const masked = configs.map((c) => {
      const len = c.valueLen ?? 0;
      const placeholder = len > 0 ? "x".repeat(Math.min(len, 32)) : "";
      return {
        key: c.key,
        masked: maskSecret(placeholder),
        length: len,
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ keys: masked });
  } catch (err) {
    logError("admin/secure-config", "GET failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

/** POST: Create or update a secure config key. Value is encrypted at rest. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuthAndPermission("settings.edit");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const masterCheck = validateMasterSecret();
  if (!masterCheck.ok) {
    return NextResponse.json(
      { error: "Secure config unavailable", details: masterCheck.message },
      { status: 503 }
    );
  }

  const sizeCheck = assertBodySize(request, BODY_LIMIT_BYTES);
  if (sizeCheck) return sizeCheck;

  const body = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const tenantId = getDefaultTenantId();
  const { key, value } = parsed.data;

  try {
    const valueEnc = encryptSecret(value);
    const valueLen = value.length;

    const existing = await prisma.secureConfig.findUnique({
      where: { tenantId_key: { tenantId, key } },
    });

    await prisma.$transaction([
      prisma.secureConfig.upsert({
        where: { tenantId_key: { tenantId, key } },
        create: { tenantId, key, valueEnc, valueLen },
        update: { valueEnc, valueLen },
      }),
      prisma.secureConfigAuditLog.create({
        data: {
          tenantId,
          userId: auth.userId,
          key,
          action: existing ? "updated" : "created",
        },
      }),
    ]);

    return NextResponse.json({ ok: true, key });
  } catch (err) {
    logError("admin/secure-config", "POST failed", {
      error: err instanceof Error ? err.message : "unknown",
      key,
    });
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
