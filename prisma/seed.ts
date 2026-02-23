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
        role: "super_admin",
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

  // Seed default product filters
  const defaultFilters = [
    { key: "brand", labelEn: "Brand", type: "select", sortOrder: 0 },
    { key: "price_range", labelEn: "Price Range", type: "range", sortOrder: 1 },
    { key: "category", labelEn: "Category", type: "select", sortOrder: 2 },
  ];
  for (const f of defaultFilters) {
    await prisma.productFilter.upsert({
      where: { key: f.key },
      create: f,
      update: {},
    }).catch(() => {});
  }
  console.log("Product filters ready");

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
        images: { create: [{ url: "/ui/product-4x3.svg", sortOrder: 0, isPrimary: true }] },
        isActive: true,
        isFeatured: true,
      },
    });
    console.log("Sample product created");
  }

  // Seed RBAC roles and permissions
  console.log("Seeding RBAC roles and permissions...");

  // Create PermissionGroups (for menu structure)
  const groups = [
    { slug: "dashboard", name: "Dashboard", icon: "LayoutDashboard", sortOrder: 0 },
    { slug: "order-management", name: "Order Management", icon: "ShoppingCart", sortOrder: 10 },
    { slug: "product-management", name: "Product Management", icon: "Package", sortOrder: 20 },
    { slug: "content", name: "Pages & Content", icon: "FileText", sortOrder: 30 },
    { slug: "customers", name: "Customers", icon: "Users", sortOrder: 40 },
    { slug: "reports", name: "Reports", icon: "Activity", sortOrder: 50 },
    { slug: "settings", name: "Settings", icon: "Settings", sortOrder: 60 },
  ];
  const groupMap: Record<string, string> = {};
  for (const g of groups) {
    const created = await prisma.permissionGroup.upsert({
      where: { slug: g.slug },
      create: g,
      update: { name: g.name, icon: g.icon, sortOrder: g.sortOrder },
    });
    groupMap[g.slug] = created.id;
  }
  console.log("Permission groups created");

  // Create permissions with group + menu metadata
  const permissions: Array<{
    name: string;
    description: string;
    groupSlug: string;
    menuLabel?: string;
    menuHref?: string;
    menuSortOrder?: number;
  }> = [
    { name: "admin.view", description: "View admin panel", groupSlug: "dashboard", menuLabel: "Dashboard", menuHref: "/admin", menuSortOrder: 0 },
    { name: "users.view", description: "View users", groupSlug: "customers" },
    { name: "users.create", description: "Create users", groupSlug: "customers" },
    { name: "users.edit", description: "Edit users", groupSlug: "customers" },
    { name: "users.delete", description: "Delete users", groupSlug: "customers" },
    { name: "products.view", description: "View products", groupSlug: "product-management", menuLabel: "Products", menuHref: "/admin/products", menuSortOrder: 0 },
    { name: "products.create", description: "Create products", groupSlug: "product-management", menuLabel: "Product Upload", menuHref: "/admin/products/upload", menuSortOrder: 1 },
    { name: "products.edit", description: "Edit products", groupSlug: "product-management" },
    { name: "products.delete", description: "Delete products", groupSlug: "product-management" },
    { name: "categories.view", description: "View categories", groupSlug: "product-management", menuLabel: "Category Tree", menuHref: "/admin/categories", menuSortOrder: 2 },
    { name: "categories.create", description: "Create categories", groupSlug: "product-management" },
    { name: "categories.edit", description: "Edit categories", groupSlug: "product-management" },
    { name: "categories.delete", description: "Delete categories", groupSlug: "product-management" },
    { name: "brands.view", description: "View brands", groupSlug: "product-management", menuLabel: "Brands", menuHref: "/admin/brands", menuSortOrder: 3 },
    { name: "collections.view", description: "View collections", groupSlug: "product-management", menuLabel: "Product Catalogs", menuHref: "/admin/collections", menuSortOrder: 4 },
    { name: "filters.view", description: "View product filters", groupSlug: "product-management", menuLabel: "Product Filters", menuHref: "/admin/product-filters", menuSortOrder: 5 },
    { name: "units.view", description: "View units", groupSlug: "product-management", menuLabel: "Units", menuHref: "/admin/products/units", menuSortOrder: 6 },
    { name: "shipping.view", description: "View shipping", groupSlug: "product-management", menuLabel: "Shipping", menuHref: "/admin/shipping", menuSortOrder: 7 },
    { name: "brands.create", description: "Create brands", groupSlug: "product-management" },
    { name: "brands.edit", description: "Edit brands", groupSlug: "product-management" },
    { name: "brands.delete", description: "Delete brands", groupSlug: "product-management" },
    { name: "orders.view", description: "View orders", groupSlug: "order-management", menuLabel: "Orders", menuHref: "/admin/orders", menuSortOrder: 0 },
    { name: "orders.create", description: "Create orders", groupSlug: "order-management", menuLabel: "Create Order", menuHref: "/admin/orders/create", menuSortOrder: 1 },
    { name: "orders.edit", description: "Edit orders", groupSlug: "order-management" },
    { name: "orders.activities", description: "View order activities", groupSlug: "order-management", menuLabel: "Order Activities", menuHref: "/admin/orders/activities", menuSortOrder: 2 },
    { name: "customers.repeat", description: "View repeat customers", groupSlug: "customers", menuLabel: "Repeat Customer", menuHref: "/admin/customers/repeat", menuSortOrder: 0 },
    { name: "customers.risk", description: "View customer risk", groupSlug: "customers", menuLabel: "Customer Risk", menuHref: "/admin/customers/risk", menuSortOrder: 1 },
    { name: "orders.delete", description: "Delete orders", groupSlug: "order-management" },
    { name: "content.view", description: "View content", groupSlug: "content", menuLabel: "Blog", menuHref: "/admin/blog", menuSortOrder: 0 },
    { name: "content.pages", description: "View site pages", groupSlug: "content", menuLabel: "Site Pages", menuHref: "/admin/pages", menuSortOrder: 1 },
    { name: "content.blogCategories", description: "View blog categories", groupSlug: "content", menuLabel: "Blog Categories", menuHref: "/admin/blog-categories", menuSortOrder: 2 },
    { name: "content.create", description: "Create content", groupSlug: "content" },
    { name: "content.edit", description: "Edit content", groupSlug: "content" },
    { name: "content.delete", description: "Delete content", groupSlug: "content" },
    { name: "settings.view", description: "View site settings", groupSlug: "settings", menuLabel: "Store Settings", menuHref: "/admin/settings", menuSortOrder: 0 },
    { name: "settings.edit", description: "Edit site settings", groupSlug: "settings" },
    { name: "analytics.view", description: "View analytics", groupSlug: "reports", menuLabel: "Analytics", menuHref: "/admin/analytics", menuSortOrder: 0 },
    { name: "ads.view", description: "View ads", groupSlug: "reports", menuLabel: "Ad Management", menuHref: "/admin/ad-management", menuSortOrder: 1 },
    { name: "ai.view", description: "View AI settings", groupSlug: "settings", menuLabel: "Global AI", menuHref: "/admin/global-ai", menuSortOrder: 3 },
    { name: "admin.users", description: "Manage admin users", groupSlug: "settings", menuLabel: "Team", menuHref: "/admin/team", menuSortOrder: 1 },
    { name: "admin.roles", description: "Manage roles and permissions", groupSlug: "settings" },
    { name: "audit.view", description: "View audit logs", groupSlug: "settings", menuLabel: "Audit Logs", menuHref: "/admin/audit-logs", menuSortOrder: 2 },
  ];

  for (const perm of permissions) {
    const [resource, action] = perm.name.split(".");
    const groupId = groupMap[perm.groupSlug] ?? null;
    await prisma.permission.upsert({
      where: { name: perm.name },
      create: {
        name: perm.name,
        description: perm.description,
        resource: resource ?? perm.name,
        action: action ?? "view",
        groupId,
        menuLabel: perm.menuLabel ?? null,
        menuHref: perm.menuHref ?? null,
        menuSortOrder: perm.menuSortOrder ?? 0,
      },
      update: {
        groupId,
        menuLabel: perm.menuLabel ?? null,
        menuHref: perm.menuHref ?? null,
        menuSortOrder: perm.menuSortOrder ?? 0,
      },
    });
  }
  console.log("Permissions created");

  // Create roles (owner = full access, same as super_admin)
  const ownerRole = await prisma.role.upsert({
    where: { name: "owner" },
    create: {
      name: "owner",
      description: "Store owner with full access",
      isSystem: true,
    },
    update: {},
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: "super_admin" },
    create: {
      name: "super_admin",
      description: "Super Administrator with full access",
      isSystem: true,
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
  const allPermissions = await prisma.permission.findMany();
  // Owner and Super Admin get all permissions
  for (const perm of allPermissions) {
    for (const role of [ownerRole, superAdminRole]) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          },
        },
        create: {
          roleId: role.id,
          permissionId: perm.id,
        },
        update: {},
      });
    }
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
      p.name === "brands.edit" ||
      p.name === "orders.edit" ||
      p.name === "orders.activities" ||
      p.name === "customers.repeat" ||
      p.name === "customers.risk" ||
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

  // Assign owner + super_admin roles to the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (adminUser) {
    for (const role of [ownerRole, superAdminRole]) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: adminUser.id,
            roleId: role.id,
          },
        },
        create: {
          userId: adminUser.id,
          roleId: role.id,
        },
        update: {},
      });
    }
    console.log("Owner and super_admin roles assigned to admin user");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
