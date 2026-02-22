export const dynamic = "force-dynamic";

import Link from "next/link";
import { getBlogPosts } from "@/src/data/provider";
import SafeImage from "@/components/media/SafeImage";

export const metadata = {
  title: "Blog | City Plus Pet Shop",
  description: "Pet care tips, news, and updates from City Plus Pet Shop.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary">Blog</h1>
      <p className="mt-2 text-slate-600">Pet care tips, news, and updates from City Plus Pet Shop.</p>

      <ul className="mt-10 space-y-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:flex-row sm:items-stretch"
            >
              <div className="relative w-full aspect-[4/3] shrink-0 overflow-hidden bg-gray-100 sm:w-72 sm:aspect-square">
                <SafeImage
                  src={post.thumbnailImage}
                  alt={post.title}
                  aspectRatio43
                  fallbackSrc="/ui/blog-cover.svg"
                  sizes="(max-width: 640px) 100vw, 288px"
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <time className="text-sm text-slate-500" dateTime={post.date}>{post.date}</time>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 group-hover:text-primary sm:text-2xl">{post.title}</h2>
                <p className="mt-2 line-clamp-2 text-slate-600">{post.excerpt}</p>
                <span className="mt-3 font-semibold text-accent group-hover:underline">Read more →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
