import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdminAuth } from "@lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  status: z.enum(["pending", "sent", "failed", "cancelled"]).optional(),
  scheduledAt: z.string().datetime().optional(),
});

/** PATCH: Update reminder (e.g. mark done) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  const update: { status?: string; scheduledAt?: Date } = {};
  if (parsed.data.status !== undefined) update.status = parsed.data.status;
  if (parsed.data.scheduledAt !== undefined) update.scheduledAt = new Date(parsed.data.scheduledAt);

  const updated = await prisma.reminder.update({
    where: { id },
    data: update,
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    scheduledAt: updated.scheduledAt.toISOString(),
  });
}

/** DELETE: Remove reminder */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });

  const { id } = await params;

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  await prisma.reminder.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
