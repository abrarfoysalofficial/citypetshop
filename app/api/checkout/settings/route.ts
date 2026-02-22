import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPrismaConfigured } from "@/src/config/env";
import { cacheHeaders } from "@/lib/cache";

const DEFAULTS = {
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 130,
  freeDeliveryThreshold: 2000,
  termsUrl: "/terms",
  privacyUrl: "/privacy",
};

/** GET: Delivery charges, policy URLs. Prisma or Supabase. */
export async function GET() {
  if (isPrismaConfigured()) {
    try {
      const s = await prisma.siteSettings.findUnique({
        where: { id: "default" },
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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(DEFAULTS, { headers: cacheHeaders("PRODUCT_LIST") });
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("delivery_inside_dhaka, delivery_outside_dhaka, free_delivery_threshold, terms_url, privacy_url")
    .eq("id", "default")
    .single();
  const row = data as { delivery_inside_dhaka?: number; delivery_outside_dhaka?: number; free_delivery_threshold?: number; terms_url?: string; privacy_url?: string } | null;
  return NextResponse.json(
    {
      deliveryInsideDhaka: row?.delivery_inside_dhaka ?? DEFAULTS.deliveryInsideDhaka,
      deliveryOutsideDhaka: row?.delivery_outside_dhaka ?? DEFAULTS.deliveryOutsideDhaka,
      freeDeliveryThreshold: row?.free_delivery_threshold ?? DEFAULTS.freeDeliveryThreshold,
      termsUrl: row?.terms_url || DEFAULTS.termsUrl,
      privacyUrl: row?.privacy_url || DEFAULTS.privacyUrl,
    },
    { headers: cacheHeaders("PRODUCT_LIST") }
  );
}
