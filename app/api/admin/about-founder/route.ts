import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const founderSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bioEn: z.string().optional(),
  bioBn: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const founder = await prisma.aboutPageProfile.findUnique({
    where: { id: "founder" },
  });
  return NextResponse.json(founder ?? null);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const parsed = founderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors.map((e) => e.message).join("; ") }, { status: 400 });
  }

  const data = await prisma.aboutPageProfile.upsert({
    where: { id: "founder" },
    create: {
      id: "founder",
      name: parsed.data.name,
      title: parsed.data.title,
      bioEn: parsed.data.bioEn ?? null,
      bioBn: parsed.data.bioBn ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      whatsapp: parsed.data.whatsapp ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      isActive: parsed.data.isActive ?? true,
    },
    update: {
      name: parsed.data.name,
      title: parsed.data.title,
      bioEn: parsed.data.bioEn ?? null,
      bioBn: parsed.data.bioBn ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      whatsapp: parsed.data.whatsapp ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      isActive: parsed.data.isActive ?? true,
    },
  });
  return NextResponse.json(data);
}
