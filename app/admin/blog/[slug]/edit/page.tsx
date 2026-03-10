"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBlog } from "@/store/BlogContext";
import { useState, useEffect } from "react";

export default function AdminEditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = decodeURIComponent(String(params.slug ?? ""));
  const { getPostBySlug, updatePost } = useBlog();
  const existing = getPostBySlug(slugParam);

  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [content, setContent] = useState("");
  const [faqText, setFaqText] = useState("");

  useEffect(() => {
    if (existing) {
      setSlug(existing.slug);
      setDate(existing.date.slice(0, 10));
      setTitle(existing.title);
      setMetaTitle(existing.metaTitle);
      setMetaDescription(existing.metaDescription);
      setKeywords(existing.keywords.join(", "));
      setContent(existing.content);
      setFaqText(existing.faq.map((f) => `${f.q}||${f.a}`).join("\n"));
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slugTrim = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const faq = faqText
      .split("\n")
      .map((line) => {
        const [q, a] = line.split("||").map((s) => s.trim());
        return q && a ? { q, a } : null;
      })
      .filter((x): x is { q: string; a: string } => !!x);
    updatePost(slugParam, {
      slug: slugTrim,
      date: date.slice(0, 10),
      title: title.trim(),
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim(),
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      content: content.trim(),
      faq,
    });
    router.push("/admin/blog");
  };

  if (!existing) {
    return (
      <div>
        <Link href="/admin/blog" className="text-sm text-primary hover:underline">
          ← Back to Blog
        </Link>
        <p className="mt-4 text-slate-600">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/blog" className="text-sm text-primary hover:underline">
          ← Back to Blog
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit Blog Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Slug (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Meta Title</label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Meta Description</label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Keywords (comma-separated)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            rows={12}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">FAQ (one per line: Question||Answer)</label>
          <textarea
            value={faqText}
            onChange={(e) => setFaqText(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            rows={4}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Update Post
          </button>
          <Link
            href="/admin/blog"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
