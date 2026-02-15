"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Upload, 
  Pencil, 
  Package, 
  Loader2, 
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import type { ProductRow } from "@/lib/schema";
import { isSupabaseConfigured } from "@/src/config/env";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<{ id: string; value: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    setUpdatingStock(productId);
    try {
      const res = await fetch("/api/admin/products/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, stock: newStock }),
      });
      if (res.ok) {
        await fetchProducts();
        setEditingStock(null);
      } else {
        alert("Failed to update stock");
      }
    } catch (err) {
      alert("Error updating stock");
    } finally {
      setUpdatingStock(null);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category_slug));
    return Array.from(cats);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category_slug === categoryFilter;
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && p.is_active) ||
                           (statusFilter === "inactive" && !p.is_active);
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof ProductRow];
      let bVal: any = b[sortBy as keyof ProductRow];
      
      if (sortBy === "selling_price" || sortBy === "stock") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700">
            <p className="font-medium mb-1">Unable to load products</p>
            <p>Service temporarily unavailable. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-slate-600">{filteredProducts.length} of {products.length} products</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            New Product
          </Link>
          <Link
            href="/admin/products/bulk"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </Link>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-4 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4">
                  <button
                    onClick={() => toggleSort("name_en")}
                    className="flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
                  >
                    Product
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4">
                  <button
                    onClick={() => toggleSort("selling_price")}
                    className="flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
                  >
                    Price
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4 font-medium text-slate-700">Category</th>
                <th className="p-4">
                  <button
                    onClick={() => toggleSort("stock")}
                    className="flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
                  >
                    Stock
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4 font-medium text-slate-700">Status</th>
                <th className="p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name_en}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                          />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{product.name_en}</p>
                          <p className="text-xs text-slate-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-900">৳{product.selling_price}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {product.category_slug}
                      </span>
                    </td>
                    <td className="p-4">
                      {editingStock?.id === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingStock.value}
                            onChange={(e) => setEditingStock({ id: product.id, value: parseInt(e.target.value) || 0 })}
                            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateStock(product.id, editingStock.value);
                              } else if (e.key === "Escape") {
                                setEditingStock(null);
                              }
                            }}
                          />
                          <button
                            onClick={() => updateStock(product.id, editingStock.value)}
                            disabled={updatingStock === product.id}
                            className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {updatingStock === product.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingStock(null)}
                            className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingStock({ id: product.id, value: product.stock })}
                          className="font-medium text-slate-900 hover:text-blue-600 cursor-pointer hover:underline"
                        >
                          {product.stock} units
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        product.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/product/${product.id}`}
                          target="_blank"
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                          title="View Product"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                          title="Edit Product"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
