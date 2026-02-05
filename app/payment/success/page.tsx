import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <CheckCircle className="h-20 w-20 text-emerald-500" />
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Payment Successful</h1>
      <p className="mt-2 text-center text-slate-600">
        Thank you for your order. We will process it shortly and send you a confirmation.
      </p>
      <Link
        href="/shop"
        className="mt-8 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
      >
        Continue Shopping
      </Link>
      <Link href="/" className="mt-4 text-sm font-medium text-secondary hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
