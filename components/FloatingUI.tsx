"use client";

import Link from "next/link";
import { MessageCircle, PackageSearch } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function FloatingUI() {
  const { settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number ?? "8801643390045";
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
  /* Mobile: bottom-20 clears MobileBottomNav (56px); desktop: bottom-6 */
  const bottomClass = "bottom-20 md:bottom-6";

  return (
    <>
      {/* Track Order — desktop only (mobile has it in the nav drawer) */}
      <Link
        href="/track-order"
        className={`fixed ${bottomClass} left-6 z-40 hidden h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90 md:flex`}
        aria-label="Track Order"
      >
        <PackageSearch className="h-6 w-6" />
      </Link>

      {/* WhatsApp — always visible, bottom-4 on mobile */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed ${bottomClass} right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 md:right-6`}
        aria-label="WhatsApp Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </>
  );
}
