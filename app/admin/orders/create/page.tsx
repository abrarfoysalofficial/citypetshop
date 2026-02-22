"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";

type ProductOption = { id: string; nameEn: string; sellingPrice: number; slug: string };

type LineItem = {
  productId?: string;
  name: string;
  qty: number;
  price: number;
};

export default function CreateOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ProductOption[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingArea, setShippingArea] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [voucherCode, setVoucherCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(() => {
    fetch("/api/admin/products?limit=500")
      .then((r) => r.json())
      .then((d) => {
        if (d?.products) setProducts(d.products);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const q = search.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.nameEn?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q)
    );
    setSearchResults(filtered.slice(0, 10));
  }, [search, products]);

  const addItem = (p: ProductOption) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.nameEn,
          qty: 1,
          price: Number(p.sellingPrice),
        },
      ];
    });
    setSearch("");
    setSearchResults([]);
  };

  const addManualItem = () => {
    setItems((prev) => [...prev, { name: "Custom Item", qty: 1, price: 0 }]);
  };

  const updateItem = (idx: number, updates: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const total = Math.max(0, subtotal + deliveryCharge - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Add at least one item");
      return;
    }
    if (!customerName.trim() || !phone.trim()) {
      setError("Customer name and phone are required");
      return;
    }
    if (!shippingAddress.trim() || !shippingCity.trim()) {
      setError("Shipping address and city are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          shippingAddress: shippingAddress.trim(),
          shippingCity: shippingCity.trim(),
          shippingArea: shippingArea.trim() || undefined,
          shippingNotes: shippingNotes.trim() || undefined,
          orderNotes: orderNotes.trim() || undefined,
          items: items.map((i) => ({
            productId: i.productId || null,
            name: i.name,
            qty: i.qty,
            price: i.price,
          })),
          subtotal,
          deliveryCharge,
          discountAmount,
          total,
          paymentMethod,
          voucherCode: voucherCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create order");
        return;
      }
      router.push(`/admin/orders/${data.orderId}`);
    } catch (err) {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Create Order</h1>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product search */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Items</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm"
            />
            {searchResults.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-48 overflow-auto">
                {searchResults.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => addItem(p)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex justify-between"
                    >
                      <span>{p.nameEn}</span>
                      <span className="text-slate-500">৳{Number(p.sellingPrice).toLocaleString()}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={addManualItem}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add custom item
          </button>

          {items.length > 0 && (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-2 text-left font-medium">Product</th>
                  <th className="p-2 text-right font-medium w-20">Qty</th>
                  <th className="p-2 text-right font-medium w-24">Price</th>
                  <th className="p-2 text-right font-medium w-24">Total</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(idx, { name: e.target.value })}
                        className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => updateItem(idx, { qty: parseInt(e.target.value, 10) || 1 })}
                        className="w-16 rounded border border-slate-200 px-2 py-1 text-right text-sm"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price}
                        onChange={(e) => updateItem(idx, { price: parseFloat(e.target.value) || 0 })}
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-right text-sm"
                      />
                    </td>
                    <td className="p-2 text-right font-medium">
                      ৳{(item.qty * item.price).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Customer & shipping */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Customer & Shipping</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
              <input
                type="text"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
              <input
                type="text"
                value={shippingArea}
                onChange={(e) => setShippingArea(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Shipping notes</label>
              <input
                type="text"
                value={shippingNotes}
                onChange={(e) => setShippingNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Order notes</label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Totals</h2>
          <div className="grid gap-4 sm:grid-cols-2 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery charge</label>
              <input
                type="number"
                min={0}
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount</label>
              <input
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="cod">Cash on Delivery</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="sslcommerz">Card / Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Voucher code</label>
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="font-medium text-slate-700">Subtotal: ৳{subtotal.toLocaleString()}</span>
            <span className="text-xl font-bold text-slate-900">Total: ৳{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Order
          </button>
          <Link
            href="/admin/orders"
            className="rounded-lg border border-slate-200 px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
