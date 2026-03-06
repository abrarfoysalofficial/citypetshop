/**
 * Pathao API client — server-only. Uses SecureConfig for credentials.
 * Token cached in memory with TTL. Never log secrets.
 */
import { PathaoClient } from "pathao-courier";
import { getSecret } from "@lib/secure-config-loader";
import { logError, logWarn } from "@lib/logger";

const TOKEN_CACHE_TTL_MS = 50 * 60 * 1000; // 50 min (Pathao tokens ~1h)
let tokenCache: { token: string; expires: number } | null = null;

export type PathaoCreds = {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  storeId: string;
};

export async function getPathaoClient(
  tenantId: string,
  sandbox: boolean
): Promise<PathaoClient | null> {
  const [clientId, clientSecret, username, password, storeId] = await Promise.all([
    getSecret(tenantId, "courier:pathao:client_id"),
    getSecret(tenantId, "courier:pathao:client_secret"),
    getSecret(tenantId, "courier:pathao:username"),
    getSecret(tenantId, "courier:pathao:password"),
    getSecret(tenantId, "courier:pathao:store_id"),
  ]);

  if (!clientId || !clientSecret || !username || !password || !storeId) {
    return null;
  }

  return new PathaoClient({
    clientId,
    clientSecret,
    username,
    password,
    environment: sandbox ? "sandbox" : "production",
  });
}

export async function getPathaoStoreId(tenantId: string): Promise<number | null> {
  const storeId = await getSecret(tenantId, "courier:pathao:store_id");
  if (!storeId) return null;
  const n = parseInt(storeId, 10);
  return Number.isNaN(n) ? null : n;
}

/** Normalize BD phone to 11 digits (01XXXXXXXXX) */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("01")) return digits;
  if (digits.length === 13 && digits.startsWith("880")) return digits.slice(2);
  if (digits.length === 10) return "0" + digits;
  return digits.slice(-11);
}

export type PathaoOrderPayload = {
  storeId: number;
  merchantOrderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  itemQuantity: number;
  itemWeight: number;
  amountToCollect: number;
  itemDescription?: string;
};

export async function createPathaoOrder(
  client: PathaoClient,
  payload: PathaoOrderPayload
): Promise<{ consignmentId: string; success: boolean; error?: string }> {
  const phone = normalizePhone(payload.recipientPhone);
  if (phone.length !== 11) {
    return { consignmentId: "", success: false, error: "Invalid recipient phone (11 digits required)" };
  }

  try {
    const res = await client.orders.create({
      store_id: payload.storeId,
      merchant_order_id: payload.merchantOrderId,
      recipient_name: payload.recipientName,
      recipient_phone: phone,
      recipient_address: payload.recipientAddress.slice(0, 220),
      delivery_type: 48,
      item_type: 2,
      item_quantity: payload.itemQuantity,
      item_weight: Math.min(10, Math.max(0.5, payload.itemWeight)),
      amount_to_collect: Math.round(payload.amountToCollect),
      item_description: payload.itemDescription?.slice(0, 200),
    });

    const consignmentId = res?.data?.consignment_id ?? "";
    if (!consignmentId) {
      return { consignmentId: "", success: false, error: "No consignment ID in response" };
    }
    return { consignmentId, success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logError("courier/pathao", "Order create failed", { error: msg });
    return { consignmentId: "", success: false, error: msg };
  }
}

/** Test Pathao credentials — calls stores.list (safe, no side effects) */
export async function testPathaoConnection(
  tenantId: string,
  sandbox: boolean
): Promise<{ ok: boolean; message: string }> {
  const client = await getPathaoClient(tenantId, sandbox);
  if (!client) {
    return { ok: false, message: "Pathao credentials not configured. Add all keys in Admin → Integrations." };
  }

  try {
    const stores = await client.stores.list();
    const list = stores?.data?.data;
    const hasStores = Array.isArray(list) && list.length > 0;
    return {
      ok: true,
      message: hasStores ? `Connected. ${list.length} store(s) found.` : "Connected. No stores yet.",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Connection failed";
    logWarn("courier/pathao", "Test connection failed", { error: msg });
    return { ok: false, message: msg };
  }
}
