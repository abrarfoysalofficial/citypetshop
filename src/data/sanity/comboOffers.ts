/**
 * Sanity data layer: combo offers. Maps to ComboOffer.
 */
import type { ComboOffer } from "../types";
import { sanityFetch } from "@/lib/sanity/client";
import { comboOffersQuery } from "@/lib/sanity/queries";

const TAGS = ["comboOffer"];

function mapDoc(d: Record<string, unknown>): ComboOffer {
  return {
    id: (d.id as string) ?? (d._id as string),
    slug: (d.slug as string) ?? "",
    title: (d.title as string) ?? "",
    description: (d.description as string) ?? "",
    image: (d.image as string) ?? "",
    price: Number(d.price) ?? 0,
    comparePrice: d.comparePrice != null ? Number(d.comparePrice) : undefined,
    productIds: (d.productIds as string[] | undefined)?.filter(Boolean),
    href: (d.href as string) ?? "/shop",
    cta: (d.cta as string) ?? "View Deal",
  };
}

export async function getComboOffers(): Promise<ComboOffer[]> {
  const list = await sanityFetch<Record<string, unknown>[]>({
    query: comboOffersQuery,
    tags: TAGS,
  });
  return (list ?? []).map(mapDoc);
}
