import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

const MASKED = "••••••••";
const SECRET_KEYS: Record<string, string[]> = {
  sslcommerz: ["store_password"],
  bkash: ["app_secret", "password"],
  nagad: [],
  rocket: [],
  cod: [],
};

function maskCredentials(gateway: string, creds: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!creds || typeof creds !== "object") return creds;
  const keys = SECRET_KEYS[gateway] ?? [];
  const out = { ...creds };
  for (const k of keys) {
    if (k in out && out[k]) out[k] = MASKED;
  }
  return out;
}

function mergeCredentials(
  existing: Record<string, unknown> | null,
  updates: Record<string, unknown>,
  gateway: string
): Record<string, unknown> {
  const base = (existing && typeof existing === "object" ? { ...existing } : {}) as Record<string, unknown>;
  const keys = SECRET_KEYS[gateway] ?? [];
  for (const [k, v] of Object.entries(updates)) {
    if (v === MASKED || (keys.includes(k) && (v === "" || v == null))) continue;
    base[k] = v;
  }
  return base;
}

/**
 * GET /api/admin/payment-gateways
 * Admin: Prisma only. Masks secrets in credentials_json.
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const rows = await prisma.paymentGateway.findMany({
      orderBy: { gateway: "asc" },
    });
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
        gateway: r.gateway,
        is_active: r.isActive,
        display_name_en: r.displayNameEn,
        display_name_bn: r.displayNameBn,
        credentials_json: maskCredentials(r.gateway, r.credentialsJson as Record<string, unknown>),
      }))
    );
  } catch (err) {
    console.error("[api/admin/payment-gateways] Prisma error:", err);
    return NextResponse.json([]);
  }
}

/**
 * PATCH /api/admin/payment-gateways
 * Update a payment gateway. Prisma only.
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing gateway id" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if ("is_active" in updates) data.isActive = updates.is_active;
    if ("display_name_en" in updates) data.displayNameEn = updates.display_name_en;
    if ("display_name_bn" in updates) data.displayNameBn = updates.display_name_bn;
    if ("credentials_json" in updates) {
      const existing = await prisma.paymentGateway.findUnique({
        where: { id },
        select: { credentialsJson: true, gateway: true },
      });
      const merged = mergeCredentials(
        existing?.credentialsJson as Record<string, unknown> | null,
        (updates.credentials_json ?? {}) as Record<string, unknown>,
        existing?.gateway ?? ""
      );
      data.credentialsJson = merged;
    }

    const updated = await prisma.paymentGateway.update({
      where: { id },
      data,
    });
    return NextResponse.json({
      id: updated.id,
      created_at: updated.createdAt.toISOString(),
      updated_at: updated.updatedAt.toISOString(),
      gateway: updated.gateway,
      is_active: updated.isActive,
      display_name_en: updated.displayNameEn,
      display_name_bn: updated.displayNameBn,
      credentials_json: updated.credentialsJson,
    });
  } catch (err) {
    console.error("[api/admin/payment-gateways] PATCH unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
