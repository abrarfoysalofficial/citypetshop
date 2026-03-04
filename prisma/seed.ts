/**
 * Seed script for self-hosted deployment.
 * Idempotent: safe to run multiple times (npx prisma db seed).
 *
 * Order:
 * 1. Default tenant (if not exists)
 * 2. Tenant settings (if not exists)
 * 3. SUPER_ADMIN / owner / admin roles (if not exists)
 * 4. Admin user (if not exists)
 * 5. Assign roles to admin user
 * 6. Payment gateways, fraud policy, product filters, sample data
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { DEFAULT_TENANT_ID } from "../lib/tenant";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@citypetshop.bd";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  if (process.env.NODE_ENV === "production") {
    if (!adminPassword || adminPassword.length < 12) {
      throw new Error("ADMIN_PASSWORD must be set and at least 12 characters in production");
    }
    if (adminPassword === "Admin@12345") {
      throw new Error("ADMIN_PASSWORD cannot be the default 'Admin@12345' in production");
    }
  }

  // 1. Default tenant (if not exists)
  await prisma.tenant.upsert({
    where: { id: DEFAULT_TENANT_ID },
    create: { id: DEFAULT_TENANT_ID, name: "Default", slug: "default" },
    update: {},
  });

  await prisma.tenantSettings.upsert({
    where: { tenantId: DEFAULT_TENANT_ID },
    create: {
      tenantId: DEFAULT_TENANT_ID,
      siteNameEn: "City Pet Shop BD",
      primaryColor: "#5cd4ff",
      accentColor: "#f39221",
      deliveryInsideDhaka: 70,
      deliveryOutsideDhaka: 130,
      freeDeliveryThreshold: 2000,
      termsUrl: "/terms",
      privacyUrl: "/privacy",
    },
    update: { primaryColor: "#5cd4ff", accentColor: "#f39221" },
  });
  console.log("Tenant settings ready");

  // 3. SUPER_ADMIN role (and owner, admin, moderator) - if not exists
  const superAdminRole = await prisma.role.upsert({
    where: { name: "super_admin" },
    create: {
      name: "super_admin",
      description: "Super Administrator with full access",
      isSystem: true,
    },
    update: {},
  });

  const ownerRole = await prisma.role.upsert({
    where: { name: "owner" },
    create: {
      name: "owner",
      description: "Store owner with full access",
      isSystem: true,
    },
    update: {},
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    create: {
      name: "admin",
      description: "Administrator with most permissions",
    },
    update: {},
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: "moderator" },
    create: {
      name: "moderator",
      description: "Moderator with limited permissions",
    },
    update: {},
  });
  console.log("Roles ready (super_admin, owner, admin, moderator)");

  // 4. Admin user (idempotent upsert — do not duplicate)
  const passwordHash = await hash(adminPassword, 12);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
      role: "super_admin",
    },
    update: {}, // never overwrite password on re-seed
  });
  console.log(`Admin user ready: ${adminEmail}`);

  // 5. Assign owner + super_admin roles to admin user
  if (adminUser) {
    for (const role of [ownerRole, superAdminRole]) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: adminUser!.id,
            roleId: role.id,
          },
        },
        create: {
          userId: adminUser!.id,
          roleId: role.id,
        },
        update: {},
      });
    }
    console.log("Owner and super_admin roles assigned to admin user");
  }

  // 6. Payment gateways, fraud policy, filters, sample data
  const gateways = [
    { gateway: "cod", displayNameEn: "Cash on Delivery", isActive: true },
    { gateway: "bkash", displayNameEn: "bKash", isActive: false },
    { gateway: "nagad", displayNameEn: "Nagad", isActive: false },
    { gateway: "rocket", displayNameEn: "Rocket", isActive: false },
    { gateway: "sslcommerz", displayNameEn: "Card / Bank", isActive: false },
  ];
  for (const g of gateways) {
    await prisma.paymentGateway.upsert({
      where: { gateway: g.gateway },
      create: g,
      update: {},
    });
  }
  console.log("Payment gateways ready");

  await prisma.fraudPolicy.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
  console.log("Fraud policy ready");

  // Seed default product filters
  const defaultFilters = [
    { key: "brand", labelEn: "Brand", type: "select", sortOrder: 0 },
    { key: "price_range", labelEn: "Price Range", type: "range", sortOrder: 1 },
    { key: "category", labelEn: "Category", type: "select", sortOrder: 2 },
  ];
  for (const f of defaultFilters) {
    await prisma.productFilter.upsert({
      where: { key: f.key },
      create: f,
      update: {},
    }).catch(() => {});
  }
  console.log("Product filters ready");

  // Legal pages (terms, privacy, refund) — create only if not exists
  const legalSlugs = ["terms", "privacy", "refund"];
  for (const slug of legalSlugs) {
    const existing = await prisma.cmsPage.findUnique({ where: { slug } });
    if (!existing) {
      const legalContent: Record<string, { titleEn: string; titleBn: string; seoTitle: string; seoDescription: string; contentEn: string }> = {
        terms: {
          titleEn: "Terms & Conditions",
          titleBn: "সেবার শর্তাবলী",
          seoTitle: "Terms & Conditions | City Plus Pet Shop",
          seoDescription: "Terms and conditions for City Plus Pet Shop (City Pet Shop BD) — Bangladesh ecommerce for pet food, accessories, and care products.",
          contentEn: `<section><h2>১. সেবার পরিধি, অ্যাকাউন্ট ও মূল্য</h2><p>City Plus Pet Shop (City Pet Shop bd) একটি ই-কমার্স প্ল্যাটফর্ম যেখানে পোষা প্রাণীর খাদ্য, আনুষাঙ্গিক ও যত্নের পণ্য বিক্রয় করা হয়। ওয়েবসাইট ব্যবহার, অ্যাকাউন্ট তৈরি ও অর্ডার করার মাধ্যমে আপনি এই শর্তাবলী মেনে নিচ্ছেন। সমস্ত মূল্য বাংলাদেশী টাকা (৳) এ প্রদর্শিত। মূল্য প্রাপ্যতা ও বাজার অবস্থার ভিত্তিতে পরিবর্তন হতে পারে। পণ্যের প্রাপ্যতা স্টক অনুযায়ী সীমাবদ্ধ; স্টক ফুরিয়ে গেলে আমরা অর্ডার বাতিল বা স্থগিত রাখার অধিকার সংরক্ষণ করি।</p></section>
<section><h2>২. অর্ডার ও নিশ্চিতকরণ</h2><p>অর্ডার প্লেস করার পর আপনি একটি নিশ্চিতকরণ ইমেইল বা এসএমএস পাবেন। অর্ডার শুধুমাত্র আমাদের নিশ্চিতকরণের পর প্রক্রিয়াকরণের জন্য গৃহীত হবে। ভুল তথ্য, স্টক সমস্যা বা অস্বাভাবিক পরিস্থিতিতে আমরা অর্ডার বাতিল বা প্রত্যাখ্যান করার অধিকার রাখি। গ্রাহককে যথাসময়ে জানানো হবে।</p></section>
<section><h2>৩. ডেলিভারি নীতি</h2><p><strong>ঢাকা শহর:</strong> সাধারণত ১–৩ কার্যদিবসের মধ্যে ডেলিভারি দেওয়া হয়। নির্দিষ্ট অঞ্চল ও ট্রাফিকের উপর নির্ভর করে সময় পরিবর্তন হতে পারে।</p><p><strong>ঢাকার বাইরে:</strong> ৩–৭ কার্যদিবস বা তার বেশি সময় লাগতে পারে। দূরত্ব ও কুরিয়ার পার্টনার অনুযায়ী ডেলিভারি চার্জ আলাদা হতে পারে।</p><p>ডেলিভারির সময় পণ্যের দায় গ্রাহকের উপর চলে যায়। অর্ডার গ্রহণের সময় কেউ উপস্থিত থাকা নিশ্চিত করুন। ডেলিভারি পার্টনার (যেমন Steadfast, Pathao, Sundarban, eCourier) আমাদের নির্দেশ অনুযায়ী কাজ করে।</p></section>
<section><h2>৪. ক্যাশ অন ডেলিভারি (COD) নিয়ম</h2><p>COD অর্ডারের জন্য গ্রাহককে ডেলিভারির সময় নগদ অর্থ প্রদান করতে হবে। নির্দিষ্ট অর্ডার মূল্যের উপরে COD সুবিধা দেওয়া হতে পারে; নিচের অর্ডারে অতিরিক্ত চার্জ প্রযোজ্য হতে পারে। ভুল ঠিকানা, অনুপস্থিতি বা বারবার ডেলিভারি ব্যর্থতার কারণে আমরা COD সুবিধা প্রত্যাহার বা সীমাবদ্ধ করার অধিকার রাখি।</p></section>
<section><h2>৫. পেমেন্ট পদ্ধতি ও ওয়ালেট</h2><p>আমরা ক্যাশ অন ডেলিভারি (COD), bKash, Nagad, Rocket এবং কার্ড পেমেন্ট গ্রহণ করি। ওয়ালেট পেমেন্টের ক্ষেত্রে গ্রাহক নিজের অ্যাকাউন্ট থেকে সঠিক পরিমাণ পাঠাবেন এবং ট্রানজেকশন আইডি/রেফারেন্স প্রদান করবেন। ভুল নম্বর বা অপর্যাপ্ত টাকা পাঠানোর দায় আমরা নেব না।</p></section>
<section><h2>৬. জালিয়াতি প্রতিরোধ</h2><p>আমরা জালিয়াতি ও অপব্যবহার রোধ করতে অর্ডার যাচাই, ফোন/ইমেইল নিশ্চিতকরণ এবং প্রয়োজনে ম্যানুয়াল রিভিউ করি। সন্দেহজনক অর্ডার বাতিল বা বিলম্বিত হতে পারে। জালিয়াতিমূলক কার্যকলাপের ক্ষেত্রে আইনি ব্যবস্থা নেওয়া হতে পারে।</p></section>
<section><h2>৭. রিটার্ন ও রিফান্ড</h2><p>ত্রুটিপূর্ণ বা ভুল পণ্য পাঠানোর ক্ষেত্রে রিটার্ন ও রিফান্ডের জন্য আমাদের <a href="/refund" class="text-primary hover:underline">রিফান্ড নীতি</a> অনুসরণ করা হয়। কিছু পণ্য (যেমন হাইজিন-সংবেদনশীল বা পচনশীল) রিটার্নের অযোগ্য হতে পারে। বিস্তারিত জানতে <a href="/refund" class="text-primary hover:underline">/refund</a> পেজ দেখুন।</p></section>
<section><h2>৮. ব্যবহারকারীর দায়িত্ব</h2><p>আপনি সঠিক ও সম্পূর্ণ তথ্য প্রদান করবেন; ভুল ঠিকানা বা ফোন নম্বরের কারণে বিলম্ব বা ব্যর্থতার দায় আমরা নেব না। অ্যাকাউন্ট নিরাপত্তা আপনার দায়িত্ব। নিষিদ্ধ কার্যকলাপের মধ্যে রয়েছে: জালিয়াতি, স্প্যাম, সিস্টেমে অননুমোদিত প্রবেশ, মিথ্যা তথ্য প্রদান, আইনবিরোধী পণ্য অর্ডার করা। এ ধরনের কার্যকলাপের জন্য অ্যাকাউন্ট বাতিল ও আইনি ব্যবস্থা নেওয়া হতে পারে।</p></section>
<section><h2>৯. দায় সীমাবদ্ধতা</h2><p>আমরা আইনসম্মত সর্বোচ্চ সীমা পর্যন্ত দায় সীমাবদ্ধ রাখি। অপ্রত্যাশিত বিলম্ব, কুরিয়ার ত্রুটি, প্রাকৃতিক দুর্যোগ বা তৃতীয় পক্ষের কারণে হওয়া ক্ষতির জন্য আমরা সরাসরি দায়ী নই। পণ্যের গুণমান নিশ্চিত করার চেষ্টা করলেও আমরা প্রস্তুতকারকের দায় বহন করি না।</p></section>
<section><h2>১০. বিরোধ নিষ্পত্তি ও আইন</h2><p>কোনো বিরোধ প্রথমে আলোচনার মাধ্যমে সমাধানের চেষ্টা করা হবে। সমাধান না হলে বাংলাদেশের আইন ও আদালত প্রযোজ্য হবে। এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী ব্যাখ্যা করা হবে।</p></section>
<section><h2>১১. যোগাযোগ ও সাপোর্ট</h2><p>সেবার শর্তাবলী সংক্রান্ত প্রশ্নের জন্য যোগাযোগ করুন: <a href="mailto:info@citypluspetshop.com" class="text-primary hover:underline">info@citypluspetshop.com</a> অথবা ফোন <a href="tel:+8801643390045" class="text-primary hover:underline">+৮৮০ ১৬৪৩-৩৯০০৪৫</a>। ঠিকানা: মিরপুর ২, বড়বাগ, ঢাকা, বাংলাদেশ।</p></section>`,
        },
        privacy: {
          titleEn: "Privacy Policy",
          titleBn: "গোপনীয়তা নীতি",
          seoTitle: "Privacy Policy | City Plus Pet Shop",
          seoDescription: "Privacy policy for City Plus Pet Shop (City Pet Shop BD) — how we collect, use, and protect your personal data.",
          contentEn: `<section><h2>১. আমরা কী তথ্য সংগ্রহ করি</h2><p>আমরা আপনার নাম, ফোন নম্বর, ইমেইল, ডেলিভারি ঠিকানা, অর্ডার ইতিহাস এবং প্রয়োজনে পেমেন্ট-সংক্রান্ত তথ্য সংগ্রহ করি। অ্যাকাউন্ট তৈরি, অর্ডার দেওয়া বা আমাদের সাথে যোগাযোগ করার সময় আপনি এই তথ্য সরবরাহ করেন। এছাড়াও আমরা ডিভাইস ও ব্রাউজার ডেটা (যেমন IP ঠিকানা, ব্রাউজার টাইপ, ডিভাইস টাইপ) স্বয়ংক্রিয়ভাবে সংগ্রহ করতে পারি।</p></section>
<section><h2>২. কেন আমরা তথ্য সংগ্রহ করি</h2><p>আমরা আপনার তথ্য ব্যবহার করি: অর্ডার প্রক্রিয়াকরণ ও ডেলিভারি, গ্রাহক সাপোর্ট, জালিয়াতি প্রতিরোধ, সেবার মান উন্নয়ন এবং বিশ্লেষণ (অ্যানালিটিক্স) এর জন্য। আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষকে বিক্রয় করি না।</p></section>
<section><h2>৩. পেমেন্ট ডেটা সম্পর্কে</h2><p>আমরা কার্ডের সম্পূর্ণ বিবরণ সংরক্ষণ করি না। কার্ড পেমেন্ট SSLCommerz বা অন্যান্য অনুমোদিত পেমেন্ট গেটওয়ের মাধ্যমে প্রক্রিয়া হয়। bKash, Nagad, Rocket ইত্যাদি ওয়ালেট লেনদেন সংশ্লিষ্ট প্রোভাইডার দ্বারা পরিচালিত হয়; আমরা শুধুমাত্র ট্রানজেকশন রেফারেন্স সংরক্ষণ করি।</p></section>
<section><h2>৪. তথ্য শেয়ারিং</h2><p>আমরা তথ্য শেয়ার করি: কুরিয়ার পার্টনারদের সাথে (ডেলিভারির জন্য), পেমেন্ট গেটওয়েগুলোর সাথে (লেনদেন প্রক্রিয়াকরণের জন্য), হোস্টিং ও অ্যানালিটিক্স সেবার প্রোভাইডারদের সাথে (সীমিত পরিসরে), এবং আইনি বাধ্যবাধকতা বা কর্তৃপক্ষের অনুরোধে।</p></section>
<section><h2>৫. কুকিজ ও ট্র্যাকিং</h2><p>আমরা সেশন কুকিজ (লগইন/অ্যাকাউন্ট স্টেট), কার্ট কুকিজ (শপিং কার্ট সংরক্ষণ) এবং অ্যানালিটিক্স কুকিজ ব্যবহার করি। আপনি ব্রাউজার সেটিংস থেকে কুকিজ নিষ্ক্রিয় করতে পারবেন; তবে কিছু কার্যকারিতা (যেমন কার্ট) সীমিত হতে পারে। মার্কেটিং ইমেইলের জন্য আপনি যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।</p></section>
<section><h2>৬. ডেটা সংরক্ষণ ও মোছার অনুরোধ</h2><p>আমরা অ্যাকাউন্টিং, লিগাল কমপ্লায়েন্স এবং স্প্যাম/জালিয়াতি প্রতিরোধের জন্য যুক্তিসঙ্গত সময় পর্যন্ত ডেটা সংরক্ষণ করি। আপনি ডেটা সংশোধন বা মোছার জন্য অনুরোধ করতে পারেন। আমরা আপনার অনুরোধ যাচাই করে ৩০ কার্যদিবসের মধ্যে সাড়া দেবার চেষ্টা করব।</p></section>
<section><h2>৭. নিরাপত্তা</h2><p>আমরা অ্যাক্সেস নিয়ন্ত্রণ, ট্রানজিটে এনক্রিপশন (HTTPS), এবং সীমিত স্টাফ অ্যাক্সেসের মাধ্যমে আপনার তথ্য রক্ষা করার চেষ্টা করি। সংবেদনশীল ডেটা শিল্প অনুশীলন অনুযায়ী পরিচালিত হয়।</p></section>
<section><h2>৮. আপনার অধিকার</h2><p>আপনি আপনার তথ্য সংশোধন, মোছার অনুরোধ এবং মার্কেটিং কমিউনিকেশন থেকে আনসাবস্ক্রাইব করার অধিকার রাখেন। অনুরোধের জন্য নিচের যোগাযোগ তথ্য ব্যবহার করুন।</p></section>
<section><h2>৯. শিশুদের গোপনীয়তা</h2><p>আমাদের সেবা ১৮ বছরের কম বয়সীদের জন্য উদ্দিষ্ট নয়। আমরা ইচ্ছাকৃতভাবে শিশুদের কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। যদি কোনো শিশুর তথ্য ভুলবশত সংগ্রহ হয়ে থাকে তবে আমরা তা সরিয়ে ফেলব।</p></section>
<section><h2>১০. নীতি আপডেট ও কার্যকর তারিখ</h2><p>আমরা প্রয়োজন অনুযায়ী এই গোপনীয়তা নীতি আপডেট করতে পারি। উল্লেখযোগ্য পরিবর্তনের ক্ষেত্রে আমরা ওয়েবসাইটে বা ইমেইলের মাধ্যমে জানাব। এই পেজের "সর্বশেষ আপডেট" তারিখে নীতি কার্যকর হবে।</p></section>
<section><h2>১১. যোগাযোগ</h2><p>এই গোপনীয়তা নীতি সম্পর্কে প্রশ্নের জন্য যোগাযোগ করুন: <a href="mailto:info@citypluspetshop.com" class="text-primary hover:underline">info@citypluspetshop.com</a> অথবা ফোন <a href="tel:+8801643390045" class="text-primary hover:underline">+৮৮০ ১৬৪৩-৩৯০০৪৫</a>। ঠিকানা: মিরপুর ২, বড়বাগ, ঢাকা, বাংলাদেশ।</p></section>`,
        },
        refund: {
          titleEn: "Return & Refund Policy",
          titleBn: "রিটার্ন ও রিফান্ড নীতি",
          seoTitle: "Return & Refund Policy | City Plus Pet Shop",
          seoDescription: "Return and refund policy for City Plus Pet Shop (City Pet Shop BD). Eligibility, non-returnable items, damaged product procedure, refund methods.",
          contentEn: `<section><h2>১. দাবির যোগ্যতা ও সময়সীমা</h2><p>ভুল বা ত্রুটিপূর্ণ পণ্য পাঠানোর দাবির জন্য ডেলিভারি পাওয়ার পর <strong>২৪–৭২ ঘণ্টার</strong> মধ্যে আমাদের সাথে যোগাযোগ করুন। সাধারণ পণ্য (খেলনা, আনুষাঙ্গিক) এর জন্য ৭২ ঘণ্টা; খাদ্য বা ওষুধের জন্য ২৪ ঘণ্টার মধ্যে দাবি করতে হবে। এই সময়ের পরে দাবি বিবেচনা করা নাও হতে পারে।</p></section>
<section><h2>২. রিটার্ন অযোগ্য পণ্য</h2><p>নিচের পণ্য রিটার্ন বা রিফান্ডের অযোগ্য: খোলা পেট ফুড/ক্যাট ফুড, ওষুধ, হাইজিন সংবেদনশীল পণ্য (যেমন শ্যাম্পু, কন্ডিশনার যা খোলা হয়েছে), পচনশীল পণ্য, এবং সিল ভাঙা প্যাকেট। সিল অক্ষত থাকলে কিছু পণ্য বিনিময়ের জন্য বিবেচনা করা হতে পারে।</p></section>
<section><h2>৩. ভুল/ক্ষতিগ্রস্ত পণ্য প্রক্রিয়া</h2><p>ভুল বা ক্ষতিগ্রস্ত পণ্য দাবি করতে হলে: (ক) আনবক্সিং ভিডিও বা ফটো প্রমাণ রাখুন, (খ) পণ্য ও প্যাকেজিংয়ের স্পষ্ট ছবি পাঠান, (গ) অর্ডার আইডি ও সমস্যার বিবরণ দিয়ে <a href="mailto:info@citypluspetshop.com" class="text-primary hover:underline">info@citypluspetshop.com</a> বা ফোন <a href="tel:+8801643390045" class="text-primary hover:underline">+৮৮০ ১৬৪৩-৩৯০০৪৫</a> এ যোগাযোগ করুন। আমরা ২৪–৪৮ ঘণ্টার মধ্যে সাড়া দেব এবং প্রক্রিয়া জানাব।</p></section>
<section><h2>৪. রিফান্ড পদ্ধতি ও সময়</h2><p>অনুমোদিত রিফান্ড <strong>৫–১০ কার্যদিবসের</strong> মধ্যে প্রক্রিয়া করা হবে। ক্যাশ অন ডেলিভারি (COD) অর্ডারের জন্য bKash, Nagad বা ব্যাংক ট্রান্সফার দিয়ে রিফান্ড দেওয়া হবে। কার্ড পেমেন্টের ক্ষেত্রে মূল পেমেন্ট মেথডে ফেরত যাবে। ওয়ালেট পেমেন্টের জন্য সংশ্লিষ্ট ওয়ালেটে রিফান্ড করা হতে পারে।</p></section>
<section><h2>৫. ডেলিভারি চার্জ রিফান্ড</h2><p>আমাদের ভুল বা ত্রুটির কারণে সম্পূর্ণ অর্ডার বাতিল হলে ডেলিভারি চার্জ সহ পুরো অর্ডার মূল্য রিফান্ড করা হবে। গ্রাহকের ভুল (ভুল ঠিকানা, অনুপস্থিতি) বা শুধুমাত্র কিছু পণ্য রিটার্নের ক্ষেত্রে ডেলিভারি চার্জ রিফান্ড করা নাও হতে পারে।</p></section>
<section><h2>৬. বিনিময় নীতি</h2><p>সিল অক্ষত ও রিটার্নযোগ্য পণ্যের ক্ষেত্রে আমরা বিনিময় বিবেচনা করি। স্টক থাকলে একই পণ্য বা সমমূল্যের বিকল্প দেওয়া হতে পারে। বিনিময়ের জন্য আগে আমাদের সাথে যোগাযোগ করুন।</p></section>
<section><h2>৭. অর্ডার বাতিল নিয়ম</h2><p><strong>শিপমেন্টের আগে:</strong> অর্ডার ডিসপ্যাচ হওয়ার আগে বাতিল করলে সম্পূর্ণ রিফান্ড দেওয়া হবে। পেমেন্ট করা থাকলে ৫–৭ কার্যদিবসের মধ্যে ফেরত যাবে।</p><p><strong>শিপমেন্টের পর:</strong> পণ্য পাঠানোর পর বাতিল করতে চাইলে ডেলিভারি রিসিভ করতে হবে, তারপর রিটার্ন প্রক্রিয়া অনুসরণ করুন। কুরিয়ার ফেরত চার্জ আপনার দায় হতে পারে যদি শুধুমাত্র আপনার পছন্দ পরিবর্তনের কারণে হয়।</p></section>
<section><h2>৮. যোগাযোগ ও সাপোর্ট</h2><p>রিটার্ন/রিফান্ড সম্পর্কে প্রশ্নের জন্য যোগাযোগ করুন: <a href="mailto:info@citypluspetshop.com" class="text-primary hover:underline">info@citypluspetshop.com</a> অথবা ফোন <a href="tel:+8801643390045" class="text-primary hover:underline">+৮৮০ ১৬৪৩-৩৯০০৪৫</a>। ঠিকানা: মিরপুর ২, বড়বাগ, ঢাকা, বাংলাদেশ। অর্ডার আইডি ও সমস্যার বিবরণ দিয়ে যোগাযোগ করলে দ্রুত সহায়তা পাবেন।</p></section>`,
        },
      };
      const data = legalContent[slug];
      if (data) {
        await prisma.cmsPage.create({
          data: {
            slug,
            titleEn: data.titleEn,
            titleBn: data.titleBn,
            contentEn: data.contentEn,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            template: "legal",
            isPublished: true,
            publishedAt: new Date(),
          },
        });
        console.log(`Legal page "${slug}" seeded`);
      }
    }
  }

  // About page: founder profile (idempotent upsert)
  await prisma.aboutPageProfile.upsert({
    where: { id: "founder" },
    create: {
      id: "founder",
      name: "Our Founder",
      title: "Founder",
      bioEn:
        "City Plus Pet Shop started with a simple belief: every pet deserves the best. From a small shop in Dhaka to serving pet owners across Bangladesh, we remain committed to authentic dog food, cat food, and premium pet products. Your trust drives us every day.",
      imageUrl: "/team/founder.jpg",
      sortOrder: 0,
      isActive: true,
    },
    update: {
      name: "Our Founder",
      title: "Founder",
      bioEn:
        "City Plus Pet Shop started with a simple belief: every pet deserves the best. From a small shop in Dhaka to serving pet owners across Bangladesh, we remain committed to authentic dog food, cat food, and premium pet products. Your trust drives us every day.",
    },
  });
  console.log("About page founder profile ready");

  // About page: team members (create only if none exist — do not overwrite custom content)
  const existingTeamCount = await prisma.teamMember.count({ where: { isActive: true } });
  if (existingTeamCount === 0) {
    const seedTeam = [
      { name: "Customer Support", title: "Support Team", email: null, whatsapp: null, imageUrl: null, sortOrder: 0 },
      { name: "Operations", title: "Delivery & Logistics", email: null, whatsapp: null, imageUrl: null, sortOrder: 1 },
      { name: "Product Specialist", title: "Pet Food & Accessories", email: null, whatsapp: null, imageUrl: null, sortOrder: 2 },
      { name: "Quality Assurance", title: "Authenticity & Standards", email: null, whatsapp: null, imageUrl: null, sortOrder: 3 },
    ];
    for (const m of seedTeam) {
      await prisma.teamMember.create({
        data: {
          name: m.name,
          title: m.title,
          email: m.email,
          whatsapp: m.whatsapp,
          imageUrl: m.imageUrl,
          sortOrder: m.sortOrder,
          isActive: true,
        },
      });
    }
    console.log("About page team members seeded");
  }

  const cat = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: DEFAULT_TENANT_ID, slug: "dog-food" } },
    create: { tenantId: DEFAULT_TENANT_ID, slug: "dog-food", nameEn: "Dog Food", sortOrder: 0 },
    update: {},
  });

  const existingProduct = await prisma.product.findFirst({
    where: { tenantId: DEFAULT_TENANT_ID, slug: "sample-product" },
  });
  if (!existingProduct) {
    await prisma.product.create({
      data: {
        tenantId: DEFAULT_TENANT_ID,
        nameEn: "Sample Product",
        slug: "sample-product",
        categorySlug: cat.slug,
        categoryId: cat.id,
        sellingPrice: 500,
        buyingPrice: 400,
        stock: 10,
        images: { create: [{ url: "/ui/product-4x3.svg", sortOrder: 0, isPrimary: true }] },
        isActive: true,
        isFeatured: true,
      },
    });
    console.log("Sample product created");
  }

  // Seed RBAC roles and permissions
  console.log("Seeding RBAC roles and permissions...");

  // Create PermissionGroups (for menu structure)
  const groups = [
    { slug: "dashboard", name: "Dashboard", icon: "LayoutDashboard", sortOrder: 0 },
    { slug: "order-management", name: "Order Management", icon: "ShoppingCart", sortOrder: 10 },
    { slug: "product-management", name: "Product Management", icon: "Package", sortOrder: 20 },
    { slug: "content", name: "Pages & Content", icon: "FileText", sortOrder: 30 },
    { slug: "customers", name: "Customers", icon: "Users", sortOrder: 40 },
    { slug: "reports", name: "Reports", icon: "Activity", sortOrder: 50 },
    { slug: "settings", name: "Settings", icon: "Settings", sortOrder: 60 },
  ];
  const groupMap: Record<string, string> = {};
  for (const g of groups) {
    const created = await prisma.permissionGroup.upsert({
      where: { slug: g.slug },
      create: g,
      update: { name: g.name, icon: g.icon, sortOrder: g.sortOrder },
    });
    groupMap[g.slug] = created.id;
  }
  console.log("Permission groups created");

  // Create permissions with group + menu metadata
  const permissions: Array<{
    name: string;
    description: string;
    groupSlug: string;
    menuLabel?: string;
    menuHref?: string;
    menuSortOrder?: number;
  }> = [
    { name: "admin.view", description: "View admin panel", groupSlug: "dashboard", menuLabel: "Dashboard", menuHref: "/admin", menuSortOrder: 0 },
    { name: "users.view", description: "View users", groupSlug: "customers" },
    { name: "users.create", description: "Create users", groupSlug: "customers" },
    { name: "users.edit", description: "Edit users", groupSlug: "customers" },
    { name: "users.delete", description: "Delete users", groupSlug: "customers" },
    { name: "products.view", description: "View products", groupSlug: "product-management", menuLabel: "Products", menuHref: "/admin/products", menuSortOrder: 0 },
    { name: "products.create", description: "Create products", groupSlug: "product-management", menuLabel: "Product Upload", menuHref: "/admin/products/upload", menuSortOrder: 1 },
    { name: "products.edit", description: "Edit products", groupSlug: "product-management" },
    { name: "products.delete", description: "Delete products", groupSlug: "product-management" },
    { name: "categories.view", description: "View categories", groupSlug: "product-management", menuLabel: "Category Tree", menuHref: "/admin/categories", menuSortOrder: 2 },
    { name: "categories.create", description: "Create categories", groupSlug: "product-management" },
    { name: "categories.edit", description: "Edit categories", groupSlug: "product-management" },
    { name: "categories.delete", description: "Delete categories", groupSlug: "product-management" },
    { name: "brands.view", description: "View brands", groupSlug: "product-management", menuLabel: "Brands", menuHref: "/admin/brands", menuSortOrder: 3 },
    { name: "collections.view", description: "View collections", groupSlug: "product-management", menuLabel: "Product Catalogs", menuHref: "/admin/collections", menuSortOrder: 4 },
    { name: "filters.view", description: "View product filters", groupSlug: "product-management", menuLabel: "Product Filters", menuHref: "/admin/product-filters", menuSortOrder: 5 },
    { name: "units.view", description: "View units", groupSlug: "product-management", menuLabel: "Units", menuHref: "/admin/products/units", menuSortOrder: 6 },
    { name: "shipping.view", description: "View shipping", groupSlug: "product-management", menuLabel: "Shipping", menuHref: "/admin/shipping", menuSortOrder: 7 },
    { name: "brands.create", description: "Create brands", groupSlug: "product-management" },
    { name: "brands.edit", description: "Edit brands", groupSlug: "product-management" },
    { name: "brands.delete", description: "Delete brands", groupSlug: "product-management" },
    { name: "orders.view", description: "View orders", groupSlug: "order-management", menuLabel: "Orders", menuHref: "/admin/orders", menuSortOrder: 0 },
    { name: "orders.create", description: "Create orders", groupSlug: "order-management", menuLabel: "Create Order", menuHref: "/admin/orders/create", menuSortOrder: 1 },
    { name: "orders.edit", description: "Edit orders", groupSlug: "order-management" },
    { name: "orders.activities", description: "View order activities", groupSlug: "order-management", menuLabel: "Order Activities", menuHref: "/admin/orders/activities", menuSortOrder: 2 },
    { name: "customers.repeat", description: "View repeat customers", groupSlug: "customers", menuLabel: "Repeat Customer", menuHref: "/admin/customers/repeat", menuSortOrder: 0 },
    { name: "customers.risk", description: "View customer risk", groupSlug: "customers", menuLabel: "Customer Risk", menuHref: "/admin/customers/risk", menuSortOrder: 1 },
    { name: "orders.delete", description: "Delete orders", groupSlug: "order-management" },
    { name: "content.view", description: "View content", groupSlug: "content", menuLabel: "Blog", menuHref: "/admin/blog", menuSortOrder: 0 },
    { name: "content.pages", description: "View site pages", groupSlug: "content", menuLabel: "Site Pages", menuHref: "/admin/pages", menuSortOrder: 1 },
    { name: "content.blogCategories", description: "View blog categories", groupSlug: "content", menuLabel: "Blog Categories", menuHref: "/admin/blog-categories", menuSortOrder: 2 },
    { name: "content.create", description: "Create content", groupSlug: "content" },
    { name: "content.edit", description: "Edit content", groupSlug: "content" },
    { name: "content.delete", description: "Delete content", groupSlug: "content" },
    { name: "settings.view", description: "View site settings", groupSlug: "settings", menuLabel: "Store Settings", menuHref: "/admin/settings", menuSortOrder: 0 },
    { name: "settings.edit", description: "Edit site settings", groupSlug: "settings" },
    { name: "analytics.view", description: "View analytics", groupSlug: "reports", menuLabel: "Analytics", menuHref: "/admin/analytics", menuSortOrder: 0 },
    { name: "ads.view", description: "View ads", groupSlug: "reports", menuLabel: "Ad Management", menuHref: "/admin/ad-management", menuSortOrder: 1 },
    { name: "ai.view", description: "View AI settings", groupSlug: "settings", menuLabel: "Global AI", menuHref: "/admin/global-ai", menuSortOrder: 3 },
    { name: "admin.users", description: "Manage admin users", groupSlug: "settings", menuLabel: "Team", menuHref: "/admin/team", menuSortOrder: 1 },
    { name: "admin.roles", description: "Manage roles and permissions", groupSlug: "settings" },
    { name: "audit.view", description: "View audit logs", groupSlug: "settings", menuLabel: "Audit Logs", menuHref: "/admin/audit-logs", menuSortOrder: 2 },
  ];

  for (const perm of permissions) {
    const [resource, action] = perm.name.split(".");
    const groupId = groupMap[perm.groupSlug] ?? null;
    await prisma.permission.upsert({
      where: { name: perm.name },
      create: {
        name: perm.name,
        description: perm.description,
        resource: resource ?? perm.name,
        action: action ?? "view",
        groupId,
        menuLabel: perm.menuLabel ?? null,
        menuHref: perm.menuHref ?? null,
        menuSortOrder: perm.menuSortOrder ?? 0,
      },
      update: {
        groupId,
        menuLabel: perm.menuLabel ?? null,
        menuHref: perm.menuHref ?? null,
        menuSortOrder: perm.menuSortOrder ?? 0,
      },
    });
  }
  console.log("Permissions created");

  // Assign permissions to roles (owner + super_admin get all; admin gets most; moderator gets limited)
  const allPermissions = await prisma.permission.findMany();
  // Owner and Super Admin get all permissions
  for (const perm of allPermissions) {
    for (const role of [ownerRole, superAdminRole]) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          },
        },
        create: {
          roleId: role.id,
          permissionId: perm.id,
        },
        update: {},
      });
    }
  }

  // Admin gets most permissions except admin user management
  const adminPermissions = allPermissions.filter(
    (p) => !p.name.startsWith("admin.")
  );
  for (const perm of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
      update: {},
    });
  }

  // Moderator gets view permissions and limited edit permissions
  const moderatorPermissions = allPermissions.filter(
    (p) =>
      p.name.includes(".view") ||
      p.name === "products.edit" ||
      p.name === "categories.edit" ||
      p.name === "brands.edit" ||
      p.name === "orders.edit" ||
      p.name === "orders.activities" ||
      p.name === "customers.repeat" ||
      p.name === "customers.risk" ||
      p.name === "content.edit"
  );
  for (const perm of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: perm.id,
        },
      },
      create: {
        roleId: moderatorRole.id,
        permissionId: perm.id,
      },
      update: {},
    });
  }

  console.log("Role permissions assigned");

  // Phase 3: Blog categories and posts
  const { seedBlog } = await import("./blog-seed");
  await seedBlog(prisma);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
