"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Upload,
  Pencil,
  Package,
  Loader2,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";
import type { ProductRow } from "@/lib/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name_en: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    nameEn: "",
    nameBn: "",
    slug: "",
    descriptionEn: "",
    descriptionBn: "",
    sellingPrice: "",
    stock: "",
    categorySlug: "",
    isActive: true
  });
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<{ id: string; value: number } | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
      const res = await fetch(`/api/admin/products?${params}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (res.status === 403) {
        setProducts([]);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

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

  const createProduct = useCallback(async () => {
    if (!createForm.nameEn || !createForm.slug || !createForm.sellingPrice) {
      alert("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: createForm.nameEn,
          nameBn: createForm.nameBn,
          slug: createForm.slug,
          descriptionEn: createForm.descriptionEn,
          descriptionBn: createForm.descriptionBn,
          sellingPrice: parseFloat(createForm.sellingPrice),
          stock: parseInt(createForm.stock) || 0,
          categorySlug: createForm.categorySlug,
          isActive: createForm.isActive
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setCreateForm({
          nameEn: "",
          nameBn: "",
          slug: "",
          descriptionEn: "",
          descriptionBn: "",
          sellingPrice: "",
          stock: "",
          categorySlug: "",
          isActive: true
        });
        fetchProducts();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Create product error:", error);
      alert("Failed to create product");
    } finally {
      setCreating(false);
    }
  }, [createForm, fetchProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.is_active) ||
        (statusFilter === "inactive" && !p.is_active);
      return matchesStatus;
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
  }, [products, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} of {products.length} products
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your store.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name (English) *</label>
                    <Input
                      value={createForm.nameEn}
                      onChange={(e) => setCreateForm({ ...createForm, nameEn: e.target.value })}
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name (Bengali)</label>
                    <Input
                      value={createForm.nameBn}
                      onChange={(e) => setCreateForm({ ...createForm, nameBn: e.target.value })}
                      placeholder="পণ্যের নাম"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Slug *</label>
                    <Input
                      value={createForm.slug}
                      onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                      placeholder="product-slug"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={createForm.categorySlug}
                      onValueChange={(value) => setCreateForm({ ...createForm, categorySlug: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.slug} value={c.slug}>
                            {c.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Selling Price *</label>
                    <Input
                      type="number"
                      value={createForm.sellingPrice}
                      onChange={(e) => setCreateForm({ ...createForm, sellingPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stock</label>
                    <Input
                      type="number"
                      value={createForm.stock}
                      onChange={(e) => setCreateForm({ ...createForm, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description (English)</label>
                  <Textarea
                    value={createForm.descriptionEn}
                    onChange={(e) => setCreateForm({ ...createForm, descriptionEn: e.target.value })}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={createProduct} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" asChild>
            <Link href="/admin/products/bulk">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border bg-card p-4 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border bg-card shadow-sm"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("name_en")}
                  className="h-auto p-0 font-medium"
                >
                  Product
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("selling_price")}
                  className="h-auto p-0 font-medium"
                >
                  Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("stock")}
                  className="h-auto p-0 font-medium"
                >
                  Stock
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 font-medium">No products found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name_en}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-cover border"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.name_en}</p>
                        <p className="text-sm text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">৳{product.selling_price}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category_slug}</Badge>
                  </TableCell>
                  <TableCell>
                    {editingStock?.id === product.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editingStock.value}
                          onChange={(e) => setEditingStock({ id: product.id, value: parseInt(e.target.value) || 0 })}
                          className="w-20"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateStock(product.id, editingStock.value);
                            } else if (e.key === "Escape") {
                              setEditingStock(null);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => updateStock(product.id, editingStock.value)}
                          disabled={updatingStock === product.id}
                        >
                          {updatingStock === product.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingStock(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="link"
                        className="h-auto p-0"
                        onClick={() => setEditingStock({ id: product.id, value: product.stock })}
                      >
                        {product.stock} units
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/product/${product.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
