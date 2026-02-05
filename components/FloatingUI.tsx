"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, PackageSearch } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function FloatingUI() {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number ?? "8801643390045";
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
  const isProductPage = pathname?.match(/^\/product\/[^/]+$/);
  const bottomClass = isProductPage ? "bottom-24 lg:bottom-6" : "bottom-6";

  return (
    <>
      {/* Track Order - Left */}
      <Link
        href="/track-order"
        className={`fixed ${bottomClass} left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90`}
        aria-label="Track Order"
      >
        <PackageSearch className="h-6 w-6" />
      </Link>

      {/* WhatsApp - Right */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed ${bottomClass} right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600`}
        aria-label="WhatsApp Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </>
  );
}
