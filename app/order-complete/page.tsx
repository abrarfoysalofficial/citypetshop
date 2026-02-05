import Link from "next/link";
import { CheckCircle, PackageSearch } from "lucide-react";

export const metadata = {
  title: "Order Complete | City Plus Pet Shop",
  description: "Thank you for your order. Track your delivery here.",
};

export default function OrderCompletePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <CheckCircle className="h-20 w-20 text-emerald-500" />
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Thank you for your order</h1>
      <p className="mt-2 text-center text-slate-600">
        We will process it shortly and contact you for delivery. You can track your order below.
      </p>
      <Link
        href="/track-order"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
      >
        <PackageSearch className="h-5 w-5" />
        Track Order
      </Link>
      <Link href="/shop" className="mt-4 text-sm font-medium text-secondary hover:underline">
        Continue Shopping
      </Link>
    </div>
  );
}
