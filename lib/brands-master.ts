/**
 * Master brand list. Admin/CMS editable. Logos in /public/brands/.
 * Brand section (Home) uses only FEATURED_BRAND_SLUGS; all others remain for filters/SEO.
 */

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  /** SEO description (max 160 chars), used when missing from CMS. */
  seoDescription?: string;
}

/** Slugs allowed in the Home "Featured Brands" section. Use only /public/brands/* assets. */
export const FEATURED_BRAND_SLUGS = [
  "royal-canin", "reflex", "drools", "smartheart", "bonacibo", "friskies", "jungle", "lara",
  "bioline", "bellotta", "felicia", "himalaya", "skyec", "zoi-cat", "truly", "naturebridge", "nature-bridge", "petmetro",
] as const;

export function isFeaturedBrand(slug: string): boolean {
  return (FEATURED_BRAND_SLUGS as readonly string[]).includes(slug);
}

/** SEO description for brand (max 160 chars). Use when CMS has none. */
export const BRAND_SEO_DESCRIPTIONS: Record<string, string> = {
  "royal-canin": "Royal Canin offers scientifically formulated nutrition for cats and dogs at every life stage.",
  "reflex": "Reflex provides quality pet food and care products for dogs and cats in Bangladesh.",
  "smartheart": "SmartHeart delivers affordable, nutritious pet food for dogs and cats.",
  "bonacibo": "BonaCibo offers premium natural pet food for health and vitality.",
  "friskies": "Friskies brings tasty, balanced cat food and treats your cat will love.",
  "jungle": "Jungle offers natural pet food and care products for pets.",
  "lara": "Lara provides quality pet nutrition and care products.",
  "bellotta": "Bellotta offers premium pet food and accessories.",
  "himalaya": "Himalaya brings herbal pet care and wellness products.",
  "skyec": "SKYEC offers quality pet food and care solutions.",
  "zoi-cat": "Zoi Cat provides specialized nutrition and treats for cats.",
  "truly": "TRULY delivers trusted pet food and care for dogs and cats.",
  "nature-bridge": "Nature Bridge offers natural pet nutrition and wellness.",
  "naturebridge": "Nature Bridge offers natural pet nutrition and wellness.",
  "petmetro": "PetMetro provides pet food and accessories for your companion.",
  "bioline": "Bioline offers pet care and wellness products.",
  "drools": "Drools offers premium dog and cat food for all life stages.",
  "felicia": "Felicia provides quality pet food and care products.",
};

export const MASTER_BRANDS: BrandItem[] = [
  { id: "bioline", name: "Bioline", slug: "bioline", logo: "/brands/bioline.png" },
  { id: "friskies", name: "Friskies", slug: "friskies", logo: "/brands/friskies.png" },
  { id: "himalaya", name: "Himalaya", slug: "himalaya", logo: "/brands/himalaya.png" },
  { id: "jungle", name: "Jungle", slug: "jungle", logo: "/brands/jungle.png" },
  { id: "lara", name: "Lara", slug: "lara", logo: "/brands/lara.png" },
  { id: "aci", name: "ACI", slug: "aci", logo: "/brands/aci.png" },
  { id: "bellotta", name: "Bellotta", slug: "bellotta", logo: "/brands/bellotta.png" },
  { id: "beyond", name: "Beyond", slug: "beyond", logo: "/brands/beyond.png" },
  { id: "bili", name: "Bili", slug: "bili", logo: "/brands/bili.png" },
  { id: "bonacibo", name: "BonaCibo", slug: "bonacibo", logo: "/brands/bonacibo.png" },
  { id: "canago", name: "Canago", slug: "canago", logo: "/brands/canago.png" },
  { id: "captain", name: "CAPTAIN", slug: "captain", logo: "/brands/captain.png" },
  { id: "cleo", name: "Cleo", slug: "cleo", logo: "/brands/cleo.png" },
  { id: "fido", name: "Fido", slug: "fido", logo: "/brands/fido.png" },
  { id: "kaniva", name: "Kaniva", slug: "kaniva", logo: "/brands/kaniva.png" },
  { id: "smartheart", name: "SmartHeart", slug: "smartheart", logo: "/brands/smartheart.png" },
  { id: "hasipet", name: "hasipet", slug: "hasipet", logo: "/brands/hasipet.png" },
  { id: "kitchen-flavor", name: "Kitchen Flavor", slug: "kitchen-flavor", logo: "/brands/kitchen-flavor.png" },
  { id: "nature-bridge", name: "Nature Bridge", slug: "nature-bridge", logo: "/brands/nature-bridge.png" },
  { id: "oskies", name: "Oskies", slug: "oskies", logo: "/brands/oskies.png" },
  { id: "petme", name: "petme", slug: "petme", logo: "/brands/petme.png" },
  { id: "petmetro", name: "PetMetro", slug: "petmetro", logo: "/brands/petmetro.png" },
  { id: "reflex", name: "Reflex", slug: "reflex", logo: "/brands/reflex.png" },
  { id: "shifa", name: "Shifa", slug: "shifa", logo: "/brands/shifa.png" },
  { id: "royal-canin", name: "Royal Canin", slug: "royal-canin", logo: "/brands/royal-canin.png" },
  { id: "skyec", name: "SKYEC", slug: "skyec", logo: "/brands/skyec.png" },
  { id: "smart-cat", name: "Smart Cat", slug: "smart-cat", logo: "/brands/smart-cat.png" },
  { id: "tendline", name: "TENDLINE", slug: "tendline", logo: "/brands/tendline.png" },
  { id: "truly", name: "TRULY", slug: "truly", logo: "/brands/truly.png" },
  { id: "zoi-cat", name: "Zoi Cat", slug: "zoi-cat", logo: "/brands/zoi-cat.png" },
  { id: "gold-seal", name: "Gold Seal", slug: "gold-seal", logo: "/brands/gold-seal.png" },
];
