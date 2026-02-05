import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString("en-GB")}</p>

      <div className="mt-8 space-y-6 text-gray-600">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. Information We Collect</h2>
          <p className="mt-2">
            We may collect information you provide when you place an order, contact us, or sign up
            for updates. This may include your name, phone number, email, delivery address, and
            payment details as necessary to process your order.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p className="mt-2">
            We use your information to process orders, deliver products, communicate with you
            about your orders, and improve our services. We do not sell your personal information
            to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. Data Security</h2>
          <p className="mt-2">
            We take reasonable steps to protect your personal information. Payment and sensitive
            data are handled in accordance with applicable security practices.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900">4. Contact</h2>
          <p className="mt-2">
            For questions about this Privacy Policy, contact us at{" "}
            <a href="mailto:info@citypluspetshop.com" className="text-secondary hover:underline">
              info@citypluspetshop.com
            </a>{" "}
            or call +880 1643-390045.
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
