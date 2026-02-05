/**
 * GROQ queries for Sanity – used when DATA_SOURCE=sanity.
 */

export const productsQuery = `*[_type == "product" && defined(slug.current)] | order(_updatedAt desc) {
  _id,
  "id": _id,
  "slug": slug.current,
  "name": title,
  "category": category->title,
  "categorySlug": category->slug.current,
  brand,
  price,
  comparePrice,
  rating,
  "inStock": coalesce(inStock, true),
  "shortDesc": shortDescription,
  "longDesc": pt::text(description),
  "images": images[].asset->url,
  "image": images[0].asset->url,
  tags,
  specs,
  "stockQuantity": stock,
  featured,
  videoUrl,
  "seo": {
    "metaTitle": metaTitle,
    "metaDescription": metaDescription,
    keywords
  }
}`;

export const productByIdQuery = `*[_type == "product" && _id == $id][0] {
  _id,
  "id": _id,
  "slug": slug.current,
  "name": title,
  "category": category->title,
  "categorySlug": category->slug.current,
  brand,
  price,
  comparePrice,
  rating,
  "inStock": coalesce(inStock, true),
  "shortDesc": shortDescription,
  "longDesc": pt::text(description),
  "images": images[].asset->url,
  "image": images[0].asset->url,
  tags,
  specs,
  "stockQuantity": stock,
  featured,
  videoUrl,
  "seo": {
    "metaTitle": metaTitle,
    "metaDescription": metaDescription,
    keywords
  }
}`;

export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  "id": _id,
  "slug": slug.current,
  "name": title,
  "category": category->title,
  "categorySlug": category->slug.current,
  brand,
  price,
  comparePrice,
  rating,
  "inStock": coalesce(inStock, true),
  "shortDesc": shortDescription,
  "longDesc": pt::text(description),
  "images": images[].asset->url,
  "image": images[0].asset->url,
  tags,
  specs,
  "stockQuantity": stock,
  featured,
  videoUrl,
  "seo": {
    "metaTitle": metaTitle,
    "metaDescription": metaDescription,
    keywords
  }
}`;

export const featuredProductsQuery = `*[_type == "product" && featured == true && defined(slug.current)] | order(_updatedAt desc) [0...20] {
  _id,
  "id": _id,
  "slug": slug.current,
  "name": title,
  "category": category->title,
  "categorySlug": category->slug.current,
  brand,
  price,
  comparePrice,
  rating,
  "inStock": coalesce(inStock, true),
  "shortDesc": shortDescription,
  "images": images[].asset->url,
  "image": images[0].asset->url,
  tags,
  specs,
  "stockQuantity": stock,
  videoUrl,
  "seo": { "metaTitle": metaTitle, "metaDescription": metaDescription, keywords }
}`;

export const categoriesQuery = `*[_type == "category" && defined(slug.current)] | order(title asc) {
  "slug": slug.current,
  "name": title,
  "image": image.asset->url,
  description
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  title,
  tagline,
  "logoUrl": logo.asset->url,
  "logoDarkUrl": logoDark.asset->url,
  defaultMetaTitle,
  defaultMetaDescription,
  "ogImageUrl": ogImage.asset->url,
  phone,
  email,
  address,
  whatsapp,
  "heroSlides": heroSlides[] {
    "id": _key,
    "title": title,
    subheadline,
    "image": image.asset->url,
    "href": link,
    cta,
    discountText
  },
  "bannerImages": bannerImages[] {
    "image": image.asset->url,
    title,
    "href": link,
    cta
  }
}`;

export const homeSectionQuery = `{
  "heroSlides": *[_type == "siteSettings"][0].heroSlides[] {
    "id": _key,
    "title": title,
    subheadline,
    "image": image.asset->url,
    "href": link,
    cta,
    discountText
  },
  "featuredCategories": *[_type == "category" && defined(slug.current)] | order(title asc) [0...6] {
    "slug": slug.current,
    "name": title,
    "image": image.asset->url,
    "href": "/category/" + slug.current
  },
  "featuredBrands": *[_type == "product" && defined(brand)] | order(brand asc) { "id": brand, "name": brand },
  "flashSale": null,
  "sideBanners": *[_type == "siteSettings"][0].bannerImages[] {
    "id": _key,
    "title": title,
    "subtitle": cta,
    "image": image.asset->url,
    "href": link,
    "cta": cta
  }
}`;

export const comboOffersQuery = `*[_type == "comboOffer" && defined(slug.current)] | order(_updatedAt desc) {
  _id,
  "id": _id,
  "slug": slug.current,
  title,
  description,
  "image": image.asset->url,
  price,
  comparePrice,
  "productIds": products[]._ref,
  "href": coalesce(link, "/shop"),
  cta
}`;

export const productsByIdsQuery = `*[_type == "product" && _id in $ids] {
  _id,
  "id": _id,
  "slug": slug.current,
  "name": title,
  "category": category->title,
  "categorySlug": category->slug.current,
  brand,
  price,
  comparePrice,
  rating,
  "inStock": inStock != false,
  "shortDesc": shortDescription,
  "images": images[].asset->url,
  "image": images[0].asset->url,
  tags,
  "stockQuantity": stock,
  "seo": { "metaTitle": metaTitle, "metaDescription": metaDescription, keywords }
}`;
