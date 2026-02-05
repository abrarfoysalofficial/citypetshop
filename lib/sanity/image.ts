import imageUrlBuilder from "@sanity/image-url";
import { getSanityConfig } from "./config";

/** Sanity image reference (asset or object with _ref). */
export type SanityImageSource = Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0];

/**
 * Sanity image URL builder for next/image or <img>.
 * Uses validated config; call only when DATA_SOURCE=sanity or isSanityConfigured().
 */
function getImageBuilder() {
  const { projectId, dataset } = getSanityConfig();
  return imageUrlBuilder({ projectId, dataset });
}

/**
 * Build a URL for a Sanity image with optional width/height/crop.
 * Returns a string URL suitable for next/image src or <img src={...} />.
 */
export function urlForImage(
  source: SanityImageSource,
  options?: { width?: number; height?: number; fit?: "max" | "min" | "fill" }
): string {
  const builder = getImageBuilder().image(source);
  if (options?.width) builder.width(options.width);
  if (options?.height) builder.height(options.height);
  if (options?.fit) builder.fit(options.fit);
  return builder.url();
}
