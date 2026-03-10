/**
 * Server-side category helpers. Fetches from DB (Prisma).
 * Use for server components and API routes.
 */
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";

export type CategoryInfo = { slug: string; name: string };

export async function getCategoryBySlugFromDb(slug: string): Promise<CategoryInfo | null> {
  try {
    const tenantId = getDefaultTenantId();
    const c = await prisma.category.findFirst({
      where: { tenantId, slug, deletedAt: null, isActive: true },
      select: { slug: true, nameEn: true },
    });
    if (!c) return null;
    return { slug: c.slug, name: c.nameEn };
  } catch {
    return null;
  }
}

export type SubcategoryInfo = { slug: string; fullSlug: string; name: string };

export async function getSubcategoryByFullSlugFromDb(fullSlug: string): Promise<SubcategoryInfo | null> {
  try {
    const parts = fullSlug.split("/");
    if (parts.length < 2) return null;
    const [parentSlug, childSlug] = parts;
    const tenantId = getDefaultTenantId();
    const child = await prisma.category.findFirst({
      where: {
        tenantId,
        slug: childSlug,
        deletedAt: null,
        isActive: true,
        parent: { slug: parentSlug },
      },
      select: { slug: true, nameEn: true },
    });
    if (!child) return null;
    return {
      slug: child.slug,
      fullSlug,
      name: child.nameEn,
    };
  } catch {
    return null;
  }
}
