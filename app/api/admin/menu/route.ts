/**
 * GET /api/admin/menu
 * Returns admin sidebar menu structure based on user permissions.
 * Menu items are built from PermissionGroups + Permissions with menuLabel/menuHref.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminAuth } from "@/lib/admin-auth";

export type MenuItem = {
  name: string;
  href: string;
  icon?: string;
  children?: { name: string; href: string }[];
};

export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status ?? 401 });
  }

  const userId = auth.userId;

  // Demo user: return full static menu (no DB roles)
  if (userId === "demo-admin") {
    return NextResponse.json({
      menu: getStaticMenu(),
      source: "static",
    });
  }

  try {
    const menu = await buildMenuFromPermissions(userId);
    return NextResponse.json({ menu, source: "permissions" });
  } catch (e) {
    console.error("Menu build error:", e);
    return NextResponse.json({ menu: getStaticMenu(), source: "fallback" });
  }
}

async function buildMenuFromPermissions(userId: string): Promise<MenuItem[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: {
                include: { group: true },
              },
            },
          },
        },
      },
    },
  });

  const permissionIds = new Set<string>();
  for (const ur of userRoles) {
    for (const rp of ur.role.permissions) {
      permissionIds.add(rp.permissionId);
    }
  }

  const permissions = await prisma.permission.findMany({
    where: {
      id: { in: Array.from(permissionIds) },
      menuHref: { not: null },
      group: { isActive: true },
    },
    include: { group: true },
    orderBy: [{ group: { sortOrder: "asc" } }, { menuSortOrder: "asc" }],
  });

  const byGroup = new Map<string, { name: string; icon?: string; sortOrder: number; items: { name: string; href: string; sortOrder: number }[] }>();

  for (const p of permissions) {
    if (!p.group || !p.menuLabel || !p.menuHref) continue;
    const g = p.group;
    if (!byGroup.has(g.id)) {
      byGroup.set(g.id, { name: g.name, icon: g.icon ?? undefined, sortOrder: g.sortOrder, items: [] });
    }
    const grp = byGroup.get(g.id)!;
    grp.items.push({
      name: p.menuLabel,
      href: p.menuHref,
      sortOrder: p.menuSortOrder ?? 0,
    });
  }

  const sortedGroups = Array.from(byGroup.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  const menu: MenuItem[] = [];

  for (const grp of sortedGroups) {
    grp.items.sort((a, b) => a.sortOrder - b.sortOrder);
    if (grp.items.length === 1 && grp.items[0]!.href === "/admin") {
      menu.push({ name: grp.items[0]!.name, href: grp.items[0]!.href, icon: grp.icon });
    } else if (grp.items.length === 1) {
      menu.push({ name: grp.items[0]!.name, href: grp.items[0]!.href, icon: grp.icon });
    } else {
      const first = grp.items[0]!;
      menu.push({
        name: grp.name,
        href: first.href,
        icon: grp.icon,
        children: grp.items.map((i) => ({ name: i.name, href: i.href })),
      });
    }
  }

  return menu;
}

function getStaticMenu(): MenuItem[] {
  return [
    { name: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { name: "Home Banner Slides", href: "/admin/home-banner-slides", icon: "Image" },
    { name: "Category", href: "/admin/categories", icon: "FolderTree" },
    {
      name: "Products",
      href: "/admin/products",
      icon: "Package",
      children: [
        { name: "Product List", href: "/admin/products" },
        { name: "Product Upload", href: "/admin/products/upload" },
        { name: "Add Product RAMS", href: "/admin/products/rams" },
        { name: "Add Product WEIGHT", href: "/admin/products/weights" },
        { name: "Add Product SIZE", href: "/admin/products/sizes" },
      ],
    },
    { name: "Orders", href: "/admin/orders", icon: "ShoppingCart" },
    { name: "Create Order", href: "/admin/orders/create", icon: "ShoppingCart" },
    { name: "Order Activities", href: "/admin/orders/activities", icon: "Activity" },
    { name: "Repeat Customer", href: "/admin/customers/repeat", icon: "Users" },
    { name: "Home Banners", href: "/admin/home-banners", icon: "ImageIcon" },
    { name: "Home Side Banners", href: "/admin/home-side-banners", icon: "PanelLeft" },
    { name: "Home Bottom Banners", href: "/admin/home-bottom-banners", icon: "LayoutGrid" },
    {
      name: "Settings & More",
      href: "/admin/settings",
      icon: "Settings",
      children: [
        { name: "Store Settings", href: "/admin/settings" },
        { name: "Checkout Settings", href: "/admin/checkout-settings" },
        { name: "Payments", href: "/admin/payments" },
        { name: "Analytics", href: "/admin/analytics" },
        { name: "Live Visitors", href: "/admin/analytics/live" },
        { name: "Blog", href: "/admin/blog" },
        { name: "Customers", href: "/admin/customers" },
        { name: "Vouchers", href: "/admin/vouchers" },
        { name: "Landing Pages", href: "/admin/landing-pages" },
        { name: "Abandoned Checkout", href: "/admin/draft-orders" },
        { name: "Fraud & Security", href: "/admin/fraud" },
        { name: "Courier", href: "/admin/courier" },
        { name: "Team", href: "/admin/team" },
      ],
    },
  ];
}
