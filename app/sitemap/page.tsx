import Link from "next/link";
import { products, categories } from "@/lib/data";

export default function SitemapPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypluspetshop.com";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-primary">Sitemap</h1>
      <p className="mt-2 text-slate-600">All pages on City Plus Pet Shop.</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Main</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
          <li><Link href="/" className="hover:text-primary">Home</Link></li>
          <li><Link href="/shop" className="hover:text-primary">Shop</Link></li>
          <li><Link href="/offers" className="hover:text-primary">Offers</Link></li>
          <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
          <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
          <li><Link href="/track-order" className="hover:text-primary">Track Order</Link></li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="hover:text-primary">{c.name}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Products</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
          {products.slice(0, 30).map((p) => (
            <li key={p.id}>
              <Link href={`/product/${p.id}`} className="hover:text-primary">{p.name}</Link>
            </li>
          ))}
          {products.length > 30 && <li className="text-slate-500">… and more in Shop</li>}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Legal & Utility</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
          <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
          <li><Link href="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
          <li><Link href="/refund" className="hover:text-primary">Refund Policy</Link></li>
          <li><Link href="/payment/success" className="hover:text-primary">Payment Success</Link></li>
          <li><Link href="/payment/failed" className="hover:text-primary">Payment Failed</Link></li>
        </ul>
      </section>
    </div>
  );
}
