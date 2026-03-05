import type { Metadata } from "next";
import Link from "next/link";
import { getCmsPageBySlug } from "@/lib/cms-page";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Return & Refund Policy | City Plus Pet Shop",
  description:
    "Return and refund policy for City Plus Pet Shop (City Pet Shop BD). Eligibility, non-returnable items, damaged product procedure, refund methods, cancellation rules.",
};

const CONTACT = { email: CONTACT_EMAIL, phone: "+880 1643-390045", phoneRaw: "+8801643390045", address: "মিরপুর ২, বড়বাগ, ঢাকা, বাংলাদেশ" };

const REFUND_FALLBACK = (
  <div className="mt-8 space-y-6 text-slate-600">
    <section>
      <h2 className="text-lg font-semibold text-slate-900">১. দাবির যোগ্যতা ও সময়সীমা</h2>
      <p className="mt-2">
        ভুল বা ত্রুটিপূর্ণ পণ্য পাঠানোর দাবির জন্য ডেলিভারি পাওয়ার পর <strong>২৪–৭২ ঘণ্টার</strong> মধ্যে আমাদের সাথে যোগাযোগ করুন। সাধারণ পণ্য (খেলনা, আনুষাঙ্গিক) এর জন্য ৭২ ঘণ্টা; খাদ্য বা ওষুধের জন্য ২৪ ঘণ্টার মধ্যে দাবি করতে হবে। এই সময়ের পরে দাবি বিবেচনা করা নাও হতে পারে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">২. রিটার্ন অযোগ্য পণ্য</h2>
      <p className="mt-2">
        নিচের পণ্য রিটার্ন বা রিফান্ডের অযোগ্য: খোলা পেট ফুড/ক্যাট ফুড, ওষুধ, হাইজিন সংবেদনশীল পণ্য (যেমন শ্যাম্পু, কন্ডিশনার যা খোলা হয়েছে), পচনশীল পণ্য, এবং সিল ভাঙা প্যাকেট। সিল অক্ষত থাকলে কিছু পণ্য বিনিময়ের জন্য বিবেচনা করা হতে পারে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৩. ভুল/ক্ষতিগ্রস্ত পণ্য প্রক্রিয়া</h2>
      <p className="mt-2">
        ভুল বা ক্ষতিগ্রস্ত পণ্য দাবি করতে হলে: (ক) আনবক্সিং ভিডিও বা ফটো প্রমাণ রাখুন, (খ) পণ্য ও প্যাকেজিংয়ের স্পষ্ট ছবি পাঠান, (গ) অর্ডার আইডি ও সমস্যার বিবরণ দিয়ে{" "}
        <a href={`mailto:${CONTACT.email}`} className="font-medium text-primary hover:underline">{CONTACT.email}</a> বা ফোন{" "}
        <a href={`tel:${CONTACT.phoneRaw}`} className="font-medium text-primary hover:underline">{CONTACT.phone}</a> এ যোগাযোগ করুন। আমরা ২৪–৪৮ ঘণ্টার মধ্যে সাড়া দেব এবং প্রক্রিয়া জানাব।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৪. রিফান্ড পদ্ধতি ও সময়</h2>
      <p className="mt-2">
        অনুমোদিত রিফান্ড <strong>৫–১০ কার্যদিবসের</strong> মধ্যে প্রক্রিয়া করা হবে। ক্যাশ অন ডেলিভারি (COD) অর্ডারের জন্য bKash, Nagad বা ব্যাংক ট্রান্সফার দিয়ে রিফান্ড দেওয়া হবে। কার্ড পেমেন্টের ক্ষেত্রে মূল পেমেন্ট মেথডে ফেরত যাবে। ওয়ালেট পেমেন্টের জন্য সংশ্লিষ্ট ওয়ালেটে রিফান্ড করা হতে পারে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৫. ডেলিভারি চার্জ রিফান্ড</h2>
      <p className="mt-2">
        আমাদের ভুল বা ত্রুটির কারণে সম্পূর্ণ অর্ডার বাতিল হলে ডেলিভারি চার্জ সহ পুরো অর্ডার মূল্য রিফান্ড করা হবে। গ্রাহকের ভুল (ভুল ঠিকানা, অনুপস্থিতি) বা শুধুমাত্র কিছু পণ্য রিটার্নের ক্ষেত্রে ডেলিভারি চার্জ রিফান্ড করা নাও হতে পারে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৬. বিনিময় নীতি</h2>
      <p className="mt-2">
        সিল অক্ষত ও রিটার্নযোগ্য পণ্যের ক্ষেত্রে আমরা বিনিময় বিবেচনা করি। স্টক থাকলে একই পণ্য বা সমমূল্যের বিকল্প দেওয়া হতে পারে। বিনিময়ের জন্য আগে আমাদের সাথে যোগাযোগ করুন।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৭. অর্ডার বাতিল নিয়ম</h2>
      <p className="mt-2">
        <strong>শিপমেন্টের আগে:</strong> অর্ডার ডিসপ্যাচ হওয়ার আগে বাতিল করলে সম্পূর্ণ রিফান্ড দেওয়া হবে। পেমেন্ট করা থাকলে ৫–৭ কার্যদিবসের মধ্যে ফেরত যাবে।
      </p>
      <p className="mt-2">
        <strong>শিপমেন্টের পর:</strong> পণ্য পাঠানোর পর বাতিল করতে চাইলে ডেলিভারি রিসিভ করতে হবে, তারপর রিটার্ন প্রক্রিয়া অনুসরণ করুন। কুরিয়ার ফেরত চার্জ আপনার দায় হতে পারে যদি শুধুমাত্র আপনার পছন্দ পরিবর্তনের কারণে হয়।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৮. যোগাযোগ ও সাপোর্ট</h2>
      <p className="mt-2">
        রিটার্ন/রিফান্ড সম্পর্কে প্রশ্নের জন্য যোগাযোগ করুন:{" "}
        <a href={`mailto:${CONTACT.email}`} className="font-medium text-primary hover:underline">{CONTACT.email}</a> অথবা ফোন{" "}
        <a href={`tel:${CONTACT.phoneRaw}`} className="font-medium text-primary hover:underline">{CONTACT.phone}</a>। ঠিকানা: {CONTACT.address}। অর্ডার আইডি ও সমস্যার বিবরণ দিয়ে যোগাযোগ করলে দ্রুত সহায়তা পাবেন।
      </p>
    </section>
  </div>
);

function LegalPageFooter() {
  return (
    <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-8">
      <Link href="/" className="font-semibold text-primary hover:underline">← বাড়িতে ফিরে যান</Link>
      <Link href="/terms" className="font-semibold text-primary hover:underline">সেবার শর্তাবলী</Link>
      <Link href="/privacy" className="font-semibold text-primary hover:underline">গোপনীয়তা নীতি →</Link>
    </div>
  );
}

export default async function RefundPage() {
  const page = await getCmsPageBySlug("refund");
  const title = page?.titleBn ?? page?.titleEn ?? "রিটার্ন ও রিফান্ড নীতি";
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
        REFUND_FALLBACK
      )}
      <LegalPageFooter />
    </div>
  );
}
