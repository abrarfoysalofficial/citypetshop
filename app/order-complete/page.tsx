"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, PackageSearch, Download } from "lucide-react";
import { useState } from "react";

export default function OrderCompletePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!orderId || orderId.startsWith("ORD-")) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/invoice?orderId=${encodeURIComponent(orderId)}`);
      if (!res.ok) throw new Error("Failed to generate invoice");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail for invalid order IDs
    } finally {
      setDownloading(false);
    }
  };

  const canDownloadInvoice = orderId && !orderId.startsWith("ORD-");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16"
    >
      <CheckCircle className="h-20 w-20 text-emerald-500" />
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Thank you for your order</h1>
      <p className="mt-2 text-center text-slate-600">
        We will process it shortly and contact you for delivery. You can track your order below.
      </p>
      {orderId && (
        <p className="mt-2 text-center text-sm font-mono text-slate-500">
          Order ID: {orderId.length > 20 ? `${orderId.slice(0, 8)}...` : orderId}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3">
        {canDownloadInvoice && (
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            {downloading ? "Generating…" : "Download Invoice"}
          </button>
        )}
        <Link
          href={orderId ? `/track-order?orderId=${encodeURIComponent(orderId)}` : "/track-order"}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
        >
          <PackageSearch className="h-5 w-5" />
          Track Order
        </Link>
      </div>
      <Link href="/shop" className="mt-6 text-sm font-medium text-secondary hover:underline">
        Continue Shopping
      </Link>
    </motion.div>
  );
}
