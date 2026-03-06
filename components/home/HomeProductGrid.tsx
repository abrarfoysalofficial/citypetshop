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
    <section className="py-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-[var(--text-primary)] md:text-2xl lg:text-3xl">{title}</h2>
          {subtitle && <p className="mx-auto mt-1 max-w-xl text-sm text-[var(--text-secondary)] md:mt-2 md:text-base">{subtitle}</p>}
        </div>
        <motion.div
          className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
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
