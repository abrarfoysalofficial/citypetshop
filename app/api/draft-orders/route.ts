import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/** POST /api/draft-orders - Auto-save draft (cart + partial shipping) */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sessionId = (await cookies()).get("__session")?.value ?? req.headers.get("x-session-id") ?? `anon-${Date.now()}`;
  const cartJson = body.cart ?? [];
  const shippingJson = body.shipping ?? null;
  const guestEmail = body.guestEmail as string | undefined;
  const guestPhone = body.guestPhone as string | undefined;
  const guestName = body.guestName as string | undefined;

  const now = new Date();
  await prisma.draftOrder.upsert({
    where: { sessionId },
    create: {
      sessionId,
      guestEmail,
      guestPhone,
      guestName,
      cartJson: Array.isArray(cartJson) ? cartJson : [],
      shippingJson,
      lastActivityAt: now,
    },
    update: {
      guestEmail: guestEmail ?? undefined,
      guestPhone: guestPhone ?? undefined,
      guestName: guestName ?? undefined,
      cartJson: Array.isArray(cartJson) ? cartJson : [],
      shippingJson: shippingJson ?? undefined,
      lastActivityAt: now,
    },
  });
  return NextResponse.json({ ok: true });
}
