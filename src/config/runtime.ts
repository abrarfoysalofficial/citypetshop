/**
 * Runtime config for PostgreSQL-only production setup.
 * Exported as string (not literal) so feature-flag comparisons compile
 * without TypeScript "comparison has no overlap" errors in legacy branches.
 */

export { getSiteUrl } from "./env";

/** Data source is always Prisma (PostgreSQL). Cast to string for compatibility. */
export const DATA_SOURCE: string = "prisma";

/** Auth mode is always Prisma (NextAuth with PostgreSQL). Cast to string for compatibility. */
export const AUTH_MODE: string = "prisma";

/** Not demo mode. */
export const IS_DEMO_MODE = false;
