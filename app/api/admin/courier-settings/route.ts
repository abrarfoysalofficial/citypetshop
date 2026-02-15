import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth, isDemoAuth } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/src/config/env";
import { z } from "zod";

const providerSchema = z.enum(["pathao", "steadfast", "redx"]);

const defaults = {
  providers: [
    { id: "pathao", name: "Pathao", enabled: true },
    { id: "steadfast", name: "Steadfast", enabled: true },
    { id: "redx", name: "RedX", enabled: true },
  ],
  defaultProvider: "pathao" as const,
  sandbox: true,
};

/** GET: Courier provider list. Returns demo data when Supabase not configured. */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isSupabaseConfigured()) {
    return NextResponse.json(defaults);
  }
  const supabase = await createClient();
  const [configsRes, settingsRes] = await Promise.all([
    supabase.from("courier_configs").select("provider, is_active").in("provider", ["pathao", "steadfast", "redx"]),
    supabase.from("site_settings").select("courier_default_provider, courier_sandbox").eq("id", "default").single(),
  ]);

  const configs = (configsRes.data || []) as { provider: string; is_active: boolean }[];
  const settings = settingsRes.data as { courier_default_provider?: string; courier_sandbox?: boolean } | null;

  const providerMap: Record<string, boolean> = { pathao: true, steadfast: true, redx: true };
  configs.forEach((c) => { providerMap[c.provider] = c.is_active; });

  const defaultProvider = providerSchema.safeParse(settings?.courier_default_provider).success
    ? settings!.courier_default_provider
    : defaults.defaultProvider;

  return NextResponse.json({
    providers: [
      { id: "pathao", name: "Pathao", enabled: providerMap.pathao !== false },
      { id: "steadfast", name: "Steadfast", enabled: providerMap.steadfast !== false },
      { id: "redx", name: "RedX", enabled: providerMap.redx !== false },
    ],
    defaultProvider,
    sandbox: settings?.courier_sandbox ?? defaults.sandbox,
  });
}

const patchSchema = z.object({
  defaultProvider: providerSchema.optional(),
  sandbox: z.boolean().optional(),
  providers: z.array(z.object({ id: providerSchema, enabled: z.boolean() })).optional(),
});

/** PATCH: Update default provider, sandbox, or provider enabled flags. */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isSupabaseConfigured()) {
    return NextResponse.json(defaults);
  }

  const body = await request.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();

  if (parsed.data.defaultProvider != null || parsed.data.sandbox != null) {
    const update: { courier_default_provider?: string; courier_sandbox?: boolean; updated_at?: string } = {
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.defaultProvider != null) update.courier_default_provider = parsed.data.defaultProvider;
    if (parsed.data.sandbox != null) update.courier_sandbox = parsed.data.sandbox;
    const { error } = await supabase.from("site_settings").update(update).eq("id", "default");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (parsed.data.providers?.length) {
    for (const p of parsed.data.providers) {
      const { error } = await supabase
        .from("courier_configs")
        .update({ is_active: p.enabled, updated_at: new Date().toISOString() })
        .eq("provider", p.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
