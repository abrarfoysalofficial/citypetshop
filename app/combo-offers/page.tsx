export const revalidate = 300;

import Link from "next/link";
import { Package } from "lucide-react";
import { getComboOffers } from "@/src/data/provider";
import SafeImage from "@/components/media/SafeImage";

export default async function ComboOffersPage() {
  const combos = await getComboOffers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-primary sm:text-4xl">Combo Offers</h1>
      <p className="mt-2 text-sm font-semibold text-slate-700 sm:text-base">Save more with our bundled deals.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {combos.map((combo) => (
          <Link
            key={combo.id}
            href={combo.href}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
              <SafeImage
                src={combo.image}
                alt={combo.title}
                aspectRatio43
                fallbackSrc="/ui/product-4x3.svg"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition group-hover:scale-105"
              />
              {combo.comparePrice != null && combo.comparePrice > combo.price && (
                <span className="absolute right-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {Math.round(((combo.comparePrice - combo.price) / combo.comparePrice) * 100)}% OFF
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="font-bold text-slate-900 group-hover:text-primary sm:text-lg">{combo.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-700">{combo.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <p className="text-base font-bold text-secondary sm:text-lg">৳{combo.price.toLocaleString("en-BD")}</p>
                {combo.comparePrice != null && combo.comparePrice > combo.price && (
                  <p className="text-sm text-gray-500 line-through">৳{combo.comparePrice.toLocaleString("en-BD")}</p>
                )}
              </div>
              <span className="mt-3 inline-flex items-center gap-2 font-semibold text-brand group-hover:underline">
                <Package className="h-4 w-4" /> {combo.cta ?? "View Deal"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/shop" className="mt-8 inline-block font-semibold text-secondary hover:underline">View All Products →</Link>
    </div>
  );
}
