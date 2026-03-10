/**
 * One-time script: Sync 3 hero slides into home_banner_slides.
 * Run when seed is blocked or admin cannot be used.
 *
 * Usage: npx tsx scripts/sync-hero-banners.ts
 * Requires: DATABASE_URL in .env
 */
import { PrismaClient } from "@prisma/client";

const slides = [
  { imageUrl: "/banners/hero-slide-1.jpeg", titleEn: "Premium Pet Travel Gear", link: "/shop", sortOrder: 1 },
  { imageUrl: "/banners/hero-slide-2.jpeg", titleEn: "Premium Pet Care Starts Here", link: "/shop", sortOrder: 2 },
  { imageUrl: "/banners/hero-slide-3.jpeg", titleEn: "Luxury and Exclusive Fashion", link: "/shop", sortOrder: 3 },
];

async function main() {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.homeBannerSlide.findMany({ orderBy: { sortOrder: "asc" } });

    if (existing.length >= 3) {
      for (let i = 0; i < 3; i++) {
        await prisma.homeBannerSlide.update({
          where: { id: existing[i]!.id },
          data: { ...slides[i], isActive: true },
        });
      }
      if (existing.length > 3) {
        await prisma.homeBannerSlide.deleteMany({ where: { id: { in: existing.slice(3).map((e) => e.id) } } });
      }
      console.log("Updated 3 slides, removed extras");
    } else {
      await prisma.homeBannerSlide.deleteMany({});
      for (const s of slides) {
        await prisma.homeBannerSlide.create({ data: { ...s, isActive: true } });
      }
      console.log("Created 3 slides");
    }

    const final = await prisma.homeBannerSlide.findMany({ orderBy: { sortOrder: "asc" } });
    console.log("Final slides:", final.map((s) => ({ sortOrder: s.sortOrder, titleEn: s.titleEn, imageUrl: s.imageUrl })));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
