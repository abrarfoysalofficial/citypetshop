import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-primary">Refund Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString("en-GB")}</p>

      <div className="mt-8 space-y-6 text-slate-600">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1. Eligibility</h2>
          <p className="mt-2">
            Refunds are considered for defective or incorrect items, or when an order is cancelled before dispatch.
            Some items (e.g. perishable or hygiene-sensitive) may be non-refundable.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">2. How to Request</h2>
          <p className="mt-2">
            Contact us at info@citypluspetshop.com or +880 1643-390045 with your order ID and reason.
            We will respond within 24–48 hours and guide you through the process.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">3. Processing</h2>
          <p className="mt-2">
            Approved refunds are processed within 5–10 business days to the original payment method.
            For Cash on Delivery, we will arrange bank transfer or bKash as applicable.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">4. Contact</h2>
          <p className="mt-2">
            Mirpur 2, Borobag, Dhaka, Bangladesh. Phone: +880 1643-390045.
          </p>
        </section>
      </div>

      <div className="mt-10 border-t border-slate-200 pt-8">
        <Link href="/" className="font-semibold text-secondary hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
