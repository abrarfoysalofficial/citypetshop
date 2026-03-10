/**
 * Request utils: body size limit (assertBodySize).
 */
import { NextRequest } from "next/server";
import { assertBodySize } from "@/lib/request-utils";

describe("assertBodySize", () => {
  function req(contentLength: string | null): NextRequest {
    const headers = new Headers();
    if (contentLength !== null) headers.set("content-length", contentLength);
    return new NextRequest("http://localhost/api/test", { method: "POST", headers });
  }

  it("returns null when Content-Length is absent (proceed)", () => {
    expect(assertBodySize(req(null), 1024)).toBeNull();
  });

  it("returns null when Content-Length is within limit", () => {
    expect(assertBodySize(req("512"), 1024)).toBeNull();
    expect(assertBodySize(req("1024"), 1024)).toBeNull();
  });

  it("returns 413 response when Content-Length exceeds limit", async () => {
    const res = assertBodySize(req("1025"), 1024);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(413);
    const json = await res!.json();
    expect(json).toEqual({ error: "Payload Too Large" });
  });

  it("returns null for invalid Content-Length (NaN)", () => {
    expect(assertBodySize(req("abc"), 1024)).toBeNull();
  });

  it("returns null for zero or negative Content-Length", () => {
    expect(assertBodySize(req("0"), 1024)).toBeNull();
    expect(assertBodySize(req("-1"), 1024)).toBeNull();
  });
});
