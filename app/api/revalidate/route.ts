import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * On-demand revalidation for Sanity webhooks.
 * POST body: { _type: "product" | "category" | "siteSettings" | "comboOffer" } (from Sanity webhook payload).
 * Optionally protect with a secret: ?secret=YOUR_REVALIDATE_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get("secret");
    if (process.env.SANITY_REVALIDATE_SECRET && secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return Response.json({ error: "Invalid secret" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const type = (body._type as string) ?? (body.type as string);

    const tag = type && typeof type === "string" ? type : "sanity";
    revalidateTag(tag);
    revalidateTag("product");
    revalidateTag("category");
    revalidateTag("siteSettings");
    revalidateTag("comboOffer");

    return Response.json({ revalidated: true, tag });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Revalidation failed" },
      { status: 500 }
    );
  }
}
