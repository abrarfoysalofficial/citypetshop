"use client";

import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";
import Image from "next/image";
import { Truck, CreditCard, Headphones, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { useSiteSettings } from "@/store/SiteSettingsContext";

const SUPPORT_BLOCKS = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over ৳2000" },
  { icon: CreditCard, title: "Online Payment", desc: "Secure payment methods" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated support" },
];

const STORE_POLICY = [
  { href: "/terms", label: "সেবার শর্তাবলী" },
  { href: "/privacy", label: "গোপনীয়তা নীতি" },
  { href: "/refund", label: "রিটার্ন/রিফান্ড নীতি" },
];

const DEFAULT_FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/account", label: "My Account" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
  { href: "/site-map", label: "Site Map" },
];

type FooterLinkItem = { href: string; label?: string; label_en?: string; openInNewTab?: boolean; visible?: boolean };

const POPULAR_CATEGORIES = [
  { href: "/category/dog-food", label: "Dog Food" },
  { href: "/category/cat-food", label: "Cat Food" },
  { href: "/category/cat-accessories", label: "Cat Accessories" },
  { href: "/combo-offers", label: "Combo Offers" },
];

const DELIVERY_PARTNERS = ["Steadfast", "Pathao", "Sundarban", "eCourier"];

function getSocialUrl(platform: string, links: { platform: string; url: string }[]): string | null {
  const link = links.find((l) => l.platform.toLowerCase() === platform.toLowerCase());
  return link?.url && link.url.startsWith("http") ? link.url : null;
}

export default function HomeFooter() {
  const { settings } = useSiteSettings();
  const socialLinks = settings?.social_links ?? [];
  const rawFooterLinks = (settings?.footer_links ?? []) as FooterLinkItem[];
  const footerLinks = rawFooterLinks.filter((l) => l.visible !== false).length > 0
    ? rawFooterLinks.filter((l) => l.visible !== false)
    : DEFAULT_FOOTER_LINKS;
  const getFooterLabel = (l: FooterLinkItem | (typeof DEFAULT_FOOTER_LINKS)[0]) =>
    (l as { label?: string; label_en?: string }).label ?? (l as { label_en?: string }).label_en ?? "";
  const facebookUrl = getSocialUrl("facebook", socialLinks) || process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || null;
  const instagramUrl = getSocialUrl("instagram", socialLinks) || process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || null;
  const youtubeUrl = getSocialUrl("youtube", socialLinks) || process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || null;

  return (
    <footer className="mt-20 bg-[var(--footer-bg)] pt-12 text-white md:mb-0">
      {/* Support blocks */}
      <div className="border-b border-white/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {SUPPORT_BLOCKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="text-sm text-white/70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src={settings?.logo_dark_url || settings?.logo_url || "/brand/logo-white.jpg"}
                alt={settings?.site_name_en || "City Plus Pet Shop"}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-lg font-bold text-white">{settings?.site_name_en || "City Plus Pet Shop"}</span>
            </Link>
            <p className="mt-2 text-sm text-white/80">{settings?.tagline_en || "Your pet, our passion. Premium pet food, accessories & care."}</p>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              {settings?.address_en && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[var(--teal-from)]" />
                  {settings.address_en}
                </p>
              )}
              {settings?.phone && (
                <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 hover:text-white">
                  <Phone className="h-4 w-4 shrink-0 text-[var(--teal-from)]" />
                  {settings.phone}
                </a>
              )}
              <a href={`mailto:${settings?.email || CONTACT_EMAIL}`} className="flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4 shrink-0 text-[var(--teal-from)]" />
                {settings?.email || CONTACT_EMAIL}
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Store Policy</h4>
            <ul className="mt-4 space-y-2">
              {STORE_POLICY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Important Links</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.map((l) => {
                const href = l.href;
                const label = getFooterLabel(l);
                const openInNewTab = "openInNewTab" in l && l.openInNewTab;
                return openInNewTab ? (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-white">{label}</a>
                  </li>
                ) : (
                  <li key={href}>
                    <Link href={href} className="text-sm text-white/70 hover:text-white">{label}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Popular Categories</h4>
            <ul className="mt-4 space-y-2">
              {POPULAR_CATEGORIES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Delivery & Payment */}
        <div className="mt-10 border-t border-white/20 pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Delivery Partners</p>
              <p className="mt-1 text-sm text-white/70">{DELIVERY_PARTNERS.join(" • ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">We Accept</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <span className="rounded border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80">COD</span>
                <span className="rounded border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80">bKash</span>
                <span className="rounded border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80">Nagad</span>
                <span className="rounded border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80">Card</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-8 sm:flex-row">
          <div className="flex gap-4">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-[var(--teal-from)]" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-[var(--teal-from)]" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {youtubeUrl && (
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-[var(--teal-from)]" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
          <p className="text-center text-xs text-white/70">© {new Date().getFullYear()} {settings?.site_name_en || "City Plus Pet Shop"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
