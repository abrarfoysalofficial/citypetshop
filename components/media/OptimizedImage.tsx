"use client";

/**
 * Phase 1: Lazy image loading + WebP/AVIF optimization.
 * Wraps Next.js Image with loading="lazy", sizes, and priority for LCP.
 */
import Image from "next/image";
import { useState, useCallback } from "react";

const FALLBACK = "/ui/product-4x3.svg";

export interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  /** LCP image: use priority + fetchPriority="high" */
  priority?: boolean;
  /** Aspect ratio wrapper for product cards */
  aspectRatio?: "4/3" | "1/1" | "16/9";
  sizes?: string;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority = false,
  aspectRatio,
  sizes,
  fallbackSrc = FALLBACK,
}: OptimizedImageProps) {
  const [effectiveSrc, setEffectiveSrc] = useState(() => {
    const s = (src || "").trim();
    if (!s || s.startsWith("undefined") || s.startsWith("null")) return fallbackSrc;
    return s;
  });
  const [loading, setLoading] = useState(true);

  const handleError = useCallback(() => {
    if (effectiveSrc !== fallbackSrc) setEffectiveSrc(fallbackSrc);
    setLoading(false);
  }, [fallbackSrc, effectiveSrc]);

  const handleLoad = useCallback(() => setLoading(false), []);

  const useFill = fill ?? !!aspectRatio;
  const defaultSizes = aspectRatio
    ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
    : undefined;

  const content = (
    <>
      {loading && (
        <div
          className="absolute inset-0 bg-slate-200 animate-pulse"
          aria-hidden
        />
      )}
      <Image
        src={effectiveSrc}
        alt={alt}
        fill={useFill}
        width={!useFill ? width : undefined}
        height={!useFill ? height : undefined}
        className={`object-cover transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        } ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={sizes ?? defaultSizes}
        unoptimized={effectiveSrc.startsWith("data:")}
        // Next.js 14 supports quality; default 75 is good for WebP
        quality={85}
      />
    </>
  );

  if (aspectRatio) {
    return (
      <div
        className="relative w-full overflow-hidden bg-slate-100"
        style={{ aspectRatio }}
      >
        {content}
      </div>
    );
  }

  if (fill) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-slate-100">
        {content}
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden bg-slate-100"
      style={{ width: width ?? "100%", height: height ?? "auto" }}
    >
      {content}
    </div>
  );
}
