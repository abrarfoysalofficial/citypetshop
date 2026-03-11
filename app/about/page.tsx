import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import SafeImage from "@/components/media/SafeImage";
import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Truck,
  Tag,
  HeartPulse,
  ArrowRight,
  Mail,
  ExternalLink,
} from "lucide-react";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshop.bd";
const ABOUT_URL = `${SITE_URL.replace(/\/$/, "")}/about`;

const DEFAULT_FOUNDER = {
  name: "Our Founder",
  title: "Founder",
  bioEn:
    "City Plus Pet Shop started with a simple belief: every pet deserves the best. From a small shop in Dhaka to serving pet owners across Bangladesh, we remain committed to authentic dog food, cat food, and premium pet products. Your trust drives us every day.",
  imageUrl: "/team/founder.jpg",
  whatsapp: null as string | null,
  phone: null as string | null,
};

const DEFAULT_TEAM: {
  name: string;
  title: string;
  email: string | null;
  imageUrl: string | null;
  whatsapp: string | null;
}[] = [];

export const metadata: Metadata = {
  title:
    "আমাদের সম্পর্কে | About Us - City Plus Pet Shop | পোষা প্রাণীর খাবার ও এক্সেসরিজ | Pet Food Bangladesh",
  description:
    "City Plus Pet Shop — trusted pet shop in Bangladesh. 100% authentic dog food, cat food, and premium pet products. Fast delivery, genuine brands, expert support. Your pet, our passion.",
  alternates: {
    canonical: ABOUT_URL,
  },
  openGraph: {
    title: "আমাদের সম্পর্কে | About Us - City Plus Pet Shop | Pet Food & Accessories Bangladesh",
    description:
      "Trusted pet shop in Bangladesh. Authentic dog food BD, cat food BD, and premium pet products. Fast delivery, expert support.",
    url: ABOUT_URL,
    type: "website",
    locale: "bn_BD",
    alternateLocale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - City Plus Pet Shop | Pet Food Bangladesh",
  },
  keywords: [
    "pet shop Bangladesh",
    "pet shop in Bangladesh",
    "dog food BD",
    "cat food BD",
    "authentic pet products",
    "pet food Dhaka",
    "City Plus Pet Shop",
    "City Pet Shop BD",
  ],
};

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article
      className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
      aria-labelledby={`feature-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div
        className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-muted"
        aria-hidden
      >
        <Icon className="h-7 w-7 text-primary" size={28} />
      </div>
      <h3
        id={`feature-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="text-base font-semibold text-slate-900"
      >
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </article>
  );
}

