/**
 * Local filesystem media route - serves uploaded images.
 * Path traversal protected. No S3/MinIO.
 * URL: /api/media/{key}
 */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/var/www/city-plus/uploads";

const ALLOWED_EXT = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg", "ico",
  "pdf", "mp4", "webm", "mp3", "wav", "ogg",
]);

function getContentType(ext: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", ico: "image/x-icon",
    pdf: "application/pdf", mp4: "video/mp4", webm: "video/webm",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const key = decodeURIComponent(pathSegments.join("/"));
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  // Path traversal protection
  const resolved = path.resolve(UPLOAD_DIR, key);
  const uploadRoot = path.resolve(UPLOAD_DIR);
  if (!resolved.startsWith(uploadRoot + path.sep) && resolved !== uploadRoot) {
    return new NextResponse(null, { status: 403 });
  }

  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.has(ext)) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const bytes = await fs.readFile(resolved);
    const contentType = getContentType(ext);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return new NextResponse(null, { status: 404 });
    }
    console.error("[media] read error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
