"use client";

import Link from "next/link";
import SafeImage from "@/components/media/SafeImage";

const REVIEW_IMAGES = [
  { src: "/ui/reviews/Adiba Khan Jihanreview.png", name: "Adiba Khan Jihan" },
  { src: "/ui/reviews/anika tabasssum review.png", name: "Anika Tabassum" },
  { src: "/ui/reviews/monir khan review.png", name: "Monir Khan" },
  { src: "/ui/reviews/Nazma Akter review.png", name: "Nazma Akter" },
  { src: "/ui/reviews/Nurul Amin Babu review.png", name: "Nurul Amin Babu" },
  { src: "/ui/reviews/Rajmoni Inomjar review.png", name: "Rajmoni Inomjar" },
  { src: "/ui/reviews/shakura jahan review.png", name: "Shakura Jahan" },
  { src: "/ui/reviews/Sk Umma Sinha review.png", name: "Sk Umma Sinha" },
];

interface HomeReviewSectionProps {
  title?: string;
  subtitle?: string;
}

export default function HomeReviewSection({
  title = "Customer Reviews",
  subtitle = "What our customers say about us.",
}: HomeReviewSectionProps) {
  return (
    <section className="border-y border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-center text-slate-600">{subtitle}</p>
        )}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {REVIEW_IMAGES.map((r) => (
            <div
              key={r.src}
              className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition hover:shadow-md"
            >
              <Link href={encodeURI(r.src)} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative aspect-[3/4]">
                  <SafeImage
                    src={encodeURI(r.src)}
                    alt={`Review from ${r.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <p className="truncate px-3 py-2 text-center text-sm font-medium text-slate-700">
                  {r.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Real reviews from happy customers.{" "}
          <Link href="/shop" className="font-medium text-primary hover:underline">
            Shop now
          </Link>
        </p>
      </div>
    </section>
  );
}
