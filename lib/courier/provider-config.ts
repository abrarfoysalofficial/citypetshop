/**
 * Provider config — checks if provider is enabled and has credentials.
 * Server-only.
 */
import { getSecret } from "@lib/secure-config-loader";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { COURIER_SECURE_KEYS, type CourierProvider } from "./key-registry";

export async function isProviderConfigured(
  tenantId: string,
  provider: CourierProvider
): Promise<boolean> {
  const keys = COURIER_SECURE_KEYS[provider];
  for (const key of keys) {
    const val = await getSecret(tenantId, key);
    if (!val?.trim()) return false;
  }
  return true;
}

export async function getActiveCourierProvider(tenantId: string): Promise<CourierProvider | "none"> {
  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
    select: { advancedSettings: true },
  });
  const adv = (settings?.advancedSettings ?? {}) as { activeCourierProvider?: string };
  const v = adv.activeCourierProvider;
  if (v === "pathao" || v === "steadfast" || v === "redx") return v;
  return "none";
}

export async function isProviderEnabled(_tenantId: string, provider: CourierProvider): Promise<boolean> {
  const cfg = await prisma.courierConfig.findUnique({ where: { provider } });
  return cfg?.isActive ?? false;
}

export async function getCourierSandbox(tenantId: string): Promise<boolean> {
  const settings = await prisma.tenantSettings.findUnique({
    where: { tenantId },
    select: { advancedSettings: true },
  });
  const adv = (settings?.advancedSettings ?? {}) as { courier_sandbox?: boolean };
  return adv.courier_sandbox ?? true;
}
