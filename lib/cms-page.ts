/**
 * CMS page data layer - fetches legal/static pages from cms_pages.
 */
import { prisma } from "@/lib/db";

export type CmsPageResult = {
  titleEn: string;
  titleBn: string | null;
  contentEn: string | null;
  contentBn: string | null;
  publishedAt: Date | null;
};

export async function getCmsPageBySlug(slug: string): Promise<CmsPageResult | null> {
  const page = await prisma.cmsPage.findFirst({
    where: { slug, isPublished: true },
    select: {
      titleEn: true,
      titleBn: true,
      contentEn: true,
      contentBn: true,
      publishedAt: true,
    },
  });
  return page;
}
