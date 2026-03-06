/**
 * GET   /api/admin/customers/[id]  — customer detail with recent orders
 * PATCH /api/admin/customers/[id]  — update customer fields
 */
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      reminders: {
        orderBy: { scheduledAt: "desc" },
        take: 20,
      },
    },
  });

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  // Fetch recent orders via phone or email
  const tenantId = getDefaultTenantId();
  const orderWhere =
    customer.phone
      ? { tenantId, guestPhone: { contains: customer.phone.replace(/\D/g, "").slice(-10) } }
      : customer.email
      ? { tenantId, guestEmail: customer.email }
      : { tenantId, id: "00000000-0000-0000-0000-000000000000" }; // No match when neither phone nor email

  const recentOrders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      guestName: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ ...customer, recentOrders });
}

const PatchCustomerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PatchCustomerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      metadata: parsed.data.metadata as object | undefined,
    },
  });

  return NextResponse.json(customer);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
