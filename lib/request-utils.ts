/**
 * Request utilities for security: body size limits.
 * Check Content-Length before parsing to avoid memory exhaustion.
 */
import { NextRequest, NextResponse } from "next/server";

/**
 * Reject request if Content-Length exceeds maxBytes. Returns 413 or null (proceed).
 * Call before request.json() / request.text() / request.formData().
 */
export function assertBodySize(
  request: NextRequest,
  maxBytes: number
): NextResponse | null {
  const raw = request.headers.get("content-length");
  if (!raw) return null; // No Content-Length: allow (streaming/chunked)
  const len = parseInt(raw, 10);
  if (Number.isNaN(len) || len <= 0) return null;
  if (len > maxBytes) {
    return NextResponse.json(
      { error: "Payload Too Large" },
      { status: 413 }
    );
  }
  return null;
}
