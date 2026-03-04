const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "City Pet Shop BD",
  url: BASE,
  logo: `${BASE}/brand/logo.png`,
  description: "Buy authentic dog food, cat food, and pet accessories in Bangladesh. Fast delivery, COD available, trusted brands at the best price.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "BD",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Bengali"],
  },
};

export default function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}
