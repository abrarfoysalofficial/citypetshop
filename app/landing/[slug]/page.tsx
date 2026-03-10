export const revalidate = 300;
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import LandingBlockRenderer from "./LandingBlockRenderer";

type LandingPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.landingPage.findFirst({ where: { slug, isPublished: true } });
  return {
    title: page?.seoTitle ?? page?.title ?? "City Plus Pet Shop",
    description: page?.seoDesc ?? undefined,
  };
}

export default async function LandingPageRoute({ params }: LandingPageProps) {
  const { slug } = await params;
  const page = await prisma.landingPage.findFirst({
    where: { slug, isPublished: true },
    include: { blocks: { orderBy: { sortOrder: "asc" } } },
  });

  if (!page) notFound();

  return (
    <div className="min-h-screen bg-white">
      {page.blocks.map((block) => (
        <LandingBlockRenderer key={block.id} block={block} />
      ))}
      {page.blocks.length === 0 && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-slate-500">This page has no content yet.</p>
        </div>
      )}
    </div>
  );
}
