"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, GitCompare, Star, Check, X, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
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
import { useState, useEffect, useMemo, useRef } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypluspetshop.com";

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
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${product.categorySlug}`} className="hover:text-primary">{category.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div
            className="relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-gray-100"
            onClick={() => setZoomOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setZoomOpen(true)}
            aria-label="View larger image"
          >
            <SafeImage src={mainImage} alt={product.name} fill fallbackSrc={PRODUCT_PLACEHOLDER} priority sizes="(max-width: 1024px) 100vw, 50vw" showShimmer />
          </div>
          {zoomOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setZoomOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Image zoom"
            >
              <button type="button" onClick={() => setZoomOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-800 hover:bg-white" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
              <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                <SafeImage src={mainImage} alt={product.name} width={800} height={800} className="rounded-lg object-contain" />
              </div>
            </div>
          )}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} type="button" onClick={() => setSelectedImageIndex(i)} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 focus:border-primary ${selectedImageIndex === i ? "border-primary" : "border-gray-200"}`}>
                  <div className="relative h-full w-full">
                    <SafeImage src={img} alt={`${product.name} image ${i + 1}`} fill fallbackSrc={PRODUCT_PLACEHOLDER} className="object-cover" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm font-medium text-secondary">{category.name}</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{product.name}</h1>
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

          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center rounded-lg border border-gray-300">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="rounded-l-lg p-3 hover:bg-gray-100" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="rounded-r-lg p-3 hover:bg-gray-100" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={handleAddToCart} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 px-6 font-semibold text-white hover:bg-primary/90">
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canBuyNow || buyNowProcessing}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary py-3 px-6 font-semibold text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              {buyNowProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Buy Now
            </button>
            <button onClick={() => isInCompare(product.id) ? removeFromCompare(product.id) : addToCompare(cartProduct)} className={`flex items-center justify-center gap-2 rounded-lg border py-3 px-4 font-medium ${isInCompare(product.id) ? "border-accent bg-accent/10 text-accent" : "border-slate-300 hover:bg-slate-100"}`}>
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
      {/* Mobile-first sticky CTA – z-30 so FloatingUI (z-40) stays above on overlap; FloatingUI raises on product page */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-2 border-t border-slate-200 bg-white p-3 shadow-lg lg:hidden">
        <button onClick={handleAddToCart} className="flex-1 rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary/90">
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!canBuyNow || buyNowProcessing}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-primary py-3 font-semibold text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buyNowProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          Buy Now
        </button>
      </div>
    </div>
  );
}
