import Link from "next/link";
import { getBlogPostBySlug, getBlogPosts } from "@/src/data/provider";
import SafeImage from "@/components/media/SafeImage";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Blog | City Plus Pet Shop" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/blog" className="text-sm font-medium text-accent hover:underline">← Back to Blog</Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Post not found</h1>
        <p className="mt-2 text-slate-600">The blog post you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/blog" className="text-sm font-medium text-accent hover:underline">← Back to Blog</Link>
      <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100">
        <SafeImage
          src={post.coverImage}
          alt={post.title}
          fill
          fallbackSrc="/ui/blog-cover.svg"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </div>
      <time className="mt-4 block text-sm text-slate-500" dateTime={post.date}>{post.date}</time>
      <h1 className="mt-1 text-3xl font-bold text-primary">{post.title}</h1>
      <div className="mt-6 whitespace-pre-line text-slate-700">{post.content}</div>
      {post.faq && post.faq.length > 0 && (
        <section className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-xl font-bold text-slate-900">FAQ</h2>
          <ul className="mt-4 space-y-4">
            {post.faq.map((item, i) => (
              <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">{item.q}</h3>
                <p className="mt-2 text-slate-600">{item.a}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
