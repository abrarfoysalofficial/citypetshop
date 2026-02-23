import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAuth, isDemoAuth } from "@/lib/admin-auth";
import { isPrismaConfigured } from "@/src/config/env";
import { z } from "zod";

export const dynamic = "force-dynamic";

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

/** GET: Courier provider list. Prisma only. */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isDemoAuth(auth) || !isPrismaConfigured()) {
    return NextResponse.json(defaults);
  }

  try {
    const configs = await prisma.courierConfig.findMany({
      where: { provider: { in: ["pathao", "steadfast", "redx"] } },
    });
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    const adv = (settings?.advancedSettings ?? {}) as { courier_default_provider?: string; courier_sandbox?: boolean };
    const providerMap: Record<string, boolean> = { pathao: true, steadfast: true, redx: true };
    configs.forEach((c) => { providerMap[c.provider] = c.isActive; });

    const defaultProvider = providerSchema.safeParse(adv.courier_default_provider).success
      ? adv.courier_default_provider
      : defaults.defaultProvider;

    return NextResponse.json({
      providers: [
        { id: "pathao", name: "Pathao", enabled: providerMap.pathao !== false },
        { id: "steadfast", name: "Steadfast", enabled: providerMap.steadfast !== false },
        { id: "redx", name: "RedX", enabled: providerMap.redx !== false },
      ],
      defaultProvider: defaultProvider ?? defaults.defaultProvider,
      sandbox: adv.courier_sandbox ?? defaults.sandbox,
    });
  } catch {
    return NextResponse.json(defaults);
  }
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

  if (isDemoAuth(auth) || !isPrismaConfigured()) {
    return NextResponse.json(defaults);
  }

  const body = await request.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    if (parsed.data.defaultProvider != null || parsed.data.sandbox != null) {
      const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
      const adv = (settings?.advancedSettings ?? {}) as Record<string, unknown>;
      if (parsed.data.defaultProvider != null) adv.courier_default_provider = parsed.data.defaultProvider;
      if (parsed.data.sandbox != null) adv.courier_sandbox = parsed.data.sandbox;
      const jsonAdv = adv as Prisma.InputJsonValue;
      await prisma.siteSettings.upsert({
        where: { id: "default" },
        create: { id: "default", advancedSettings: jsonAdv },
        update: { advancedSettings: jsonAdv },
      });
    }

    if (parsed.data.providers?.length) {
      for (const p of parsed.data.providers) {
        await prisma.courierConfig.upsert({
          where: { provider: p.id },
          create: { provider: p.id, isActive: p.enabled },
          update: { isActive: p.enabled },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[courier-settings] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
