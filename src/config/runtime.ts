/**
 * Runtime config for PostgreSQL-only production setup.
 * Exported as string (not literal) so feature-flag comparisons compile
 * without TypeScript "comparison has no overlap" errors in legacy branches.
 */

export { getSiteUrl } from "./env";

/** Data source is always Prisma (PostgreSQL). Cast to string for compatibility. */
export const DATA_SOURCE: string = "prisma";