export default async function AboutPage() {
  let founder: {
    name: string;
    title: string;
    bioEn: string | null;
    imageUrl: string | null;
    whatsapp: string | null;
    phone: string | null;
  } | null = null;
  let team: {
    name: string;
    title: string;
    email: string | null;
    imageUrl: string | null;
    whatsapp: string | null;
  }[] = [];

  try {
    const [f, t] = await Promise.all([
      prisma.aboutPageProfile.findUnique({ where: { id: "founder", isActive: true } }),
      prisma.teamMember.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    ]);
    founder = f;
    team = t;
  } catch {
    // Tables may not exist yet; use defaults
  }

  const founderData = founder ?? DEFAULT_FOUNDER;
  const teamData =
    team.length > 0
      ? team.map((t) => ({
          name: t.name,
          title: t.title,
          email: t.email ?? null,
          imageUrl: t.imageUrl ?? null,
          whatsapp: t.whatsapp ?? null,
        }))
      : DEFAULT_TEAM;

  let sitePhone: string | null = null;
  try {
    sitePhone = (await prisma.tenantSettings.findUnique({ where: { tenantId: getDefaultTenantId() } }))?.phone ?? null;
  } catch {
    //
  }
  const founderWhatsapp =
    founder?.whatsapp ??
    (sitePhone ? sitePhone.replace(/\D/g, "").replace(/^0/, "880") : null) ??
    (DEFAULT_FOUNDER.phone
      ? DEFAULT_FOUNDER.phone.replace(/\D/g, "").replace(/^0/, "880")
      : null);

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "আমাদের সম্পর্কে | About Us - City Plus Pet Shop",
    description:
      "City Plus Pet Shop — trusted pet shop in Bangladesh. Authentic dog food, cat food, and premium pet products. Fast delivery, expert support.",
    url: ABOUT_URL,
    mainEntity: {
      "@type": "Organization",
      name: "City Plus Pet Shop",
      alternateName: "City Pet Shop BD",
      url: SITE_URL,
      description:
        "Premium pet food, medicine, and accessories in Dhaka, Bangladesh. 100% authentic products, fast delivery.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mirpur 2, Borobag",
        addressRegion: "Dhaka",
        addressCountry: "BD",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section
          className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
          aria-labelledby="about-hero-heading"
        >
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
              <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                <Image
                  src={founderData.imageUrl || "/ui/blog-cover.svg"}
                  alt="City Plus Pet Shop"
                  width={112}
                  height={112}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div>
                <h1
                  id="about-hero-heading"
                  className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
                >
                  About Us{" "}
                  <span className="block text-primary sm:inline">
                    City Plus Pet Shop
                  </span>
                </h1>
                <p className="mt-2 text-lg font-medium text-slate-600">
                  City Plus Pet Shop (City Pet Shop BD)
                </p>
                <p className="mt-1 text-sm text-slate-500">Your pet, our passion.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content - About Us */}
        <section
          className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8"
          aria-labelledby="about-intro-heading"
        >
          <div className="mx-auto max-w-5xl">
            <h2 id="about-intro-heading" className="sr-only">
              About Us
            </h2>
            <div className="prose prose-slate max-w-none space-y-4">
              <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                Welcome to City Plus Pet Shop — your trusted pet shop in Bangladesh. We believe your
                pet is not just an animal, but a family member. That&apos;s why we&apos;re
                committed to bringing you the best quality dog food, cat food, and authentic pet
                products across Bangladesh.
              </p>
              <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                From premium dog food BD and cat food BD to essential medicines and accessories, we
                deliver genuine brands with safe packaging and reliable support. Your pet&apos;s
                health and happiness are our priority.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section
          className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8"
          aria-labelledby="mission-heading"
        >
          <div className="mx-auto max-w-5xl">
            <h2
              id="mission-heading"
              className="text-xl font-bold text-slate-900 sm:text-2xl"
            >
              <span className="border-l-4 border-primary pl-3">
                Our Mission
              </span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-700 sm:text-lg">
              Our mission is to make premium pet care accessible to every pet owner in Bangladesh.
              We deliver 100% authentic dog food, cat food, medicines, and accessories directly to
              your doorstep. Fast delivery, genuine brands, and expert support — that&apos;s our
              promise. We know that proper nutrition and care make the difference between a good
              life and a great one for your pet.
            </p>
          </div>
        </section>

        {/* Iconic Features - 4 Column Grid */}
        <section
          className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-6xl">
            <h2
              id="features-heading"
              className="text-center text-xl font-bold text-slate-900 sm:text-2xl"
            >
              Why Trust Us
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={ShieldCheck}
                title="100% Authentic Products"
                description="We source directly from approved distributors. Every dog food, cat food, and pet product is genuine."
              />
              <FeatureCard
                icon={Truck}
                title="Fast Delivery"
                description="Quick delivery across Dhaka and nationwide. Your pet's essentials when you need them."
              />
              <FeatureCard
                icon={Tag}
                title="Best Value"
                description="Competitive prices without compromising quality. Premium pet products at fair prices."
              />
              <FeatureCard
                icon={HeartPulse}
                title="Expert Support"
                description="Our team helps you choose the right food and care for your pet. WhatsApp support available."
              />
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section
          className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8"
          aria-labelledby="founder-heading"
        >
          <div className="mx-auto max-w-5xl">
            <h2 id="founder-heading" className="text-xl font-bold text-slate-900 sm:text-2xl">
              Founder
            </h2>
            <div className="mt-6 flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
                <SafeImage
                  src={founderData.imageUrl || "/team/founder.jpg"}
                  alt={founderData.name}
                  fill
                  fallbackSrc="/ui/blog-cover.svg"
                  showShimmer={false}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{founderData.name}</p>
                <p className="text-sm text-slate-600">{founderData.title}</p>
                {founderData.bioEn && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {founderData.bioEn}
                  </p>
                )}
                {founderWhatsapp && (
                  <a
                    href={`https://wa.me/${founderWhatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section
          className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8"
          aria-labelledby="team-heading"
        >
          <div className="mx-auto max-w-5xl">
            <h2 id="team-heading" className="text-xl font-bold text-slate-900 sm:text-2xl">
              Team
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {teamData.length > 0 ? teamData.map((member, i) => (
                <article
                  key={i}
                  className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm"
                  aria-labelledby={`team-member-${i}`}
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
                    <SafeImage
                      src={member.imageUrl || "/team/developer.jpg"}
                      alt={member.name}
                      fill
                      fallbackSrc="/ui/blog-cover.svg"
                      showShimmer={false}
                    />
                  </div>
                  <h3 id={`team-member-${i}`} className="mt-3 font-semibold text-slate-900">
                    {member.name}
                  </h3>
                  <p className="text-sm text-slate-600">{member.title}</p>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary transition-colors hover:underline"
                    >
                      <Mail className="h-4 w-4" aria-hidden />
                      {member.email}
                    </a>
                  )}
                  {member.whatsapp && (
                    <a
                      href={`https://wa.me/880${String(member.whatsapp).replace(/^880/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      WhatsApp
                    </a>
                  )}
                </article>
              )) : (
                <div className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-base text-slate-700">
                    Our dedicated team is here to serve you. Need help choosing the right pet food or
                    accessories? Reach us on WhatsApp for quick support.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA - Contact Us */}
        <section
          className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8"
          aria-label="Contact"
        >
          <div className="mx-auto max-w-5xl text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Contact Us
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </section>

        {/* Developer Footer - Fresher IT BD */}
        <section
          className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8"
          aria-label="Developer credits"
        >
          <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-700">💚 Developed by Fresher IT BD</p>
              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
                <SafeImage
                  src="/team/fresheritbd-logo.png"
                  alt="Fresher IT BD"
                  width={80}
                  height={40}
                  className="h-10 w-auto object-contain"
                  fallbackSrc="/ui/blog-cover.svg"
                />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">Abrar Foysal</p>
                  <p className="text-sm text-slate-600">Founder & CEO, Fresher IT BD</p>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
                    <a
                      href="mailto:abrar@fresheritbd.com"
                      className="inline-flex items-center gap-1 text-primary transition-colors hover:underline"
                    >
                      <Mail className="h-4 w-4" aria-hidden />
                      abrar@fresheritbd.com
                    </a>
                    <a
                      href="https://abrarfoysal.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary transition-colors hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
                      abrarfoysal.com
                    </a>
                    <a
                      href="https://wa.me/8801929524975"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary transition-colors hover:underline"
                    >
                      WhatsApp: 01929524975
                    </a>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    For support, future upgrades, and database integration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
