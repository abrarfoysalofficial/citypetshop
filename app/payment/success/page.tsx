"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState<"loading" | "paid" | "pending" | "failed" | "error">("loading");

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }
    fetch(`/api/checkout/order/${encodeURIComponent(orderId)}/payment-status`)
      .then((r) => r.json())
      .then((d: { paid?: boolean; paymentStatus?: string }) => {
        if (d.paid) setStatus("paid");
        else if (d.paymentStatus === "failed") setStatus("failed");
        else setStatus("pending");
      })
      .catch(() => setStatus("error"));
  }, [orderId]);

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
        <Loader2 className="h-20 w-20 animate-spin text-slate-400" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Verifying payment…</h1>
        <p className="mt-2 text-center text-slate-600">
          Please wait while we confirm your payment.
        </p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
        <XCircle className="h-20 w-20 text-rose-500" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Payment Failed</h1>
        <p className="mt-2 text-center text-slate-600">
          Your payment could not be confirmed. Please try again or contact support.
        </p>
        {orderId && (
          <Link
            href={`/checkout`}
            className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
          >
            Try Again
          </Link>
        )}
        <Link href="/" className="mt-4 text-sm font-medium text-secondary hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
        <Loader2 className="h-20 w-20 animate-spin text-amber-500" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Payment Processing</h1>
        <p className="mt-2 text-center text-slate-600">
          Your payment is being processed. This may take a few moments. You can check your order
          status shortly.
        </p>
        {orderId && (
          <Link
            href={`/order-complete?orderId=${encodeURIComponent(orderId)}`}
            className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
          >
            View Order
          </Link>
        )}
        <Link href="/" className="mt-4 text-sm font-medium text-secondary hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
        <XCircle className="h-20 w-20 text-rose-500" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-center text-slate-600">
          We couldn&apos;t verify your order. Please check your email or contact support.
        </p>
        <Link href="/" className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90">
          Back to Home
        </Link>
      </div>
    );
  }

  // status === "paid"
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <CheckCircle className="h-20 w-20 text-emerald-500" />
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Payment Successful</h1>
      <p className="mt-2 text-center text-slate-600">
        Thank you for your order. We will process it shortly and send you a confirmation.
      </p>
      {orderId && (
        <Link
          href={`/order-complete?orderId=${encodeURIComponent(orderId)}`}
          className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          View Order
        </Link>
      )}
      <Link
        href="/shop"
        className="mt-4 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
      >
        Continue Shopping
      </Link>
      <Link href="/" className="mt-4 text-sm font-medium text-secondary hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
