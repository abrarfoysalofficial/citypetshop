/**
 * Server-only SecureConfig loader. Decrypts secrets at runtime.
 * 60s cache to reduce DB hits. Never expose to client.
 */
import { prisma } from "@lib/db";
import { decryptSecret } from "@lib/crypto/secrets";
import { validateMasterSecret } from "@lib/env-validation";

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, { value: string; expires: number }>();

export async function getSecret(tenantId: string, key: string): Promise<string | null> {
  const masterCheck = validateMasterSecret();
  if (!masterCheck.ok) return null;

  const cacheKey = `${tenantId}:${key}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.value;
  }

  try {
    const row = await prisma.secureConfig.findUnique({
      where: { tenantId_key: { tenantId, key } },
      select: { valueEnc: true },
    });
    if (!row?.valueEnc) return null;

    const value = decryptSecret(row.valueEnc);
    cache.set(cacheKey, { value, expires: Date.now() + CACHE_TTL_MS });
    return value;
  } catch {
    return null;
  }
}

export function clearSecretCache(tenantId?: string, key?: string): void {
  if (!tenantId && !key) {
    cache.clear();
    return;
  }
  if (tenantId && key) {
    cache.delete(`${tenantId}:${key}`);
  } else if (tenantId) {
    for (const k of Array.from(cache.keys())) {
      if (k.startsWith(`${tenantId}:`)) cache.delete(k);
    }
  }
}
