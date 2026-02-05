import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  event_name: z.string().min(1),
  event_id: z.string().optional(),
  source: z.enum(["browser", "server"]).default("browser"),
  page_url: z.string().optional(),
  referrer: z.string().optional(),
  session_id: z.string().optional(),
  payload_summary: z.record(z.unknown()).optional(),
  has_email_hash: z.boolean().optional(),
  has_phone_hash: z.boolean().optional(),
  has_fbp: z.boolean().optional(),
  has_fbc: z.boolean().optional(),
});

/** POST: Capture analytics event. Dedup by event_id if provided. */
export async function POST(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ ok: true });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const row = {
    event_name: parsed.data.event_name,
    event_id: parsed.data.event_id || null,
    source: parsed.data.source,
    page_url: parsed.data.page_url || null,
    referrer: parsed.data.referrer || null,
    session_id: parsed.data.session_id || null,
    payload_summary: parsed.data.payload_summary || null,
    has_email_hash: parsed.data.has_email_hash ?? false,
    has_phone_hash: parsed.data.has_phone_hash ?? false,
    has_fbp: parsed.data.has_fbp ?? false,
    has_fbc: parsed.data.has_fbc ?? false,
    user_agent: request.headers.get("user-agent") || null,
  };

  if (parsed.data.event_id) {
    const { data: existing } = await supabase.from("analytics_events").select("id").eq("event_id", parsed.data.event_id).single();
    if (existing) return NextResponse.json({ ok: true, deduped: true });
  }

  const { error } = await supabase.from("analytics_events").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
