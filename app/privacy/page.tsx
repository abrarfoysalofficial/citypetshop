import type { Metadata } from "next";
import Link from "next/link";
import { getCmsPageBySlug } from "@/lib/cms-page";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | City Plus Pet Shop",
  description:
    "Privacy policy for City Plus Pet Shop (City Pet Shop BD) — how we collect, use, and protect your personal data. Data collection, cookies, security, and your rights.",
};

const CONTACT = { email: CONTACT_EMAIL, phone: "+880 1643-390045", phoneRaw: "+8801643390045", address: "মিরপুর ২, বড়বাগ, ঢাকা, বাংলাদেশ" };

const PRIVACY_FALLBACK = (
  <div className="mt-8 space-y-6 text-slate-600">
    <section>
      <h2 className="text-lg font-semibold text-slate-900">১. আমরা কী তথ্য সংগ্রহ করি</h2>
      <p className="mt-2">
        আমরা আপনার নাম, ফোন নম্বর, ইমেইল, ডেলিভারি ঠিকানা, অর্ডার ইতিহাস এবং প্রয়োজনে পেমেন্ট-সংক্রান্ত তথ্য সংগ্রহ করি। অ্যাকাউন্ট তৈরি, অর্ডার দেওয়া বা আমাদের সাথে যোগাযোগ করার সময় আপনি এই তথ্য সরবরাহ করেন। এছাড়াও আমরা ডিভাইস ও ব্রাউজার ডেটা (যেমন IP ঠিকানা, ব্রাউজার টাইপ, ডিভাইস টাইপ) স্বয়ংক্রিয়ভাবে সংগ্রহ করতে পারি।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">২. কেন আমরা তথ্য সংগ্রহ করি</h2>
      <p className="mt-2">
        আমরা আপনার তথ্য ব্যবহার করি: অর্ডার প্রক্রিয়াকরণ ও ডেলিভারি, গ্রাহক সাপোর্ট, জালিয়াতি প্রতিরোধ, সেবার মান উন্নয়ন এবং বিশ্লেষণ (অ্যানালিটিক্স) এর জন্য। আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষকে বিক্রয় করি না।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৩. পেমেন্ট ডেটা সম্পর্কে</h2>
      <p className="mt-2">
        আমরা কার্ডের সম্পূর্ণ বিবরণ সংরক্ষণ করি না। কার্ড পেমেন্ট SSLCommerz বা অন্যান্য অনুমোদিত পেমেন্ট গেটওয়ের মাধ্যমে প্রক্রিয়া হয়। bKash, Nagad, Rocket ইত্যাদি ওয়ালেট লেনদেন সংশ্লিষ্ট প্রোভাইডার দ্বারা পরিচালিত হয়; আমরা শুধুমাত্র ট্রানজেকশন রেফারেন্স সংরক্ষণ করি।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৪. তথ্য শেয়ারিং</h2>
      <p className="mt-2">
        আমরা তথ্য শেয়ার করি: কুরিয়ার পার্টনারদের সাথে (ডেলিভারির জন্য), পেমেন্ট গেটওয়েগুলোর সাথে (লেনদেন প্রক্রিয়াকরণের জন্য), হোস্টিং ও অ্যানালিটিক্স সেবার প্রোভাইডারদের সাথে (সীমিত পরিসরে), এবং আইনি বাধ্যবাধকতা বা কর্তৃপক্ষের অনুরোধে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৫. কুকিজ ও ট্র্যাকিং</h2>
      <p className="mt-2">
        আমরা সেশন কুকিজ (লগইন/অ্যাকাউন্ট স্টেট), কার্ট কুকিজ (শপিং কার্ট সংরক্ষণ) এবং অ্যানালিটিক্স কুকিজ ব্যবহার করি। আপনি ব্রাউজার সেটিংস থেকে কুকিজ নিষ্ক্রিয় করতে পারবেন; তবে কিছু কার্যকারিতা (যেমন কার্ট) সীমিত হতে পারে। মার্কেটিং ইমেইলের জন্য আপনি যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৬. ডেটা সংরক্ষণ ও মোছার অনুরোধ</h2>
      <p className="mt-2">
        আমরা অ্যাকাউন্টিং, লিগাল কমপ্লায়েন্স এবং স্প্যাম/জালিয়াতি প্রতিরোধের জন্য যুক্তিসঙ্গত সময় পর্যন্ত ডেটা সংরক্ষণ করি। আপনি ডেটা সংশোধন বা মোছার জন্য অনুরোধ করতে পারেন। আমরা আপনার অনুরোধ যাচাই করে ৩০ কার্যদিবসের মধ্যে সাড়া দেবার চেষ্টা করব।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৭. নিরাপত্তা</h2>
      <p className="mt-2">
        আমরা অ্যাক্সেস নিয়ন্ত্রণ, ট্রানজিটে এনক্রিপশন (HTTPS), এবং সীমিত স্টাফ অ্যাক্সেসের মাধ্যমে আপনার তথ্য রক্ষা করার চেষ্টা করি। সংবেদনশীল ডেটা শিল্প অনুশীলন অনুযায়ী পরিচালিত হয়।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৮. আপনার অধিকার</h2>
      <p className="mt-2">
        আপনি আপনার তথ্য সংশোধন, মোছার অনুরোধ এবং মার্কেটিং কমিউনিকেশন থেকে আনসাবস্ক্রাইব করার অধিকার রাখেন। অনুরোধের জন্য নিচের যোগাযোগ তথ্য ব্যবহার করুন।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৯. শিশুদের গোপনীয়তা</h2>
      <p className="mt-2">
        আমাদের সেবা ১৮ বছরের কম বয়সীদের জন্য উদ্দিষ্ট নয়। আমরা ইচ্ছাকৃতভাবে শিশুদের কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। যদি কোনো শিশুর তথ্য ভুলবশত সংগ্রহ হয়ে থাকে তবে আমরা তা সরিয়ে ফেলব।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">১০. নীতি আপডেট ও কার্যকর তারিখ</h2>
      <p className="mt-2">
        আমরা প্রয়োজন অনুযায়ী এই গোপনীয়তা নীতি আপডেট করতে পারি। উল্লেখযোগ্য পরিবর্তনের ক্ষেত্রে আমরা ওয়েবসাইটে বা ইমেইলের মাধ্যমে জানাব। এই পেজের &quot;সর্বশেষ আপডেট&quot; তারিখে নীতি কার্যকর হবে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">১১. যোগাযোগ</h2>
      <p className="mt-2">
        এই গোপনীয়তা নীতি সম্পর্কে প্রশ্নের জন্য যোগাযোগ করুন:{" "}
        <a href={`mailto:${CONTACT.email}`} className="font-medium text-primary hover:underline">{CONTACT.email}</a> অথবা ফোন{" "}
        <a href={`tel:${CONTACT.phoneRaw}`} className="font-medium text-primary hover:underline">{CONTACT.phone}</a>। ঠিকানা: {CONTACT.address}।
      </p>
    </section>
  </div>
);

function LegalPageFooter() {
  return (
    <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-8">
      <Link href="/" className="font-semibold text-primary hover:underline">← বাড়িতে ফিরে যান</Link>
      <Link href="/terms" className="font-semibold text-primary hover:underline">সেবার শর্তাবলী</Link>
      <Link href="/refund" className="font-semibold text-primary hover:underline">রিফান্ড নীতি →</Link>
    </div>
  );
}

export default async function PrivacyPage() {
  const page = await getCmsPageBySlug("privacy");
  const title = page?.titleBn ?? page?.titleEn ?? "গোপনীয়তা নীতি";
  const content = page?.contentBn ?? page?.contentEn;
  const updatedAt = page?.publishedAt;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        সর্বশেষ আপডেট: {updatedAt ? new Date(updatedAt).toLocaleDateString("bn-BD") : new Date().toLocaleDateString("bn-BD")}
      </p>
      {content ? (
        <div className="legal-content mt-8 space-y-4 text-slate-600 prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-primary prose-a:no-underline hover:prose-a:underline" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        PRIVACY_FALLBACK
      )}
      <LegalPageFooter />
    </div>
  );
}
