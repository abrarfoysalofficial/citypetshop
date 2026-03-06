import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

export const metadata: Metadata = {
  title: "Sitemap | City Plus Pet Shop",
  description: "Browse all pages on City Plus Pet Shop.",
};

const SECTIONS = [
  { title: "Main", links: ["/", "/shop", "/blog", "/about", "/contact"] },
  { title: "Shop", links: ["/shop", "/shop?category=dog", "/shop?category=cat"] },
];

export default function SiteMapPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Sitemap</h1>
      <p className="mt-2 text-slate-600">
        All pages on City Plus Pet Shop.
      </p>
      <div className="mt-8 space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-medium text-slate-800">{section.title}</h2>
            <ul className="mt-2 space-y-1">
              {section.links.map((href) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-blue-600 hover:underline"
                  >
                    {SITE_URL}{href}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
