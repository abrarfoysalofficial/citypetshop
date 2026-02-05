import type { BlogPost } from "../types";
import { unsplash, FALLBACK_BLOG } from "./constants";

const posts: BlogPost[] = [
  {
    slug: "best-dog-food-bangladesh",
    title: "বাংলাদেশে সেরা ডগ ফুড বাছাই করার গাইড (Adult & Puppy)",
    date: "2026-01-10",
    excerpt: "বাংলাদেশে ডগ ফুড কেনার আগে কোন ingredient দেখবেন, puppy vs adult nutrition, sensitive stomach—complete guide।",
    coverImage: unsplash.blogNutrition || FALLBACK_BLOG,
    thumbnailImage: unsplash.blogNutrition || FALLBACK_BLOG,
    metaTitle: "Best Dog Food in Bangladesh | Adult & Puppy Selection Guide",
    metaDescription: "বাংলাদেশে ডগ ফুড বাছাই করার গাইড। Ingredient, protein, digestion tips.",
    keywords: ["dog food Bangladesh", "puppy food", "adult dog nutrition", "pet shop bd"],
    content: `
বাংলাদেশে ডগ ফুড বাছাই করার সময় শুধু দাম নয়—ingredient, protein source, digestion, coat health এবং আপনার ডগের বয়স/ওজন অনুযায়ী নির্বাচন করাই সবচেয়ে গুরুত্বপূর্ণ।

## Puppy vs Adult
Puppy food-এ সাধারণত বেশি calories, DHA, calcium থাকে। Adult formula balanced maintenance nutrition দেয়।

## Protein source
Chicken, lamb, fish—যে protein আপনার ডগ সবচেয়ে ভাল digest করে, সেটি prioritize করুন।

## Sensitive stomach
Rice-based বা limited ingredient diet অনেক ক্ষেত্রে ভাল কাজ করে।

## Coat & skin support
Omega 3/6, zinc, biotin—এগুলো থাকলে coat glossy থাকে।

শেষ কথা: আপনার ডগের বয়স, activity level, digestion এবং vet advice অনুযায়ী ফুড choose করুন।
`.trim(),
    faq: [
      { q: "পাপি ফুড কত মাস পর্যন্ত দেব?", a: "সাধারণত 12 মাস পর্যন্ত (breed অনুযায়ী ভিন্ন হতে পারে)।" },
      { q: "ডগ ফুড পরিবর্তন করলে পাতলা পায়খানা হয় কেন?", a: "হঠাৎ পরিবর্তনে gut upset হয়—7 দিনের transition করুন।" },
    ],
  },
  {
    slug: "cat-litter-guide-bangladesh",
    title: "Cat Litter Guide: Bentonite, Tofu, Silica — কোনটা আপনার জন্য?",
    date: "2026-01-08",
    excerpt: "Bentonite, tofu, silica litter—odor control, clumping, dust, budget অনুযায়ী কোনটা best।",
    coverImage: unsplash.blogLitter || FALLBACK_BLOG,
    thumbnailImage: unsplash.blogLitter || FALLBACK_BLOG,
    metaTitle: "Cat Litter Guide Bangladesh | Bentonite vs Tofu vs Silica",
    metaDescription: "Cat litter choose করলে odor control, cleaning—সব এক গাইডে।",
    keywords: ["cat litter", "tofu litter", "bentonite litter", "cat care Bangladesh"],
    content: `
Cat litter choose করলে আপনার ঘরের smell control, cleaning time, এবং cat comfort—সবই depend করে。

## Bentonite (clumping)
Strong clumping, budget-friendly. Dust বেশি হতে পারে (low-dust variant নিন)।

## Tofu litter
Low dust, eco-friendly, soft on paws. দাম একটু বেশি, কিন্তু cleaning easy।

## Silica gel
Odor control strong, long-lasting। কিছু cat পছন্দ নাও করতে পারে।

Pro tips: Litter box size বড় রাখুন। Scoop daily + full change schedule follow করুন।
`.trim(),
    faq: [
      { q: "সুগন্ধি litter কি safe?", a: "কিছু cat fragrance tolerate করতে পারে না—unscented safer." },
      { q: "কতদিন পর পর litter পুরো change করব?", a: "type অনুযায়ী 1–4 সপ্তাহ; daily scoop জরুরি।" },
    ],
  },
  {
    slug: "dog-grooming-at-home",
    title: "ঘরে বসে Dog Grooming: Brush, Bath, Nail Trim (Beginner Friendly)",
    date: "2026-01-06",
    excerpt: "Beginner friendly home grooming guide: brushing, bathing, nail trimming, ear cleaning.",
    coverImage: unsplash.blogGrooming || FALLBACK_BLOG,
    thumbnailImage: unsplash.blogGrooming || FALLBACK_BLOG,
    metaTitle: "Dog Grooming at Home | Bath, Brush, Nail Trim Guide",
    metaDescription: "Home grooming নিয়মিত করলে shedding কমে, skin healthy থাকে।",
    keywords: ["dog grooming", "nail trim", "dog bath", "pet care tips"],
    content: `
Home grooming নিয়মিত করলে shedding কমে, skin healthy থাকে, এবং vet billsও কমে।

## Brushing
Short coat: 2–3 times/week। Long coat: 4–6 times/week। De-shedding tool shedding season-এ helpful।

## Bathing
3–6 সপ্তাহে একবার (breed/skin condition অনুযায়ী)। Human shampoo নয়—pet shampoo ব্যবহার করুন।

## Nail trimming
ছোট করে কাটুন, quick এ আঘাত করবেন না। সন্দেহ হলে vet/groomer-এর পরামর্শ।

Consistency is key—short sessions, treats, positive reinforcement।
`.trim(),
    faq: [
      { q: "ডগকে কত ঘন ঘন গোসল করানো উচিত?", a: "সাধারণত 3–6 সপ্তাহে একবার।" },
      { q: "নেইল কাটতে ভয় লাগে—কি করব?", a: "ছোট করে কাটুন বা groomer সাহায্য নিন।" },
    ],
  },
  {
    slug: "puppy-training-basic",
    title: "Puppy Training Basics: Potty, Bite Inhibition, Socialization",
    date: "2026-01-04",
    excerpt: "পাপির potty training schedule, biting control, crate training, safe socialization.",
    coverImage: unsplash.blogTraining || FALLBACK_BLOG,
    thumbnailImage: unsplash.blogTraining || FALLBACK_BLOG,
    metaTitle: "Puppy Training Basics | Potty, Bite, Socialization",
    metaDescription: "পাপির training শুরু যত দ্রুত করবেন, adult stage তত সহজ হবে।",
    keywords: ["puppy training", "potty training", "crate training"],
    content: `
পাপির training শুরু যত দ্রুত করবেন, adult stage তত সহজ হবে।

## Potty schedule
sleep থেকে উঠেই, খাওয়ার পর, খেলার পর—potty break দিন। same spot + praise + treats।

## Bite inhibition
"ouch" cue + toy redirect। overexcited হলে break।

## Crate training
crate কে safe space বানান। punishment নয়; calm routine।

Short sessions + consistency = results।
`.trim(),
    faq: [
      { q: "পাপি কতদিনে potty শিখবে?", a: "প্রতি পাপি ভিন্ন—সাধারণত কয়েক সপ্তাহ থেকে কয়েক মাস।" },
      { q: "Crate কি cruel?", a: "না—ঠিকভাবে করলে crate safe space হয়।" },
    ],
  },
  {
    slug: "cat-health-warning-signs",
    title: "Cat Health Warning Signs: কখন Vet দেখানো জরুরি?",
    date: "2026-01-02",
    excerpt: "Cat-এর জরুরি লক্ষণ: খাওয়া বন্ধ, hiding, vomiting, litter box change—কখন vet দেখাবেন?",
    coverImage: unsplash.catFood1 || FALLBACK_BLOG,
    thumbnailImage: unsplash.catFood1 || FALLBACK_BLOG,
    metaTitle: "Cat Health Warning Signs | When to Visit a Vet",
    metaDescription: "Cat অনেক সময় pain লুকায়। কিছু লক্ষণ দেখলে দেরি না করে vet দেখান।",
    keywords: ["cat health", "vet visit", "cat vomiting", "Bangladesh pet care"],
    content: `
Cat অনেক সময় pain লুকায়। কিছু লক্ষণ দেখলে দেরি না করে vet দেখান:

## Red flags
- 24 ঘন্টার বেশি না খাওয়া/না পান করা
- বারবার বমি বা ডায়রিয়া
- শ্বাসকষ্ট, mouth breathing
- litter box habit change (UTI risk)
- extreme lethargy / hiding behavior

## Prevention
clean water, balanced diet। regular deworming/vaccination schedule। weight monitoring।

Early action saves lives.
`.trim(),
    faq: [
      { q: "Cat না খেলে কতক্ষণ wait করব?", a: "24 ঘন্টার বেশি হলে vet consult ভালো।" },
      { q: "Litter box change কেন serious?", a: "UTI/blockage হতে পারে—তাড়াতাড়ি vet দেখান।" },
    ],
  },
  {
    slug: "inside-dhaka-outside-dhaka-delivery",
    title: "Inside Dhaka vs Outside Dhaka Delivery: চার্জ, সময়, Track করবেন কীভাবে",
    date: "2026-01-01",
    excerpt: "Inside Dhaka ৳70, Outside Dhaka ৳130—ওজন অনুযায়ী চার্জ, কুরিয়ার tracking গাইড।",
    coverImage: unsplash.blogDelivery || FALLBACK_BLOG,
    thumbnailImage: unsplash.blogDelivery || FALLBACK_BLOG,
    metaTitle: "Dhaka Delivery Charge & Tracking | Pet Shop Bangladesh",
    metaDescription: "City Plus Pet Shop delivery structure ও tracking।",
    keywords: ["delivery charge Dhaka", "courier tracking", "steadfast", "pathao"],
    content: `
City Plus Pet Shop-এর delivery structure:
- **Inside Dhaka:** ৳70
- **Outside Dhaka:** ৳130
- Parcel weight অনুযায়ী বাড়তে পারে

## Delivery timeline
- Dhaka: 1–2 days
- Outside: 2–4 days (courier dependent)

## Tracking
Track Order পেজ থেকে tracking number দিয়ে status দেখুন। Order confirm হওয়ার পরে SMS/WhatsApp update নিশ্চিত করুন।
`.trim(),
    faq: [
      { q: "চার্জ কেন ওজন অনুযায়ী বাড়ে?", a: "Courier weight slab pricing ব্যবহার করে।" },
      { q: "Tracking না দেখালে?", a: "কুরিয়ার update delay হতে পারে—কিছু সময় পরে আবার চেষ্টা করুন।" },
    ],
  },
  {
    slug: "pet-supplements-guide",
    title: "Pet Supplements Guide: Omega, Calcium, Multivitamin — কখন দরকার?",
    date: "2025-12-30",
    excerpt: "Omega 3/6, calcium, multivitamin—কোন বয়সে/কোন condition এ দরকার, কীভাবে safe ভাবে ব্যবহার করবেন।",
    coverImage: unsplash.blogNutrition || FALLBACK_BLOG,
    thumbnailImage: unsplash.blogNutrition || FALLBACK_BLOG,
    metaTitle: "Pet Supplements Guide | Omega, Calcium, Multivitamin",
    metaDescription: "Supplements medicine না—support tool. প্রয়োজন না হলে avoid করা ভালো।",
    keywords: ["pet supplements", "omega for dogs", "cat multivitamin"],
    content: `
Supplements medicine না—support tool. প্রয়োজন না হলে avoid করা ভালো।

## Common supplements
- Omega 3/6: coat/skin support
- Calcium: vet advice ছাড়া avoid (especially growing pets)
- Multivitamin: picky eater বা specific deficiency

## When needed
dull coat, shedding (Omega)। recovery support (vet-guided)। senior pets (joint support)。

Safety: dosage follow করুন। human supplements দেবেন না। ongoing disease থাকলে vet consult mandatory.
`.trim(),
    faq: [
      { q: "সব পেটের জন্য multivitamin দরকার?", a: "না—balanced food হলে অনেক সময় লাগে না।" },
      { q: "Omega কবে results দেয়?", a: "সাধারণত 3–6 সপ্তাহে coat improvement দেখা যায়।" },
    ],
  },
  {
    slug: "how-to-choose-pet-accessories",
    title: "Pet Accessories: Collar, Leash, Harness, Bowl — কীভাবে সঠিকটা বাছাই করবেন",
    date: "2025-12-28",
    excerpt: "Collar vs harness, leash length, bowl material, size guide—dogs & cats accessories কেনার আগে যা জানা জরুরি।",
    coverImage: unsplash.accessories1 || FALLBACK_BLOG,
    thumbnailImage: unsplash.accessories1 || FALLBACK_BLOG,
    metaTitle: "Choose Pet Accessories | Collar Leash Harness Bowl Guide",
    metaDescription: "Accessories choose করলে comfort + safety দুটোই important।",
    keywords: ["pet accessories", "dog harness", "cat collar", "pet bowl"],
    content: `
Accessories choose করলে comfort + safety দুটোই important।

## Collar vs Harness
leash pull বেশি হলে harness better। ID tag collar এ রাখুন।

## Leash
training leash: 4–6 ft। retractable leash beginnerদের জন্য recommended না।

## Bowls
stainless steel: best hygiene। plastic: scratch হয়, bacteria hold করতে পারে।

Right accessories = safer walks + happier pet.
`.trim(),
    faq: [
      { q: "Harness কি cat-এর জন্যও হয়?", a: "হ্যাঁ—cat harness available, proper fit জরুরি।" },
      { q: "Stainless bowl কেন best?", a: "Clean করা easy, bacteria কম জমে।" },
    ],
  },
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return posts.find((p) => p.slug === slug) ?? null;
}
