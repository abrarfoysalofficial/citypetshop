import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string; blockId: string }> };

/** PATCH: Update block config */
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { blockId } = await params;
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (body.configJson !== undefined) data.configJson = body.configJson;
  if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
  if (typeof body.type === "string") data.type = body.type;

  const block = await prisma.landingBlock.update({ where: { id: blockId }, data });
  return NextResponse.json({ block });
}

/** DELETE: Remove a block */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { blockId } = await params;
  await prisma.landingBlock.delete({ where: { id: blockId } });
  return NextResponse.json({ ok: true });
}
