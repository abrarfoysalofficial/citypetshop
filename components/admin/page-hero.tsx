"use client";

import { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

type PageHeroProps = {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
};

/**
 * Consistent page header for admin pages.
 * Combines breadcrumb, title, description, and optional actions.
 */
export function PageHero({
  title,
  description,
  breadcrumb,
  actions,
  className = "",
}: PageHeroProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb items={breadcrumb} className="mb-3" />
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-slate-600">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
