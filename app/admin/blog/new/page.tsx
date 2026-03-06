"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBlog } from "@/store/BlogContext";
import type { BlogPost } from "@lib/content";

export default function AdminNewBlogPage() {
  const router = useRouter();
  const { addPost } = useBlog();
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [content, setContent] = useState("");
  const [faqText, setFaqText] = useState(""); // "Q1||A1\nQ2||A2"

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
    const post: BlogPost = {
      slug: slugTrim,
      date,
      title: title.trim(),
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || "",
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      content: content.trim(),
      faq,
    };
    addPost(post);
    router.push("/admin/blog");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/blog" className="text-sm text-primary hover:underline">
          ← Back to Blog
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">New Blog Post</h1>
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
              placeholder="my-post-slug"
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
            placeholder="dog food, pet shop"
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
            placeholder="পাপি ফুড কত মাস পর্যন্ত দেব?||সাধারণত 12 মাস।"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Create Post
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
