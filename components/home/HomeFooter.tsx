"use client";

import Link from "next/link";
import Image from "next/image";
import { Truck, CreditCard, Headphones, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const SUPPORT_BLOCKS = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over ৳2000" },
  { icon: CreditCard, title: "Online Payment", desc: "Secure payment methods" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated support" },
];

const STORE_POLICY = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund", label: "Refund & Return" },
];

const IMPORTANT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/account", label: "My Account" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

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
  const facebookUrl = getSocialUrl("facebook", socialLinks) || process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || null;
  const instagramUrl = getSocialUrl("instagram", socialLinks) || process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || null;
  const youtubeUrl = getSocialUrl("youtube", socialLinks) || process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || null;

  return (
    <footer className="bg-slate-900 text-white">
      {/* Support blocks */}
      <div className="border-b border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {SUPPORT_BLOCKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="text-sm text-slate-400">{desc}</p>
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
              <Image src="/brand/logo-white.jpg" alt="City Plus Pet Shop" width={48} height={48} className="h-12 w-12 object-contain" />
              <span className="text-lg font-bold text-white">City Plus Pet Shop</span>
            </Link>
            <p className="mt-2 text-sm text-slate-400">Your pet, our passion. Premium pet food, accessories & care.</p>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-accent" />
                Mirpur 2, Borobag, Dhaka
              </p>
              <a href="tel:+8801643390045" className="flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                01643-390045
              </a>
              <a href="mailto:info@citypluspetshop.com" className="flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                info@citypluspetshop.com
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Store Policy</h4>
            <ul className="mt-4 space-y-2">
              {STORE_POLICY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Important Links</h4>
            <ul className="mt-4 space-y-2">
              {IMPORTANT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Popular Categories</h4>
            <ul className="mt-4 space-y-2">
              {POPULAR_CATEGORIES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-400 hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Delivery & Payment */}
        <div className="mt-10 border-t border-slate-700 pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivery Partners</p>
              <p className="mt-1 text-sm text-slate-400">{DELIVERY_PARTNERS.join(" • ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">We Accept</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <span className="rounded border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-400">COD</span>
                <span className="rounded border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-400">bKash</span>
                <span className="rounded border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-400">Nagad</span>
                <span className="rounded border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-400">Card</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-700 pt-8 sm:flex-row">
          <div className="flex gap-4">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-700 p-2 text-white hover:bg-accent" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-700 p-2 text-white hover:bg-accent" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {youtubeUrl && (
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-700 p-2 text-white hover:bg-accent" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
          <p className="text-center text-xs text-slate-500">© {new Date().getFullYear()} City Plus Pet Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
