import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

/** GET: List reminders with filtering */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "";
  const type = searchParams.get("type") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const [reminders, total] = await Promise.all([
    prisma.reminder.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { scheduledAt: "desc" },
      include: { customer: { select: { id: true, name: true, email: true, phone: true } } },
    }),
    prisma.reminder.count({ where }),
  ]);

  return NextResponse.json({
    reminders: reminders.map((r) => ({
      id: r.id,
      customerId: r.customerId,
      customerName: r.customer?.name,
      customerEmail: r.customer?.email,
      customerPhone: r.customer?.phone,
      type: r.type,
      channel: r.channel,
      scheduledAt: r.scheduledAt.toISOString(),
      status: r.status,
      templateId: r.templateId,
      metadata: r.metadata,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  });
}

const CreateReminderSchema = z.object({
  customerId: z.string().uuid(),
  type: z.enum(["cart_abandonment", "order_followup", "review_request"]),
  channel: z.enum(["sms", "email", "whatsapp"]),
  scheduledAt: z.union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)]),
  templateId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** POST: Create reminder */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateReminderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: parsed.data.customerId } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      customerId: parsed.data.customerId,
      type: parsed.data.type,
      channel: parsed.data.channel,
      scheduledAt: new Date(parsed.data.scheduledAt),
      templateId: parsed.data.templateId ?? null,
      metadata: (parsed.data.metadata ?? {}) as object,
      status: "pending",
    },
    include: { customer: { select: { name: true, email: true, phone: true } } },
  });

  return NextResponse.json({
    id: reminder.id,
    customerId: reminder.customerId,
    type: reminder.type,
    channel: reminder.channel,
    scheduledAt: reminder.scheduledAt.toISOString(),
    status: reminder.status,
  });
}
