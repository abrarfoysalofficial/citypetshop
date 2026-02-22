import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const slides = await prisma.homeBannerSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(slides);
}

const slideSchema = z.object({
  imageUrl: z.string().url().or(z.string().startsWith("/")),
  titleEn: z.string().optional(),
  titleBn: z.string().optional(),
  link: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = slideSchema.parse(await request.json());
    const slide = await prisma.homeBannerSlide.create({ data: body });
    return NextResponse.json(slide, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = slideSchema.extend({ id: z.string() }).parse(await request.json());
    const { id, ...data } = body;
    const slide = await prisma.homeBannerSlide.update({ where: { id }, data });
    return NextResponse.json(slide);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.homeBannerSlide.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
