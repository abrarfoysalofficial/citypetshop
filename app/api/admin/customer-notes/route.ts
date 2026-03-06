/**
 * GET  /api/admin/customer-notes?customerId=xxx
 * POST /api/admin/customer-notes
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const customerId = request.nextUrl.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ notes: [] });

  const notes = await prisma.customerNote.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notes });
}

const postSchema = z.object({
  customerId: z.string().uuid(),
  message: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = postSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const note = await prisma.customerNote.create({
    data: {
      customerId: parsed.data.customerId,
      message: parsed.data.message,
      createdBy: auth.email,
    },
  });
  return NextResponse.json(note, { status: 201 });
}
