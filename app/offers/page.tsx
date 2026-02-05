import Link from "next/link";

export default function OffersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-primary sm:text-4xl">Offers</h1>
      <p className="mt-2 text-sm font-semibold text-gray-700 sm:text-base">Current deals and promotions from City Plus Pet Shop.</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-6">
          <h2 className="text-lg font-bold text-primary sm:text-xl">Free Delivery</h2>
          <p className="mt-2 text-sm font-medium text-gray-700 sm:text-base">
            Enjoy free delivery on orders above ৳1500 within Dhaka. Terms apply.
          </p>
          <Link href="/shop" className="mt-4 inline-block font-semibold text-secondary hover:underline">
            Shop Now →
          </Link>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-primary sm:text-xl">New Arrivals</h2>
          <p className="mt-2 text-sm font-medium text-gray-700 sm:text-base">
            Check out our latest cat food, litter, and health products. New items added regularly.
          </p>
          <Link href="/shop" className="mt-4 inline-block font-semibold text-secondary hover:underline">
            View All Products →
          </Link>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        For the latest offers, follow us on social media or contact us at +880 1643-390045.
      </p>
    </div>
  );
}
