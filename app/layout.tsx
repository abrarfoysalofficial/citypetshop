import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/store/CartContext";
import { CompareProvider } from "@/store/CompareContext";
import { WishlistProvider } from "@/store/WishlistContext";
import { SiteSettingsProvider } from "@/store/SiteSettingsContext";
import { ProductsProvider } from "@/store/ProductsContext";
import { CategoriesProvider } from "@/store/CategoriesContext";
import { OffersProvider } from "@/store/OffersContext";
import { VouchersProvider } from "@/store/VouchersContext";
import { BlogProvider } from "@/store/BlogContext";
import StoreLayout from "@/components/StoreLayout";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import { PreloadLinks, PreloadCriticalRoutes } from "@/components/PreloadLinks";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import { ClerkProvider } from "@clerk/nextjs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "City Pet Shop BD | Pet Shop in Bangladesh | Dog Food BD | Cat Food BD",
  description: "Buy authentic dog food, cat food, and pet accessories in Bangladesh. Fast delivery, COD available, trusted brands at the best price.",
  openGraph: {
    type: "website",
    locale: "en",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "City Pet Shop BD",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <OrganizationSchema />
        <PreloadLinks />
        <PreloadCriticalRoutes />
        <ClerkProvider>
          <SiteSettingsProvider>
            <AnalyticsScripts />
            <ProductsProvider>
              <CategoriesProvider>
                <OffersProvider>
                  <VouchersProvider>
                    <BlogProvider>
                      <CartProvider>
                        <CompareProvider>
                          <WishlistProvider>
                            <StoreLayout>{children}</StoreLayout>
                          </WishlistProvider>
                        </CompareProvider>
                      </CartProvider>
                    </BlogProvider>
                  </VouchersProvider>
                </OffersProvider>
              </CategoriesProvider>
            </ProductsProvider>
          </SiteSettingsProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
