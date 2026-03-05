"use client";

import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { useCategories } from "@/store/CategoriesContext";
import { useBlog } from "@/store/BlogContext";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/compare", label: "Compare" },
  { href: "/offers", label: "Special Offer" },
  { href: "/combo-offers", label: "Combo Offer" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/account", label: "My Account" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Return & Refund" },
];

const socialLinks = [
  { href: "#", icon: Facebook },
  { href: "#", icon: Instagram },
  { href: "#", icon: Twitter },
];

export default function Footer() {
  const { lastUpdated: categoriesUpdated } = useCategories();
  const { lastUpdated: blogUpdated } = useBlog();
  const lastUpdated = [categoriesUpdated, blogUpdated].filter(Boolean).sort().pop() || null;

  return (
    <footer className="mt-20 bg-footer-bg pt-12 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-accent">City Plus Pet Shop (City Pet Shop bd)</h3>
            <p className="mt-2 text-sm text-white/80">Your pet, our passion.</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/80 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-accent" />
                <span>Mirpur 2, Borobag, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a href="tel:+8801643390045" className="hover:text-accent">+880 1643-390045</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-accent">{CONTACT_EMAIL}</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Follow Us</h4>
            <div className="mt-4 flex gap-4">
              {socialLinks.map(({ href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-full bg-white/20 p-2 text-white hover:bg-brand-bg transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-10 border-t border-white/20 pt-8 text-center text-xs text-white/80">
          © {new Date().getFullYear()} City Plus Pet Shop (City Pet Shop bd). All rights reserved.
          {lastUpdated && (
            <>
              <span className="mx-2">•</span>
              <span>Content updated: {new Date(lastUpdated).toLocaleDateString()}</span>
            </>
          )}
        </div>
        {/* Developer credits */}
        <div className="mt-4 text-center text-xs text-white/70">
          <p className="font-medium text-white">Developed by Fresher IT</p>
          <p className="mt-1">
            <strong>Abrar Foysal</strong> — Founder &amp; CEO, Fresher IT
          </p>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a href="mailto:abrar@fresheritbd.com" className="hover:text-accent">abrar@fresheritbd.com</a>
            <a href="https://abrarfoysal.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">abrarfoysal.com</a>
            <a href="https://wa.me/8801929524975" target="_blank" rel="noopener noreferrer" className="hover:text-accent">WhatsApp: 01929524975</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
