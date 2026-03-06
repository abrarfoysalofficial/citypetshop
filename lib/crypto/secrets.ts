/**
 * AES-256-GCM encryption for secrets at rest.
 * Master key from MASTER_SECRET env (required in production when SecureConfig used).
 * Never log or return decrypted values.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getMasterKey(): Buffer {
  const raw = process.env.MASTER_SECRET?.trim();
  if (!raw || raw.length < 32) {
    throw new Error("MASTER_SECRET must be set and at least 32 characters");
  }
  return scryptSync(Buffer.from(raw, "utf8"), "secure-config-salt", KEY_LENGTH);
}

/**
 * Encrypt plaintext. Returns base64(iv + tag + ciphertext).
 */
export function encryptSecret(plaintext: string, masterKey?: Buffer): string {
  const key = masterKey ?? getMasterKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, tag, enc]);
  return combined.toString("base64");
}

/**
 * Decrypt valueEnc. Throws on tamper or invalid format.
 */
export function decryptSecret(valueEnc: string, masterKey?: Buffer): string {
  const key = masterKey ?? getMasterKey();
  const buf = Buffer.from(valueEnc, "base64");
  if (buf.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid encrypted value format");
  }

  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(ciphertext) + decipher.final("utf8");
}

/**
 * Mask secret for display: "••••••••••••abcd" (last 4 chars) or "••••••••" if short.
 * Never returns full value.
 */
export function maskSecret(value: string): string {
  if (!value || value.length === 0) return "••••";
  if (value.length <= 4) return "••••";
  const last4 = value.slice(-4);
  const dots = "•".repeat(Math.min(value.length - 4, 12));
  return `${dots}${last4}`;
}
