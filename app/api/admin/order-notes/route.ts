import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@lib/admin-auth";
import { prisma } from "@lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

/** GET /api/admin/order-notes?orderId=xxx */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ notes: [] });

  try {
    const notes = await prisma.orderNote.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        type: true,
        visibility: true,
        message: true,
        createdBy: true,
      },
    });
    return NextResponse.json({ notes });
  } catch (err) {
    console.error("order-notes GET error:", err);
    return NextResponse.json({ notes: [] });
  }
}

const postSchema = z.object({
  orderId: z.string().min(1),
  type: z.enum(["admin", "courier", "system"]).default("admin"),
  visibility: z.enum(["public", "internal", "admin"]).default("internal"),
  message: z.string().min(1).max(2000),
});

/** POST /api/admin/order-notes */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = postSchema.parse(await request.json());

    const note = await prisma.orderNote.create({
      data: {
        orderId: body.orderId,
        type: body.type,
        visibility: body.visibility,
        message: body.message,
        createdBy: auth.email,
      },
      select: {
        id: true,
        createdAt: true,
        type: true,
        visibility: true,
        message: true,
        createdBy: true,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("order-notes POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
