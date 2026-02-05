"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

const DEFAULT_FALLBACK = "/ui/product-4x3.svg";
export const PRODUCT_PLACEHOLDER = "/products/placeholder.webp";

export interface SafeImageProps {
  src: string | undefined | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  sizes?: string;
  /** Enforce 4:3 aspect ratio wrapper (for product cards) */
  aspectRatio43?: boolean;
  /** Show shimmer skeleton while loading */
  showShimmer?: boolean;
}

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  fallbackSrc = DEFAULT_FALLBACK,
  priority = false,
  sizes,
  aspectRatio43 = false,
  showShimmer = true,
}: SafeImageProps) {
  const [effectiveSrc, setEffectiveSrc] = useState(() => {
    const s = (src || "").trim();
    if (!s || s.startsWith("undefined") || s.startsWith("null")) return fallbackSrc;
    return s;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (effectiveSrc !== fallbackSrc) {
      setEffectiveSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  }, [fallbackSrc, effectiveSrc]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const finalSrc = hasError ? fallbackSrc : effectiveSrc;

  const useFill = fill ?? aspectRatio43;
  const content = (
    <>
      {showShimmer && isLoading && (
        <div className="absolute inset-0 bg-slate-200" aria-hidden>
          <div className="h-full w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
      )}
      <Image
        src={finalSrc}
        alt={alt}
        fill={useFill}
        width={!useFill ? width : undefined}
        height={!useFill ? height : undefined}
        className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"} ${className}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes ?? (aspectRatio43 ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" : undefined)}
        unoptimized={finalSrc.startsWith("data:")}
      />
    </>
  );

  if (aspectRatio43) {
    return (
      <div className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: "4/3" }}>
        {content}
      </div>
    );
  }

  if (fill) {
    return <div className="relative h-full w-full overflow-hidden bg-slate-100">{content}</div>;
  }

  return (
    <div className="relative overflow-hidden bg-slate-100" style={{ width: width ?? "100%", height: height ?? "auto" }}>
      {content}
    </div>
  );
}
