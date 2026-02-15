import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** POST: Upload file to Supabase Storage. Bucket: product-images | banner-images */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rawBucket = (formData.get("bucket") as string) || "product-images";
    const allowedBuckets = ["product-images", "banner-images", "store-assets"];
    const bucket = allowedBuckets.includes(rawBucket) ? rawBucket : "product-images";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const supabase = await createClient();
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("[admin/upload]:", error);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch (err) {
    console.error("[admin/upload]:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
