"use client";

import Link from "next/link";
import {
  Package,
  Heart,
  Gamepad2,
  Layers,
  Dog,
  Bird,
  Fish,
  Rabbit,
  ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  { slug: "cat-accessories", label: "Cat Accessories", icon: Package },
  { slug: "care-health", label: "Care & Health", icon: Heart },
  { slug: "cat-toys", label: "Cat Toys", icon: Gamepad2 },
  { slug: "cat-litter", label: "Cat Litter", icon: Layers },
  { slug: "dog-food", label: "Dog Food", icon: Dog },
  { slug: "bird-food", label: "Bird Food", icon: Bird },
  { slug: "fish-food", label: "Fish Food", icon: Fish },
  { slug: "small-pets", label: "Small Pets", icon: Rabbit },
];

export default function CategorySidebar() {
  return (
    <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm lg:w-56">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Categories</h2>
      </div>
      <nav className="py-2" aria-label="Category menu">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-primary/5 hover:text-primary"
            >
              <Icon className="h-5 w-5 shrink-0 text-slate-500" />
              <span className="flex-1">{cat.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
