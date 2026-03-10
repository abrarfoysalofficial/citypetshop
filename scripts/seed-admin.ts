/**
 * Legacy script - use `npx prisma db seed` instead.
 * Creates a single admin user if needed.
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { DEFAULT_TENANT_ID } from "../lib/tenant";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@citypetshop.bd";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345!";
  const passwordHash = await hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Admin",
      role: "super_admin",
      tenantId: DEFAULT_TENANT_ID,
    },
  });

  console.log("Admin created:", email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());