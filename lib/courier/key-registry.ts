/**
 * SecureConfig key registry — single source of truth for courier credentials.
 * Namespace: courier:{provider}:{field}
 */
export const COURIER_SECURE_KEYS = {
  pathao: [
    "courier:pathao:client_id",
    "courier:pathao:client_secret",
    "courier:pathao:username",
    "courier:pathao:password",
    "courier:pathao:store_id",
  ] as const,
  steadfast: ["courier:steadfast:api_key", "courier:steadfast:secret_key"] as const,
  redx: ["courier:redx:api_key"] as const,
} as const;

export type CourierProvider = "pathao" | "steadfast" | "redx";

export const COURIER_PROVIDERS: CourierProvider[] = ["pathao", "steadfast", "redx"];

export const ALLOWED_SECURE_KEYS = [
  ...COURIER_SECURE_KEYS.pathao,
  ...COURIER_SECURE_KEYS.steadfast,
  ...COURIER_SECURE_KEYS.redx,
] as const;

export type AllowedSecureKey = (typeof ALLOWED_SECURE_KEYS)[number];

export function isAllowedSecureKey(key: string): key is AllowedSecureKey {
  return (ALLOWED_SECURE_KEYS as readonly string[]).includes(key);
}
