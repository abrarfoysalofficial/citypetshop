/**
 * SSLCommerz webhook: IP allowlist (403) and body size limit (413).
 * These paths return before DB/validation, so no prisma mock needed.
 */
import { NextRequest } from "next/server";
import { POST } from "@/app/api/webhooks/sslcommerz/route";

const ORIGINAL_ALLOWLIST = process.env.SSLCOMMERZ_IP_ALLOWLIST;

function mockRequest(opts: {
  ip?: string;
  ipHeader?: "x-forwarded-for" | "cf-connecting-ip";
  contentLength?: string;
}): NextRequest {
  const headers = new Headers();
  if (opts.ip) headers.set(opts.ipHeader ?? "x-forwarded-for", opts.ip);
  headers.set("content-length", opts.contentLength ?? "100");
  const formData = new FormData();
  formData.set("tran_id", "test-order-123");
  formData.set("status", "VALID");
  formData.set("val_id", "val-xyz");
  formData.set("amount", "100");
  return new NextRequest("http://localhost/api/webhooks/sslcommerz", {
    method: "POST",
    headers,
    body: formData,
  });
}

describe("Webhook IP allowlist", () => {
  afterAll(() => {
    process.env.SSLCOMMERZ_IP_ALLOWLIST = ORIGINAL_ALLOWLIST;
  });

  it("returns 403 when allowlist set and client IP not in list", async () => {
    process.env.SSLCOMMERZ_IP_ALLOWLIST = "1.2.3.4";
    const req = mockRequest({ ip: "5.6.7.8" });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json).toEqual({ error: "Forbidden" });
  });

  it("uses CF-Connecting-IP when present", async () => {
    process.env.SSLCOMMERZ_IP_ALLOWLIST = "1.2.3.4";
    const req = mockRequest({ ip: "5.6.7.8", ipHeader: "cf-connecting-ip" });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});

describe("Webhook body size limit", () => {
  afterAll(() => {
    process.env.SSLCOMMERZ_IP_ALLOWLIST = ORIGINAL_ALLOWLIST;
  });

  it("returns 413 when Content-Length exceeds 128KB", async () => {
    process.env.SSLCOMMERZ_IP_ALLOWLIST = "";
    const req = mockRequest({ contentLength: String(129 * 1024) });
    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json).toEqual({ error: "Payload Too Large" });
  });
});
