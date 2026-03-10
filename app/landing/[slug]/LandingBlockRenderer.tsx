"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buildProductRoute } from "@/lib/storefront-routes";

type Block = {
  id: string;
  type: string;
  configJson: unknown;
  sortOrder: number;
};

type Config = Record<string, unknown>;

function cfg(block: Block): Config {
  if (block.configJson && typeof block.configJson === "object" && !Array.isArray(block.configJson)) {
    return block.configJson as Config;
  }
  return {};
}

// ─── Hero Block ───────────────────────────────────────────────────────────────
function HeroBlock({ config }: { config: Config }) {
  const bg = config.backgroundImage as string | undefined;
  const videoUrl = config.videoUrl as string | undefined;
  const title = config.title as string | undefined;
  const subtitle = config.subtitle as string | undefined;
  const ctaText = config.ctaText as string | undefined;
  const ctaUrl = config.ctaUrl as string | undefined;
  const overlay = config.overlay !== false;

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {videoUrl ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoUrl} />
        </video>
      ) : bg ? (
        <Image src={bg} alt={title ?? "Hero"} fill className="object-cover" priority />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
      )}
      {overlay && <div className="absolute inset-0 bg-black/50" />}
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-white">
        {title && <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-6xl">{title}</h1>}
        {subtitle && <p className="mb-8 text-lg opacity-90 md:text-xl">{subtitle}</p>}
        {ctaText && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-block rounded-full bg-primary px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-primary/90"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}

// ─── Countdown Block ──────────────────────────────────────────────────────────
function CountdownBlock({ config }: { config: Config }) {
  const endTime = config.endTime as string | undefined;
  const title = config.title as string | undefined;
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const Box = ({ label, value }: { label: string; value: number }) => (
    <div className="flex flex-col items-center rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm">
      <span className="text-4xl font-bold">{pad(value)}</span>
      <span className="mt-1 text-sm uppercase tracking-widest opacity-80">{label}</span>
    </div>
  );

  return (
    <section className="bg-gradient-to-r from-red-600 to-orange-500 py-16 text-white">
      <div className="mx-auto max-w-2xl px-4 text-center">
        {title && <h2 className="mb-8 text-3xl font-bold">{title}</h2>}
        <div className="flex items-center justify-center gap-4">
          <Box label="Days" value={timeLeft.d} />
          <Box label="Hours" value={timeLeft.h} />
          <Box label="Min" value={timeLeft.m} />
          <Box label="Sec" value={timeLeft.s} />
        </div>
      </div>
    </section>
  );
}

// ─── Product Grid Block ────────────────────────────────────────────────────────
function ProductGridBlock({ config }: { config: Config }) {
  const title = config.title as string | undefined;
  const productIds = config.productIds as string[] | undefined;
  const ctaText = config.ctaText as string | undefined;
  const ctaUrl = config.ctaUrl as string | undefined;
  const [products, setProducts] = useState<
    { id: string; name: string; price: number; image?: string; slug: string }[]
  >([]);

  useEffect(() => {
    if (!productIds?.length) return;
    fetch(`/api/products/by-ids?ids=${productIds.join(",")}`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.products)) setProducts(d.products); })
      .catch(() => {});
  }, [productIds]);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        {title && <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">{title}</h2>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={buildProductRoute({
                categorySlug: "general",
                subcategorySlug: "general",
                id: p.id,
                slug: p.slug,
              })}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {p.image && (
                <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-slate-100">
                  <Image src={p.image} alt={p.name} fill className="object-contain transition group-hover:scale-105" />
                </div>
              )}
              <p className="font-medium text-slate-800 line-clamp-2">{p.name}</p>
              <p className="mt-1 font-bold text-primary">৳{p.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
        {ctaText && ctaUrl && (
          <div className="mt-8 text-center">
            <Link href={ctaUrl} className="inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white hover:bg-primary/90">
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Review / Testimonial Block ────────────────────────────────────────────────
function ReviewBlock({ config }: { config: Config }) {
  const title = config.title as string | undefined;
  const reviews = config.reviews as { name: string; text: string; rating: number }[] | undefined;

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-5xl px-4">
        {title && <h2 className="mb-10 text-center text-3xl font-bold text-slate-900">{title}</h2>}
        <div className="grid gap-6 md:grid-cols-3">
          {(reviews ?? []).map((r, i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-xl text-yellow-500">{stars(r.rating)}</p>
              <p className="mt-3 text-slate-700">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-4 font-semibold text-slate-900">— {r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof Block ────────────────────────────────────────────────────────
function SocialProofBlock({ config }: { config: Config }) {
  const stats = config.stats as { label: string; value: string }[] | undefined;
  const title = config.title as string | undefined;

  return (
    <section className="bg-primary py-12 text-white">
      <div className="mx-auto max-w-5xl px-4 text-center">
        {title && <h2 className="mb-8 text-2xl font-bold">{title}</h2>}
        <div className="flex flex-wrap justify-center gap-8">
          {(stats ?? []).map((s, i) => (
            <div key={i} className="px-6">
              <p className="text-4xl font-extrabold">{s.value}</p>
              <p className="mt-1 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Block ────────────────────────────────────────────────────────────
function FeaturesBlock({ config }: { config: Config }) {
  const title = config.title as string | undefined;
  const features = config.features as { title: string; description: string; icon?: string }[] | undefined;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4">
        {title && <h2 className="mb-10 text-center text-3xl font-bold text-slate-900">{title}</h2>}
        <div className="grid gap-8 md:grid-cols-3">
          {(features ?? []).map((f, i) => (
            <div key={i} className="text-center">
              {f.icon && <p className="mb-4 text-4xl">{f.icon}</p>}
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Block ────────────────────────────────────────────────────────────────
function CtaBlock({ config }: { config: Config }) {
  const title = config.title as string | undefined;
  const subtitle = config.subtitle as string | undefined;
  const ctaText = config.ctaText as string | undefined;
  const ctaUrl = config.ctaUrl as string | undefined;

  return (
    <section className="bg-gradient-to-r from-primary to-blue-700 py-16 text-white">
      <div className="mx-auto max-w-2xl px-4 text-center">
        {title && <h2 className="mb-4 text-3xl font-bold">{title}</h2>}
        {subtitle && <p className="mb-8 text-lg opacity-90">{subtitle}</p>}
        {ctaText && ctaUrl && (
          <Link
            href={ctaUrl}
            className="inline-block rounded-full bg-white px-8 py-3 text-lg font-semibold text-primary shadow-lg hover:bg-slate-100"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}

// ─── Custom HTML Block ─────────────────────────────────────────────────────────
function HtmlBlock({ config }: { config: Config }) {
  const html = config.html as string | undefined;
  if (!html) return null;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─── Main Renderer ────────────────────────────────────────────────────────────
export default function LandingBlockRenderer({ block }: { block: Block }) {
  const c = cfg(block);
  switch (block.type) {
    case "hero":           return <HeroBlock config={c} />;
    case "countdown":      return <CountdownBlock config={c} />;
    case "product_grid":   return <ProductGridBlock config={c} />;
    case "review":         return <ReviewBlock config={c} />;
    case "social_proof":   return <SocialProofBlock config={c} />;
    case "features":       return <FeaturesBlock config={c} />;
    case "cta":            return <CtaBlock config={c} />;
    case "html":           return <HtmlBlock config={c} />;
    default:
      return (
        <div className="mx-auto my-4 max-w-4xl rounded border border-dashed border-slate-300 p-6 text-center text-slate-400">
          Unknown block type: <code>{block.type}</code>
        </div>
      );
  }
}
