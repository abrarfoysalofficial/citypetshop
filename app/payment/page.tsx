import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment | City Plus Pet Shop",
  description: "Complete your payment securely.",
};

/** Payment page: for COD flow, order is already placed; redirect to success. For other gateways, show method selection (future). */
export default function PaymentPage() {
  // When coming from checkout with COD, order is placed and we redirect to success.
  // For bKash/Nagad/SSLCommerz we would show gateway UI here.
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Payment</h1>
      <p className="mt-2 text-slate-600">
        Cash on Delivery is currently the only active payment method. Your order will be confirmed after you place it at checkout.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/checkout"
          className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white hover:bg-primary/90"
        >
          Go to Checkout
        </Link>
        <Link href="/cart" className="text-center font-medium text-secondary hover:underline">
          Back to Cart
        </Link>
      </div>
    </div>
  );
}
