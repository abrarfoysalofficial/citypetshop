"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { useCategories } from "@/context/CategoriesContext";
import { useState, useEffect } from "react";

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");
  const { products, setProducts } = useProducts();
  const { categories } = useCategories();
  const product = products.find((p) => p.id === id);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [image, setImage] = useState("");
  const [inStock, setInStock] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price));
      setDescription(product.description);
      setCategorySlug(product.categorySlug);
      setImage(product.image);
      setInStock(product.inStock !== false);
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const priceNum = parseInt(price, 10);
    if (Number.isNaN(priceNum) || priceNum < 0) return;
    setProducts(
      products.map((p) =>
        p.id === id
          ? {
              ...p,
              name: name.trim(),
              price: priceNum,
              description: description.trim(),
              categorySlug: categorySlug.trim() || p.categorySlug,
              image: image.trim() || p.image,
              inStock,
            }
          : p
      )
    );
    router.push("/admin/products");
  };

  if (!product) {
    return (
      <div>
        <Link href="/admin/products" className="text-sm text-primary hover:underline">
          ← Back to Products
        </Link>
        <p className="mt-4 text-slate-600">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-primary hover:underline">
          ← Back to Products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Price (৳)</label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="in-stock"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="in-stock" className="text-sm text-slate-700">
              In stock
            </label>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Update Product
          </button>
          <Link
            href="/admin/products"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
