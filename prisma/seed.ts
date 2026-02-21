/**
 * Seed script for self-hosted deployment.
 * Creates default admin user, site settings, payment gateways, sample product.
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@citypetshopbd.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  if (process.env.NODE_ENV === "production") {
    if (!adminPassword || adminPassword.length < 12) {
      throw new Error("ADMIN_PASSWORD must be set and at least 12 characters in production");
    }
    if (adminPassword === "Admin@12345") {
      throw new Error("ADMIN_PASSWORD cannot be the default 'Admin@12345' in production");
    }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingUser) {
    const passwordHash = await hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Admin",
        role: "admin",
      },
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteNameEn: "City Plus Pet Shop",
      deliveryInsideDhaka: 70,
      deliveryOutsideDhaka: 130,
      freeDeliveryThreshold: 2000,
      termsUrl: "/terms",
      privacyUrl: "/privacy",
    },
    update: {},
  });
  console.log("Site settings ready");

  const gateways = [
    { gateway: "cod", displayNameEn: "Cash on Delivery", isActive: true },
    { gateway: "bkash", displayNameEn: "bKash", isActive: false },
    { gateway: "nagad", displayNameEn: "Nagad", isActive: false },
    { gateway: "sslcommerz", displayNameEn: "Card / Bank", isActive: false },
  ];
  for (const g of gateways) {
    await prisma.paymentGateway.upsert({
      where: { gateway: g.gateway },
      create: g,
      update: {},
    });
  }
  console.log("Payment gateways ready");

  await prisma.fraudPolicy.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
  console.log("Fraud policy ready");

  const cat = await prisma.category.upsert({
    where: { slug: "dog-food" },
    create: { slug: "dog-food", nameEn: "Dog Food", sortOrder: 0 },
    update: {},
  });

  const existingProduct = await prisma.product.findFirst({
    where: { slug: "sample-product" },
  });
  if (!existingProduct) {
    await prisma.product.create({
      data: {
        nameEn: "Sample Product",
        slug: "sample-product",
        categorySlug: cat.slug,
        categoryId: cat.id,
        sellingPrice: 500,
        buyingPrice: 400,
        stock: 10,
        images: { create: [{ url: "/products/placeholder.webp", sortOrder: 0, isPrimary: true }] },
        isActive: true,
        isFeatured: true,
      },
    });
    console.log("Sample product created");
  }

  // Seed RBAC roles and permissions
  console.log("Seeding RBAC roles and permissions...");

  // Create permissions
  const permissions = [
    // User management
    { name: "users.view", description: "View users" },
    { name: "users.create", description: "Create users" },
    { name: "users.edit", description: "Edit users" },
    { name: "users.delete", description: "Delete users" },

    // Product management
    { name: "products.view", description: "View products" },
    { name: "products.create", description: "Create products" },
    { name: "products.edit", description: "Edit products" },
    { name: "products.delete", description: "Delete products" },

    // Category management
    { name: "categories.view", description: "View categories" },
    { name: "categories.create", description: "Create categories" },
    { name: "categories.edit", description: "Edit categories" },
    { name: "categories.delete", description: "Delete categories" },

    // Order management
    { name: "orders.view", description: "View orders" },
    { name: "orders.edit", description: "Edit orders" },
    { name: "orders.delete", description: "Delete orders" },

    // Content management
    { name: "content.view", description: "View content" },
    { name: "content.create", description: "Create content" },
    { name: "content.edit", description: "Edit content" },
    { name: "content.delete", description: "Delete content" },

    // Site settings
    { name: "settings.view", description: "View site settings" },
    { name: "settings.edit", description: "Edit site settings" },

    // Analytics
    { name: "analytics.view", description: "View analytics" },

    // Admin management
    { name: "admin.view", description: "View admin panel" },
    { name: "admin.users", description: "Manage admin users" },
    { name: "admin.roles", description: "Manage roles and permissions" },
  ];

  for (const perm of permissions) {
    const [resource, action] = perm.name.split(".");
    await prisma.permission.upsert({
      where: { name: perm.name },
      create: { ...perm, resource: resource ?? perm.name, action: action ?? "view" },
      update: {},
    });
  }
  console.log("Permissions created");

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: "super_admin" },
    create: {
      name: "super_admin",
      description: "Super Administrator with full access",
    },
    update: {},
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    create: {
      name: "admin",
      description: "Administrator with most permissions",
    },
    update: {},
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: "moderator" },
    create: {
      name: "moderator",
      description: "Moderator with limited permissions",
    },
    update: {},
  });

  console.log("Roles created");

  // Assign permissions to roles
  // Super Admin gets all permissions
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
      update: {},
    });
  }

  // Admin gets most permissions except admin user management
  const adminPermissions = allPermissions.filter(
    (p) => !p.name.startsWith("admin.")
  );
  for (const perm of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
      update: {},
    });
  }

  // Moderator gets view permissions and limited edit permissions
  const moderatorPermissions = allPermissions.filter(
    (p) =>
      p.name.includes(".view") ||
      p.name === "products.edit" ||
      p.name === "categories.edit" ||
      p.name === "orders.edit" ||
      p.name === "content.edit"
  );
  for (const perm of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: perm.id,
        },
      },
      create: {
        roleId: moderatorRole.id,
        permissionId: perm.id,
      },
      update: {},
    });
  }

  console.log("Role permissions assigned");

  // Assign super admin role to the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (adminUser) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
      update: {},
    });
    console.log("Super admin role assigned to admin user");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
