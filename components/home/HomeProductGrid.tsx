"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import type { DisplayProduct } from "@/components/ProductCard";

interface HomeProductGridProps {
  products: DisplayProduct[];
  title?: string;
  subtitle?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function HomeProductGrid({ products, title = "Most Popular Products", subtitle }: HomeProductGridProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mx-auto mt-2 max-w-xl text-slate-600">{subtitle}</p>}
        </div>
        <motion.div
          className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {products.map((p) => (
            <motion.div key={p.id} variants={item}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
