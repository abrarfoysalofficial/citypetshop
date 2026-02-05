import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString("en-GB")}</p>

      <div className="mt-8 space-y-6 text-gray-600">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. Use of Service</h2>
          <p className="mt-2">
            By using City Plus Pet Shop (City Pet Shop bd) and placing orders, you agree to these
            terms. Our website and services are intended for personal, non-commercial use to
            purchase pet products.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. Orders & Payment</h2>
          <p className="mt-2">
            All prices are in Bangladeshi Taka (BDT). We accept payment methods as displayed at
            checkout. Orders are subject to availability. We reserve the right to refuse or cancel
            orders in case of errors or stock issues.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. Delivery</h2>
          <p className="mt-2">
            Delivery times and charges depend on your location. We aim to deliver within the
            stated timeframe. Risk of loss passes to you upon delivery. Please ensure someone is
            available to receive the order.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">4. Returns & Refunds</h2>
          <p className="mt-2">
            Please contact us for return or refund requests. We handle cases of defective or
            incorrect items in accordance with our return policy. Some items may be non-returnable
            for hygiene reasons.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">5. Contact</h2>
          <p className="mt-2">
            For questions about these Terms & Conditions, contact us at{" "}
            <a href="mailto:info@citypluspetshop.com" className="text-secondary hover:underline">
              info@citypluspetshop.com
            </a>{" "}
            or +880 1643-390045. Address: Mirpur 2, Borobag, Dhaka, Bangladesh.
          </p>
        </section>
      </div>

      <div className="mt-10 border-t border-gray-200 pt-8">
        <Link href="/" className="font-semibold text-secondary hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
