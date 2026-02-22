/**
 * GET  /api/admin/expenses — list
 * POST /api/admin/expenses — create
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const categories = ["rent", "utilities", "inventory", "marketing", "payroll", "other"] as const;

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const category = request.nextUrl.searchParams.get("category");

  const where: { date?: { gte?: Date; lte?: Date }; category?: string } = {};
  if (from) where.date = { ...where.date, gte: new Date(from) };
  if (to) where.date = { ...where.date, lte: new Date(to) };
  if (category) where.category = category;

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    take: 500,
  });

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return NextResponse.json({ expenses, total });
}

const createSchema = z.object({
  category: z.enum(categories),
  amount: z.number().min(0),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      createdBy: auth.email,
    },
  });
  return NextResponse.json(expense, { status: 201 });
}
