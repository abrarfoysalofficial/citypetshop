import type { Metadata } from "next";
import Link from "next/link";
import { getCmsPageBySlug } from "@/lib/cms-page";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions | City Plus Pet Shop",
  description:
    "Terms and conditions for City Plus Pet Shop (City Pet Shop BD) — Bangladesh ecommerce for pet food, accessories, and care products. Service scope, orders, delivery, payments, returns.",
};

const TERMS_FALLBACK = (
  <div className="mt-8 space-y-6 text-slate-600">
    <section>
      <h2 className="text-lg font-semibold text-slate-900">১. সেবার পরিধি, অ্যাকাউন্ট ও মূল্য</h2>
      <p className="mt-2">
        City Plus Pet Shop (City Pet Shop bd) একটি ই-কমার্স প্ল্যাটফর্ম যেখানে পোষা প্রাণীর খাদ্য, আনুষাঙ্গিক ও যত্নের পণ্য বিক্রয় করা হয়। ওয়েবসাইট ব্যবহার, অ্যাকাউন্ট তৈরি ও অর্ডার করার মাধ্যমে আপনি এই শর্তাবলী মেনে নিচ্ছেন। সমস্ত মূল্য বাংলাদেশী টাকা (৳) এ প্রদর্শিত। মূল্য প্রাপ্যতা ও বাজার অবস্থার ভিত্তিতে পরিবর্তন হতে পারে। পণ্যের প্রাপ্যতা স্টক অনুযায়ী সীমাবদ্ধ; স্টক ফুরিয়ে গেলে আমরা অর্ডার বাতিল বা স্থগিত রাখার অধিকার সংরক্ষণ করি।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">২. অর্ডার ও নিশ্চিতকরণ</h2>
      <p className="mt-2">
        অর্ডার প্লেস করার পর আপনি একটি নিশ্চিতকরণ ইমেইল বা এসএমএস পাবেন। অর্ডার শুধুমাত্র আমাদের নিশ্চিতকরণের পর প্রক্রিয়াকরণের জন্য গৃহীত হবে। ভুল তথ্য, স্টক সমস্যা বা অস্বাভাবিক পরিস্থিতিতে আমরা অর্ডার বাতিল বা প্রত্যাখ্যান করার অধিকার রাখি। গ্রাহককে যথাসময়ে জানানো হবে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৩. ডেলিভারি নীতি</h2>
      <p className="mt-2">
        <strong>ঢাকা শহর:</strong> সাধারণত ১–৩ কার্যদিবসের মধ্যে ডেলিভারি দেওয়া হয়। নির্দিষ্ট অঞ্চল ও ট্রাফিকের উপর নির্ভর করে সময় পরিবর্তন হতে পারে。
      </p>
      <p className="mt-2">
        <strong>ঢাকার বাইরে:</strong> ৩–৭ কার্যদিবস বা তার বেশি সময় লাগতে পারে। দূরত্ব ও কুরিয়ার পার্টনার অনুযায়ী ডেলিভারি চার্জ আলাদা হতে পারে।
      </p>
      <p className="mt-2">
        ডেলিভারির সময় পণ্যের দায় গ্রাহকের উপর চলে যায়। অর্ডার গ্রহণের সময় কেউ উপস্থিত থাকা নিশ্চিত করুন। ডেলিভারি পার্টনার (যেমন Steadfast, Pathao, Sundarban, eCourier) আমাদের নির্দেশ অনুযায়ী কাজ করে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৪. ক্যাশ অন ডেলিভারি (COD) নিয়ম</h2>
      <p className="mt-2">
        COD অর্ডারের জন্য গ্রাহককে ডেলিভারির সময় নগদ অর্থ প্রদান করতে হবে। নির্দিষ্ট অর্ডার মূল্যের উপরে COD সুবিধা দেওয়া হতে পারে; নিচের অর্ডারে অতিরিক্ত চার্জ প্রযোজ্য হতে পারে। ভুল ঠিকানা, অনুপস্থিতি বা বারবার ডেলিভারি ব্যর্থতার কারণে আমরা COD সুবিধা প্রত্যাহার বা সীমাবদ্ধ করার অধিকার রাখি।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৫. পেমেন্ট পদ্ধতি ও ওয়ালেট</h2>
      <p className="mt-2">
        আমরা ক্যাশ অন ডেলিভারি (COD), bKash, Nagad, Rocket এবং কার্ড পেমেন্ট গ্রহণ করি। ওয়ালেট পেমেন্টের ক্ষেত্রে গ্রাহক নিজের অ্যাকাউন্ট থেকে সঠিক পরিমাণ পাঠাবেন এবং ট্রানজেকশন আইডি/রেফারেন্স প্রদান করবেন। ভুল নম্বর বা অপর্যাপ্ত টাকা পাঠানোর দায় আমরা নেব না।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৬. জালিয়াতি প্রতিরোধ</h2>
      <p className="mt-2">
        আমরা জালিয়াতি ও অপব্যবহার রোধ করতে অর্ডার যাচাই, ফোন/ইমেইল নিশ্চিতকরণ এবং প্রয়োজনে ম্যানুয়াল রিভিউ করি। সন্দেহজনক অর্ডার বাতিল বা বিলম্বিত হতে পারে। জালিয়াতিমূলক কার্যকলাপের ক্ষেত্রে আইনি ব্যবস্থা নেওয়া হতে পারে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৭. রিটার্ন ও রিফান্ড</h2>
      <p className="mt-2">
        ত্রুটিপূর্ণ বা ভুল পণ্য পাঠানোর ক্ষেত্রে রিটার্ন ও রিফান্ডের জন্য আমাদের{" "}
        <Link href="/refund" className="font-medium text-primary hover:underline">রিফান্ড নীতি</Link> অনুসরণ করা হয়। কিছু পণ্য (যেমন হাইজিন-সংবেদনশীল বা পচনশীল) রিটার্নের অযোগ্য হতে পারে। বিস্তারিত জানতে <Link href="/refund" className="font-medium text-primary hover:underline">/refund</Link> পেজ দেখুন।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৮. ব্যবহারকারীর দায়িত্ব</h2>
      <p className="mt-2">
        আপনি সঠিক ও সম্পূর্ণ তথ্য প্রদান করবেন; ভুল ঠিকানা বা ফোন নম্বরের কারণে বিলম্ব বা ব্যর্থতার দায় আমরা নেব না। অ্যাকাউন্ট নিরাপত্তা আপনার দায়িত্ব। নিষিদ্ধ কার্যকলাপের মধ্যে রয়েছে: জালিয়াতি, স্প্যাম, সিস্টেমে অননুমোদিত প্রবেশ, মিথ্যা তথ্য প্রদান, আইনবিরোধী পণ্য অর্ডার করা। এ ধরনের কার্যকলাপের জন্য অ্যাকাউন্ট বাতিল ও আইনি ব্যবস্থা নেওয়া হতে পারে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">৯. দায় সীমাবদ্ধতা</h2>
      <p className="mt-2">
        আমরা আইনসম্মত সর্বোচ্চ সীমা পর্যন্ত দায় সীমাবদ্ধ রাখি। অপ্রত্যাশিত বিলম্ব, কুরিয়ার ত্রুটি, প্রাকৃতিক দুর্যোগ বা তৃতীয় পক্ষের কারণে হওয়া ক্ষতির জন্য আমরা সরাসরি দায়ী নই। পণ্যের গুণমান নিশ্চিত করার চেষ্টা করলেও আমরা প্রস্তুতকারকের দায় বহন করি না।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">১০. বিরোধ নিষ্পত্তি ও আইন</h2>
      <p className="mt-2">
        কোনো বিরোধ প্রথমে আলোচনার মাধ্যমে সমাধানের চেষ্টা করা হবে। সমাধান না হলে বাংলাদেশের আইন ও আদালত প্রযোজ্য হবে। এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী ব্যাখ্যা করা হবে।
      </p>
    </section>
    <section>
      <h2 className="text-lg font-semibold text-slate-900">১১. যোগাযোগ ও সাপোর্ট</h2>
      <p className="mt-2">
        সেবার শর্তাবলী সংক্রান্ত প্রশ্নের জন্য যোগাযোগ করুন:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">{CONTACT_EMAIL}</a> অথবা ফোন{" "}
        <a href="tel:+8801643390045" className="font-medium text-primary hover:underline">+৮৮০ ১৬৪৩-৩৯০০৪৫</a>। ঠিকানা: মিরপুর ২, বড়বাগ, ঢাকা, বাংলাদেশ।
      </p>
    </section>
  </div>
);

function LegalPageFooter() {
  return (
    <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-8">
      <Link href="/" className="font-semibold text-primary hover:underline">← বাড়িতে ফিরে যান</Link>
      <Link href="/refund" className="font-semibold text-primary hover:underline">রিফান্ড নীতি →</Link>
    </div>
  );
}

export default async function TermsPage() {
  const page = await getCmsPageBySlug("terms");
  const title = page?.titleBn ?? page?.titleEn ?? "সেবার শর্তাবলী";
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
        TERMS_FALLBACK
      )}
      <LegalPageFooter />
    </div>
  );
}
