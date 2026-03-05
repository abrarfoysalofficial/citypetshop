"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, GitCompare, Star, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/CartContext";
import { useCompare } from "@/store/CompareContext";
import { getProductRichContent } from "@/lib/content";
import SafeImage from "@/components/media/SafeImage";
import LowStockBadge from "@/components/trust/LowStockBadge";
import DeliveryETA from "@/components/trust/DeliveryETA";
import ProductReviewForm from "@/components/product/ProductReviewForm";
import { DEFAULT_LOW_STOCK_THRESHOLD, DEFAULT_DELIVERY_ETA_INSIDE } from "@/lib/commerce-settings";
import { addRecentlyViewed } from "@/lib/recently-viewed";
import { captureEvent } from "@/lib/analytics";
import { PRODUCT_PLACEHOLDER } from "@/components/media/SafeImage";
import type { Product, ProductVariation } from "@/src/data/types";
import type { Product as CartProduct } from "@/lib/types";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

function toCartProduct(p: Product): CartProduct {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.shortDesc ?? p.longDesc ?? "",
    categorySlug: p.categorySlug,
    image: p.images?.[0] ?? p.image ?? PRODUCT_PLACEHOLDER,
    inStock: p.inStock,
  };
}

function resolveImageUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const base = SITE_URL.endsWith("/") ? SITE_URL.slice(0, -1) : SITE_URL;
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

const MAGNIFIER_SIZE = 120;
const MAGNIFIER_ZOOM = 2.2;

interface ProductImageGalleryProps {
  mainImage: string;
  images: string[] | undefined;
  selectedImageIndex: number;
  productName: string;
  onSelectImage: (index: number) => void;
  onOpenZoom: () => void;
}

