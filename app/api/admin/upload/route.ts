import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/var/www/city-plus/uploads";
const APP_URL = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "";

const ALLOWED_BUCKETS = ["product-images", "banner-images", "store-assets", "about-images"];
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);

/** POST: Upload file to local filesystem. No S3/Supabase. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rawBucket = (formData.get("bucket") as string) || "product-images";
    const bucket = ALLOWED_BUCKETS.includes(rawBucket) ? rawBucket : "product-images";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const fileExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    if (!ALLOWED_EXT.has(fileExt)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const key = `${bucket}/${fileName}`;
    const fullPath = path.join(UPLOAD_DIR, key);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(fullPath, buffer);

    const url = `${APP_URL}/api/media/${encodeURIComponent(key)}`;
    return NextResponse.json({ url, path: key });
  } catch (err) {
    console.error("[admin/upload]:", err);
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
