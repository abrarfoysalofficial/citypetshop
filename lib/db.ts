/**
 * Prisma client singleton for self-hosted Postgres.
 * Replaces Supabase client.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type DbConnectivityResult = { ok: true; ms: number } | { ok: false; ms?: number; error: string };

export async function checkDbConnectivity(): Promise<DbConnectivityResult> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, ms: Date.now() - start };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return { ok: false, ms: Date.now() - start, error: err };
  }
}
