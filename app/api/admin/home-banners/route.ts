import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const data = await prisma.homeBanner.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const data = await prisma.homeBanner.create({
    data: {
      imageUrl: body.imageUrl ?? "",
      titleEn: body.titleEn ?? null,
      titleBn: body.titleBn ?? null,
      link: body.link ?? null,
      ctaText: body.ctaText ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await request.json().catch(() => ({}));
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const data = await prisma.homeBanner.update({
    where: { id },
    data: {
      ...(updates.imageUrl != null && { imageUrl: updates.imageUrl }),
      ...(updates.titleEn != null && { titleEn: updates.titleEn }),
      ...(updates.titleBn != null && { titleBn: updates.titleBn }),
      ...(updates.link != null && { link: updates.link }),
      ...(updates.ctaText != null && { ctaText: updates.ctaText }),
      ...(updates.sortOrder != null && { sortOrder: updates.sortOrder }),
      ...(updates.isActive != null && { isActive: updates.isActive }),
    },
  });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.homeBanner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
