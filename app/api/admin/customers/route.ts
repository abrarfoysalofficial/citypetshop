/**
 * GET  /api/admin/customers  — list customers with optional search/filter
 * POST /api/admin/customers  — create or upsert a customer record
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") ?? "50", 10));
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { lastOrderAt: "desc" },
      include: {
        reminders: {
          select: { id: true, type: true, status: true, scheduledAt: true },
          orderBy: { scheduledAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({ customers, total, page, pageSize });
}

const CreateCustomerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateCustomerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { email, phone, name, userId, metadata } = parsed.data;

  if (!email && !phone) {
    return NextResponse.json({ error: "email or phone is required" }, { status: 400 });
  }

  const customer = await prisma.customer.upsert({
    where: email ? { email } : { phone: phone! },
    create: { email, phone, name, userId, metadata: (metadata ?? {}) as object },
    update: { name: name ?? undefined, userId: userId ?? undefined, metadata: metadata as object | undefined },
  });

  return NextResponse.json(customer, { status: 201 });
}
