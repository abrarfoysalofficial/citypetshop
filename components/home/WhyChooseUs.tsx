import { Shield, Truck, BadgeDollarSign, Headphones } from "lucide-react";

const REASONS = [
  { icon: Shield, title: "Authentic products", desc: "Genuine brands, verified sources." },
  { icon: Truck, title: "Fast delivery", desc: "Nationwide shipping across Bangladesh." },
  { icon: BadgeDollarSign, title: "Best value pricing", desc: "Competitive prices, no hidden fees." },
  { icon: Headphones, title: "Expert support", desc: "Pet care advice when you need it." },
];

export default function WhyChooseUs() {
  return (
    <section className="border-b border-slate-200 bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">Why Choose Us</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
          Your trusted partner for premium pet care in Bangladesh.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-card border border-[var(--border-light)] bg-white p-6 shadow-soft transition hover:shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--brand-muted)] text-[var(--teal-from)]">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
