import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const memberSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  bioEn: z.string().optional(),
  bioBn: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors.map((e) => e.message).join("; ") }, { status: 400 });
  }

  const data = await prisma.teamMember.update({
    where: { id },
    data: {
      ...(parsed.data.name != null && { name: parsed.data.name }),
      ...(parsed.data.title != null && { title: parsed.data.title }),
      ...(parsed.data.bioEn != null && { bioEn: parsed.data.bioEn }),
      ...(parsed.data.bioBn != null && { bioBn: parsed.data.bioBn }),
      ...(parsed.data.email != null && { email: parsed.data.email }),
      ...(parsed.data.phone != null && { phone: parsed.data.phone }),
      ...(parsed.data.whatsapp != null && { whatsapp: parsed.data.whatsapp }),
      ...(parsed.data.imageUrl != null && { imageUrl: parsed.data.imageUrl }),
      ...(parsed.data.sortOrder != null && { sortOrder: parsed.data.sortOrder }),
      ...(parsed.data.isActive != null && { isActive: parsed.data.isActive }),
    },
  });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await params;
  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
