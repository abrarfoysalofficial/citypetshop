const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage: string;
}

interface BlogPostingSchemaProps {
  post: BlogPost;
}

export default function BlogPostingSchema({ post }: BlogPostingSchemaProps) {
  const url = `${BASE}/blog/${post.slug}`;
  const image = post.coverImage?.startsWith("http") ? post.coverImage : `${BASE}${post.coverImage?.startsWith("/") ? "" : "/"}${post.coverImage || ""}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: image || undefined,
    url,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "City Plus Pet Shop",
      url: BASE,
    },
    publisher: {
      "@type": "Organization",
      name: "City Plus Pet Shop",
      url: BASE,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
