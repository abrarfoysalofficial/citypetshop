/**
 * GET   /api/admin/conversations/[id]  — full conversation with all messages
 * PATCH /api/admin/conversations/[id]  — update status (close/escalate)
 * POST  /api/admin/conversations/[id]  — send a human reply message
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(conversation);
}

const PatchSchema = z.object({
  status: z.enum(["open", "escalated", "closed"]),
  resolvedBy: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const conversation = await prisma.conversation.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      resolvedBy: parsed.data.resolvedBy,
    },
  });

  return NextResponse.json(conversation);
}

const ReplySchema = z.object({
  content: z.string().min(1).max(5000),
  /** If true and OPENAI_API_KEY is configured, generate an AI draft reply instead */
  aiDraft: z.boolean().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = ReplySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // AI draft: generate a reply suggestion using the conversation history
  if (parsed.data.aiDraft && process.env.OPENAI_API_KEY) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    });
    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
      const apiMessages = [
        {
          role: "system",
          content:
            "You are a helpful customer support agent for City Plus Pet Shop, a Bangladeshi pet supplies store. " +
            "Reply professionally, briefly, and in the same language as the customer. " +
            "Keep responses under 150 words.",
        },
        ...conversation.messages.map((m) => ({
          role: m.role === "user" ? "user" : ("assistant" as const),
          content: m.content,
        })),
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL ?? "gpt-4o-mini",
          messages: apiMessages,
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { choices?: { message?: { content?: string } }[] };
        const aiContent = data.choices?.[0]?.message?.content?.trim();
        if (aiContent) {
          return NextResponse.json({ draft: aiContent, saved: false });
        }
      }
    } catch (err) {
      console.error("[conversations] AI draft failed:", err);
    }
    return NextResponse.json({ error: "AI draft unavailable" }, { status: 503 });
  }

  const message = await prisma.conversationMessage.create({
    data: {
      conversationId: params.id,
      role: "human",
      content: parsed.data.content,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
