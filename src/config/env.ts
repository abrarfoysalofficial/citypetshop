/**
 * Simplified env config for PostgreSQL-only setup.
 * No fallbacks or multiple data sources.
 */

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || "";
}

export function getNextAuthSecret(): string {
  return process.env.NEXTAUTH_SECRET || "";
}

export function getNextAuthUrl(): string {
  return process.env.NEXTAUTH_URL || "";
}

export function isPrismaConfigured(): boolean {
  return !!(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0);
}

