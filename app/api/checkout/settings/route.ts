import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { isPrismaConfigured } from "@/src/config/env";
import { cacheHeaders } from "@lib/cache";

const DEFAULTS = {
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 130,
  freeDeliveryThreshold: 2000,
  termsUrl: "/terms",
  privacyUrl: "/privacy",
};

/** GET: Delivery charges, policy URLs. Prisma TenantSettings. */
export async function GET() {
  if (isPrismaConfigured()) {
    try {
      const s = await prisma.tenantSettings.findUnique({
        where: { tenantId: getDefaultTenantId() },
      });
      return NextResponse.json(
        {
          deliveryInsideDhaka: s?.deliveryInsideDhaka ? Number(s.deliveryInsideDhaka) : DEFAULTS.deliveryInsideDhaka,
          deliveryOutsideDhaka: s?.deliveryOutsideDhaka ? Number(s.deliveryOutsideDhaka) : DEFAULTS.deliveryOutsideDhaka,
          freeDeliveryThreshold: s?.freeDeliveryThreshold ? Number(s.freeDeliveryThreshold) : DEFAULTS.freeDeliveryThreshold,
          termsUrl: s?.termsUrl || DEFAULTS.termsUrl,
          privacyUrl: s?.privacyUrl || DEFAULTS.privacyUrl,
        },
        { headers: cacheHeaders("PRODUCT_LIST") }
      );
    } catch {
      return NextResponse.json(DEFAULTS, { headers: cacheHeaders("PRODUCT_LIST") });
    }
  }

  return NextResponse.json(DEFAULTS, { headers: cacheHeaders("PRODUCT_LIST") });
}
