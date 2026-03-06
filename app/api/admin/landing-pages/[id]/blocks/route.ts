import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** POST: Add a block to a landing page */
export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id: pageId } = await params;
  const body = await req.json().catch(() => ({}));

  const type = (body.type as string)?.trim();
  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  const configJson = body.configJson ?? {};
  const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;

  const block = await prisma.landingBlock.create({
    data: { pageId, type, configJson, sortOrder },
  });
  return NextResponse.json({ block });
}

/** PUT: Reorder blocks (accepts array of {id, sortOrder}) */
export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id: pageId } = await params;
  const body = await req.json().catch(() => ({}));
  const blocks = body.blocks as { id: string; sortOrder: number }[];
  if (!Array.isArray(blocks)) return NextResponse.json({ error: "blocks array required" }, { status: 400 });

  await prisma.$transaction(
    blocks.map((b) =>
      prisma.landingBlock.update({
        where: { id: b.id, pageId },
        data: { sortOrder: b.sortOrder },
      })
    )
  );
  return NextResponse.json({ ok: true });
}
