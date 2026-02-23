import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPrismaConfigured } from "@/src/config/env";

export const dynamic = "force-dynamic";

const COD_FALLBACK = [{ gateway: "cod", display_name_en: "Cash on Delivery", display_name_bn: null }];

/**
 * GET /api/payment-gateways
 * Fetch only ACTIVE payment gateways (public route for checkout page).
 * Prisma mode: from DB. Else: COD fallback.
 */
export async function GET() {
  if (!isPrismaConfigured()) {
    return NextResponse.json(COD_FALLBACK);
  }
  try {
    const rows = await prisma.paymentGateway.findMany({
      where: { isActive: true },
      orderBy: { gateway: "asc" },
    });
    if (rows.length === 0) return NextResponse.json(COD_FALLBACK);
    return NextResponse.json(
      rows.map((r) => ({
        gateway: r.gateway,
        display_name_en: r.displayNameEn,
        display_name_bn: r.displayNameBn,
      }))
    );
  } catch (err) {
    console.error("payment-gateways Prisma error:", err);
    return NextResponse.json(COD_FALLBACK);
  }
}