function ProductImageGallery({
  mainImage,
  images,
  selectedImageIndex,
  productName,
  onSelectImage,
  onOpenZoom,
}: ProductImageGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    },
    []
  );

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setMousePos(null);
  }, []);

  const imageList = images && images.length > 1 ? images : [mainImage];
  const resolvedMainUrl = resolveImageUrl(mainImage);

  return (
    <div className="space-y-4">
      {/* Magnifier interactions are mouse-only; suppress on touch via CSS media query */}
      <div
        ref={containerRef}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-gray-100"
        onClick={onOpenZoom}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpenZoom()}
        aria-label="View larger image"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ touchAction: "manipulation" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mainImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <SafeImage
              src={mainImage}
              alt={productName}
              fill
              fallbackSrc={PRODUCT_PLACEHOLDER}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              showShimmer
            />
          </motion.div>
        </AnimatePresence>
        {/* Magnifier: rendered only when mouse hover is active (no-op on touch) */}
        {isHovering && mousePos && containerRef.current && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-10 hidden rounded-full border-2 border-white/80 bg-white shadow-xl md:block"
            style={{
              width: MAGNIFIER_SIZE,
              height: MAGNIFIER_SIZE,
              left: Math.max(0, Math.min(containerRef.current.offsetWidth - MAGNIFIER_SIZE, (mousePos.x / 100) * containerRef.current.offsetWidth - MAGNIFIER_SIZE / 2)),
              top: Math.max(0, Math.min(containerRef.current.offsetHeight - MAGNIFIER_SIZE, (mousePos.y / 100) * containerRef.current.offsetHeight - MAGNIFIER_SIZE / 2)),
              backgroundImage: `url(${resolvedMainUrl})`,
              backgroundSize: `${MAGNIFIER_ZOOM * 100}%`,
              backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
            }}
          />
        )}
      </div>
      {imageList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageList.map((img, i) => (
            <motion.button
              key={`${img}-${i}`}
              type="button"
              onClick={() => onSelectImage(i)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                selectedImageIndex === i ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={img}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative h-full w-full"
                >
                  <SafeImage src={img} alt={`${productName} image ${i + 1}`} fill fallbackSrc={PRODUCT_PLACEHOLDER} className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductDetailContentProps {
  product: Product;
}

export default function ProductDetailContent({ product }: ProductDetailContentProps) {
  const router = useRouter();
  const { addItem, clearCart, openCart } = useCart();
  const [buyNowProcessing, setBuyNowProcessing] = useState(false);
  const [toast, setToast] = useState("");
  const buyNowInProgress = useRef(false);
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const variations = useMemo(() => product.variations ?? [], [product.variations]);
  const defaultVariation = useMemo(
    () =>
      product.defaultVariationId
        ? variations.find((v) => v.id === product.defaultVariationId)
        : variations[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- variations is memoized above; product.variations reference is intentional
    [variations, product.defaultVariationId]
  );
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(defaultVariation ?? null);

  const richContent = getProductRichContent(product.id);
  const category = { name: product.category ?? product.categorySlug, slug: product.categorySlug };
  const variationImage = selectedVariation?.image;
  const mainImage =
    variationImage ??
    product.images?.[selectedImageIndex] ??
    product.images?.[0] ??
    PRODUCT_PLACEHOLDER;

  useEffect(() => {
    if (selectedVariation?.image) {
      const idx = product.images?.indexOf(selectedVariation.image);
      if (idx != null && idx >= 0) setSelectedImageIndex(idx);
    }
  }, [selectedVariation?.image, product.images]);

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id]);

  useEffect(() => {
    captureEvent({ event_name: "ViewContent", payload_summary: { content_ids: [product.id], content_name: product.name, value: product.price } });
  }, [product.id, product.name, product.price]);

  useEffect(() => {
    if (richContent?.seo) {
      document.title = richContent.seo.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", richContent.seo.description);
    }
  }, [richContent]);

  const displayPrice = selectedVariation?.price ?? product.price;
  const displayComparePrice = selectedVariation?.comparePrice ?? product.comparePrice;

  const cartProductWithPrice = useMemo(
    () => ({ ...toCartProduct(product), price: displayPrice }),
    [product, displayPrice]
  );

  const handleAddToCart = () => {
    addItem(cartProductWithPrice as CartProduct, quantity);
    openCart();
  };

  const canBuyNow = (() => {
    if (!product.inStock) return false;
    if (selectedVariation && selectedVariation.inStock === false) return false;
    return true;
  })();

  const handleBuyNow = () => {
    if (!canBuyNow || buyNowProcessing || buyNowInProgress.current) return;
    buyNowInProgress.current = true;
    setBuyNowProcessing(true);
    setToast("Added! Redirecting to checkout…");
    const item = { ...cartProductWithPrice } as CartProduct;
    if (selectedVariation) {
      item.name = `${product.name} (${selectedVariation.name})`;
    }
    clearCart();
    addItem(item, quantity);
    router.push("/checkout");
    setBuyNowProcessing(false);
    buyNowInProgress.current = false;
    setTimeout(() => setToast(""), 2500);
  };

  const cartProduct = toCartProduct(product);
  const imageList = product.images?.length ? product.images : [mainImage];
  const imageUrls = imageList.map((url) => (url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`));
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: richContent?.seo?.title ?? product.name,
    description: richContent?.seo?.description ?? product.shortDesc,
    image: imageUrls,
    sku: product.id,
    offers: { "@type": "Offer", price: product.price, priceCurrency: "BDT", availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${SITE_URL}/product/${product.id}` },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/category/${product.categorySlug}` },
      { "@type": "ListItem", position: 4, name: product.name, item: `${SITE_URL}/product/${product.id}` },
    ],
  };
  const faqJsonLd = richContent?.faq?.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: richContent.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) } : null;

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <nav className="mb-4 lg:mb-8 text-xs text-gray-400 sm:text-sm sm:text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/category/${product.categorySlug}`} className="hover:text-primary">{category.name}</Link>
        <span className="mx-1.5">/</span>
        <span className="truncate text-gray-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <ProductImageGallery
            mainImage={mainImage}
            images={product.images}
            selectedImageIndex={selectedImageIndex}
            productName={product.name}
            onSelectImage={setSelectedImageIndex}
            onOpenZoom={() => setZoomOpen(true)}
          />
          <AnimatePresence>
            {zoomOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                onClick={() => setZoomOpen(false)}
                role="dialog"
                aria-modal="true"
                aria-label="Image zoom"
              >
                <button type="button" onClick={() => setZoomOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-800 hover:bg-white" aria-label="Close">
                  <X className="h-6 w-6" />
                </button>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative max-h-[90vh] max-w-[90vw]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SafeImage src={mainImage} alt={product.name} width={800} height={800} className="rounded-lg object-contain" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm font-medium text-secondary">{category.name}</span>
          <h1 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-2xl font-bold text-secondary">৳{displayPrice.toLocaleString("en-BD")}</p>
            {displayComparePrice != null && displayComparePrice > displayPrice && (
              <p className="text-lg text-gray-500 line-through">৳{displayComparePrice.toLocaleString("en-BD")}</p>
            )}
            {product.stockQuantity != null && (
              <LowStockBadge quantity={product.stockQuantity} threshold={DEFAULT_LOW_STOCK_THRESHOLD} />
            )}
          </div>
          {product.rating != null && (
            <div className="mt-1 flex items-center gap-1 text-amber-500">
              <Star className="h-5 w-5 fill-amber-400" />
              <span className="font-medium text-slate-600">{product.rating.toFixed(1)}</span>
            </div>
          )}
          {variations.length > 0 && (
            <div className="mt-4">
              <span className="text-sm font-medium text-slate-700">Select: </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {variations.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariation(v)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedVariation?.id === v.id ? "border-primary bg-primary/10 text-primary" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="mt-4 text-gray-600">{product.shortDesc ?? product.longDesc ?? ""}</p>
          <DeliveryETA inside={DEFAULT_DELIVERY_ETA_INSIDE} zone="inside" className="mt-2" />
          {richContent?.highlights && richContent.highlights.length > 0 && (
            <ul className="mt-4 space-y-2">
              {richContent.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center rounded-lg border border-gray-300">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center rounded-l-lg hover:bg-gray-100" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="flex h-11 w-11 items-center justify-center rounded-r-lg hover:bg-gray-100" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          {/* Compare – compact, visible on all sizes (doesn't need to be in sticky bar) */}
          <div className="mt-4 lg:hidden">
            <button
              onClick={() => isInCompare(product.id) ? removeFromCompare(product.id) : addToCompare(cartProduct)}
              className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${isInCompare(product.id) ? "border-accent bg-accent/10 text-accent" : "border-slate-300 hover:bg-slate-100"}`}
            >
              <GitCompare className="h-4 w-4" /> {isInCompare(product.id) ? "In Compare" : "Compare"}
            </button>
          </div>
          {/* Desktop/tablet inline CTAs – hidden on mobile (mobile uses sticky bar below) */}
          <div className="mt-5 hidden flex-wrap gap-3 lg:flex">
            <button onClick={handleAddToCart} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-white transition hover:bg-primary/90">
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canBuyNow || buyNowProcessing}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              {buyNowProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Buy Now
            </button>
            <button onClick={() => isInCompare(product.id) ? removeFromCompare(product.id) : addToCompare(cartProduct)} className={`flex h-12 items-center justify-center gap-2 rounded-lg border px-4 font-medium transition ${isInCompare(product.id) ? "border-accent bg-accent/10 text-accent" : "border-slate-300 hover:bg-slate-100"}`}>
              <GitCompare className="h-5 w-5" /> {isInCompare(product.id) ? "In Compare" : "Compare"}
            </button>
          </div>
        </div>
      </div>

      {product.videoUrl && (
        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold text-gray-900">Video</h2>
          <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-slate-100">
            {product.videoUrl.includes("youtube.com") || product.videoUrl.includes("youtu.be") ? (
              <iframe
                src={product.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                title="Product video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={product.videoUrl} controls className="h-full w-full" />
            )}
          </div>
        </section>
      )}

      {((product.longDesc ?? richContent?.longDescription)) && (
        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold text-gray-900">Description</h2>
          <div className="mt-4 whitespace-pre-line text-gray-600">{(product.longDesc ?? richContent?.longDescription ?? "").trim()}</div>
        </section>
      )}
      {richContent?.ingredientsNutrition && richContent.ingredientsNutrition.length > 0 && (
        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold text-gray-900">Ingredients & Nutrition</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 font-semibold text-gray-900">Item</th><th className="px-4 py-3 font-semibold text-gray-900">Value</th></tr></thead>
              <tbody>
                {richContent.ingredientsNutrition.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border-t border-gray-200 px-4 py-3 text-gray-700">{row.label}</td>
                    <td className="border-t border-gray-200 px-4 py-3 text-gray-900">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {richContent?.feedingGuide && richContent.feedingGuide.length > 0 && (
        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold text-gray-900">How to use / Feeding guide</h2>
          <ul className="mt-4 space-y-2">
            {richContent.feedingGuide.map((row, i) => (
              <li key={i} className="flex justify-between gap-4 rounded-lg bg-gray-50 px-4 py-2 text-gray-700"><span className="font-medium">{row.size}</span><span>{row.amount}</span></li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-12 border-t border-gray-200 pt-10">
        <h2 className="text-xl font-bold text-gray-900">Shipping & Return</h2>
        <p className="mt-4 text-gray-600">{richContent?.shippingReturn ?? "We deliver all over Bangladesh. Inside Dhaka from ৳70, outside Dhaka ৳130. Cash on delivery available. See Refund & Return Policy for returns."}</p>
        <Link href="/refund" className="mt-2 inline-block text-secondary hover:underline">Refund & Return Policy →</Link>
      </section>
      {richContent?.faq && richContent.faq.length > 0 && (
        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-bold text-gray-900">FAQ</h2>
          <ul className="mt-4 space-y-4">
            {richContent.faq.map((item, i) => (
              <li key={i} className="rounded-lg border border-gray-200 bg-white p-4"><h3 className="font-semibold text-gray-900">{item.q}</h3><p className="mt-2 text-gray-600">{item.a}</p></li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-12 border-t border-gray-200 pt-10">
        <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
        <ProductReviewForm productId={product.id} />
      </section>

      {toast && (
        <div className="fixed bottom-24 left-4 right-4 z-50 rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-sm" role="status">
          {toast}
        </div>
      )}
      {/* Mobile sticky CTA – z-30 so FloatingUI (z-40) floats above; safe-area-inset clears iPhone home bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex gap-2 border-t border-slate-200 bg-white px-3 pt-3 shadow-lg lg:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <button onClick={handleAddToCart} className="h-12 flex-1 rounded-lg bg-primary font-semibold text-white transition hover:bg-primary/90">
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!canBuyNow || buyNowProcessing}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buyNowProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          Buy Now
        </button>
      </div>
    </div>
  );
}
