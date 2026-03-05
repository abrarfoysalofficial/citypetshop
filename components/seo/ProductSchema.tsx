import type { Product } from "@/src/data/types";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

interface ProductSchemaProps {
  product: Product;
  productUrl: string;
}

export default function ProductSchema({ product, productUrl }: ProductSchemaProps) {
  const image = product.images?.[0] ?? product.image;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc || product.longDesc || product.name,
    image: image ? (image.startsWith("http") ? image : `${BASE}${image.startsWith("/") ? "" : "/"}${image}`) : undefined,
    url: productUrl,
    sku: product.id,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "BDT",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
