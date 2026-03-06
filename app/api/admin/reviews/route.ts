import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";
import { prisma } from "@lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({ id: z.string(), status: z.enum(["approved", "rejected"]) });

/** PATCH: Update review status (approve/reject). */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await prisma.productReview.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ success: true });
}
