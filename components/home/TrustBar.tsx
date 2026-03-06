import { Shield, Truck, Headphones, CreditCard } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Truck, title: "Fast Delivery", desc: "Nationwide shipping" },
  { icon: Shield, title: "Authentic Products", desc: "100% genuine brands" },
  { icon: Headphones, title: "Customer Service Support", desc: "Dedicated support" },
  { icon: CreditCard, title: "Flexible Payments", desc: "COD, bKash, Card" },
];

export default function TrustBar() {
  return (
    <section className="border-b border-[var(--border-light)] bg-white py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center rounded-card border border-[var(--border-light)] bg-white p-4 shadow-soft transition-shadow hover:shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-muted)] text-[var(--teal-from)]">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
