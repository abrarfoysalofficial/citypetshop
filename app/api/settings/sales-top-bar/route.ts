import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const DEFAULT =
  "City Plus Pet Shop — 100% Authentic Pet Supplies • Fast Delivery • Best Price Guarantee • Hotline: 01643-390045";

/** Public API: Sales top bar text and enabled flag (admin editable). */
export async function GET() {
  try {
    const s = await prisma.tenantSettings.findUnique({
      where: { tenantId: getDefaultTenantId() },
      select: { salesTopBarText: true, salesTopBarEnabled: true },
    });
    const enabled = s?.salesTopBarEnabled ?? true;
    const text = s?.salesTopBarText?.trim() || DEFAULT;
    return NextResponse.json({ text, enabled });
  } catch {
    return NextResponse.json({ text: DEFAULT, enabled: true });
  }
}
