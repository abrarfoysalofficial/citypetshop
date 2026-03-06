/**
 * POST /api/admin/settings/security/change-password
 * Change password for the authenticated admin user.
 * Requires current password, validates new password, securely hashes.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";
import { prisma } from "@lib/db";
import { compare, hash } from "bcryptjs";
import { createAuditLog } from "@lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const MIN_LENGTH = 12;
const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(MIN_LENGTH, `New password must be at least ${MIN_LENGTH} characters`),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.newPassword?.[0]
      ?? parsed.error.flatten().fieldErrors.currentPassword?.[0]
      ?? "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must be different from current password" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { passwordHash: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }

  const passwordHash = await hash(newPassword, 12);
  await prisma.user.update({
    where: { id: auth.userId },
    data: { passwordHash },
  });

  await createAuditLog({
    userId: auth.userId,
    action: "update",
    resource: "user",
    resourceId: auth.userId,
    newValues: { field: "password", changedAt: new Date().toISOString() },
  });

  return NextResponse.json({ success: true, message: "Password changed successfully" });
}
