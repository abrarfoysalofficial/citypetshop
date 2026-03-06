/**
 * Unit tests: encryption roundtrip, tamper fails, masking.
 */
import { encryptSecret, decryptSecret, maskSecret } from "@lib/crypto/secrets";

const MASTER = "a".repeat(32);

describe("encryptSecret / decryptSecret", () => {
  const origEnv = process.env.MASTER_SECRET;

  beforeAll(() => {
    process.env.MASTER_SECRET = MASTER;
  });

  afterAll(() => {
    process.env.MASTER_SECRET = origEnv;
  });

  it("roundtrips plaintext", () => {
    const plain = "my-secret-api-key-12345";
    const enc = encryptSecret(plain);
    expect(enc).toBeTruthy();
    expect(enc).not.toContain(plain);
    const dec = decryptSecret(enc);
    expect(dec).toBe(plain);
  });

  it("produces different ciphertext each time (random IV)", () => {
    const plain = "same";
    const enc1 = encryptSecret(plain);
    const enc2 = encryptSecret(plain);
    expect(enc1).not.toBe(enc2);
    expect(decryptSecret(enc1)).toBe(plain);
    expect(decryptSecret(enc2)).toBe(plain);
  });

  it("throws on tampered ciphertext", () => {
    const enc = encryptSecret("secret");
    const buf = Buffer.from(enc, "base64");
    buf[buf.length - 1] ^= 0xff;
    expect(() => decryptSecret(buf.toString("base64"))).toThrow();
  });

  it("throws on invalid format", () => {
    expect(() => decryptSecret("short")).toThrow("Invalid encrypted value format");
  });
});

describe("maskSecret", () => {
  it("masks long value with last 4 visible", () => {
    const m = maskSecret("abcdefghijklmnopqrstuvwxyz");
    expect(m).toMatch(/.{4}$/);
    expect(m.endsWith("wxyz")).toBe(true);
    expect(m).not.toContain("abcdef");
  });

  it("returns dots for short value", () => {
    const m = maskSecret("ab");
    expect(m).toBe("••••");
  });

  it("returns dots for empty", () => {
    expect(maskSecret("")).toBe("••••");
  });
});
