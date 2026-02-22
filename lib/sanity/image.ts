/**
 * Sanity image stub – not used in production (Prisma is source of truth).
 */
export type SanityImageSource = { _ref?: string; asset?: { _ref?: string } };

export function urlForImage(_source: SanityImageSource, _options?: { width?: number; height?: number }): string {
  return "";
}
