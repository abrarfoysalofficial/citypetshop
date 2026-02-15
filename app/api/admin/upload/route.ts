import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ALLOWED_BUCKETS = ["product-images", "banner-images", "store-assets"];

/** POST: Upload file to Supabase Storage. Uses service-role when available to bypass RLS. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rawBucket = (formData.get("bucket") as string) || "product-images";
    const bucket = ALLOWED_BUCKETS.includes(rawBucket) ? rawBucket : "product-images";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Use service-role client when available (bypasses RLS); otherwise use session client
    let supabase: Awaited<ReturnType<typeof createClient>>;
    try {
      supabase = createServiceRoleClient();
    } catch {
      supabase = await createClient();
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
      contentType: file.type || `image/${fileExt}`,
      upsert: false,
    });

    if (error) {
      console.error("[admin/upload]:", error.message, { bucket, code: error.name });
      const msg =
        error.message?.includes("Bucket not found") || error.message?.includes("not found")
          ? "Storage bucket not found. Create the bucket in Supabase Dashboard → Storage."
          : error.message || "Failed to upload file";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch (err) {
    console.error("[admin/upload]:", err);
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
