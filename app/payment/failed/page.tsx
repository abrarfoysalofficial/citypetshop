"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const cancelled = searchParams.get("cancelled") === "1";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <XCircle className="h-20 w-20 text-rose-500" />
      <h1 className="mt-6 text-2xl font-bold text-slate-900">
        {cancelled ? "Payment Cancelled" : "Payment Failed"}
      </h1>
      <p className="mt-2 text-center text-slate-600">
        {cancelled
          ? "You cancelled the payment. Your order is still pending."
          : "Your payment could not be processed. Please try again or choose another payment method."}
      </p>
      {orderId && (
        <Link
          href={`/checkout`}
          className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
        >
          Try Again
        </Link>
      )}
      <Link
        href="/cart"
        className="mt-4 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
      >
        Back to Cart
      </Link>
      <Link href="/" className="mt-4 text-sm font-medium text-secondary hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
