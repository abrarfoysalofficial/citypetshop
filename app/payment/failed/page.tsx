import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <XCircle className="h-20 w-20 text-rose-500" />
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Payment Failed</h1>
      <p className="mt-2 text-center text-slate-600">
        Your payment could not be processed. Please try again or choose another payment method.
      </p>
      <Link
        href="/cart"
        className="mt-8 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
      >
        Back to Cart
      </Link>
      <Link href="/" className="mt-4 text-sm font-medium text-secondary hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
