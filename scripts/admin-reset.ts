#!/usr/bin/env npx tsx
/**
 * Safe admin password reset — City Pet Shop BD
 *
 * Upserts admin@citypetshop.bd with role SUPER_ADMIN and a new password.
 * Loads .env.production.local (or .env.local) for DATABASE_URL.
 *
 * Usage (production):
 *   cd /var/www/cityplus/app
 *   ADMIN_PASSWORD='YourNewSecurePassword123!' npx tsx scripts/admin-reset.ts
 *
 * Temporary (change after first login):
 *   ADMIN_EMAIL=admin@citypetshop.bd ADMIN_PASSWORD='Admin 123' npx tsx scripts/admin-reset.ts
 *
 * Requirements:
 *   - DATABASE_URL must be set (from .env.production.local)
 *   - ADMIN_PASSWORD must be at least 8 characters (12+ recommended for production)
 */
import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@citypetshop.bd";

async function main() {
  // Load env: prefer .env.production.local, then .env.local
  const prodPath = resolve(process.cwd(), ".env.production.local");
  const localPath = resolve(process.cwd(), ".env.local");
  const { existsSync } = await import("fs");
  const envPath = existsSync(prodPath) ? prodPath : existsSync(localPath) ? localPath : undefined;
  if (envPath) config({ path: envPath });

  const dbUrl = process.env.DATABASE_URL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!dbUrl?.trim()) {
    console.error("ERROR: DATABASE_URL not set. Ensure .env.production.local exists.");
    process.exit(1);
  }

  if (!adminPassword || adminPassword.length < 8) {
    console.error("ERROR: ADMIN_PASSWORD must be set and at least 8 characters.");
    console.error("Usage: ADMIN_PASSWORD='YourNewPassword123!' npx tsx scripts/admin-reset.ts");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const passwordHash = await hash(adminPassword, 12);

    const user = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      create: {
        email: ADMIN_EMAIL,
        passwordHash,
        name: "Admin",
        role: "super_admin",
      },
      update: {
        passwordHash,
        role: "super_admin",
      },
    });

    // Ensure super_admin role is assigned (RBAC)
    const superAdminRole = await prisma.role.findUnique({
      where: { name: "super_admin" },
    });
    if (superAdminRole) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: superAdminRole.id,
          },
        },
        create: {
          userId: user.id,
          roleId: superAdminRole.id,
        },
        update: {},
      });
    }

    console.log(`Admin reset complete: ${ADMIN_EMAIL}`);
    console.log("Login at: https://citypetshop.bd/admin/login");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
