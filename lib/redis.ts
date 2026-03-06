/**
 * Redis client for rate limiting. Lazy connect.
 * Falls back to null when REDIS_URL not set or connection fails.
 */
import Redis from "ioredis";

let client: Redis | null = null;
let connectAttempted = false;

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL?.trim() || undefined;
}

export function getRedisClient(): Redis | null {
  if (connectAttempted) return client;
  connectAttempted = true;

  const url = getRedisUrl();
  if (!url) return null;

  try {
    client = new Redis(url, {
      maxRetriesPerRequest: 2,
      retryStrategy: () => null,
      lazyConnect: true,
    });
    client.on("error", () => {});
    return client;
  } catch {
    return null;
  }
}

export async function isRedisAvailable(): Promise<boolean> {
  const r = getRedisClient();
  if (!r) return false;
  try {
    await r.ping();
    return true;
  } catch {
    return false;
  }
}
