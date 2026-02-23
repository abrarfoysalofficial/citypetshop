import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
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
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://citypetshopbd.com";
const ABOUT_URL = `${SITE_URL.replace(/\/$/, "")}/about`;

const DEFAULT_FOUNDER = {
  name: "Sheikh Shakil",
  title: "Founder",
  bioEn: "City Plus Pet Shop এর প্রতিষ্ঠাতা। পোষা প্রাণীর যত্নে আমরা নিবেদিত।",
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
}[] = [
  {
    name: "Abrar Foysal",
    title: "Founder & CEO, Fresher IT BD",
    email: "abrar@fresheritbd.com",
    imageUrl: "/team/developer.jpg",
    whatsapp: "8801929524975",
  },
];

export const metadata: Metadata = {
  title:
    "আমাদের সম্পর্কে | About Us - City Plus Pet Shop | পোষা প্রাণীর খাবার ও এক্সেসরিজ | Pet Food Bangladesh",
  description:
    "City Plus Pet Shop - ঢাকার মিরপুর ২ থেকে পোষা প্রাণীর জন্য ১০০% অরিজিনাল খাবার, ঔষধ ও প্রিমিয়াম এক্সেসরিজ। Premium pet food, medicine, accessories in Dhaka, Bangladesh. Fast delivery, authentic products.",
  alternates: {
    canonical: ABOUT_URL,
  },
  openGraph: {
    title: "আমাদের সম্পর্কে | About Us - City Plus Pet Shop | Pet Food & Accessories Bangladesh",
    description:
      "১০০% অরিজিনাল পোষা প্রাণীর খাবার, দ্রুত ডেলিভারি, বিশেষজ্ঞ পরামর্শ। Premium pet food, medicine, accessories in Dhaka.",
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
    "পোষা প্রাণীর দোকান",
    "pet food Dhaka",
    "cat food dog food",
    "মিরপুর পেট শপ",
    "City Plus Pet Shop",
    "authentic pet products",
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
    sitePhone = (await prisma.siteSettings.findUnique({ where: { id: "default" } }))?.phone ?? null;
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
      "City Plus Pet Shop - ঢাকার মিরপুর ২ থেকে পোষা প্রাণীর জন্য ১০০% অরিজিনাল খাবার, ঔষধ ও প্রিমিয়াম এক্সেসরিজ।",
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
                  src={founderData.imageUrl || "/brand/logo.png"}
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
                  আমাদের সম্পর্কে{" "}
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
            <div className="prose prose-slate max-w-none">
              <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                সিটি প্লাস পেট শপ-এ আপনাদের স্বাগতম। আমরা বিশ্বাস করি আপনার পোষা প্রাণীটি কেবল
                একটি প্রাণী নয়, বরং আপনার পরিবারের একজন সদস্য। আর তাই, তাদের সুস্থতা এবং আনন্দের
                জন্য সেরা মানের পণ্য সরবরাহ করাই আমাদের মূল লক্ষ্য।
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
                আমাদের লক্ষ্য
              </span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-700 sm:text-lg">
              ঢাকার মিরপুর ২ থেকে শুরু হওয়া আমাদের এই পথচলার মূল উদ্দেশ্য হলো পোষা প্রাণীদের জন্য
              ১০০% অরিজিনাল খাবার, প্রয়োজনীয় ঔষধ এবং প্রিমিয়াম এক্সেসরিজ সরাসরি আপনার দোরগোড়ায়
              পৌঁছে দেওয়া। আমরা জানি, সঠিক পুষ্টি এবং যত্নই পারে একটি প্রাণীকে দীর্ঘায়ু ও প্রাণবন্ত
              রাখতে।
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
              আমরা কেন অনন্য?
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={ShieldCheck}
                title="১০০% অথেন্টিক পণ্য"
                description="আমরা সরাসরি অনুমোদিত আমদানিকারক থেকে পণ্য সংগ্রহ করি।"
              />
              <FeatureCard
                icon={Truck}
                title="দ্রুত ডেলিভারি"
                description="আপনার জরুরি প্রয়োজনে আমরা দ্রুততম সময়ে পণ্য পৌঁছানোর নিশ্চয়তা দেই।"
              />
              <FeatureCard
                icon={Tag}
                title="সাশ্রয়ী মূল্য"
                description="আমরা বাজারের সেরা মূল্যে প্রিমিয়াম কোয়ালিটি নিশ্চিত করি।"
              />
              <FeatureCard
                icon={HeartPulse}
                title="বিশেষজ্ঞ পরামর্শ"
                description="আমাদের অভিজ্ঞ টিম আপনাকে আপনার পোষা প্রাণীর জন্য সঠিক খাবার ও যত্ন নির্বাচনে সহায়তা করে।"
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
                  fallbackSrc="/brand/logo.png"
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
              {teamData.map((member, i) => (
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
                      fallbackSrc="/brand/logo.png"
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
              ))}
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
                  fallbackSrc="/brand/logo.png"
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
