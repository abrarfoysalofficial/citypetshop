"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

/**
 * Reusable breadcrumb for admin pages.
 * Last item is rendered as plain text (current page).
 */
export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-sm text-slate-600 ${className}`}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            {isLast ? (
              <span className="font-medium text-slate-900">{item.label}</span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="hover:text-blue-600 hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
