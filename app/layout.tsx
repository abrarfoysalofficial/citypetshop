import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { OffersProvider } from "@/context/OffersContext";
import { VouchersProvider } from "@/context/VouchersContext";
import { BlogProvider } from "@/context/BlogContext";
import StoreLayout from "@/components/StoreLayout";
import AnalyticsScripts from "@/components/AnalyticsScripts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypluspetshop.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "City Plus Pet Shop | Your pet, our passion",
  description: "Premium pet food, accessories, toys, and medicine for your furry friends.",
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
    "apple-mobile-web-app-title": "City Plus Pet Shop",
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
        <AnalyticsScripts />
        <SiteSettingsProvider>
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
      </body>
    </html>
  );
}
