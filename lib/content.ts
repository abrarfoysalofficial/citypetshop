/**
 * SEO and long-form content for products, about, and blog.
 * Map product IDs to rich content; use getProductRichContent(productId).
 */

export const productSeo = {
  title: "Premium Adult Dog Food (Chicken & Rice) 10kg | City Plus Pet Shop Bangladesh",
  description:
    "Premium adult dog food with chicken & rice for healthy digestion, shiny coat and strong immunity. Fast delivery across Bangladesh. Cash on delivery available.",
  keywords: [
    "dog food Bangladesh",
    "premium dog food",
    "chicken rice dog food",
    "adult dog food 10kg",
    "City Plus Pet Shop",
    "pet shop bd",
  ],
};

export const productLongDescription = `
Premium Adult Dog Food (Chicken & Rice) is formulated for adult dogs who need balanced daily nutrition for energy, digestion, and immunity.
This recipe is designed with high-quality protein and easy-to-digest carbohydrates to support strong muscles, healthy skin, and a glossy coat.

Why pet parents in Bangladesh choose this formula:
- Balanced protein for lean muscle support
- Rice-based carbs for gentle digestion
- Omega 3 & 6 to support skin health and a shiny coat
- Added vitamins & minerals to support immunity
- Carefully selected ingredients for everyday feeding

Ideal for:
- Adult dogs (12 months+)
- Medium to large breeds
- Dogs with sensitive digestion (rice-based)

Feeding guide (general):
- Small (1–10kg): 90–180g/day
- Medium (10–25kg): 180–320g/day
- Large (25kg+): 320–450g/day
*Adjust based on activity, weather, and body condition.

Storage:
Keep sealed in a cool, dry place. Use within 30–45 days after opening for best freshness.

Delivery & support:
We deliver all over Bangladesh. Inside Dhaka delivery starts from ৳70, outside Dhaka ৳130 (weight-based adjustments may apply).
Cash on delivery available. For any product query, contact our support from the website.

Note:
Always provide fresh water. If your pet has medical conditions, consult a vet before changing diet.
`;

export const productHighlights = [
  "Balanced protein for lean muscle support",
  "Rice-based carbs for gentle digestion",
  "Omega 3 & 6 for skin health and shiny coat",
  "Added vitamins & minerals for immunity",
  "Ideal for adult dogs (12 months+)",
  "Fast delivery across Bangladesh • Cash on delivery",
];

export const productIngredientsNutrition: { label: string; value: string }[] = [
  { label: "Crude Protein (min)", value: "22%" },
  { label: "Crude Fat (min)", value: "12%" },
  { label: "Crude Fiber (max)", value: "4%" },
  { label: "Moisture (max)", value: "10%" },
  { label: "Key ingredients", value: "Chicken meal, rice, rice bran, omega 3 & 6, vitamins & minerals" },
];

export const productFeedingGuide = [
  { size: "Small (1–10kg)", amount: "90–180g/day" },
  { size: "Medium (10–25kg)", amount: "180–320g/day" },
  { size: "Large (25kg+)", amount: "320–450g/day" },
];

export const productShippingReturn = `We deliver all over Bangladesh. Inside Dhaka delivery from ৳70, outside Dhaka ৳130 (weight-based adjustments may apply). Cash on delivery available. Wrong or damaged product? Return/refund applies within the specified period—see Refund & Return Policy page for details.`;

export const productFaq = [
  {
    q: "এই ডগ ফুড কি সব ব্রিডের জন্য উপযুক্ত?",
    a: "হ্যাঁ, এটি adult dogs-এর জন্য উপযুক্ত। তবে sensitive digestion বা বিশেষ ডায়েট লাগলে ভেটের পরামর্শ নিন।",
  },
  {
    q: "কত দিনে ডেলিভারি পাবো?",
    a: "Dhaka-তে সাধারণত 1–2 দিন, ঢাকার বাইরে 2–4 দিন। কুরিয়ার ও পরিস্থিতি অনুযায়ী পরিবর্তন হতে পারে।",
  },
  {
    q: "Cash on delivery আছে?",
    a: "হ্যাঁ, এখন অর্ডার সম্পন্ন হবে Cash on Delivery দিয়ে।",
  },
  {
    q: "Return/Refund policy কী?",
    a: "ভুল/ড্যামেজড প্রোডাক্ট হলে নির্দিষ্ট সময়ের মধ্যে রিটার্ন/রিফান্ড প্রযোজ্য। বিস্তারিত Refund & Return Policy পেজে আছে।",
  },
];

/** Product IDs that have rich content (highlights, FAQ, long description). Add more IDs as you add content. */
const PRODUCT_RICH_CONTENT_IDS = ["5"];

export function getProductRichContent(productId: string) {
  if (!PRODUCT_RICH_CONTENT_IDS.includes(productId)) return null;
  return {
    seo: productSeo,
    longDescription: productLongDescription,
    highlights: productHighlights,
    ingredientsNutrition: productIngredientsNutrition,
    feedingGuide: productFeedingGuide,
    shippingReturn: productShippingReturn,
    faq: productFaq,
  };
}

// ——— About page ———

export const aboutPageContent = {
  title: "About City Plus Pet Shop",
  subtitle: "Your pet, our passion.",
  seoTitle: "About City Plus Pet Shop | Premium Pet Food & Accessories in Bangladesh",
  seoDescription:
    "City Plus Pet Shop offers premium food, accessories, toys, and pet care essentials for cats and dogs in Bangladesh. Fast delivery, trusted service, and customer-friendly support.",
  body: `
City Plus Pet Shop is a premium digital pet shop in Bangladesh dedicated to cats and dogs.
We bring carefully selected pet food, accessories, grooming essentials, toys, and health-focused products—so pet parents can shop confidently.

What makes us different:
- Curated premium products for dogs and cats
- Fast delivery across Bangladesh
- Transparent pricing and customer-first support
- Easy shopping experience with guest checkout and secure order tracking

Our mission:
To make quality pet care accessible for every pet parent—through reliable service, genuine products, and a smooth online experience.

We're committed to:
- Authentic products and proper packaging
- Responsible sourcing from trusted brands
- Improving pet parent education through helpful blogs and guides

Thank you for choosing City Plus Pet Shop. We're here to support the well-being of your furry friends—every day.
`,
  ctaText: "Contact Us",
  ctaHref: "/contact",
};

// ——— Blog posts ———

export interface BlogPost {
  slug: string;
  date: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: string;
  faq: { q: string; a: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "best-dog-food-bangladesh",
    date: "2026-01-10",
    title: "বাংলাদেশে সেরা ডগ ফুড বাছাই করার গাইড (Adult & Puppy)",
    metaTitle: "Best Dog Food in Bangladesh | Adult & Puppy Selection Guide",
    metaDescription:
      "বাংলাদেশে ডগ ফুড কেনার আগে কোন ingredient দেখবেন, puppy vs adult nutrition, sensitive stomach, budget ও premium—সব মিলিয়ে complete guide।",
    keywords: ["dog food Bangladesh", "puppy food", "adult dog nutrition", "pet shop bd"],
    content: `
বাংলাদেশে ডগ ফুড বাছাই করার সময় শুধু দাম নয়—ingredient, protein source, digestion, coat health এবং আপনার ডগের বয়স/ওজন অনুযায়ী নির্বাচন করাই সবচেয়ে গুরুত্বপূর্ণ।

1) Puppy vs Adult
Puppy food-এ সাধারণত বেশি calories, DHA, calcium থাকে। Adult formula balanced maintenance nutrition দেয়।

2) Protein source
Chicken, lamb, fish—যে protein আপনার ডগ সবচেয়ে ভাল digest করে, সেটি prioritize করুন।

3) Sensitive stomach
Rice-based বা limited ingredient diet অনেক ক্ষেত্রে ভাল কাজ করে।

4) Coat & skin support
Omega 3/6, zinc, biotin—এগুলো থাকলে coat glossy থাকে।

5) How to transition
পুরোনো ফুডের সাথে 7 দিনের gradual transition করলে tummy upset কম হয়।

Bonus: কীভাবে fake/low-quality food চিনবেন
- unusual smell, broken seal, no batch/expiry, suspicious price—এগুলো red flags।

শেষ কথা: আপনার ডগের বয়স, activity level, digestion এবং vet advice অনুযায়ী ফুড choose করুন。
`,
    faq: [
      { q: "পাপি ফুড কত মাস পর্যন্ত দেব?", a: "সাধারণত 12 মাস পর্যন্ত (breed অনুযায়ী ভিন্ন হতে পারে)।" },
      { q: "ডগ ফুড পরিবর্তন করলে পাতলা পায়খানা হয় কেন?", a: "হঠাৎ পরিবর্তনে gut upset হয়—7 দিনের transition করুন।" },
    ],
  },
  {
    slug: "cat-litter-guide-bangladesh",
    date: "2026-01-08",
    title: "Cat Litter Guide: Bentonite, Tofu, Silica — কোনটা আপনার জন্য?",
    metaTitle: "Cat Litter Guide Bangladesh | Bentonite vs Tofu vs Silica",
    metaDescription:
      "Bentonite, tofu, silica litter—odor control, clumping, dust, budget এবং cleaning ease অনুযায়ী কোনটা best তা জানুন।",
    keywords: ["cat litter", "tofu litter", "bentonite litter", "cat care Bangladesh"],
    content: `
Cat litter choose করলে আপনার ঘরের smell control, cleaning time, এবং cat comfort—সবই depend করে।

Bentonite (clumping):
- Strong clumping, budget-friendly
- Dust বেশি হতে পারে (low-dust variant নিন)

Tofu litter:
- Low dust, eco-friendly, soft on paws
- দাম একটু বেশি, কিন্তু cleaning easy

Silica gel:
- Odor control strong, long-lasting
- কিছু cat পছন্দ নাও করতে পারে

Pro tips:
- Litter box size বড় রাখুন
- Scoop daily + full change schedule follow করুন
- Multi-cat হলে extra box add করুন (n cats -> n+1 boxes)

আপনার cat sensitive হলে low-dust/unscented litter try করুন。
`,
    faq: [
      { q: "সুগন্ধি litter কি safe?", a: "কিছু cat fragrance tolerate করতে পারে না—unscented safer." },
      { q: "কতদিন পর পর litter পুরো change করব?", a: "type অনুযায়ী 1–4 সপ্তাহ; daily scoop জরুরি।" },
    ],
  },
  {
    slug: "dog-grooming-at-home",
    date: "2026-01-06",
    title: "ঘরে বসে Dog Grooming: Brush, Bath, Nail Trim (Beginner Friendly)",
    metaTitle: "Dog Grooming at Home | Bath, Brush, Nail Trim Guide",
    metaDescription:
      "Beginner friendly home grooming guide: brushing schedule, bathing tips, nail trimming safety, ear cleaning, shedding control।",
    keywords: ["dog grooming", "nail trim", "dog bath", "pet care tips"],
    content: `
Home grooming নিয়মিত করলে shedding কমে, skin healthy থাকে, এবং vet billsও কমে।

Brushing:
- Short coat: 2–3 times/week
- Long coat: 4–6 times/week
- De-shedding tool shedding season-এ helpful

Bathing:
- 3–6 সপ্তাহে একবার (breed/skin condition অনুযায়ী)
- Human shampoo নয়—pet shampoo ব্যবহার করুন

Nail trimming:
- ছোট করে কাটুন, quick এ আঘাত করবেন না
- সন্দেহ হলে vet/groomer-এর পরামর্শ

Ear cleaning:
- Vet-approved ear solution + cotton pad
- Deep cotton bud avoid

Consistency is key—short sessions, treats, positive reinforcement।
`,
    faq: [
      { q: "ডগকে কত ঘন ঘন গোসল করানো উচিত?", a: "সাধারণত 3–6 সপ্তাহে একবার।" },
      { q: "নেইল কাটতে ভয় লাগে—কি করব?", a: "ছোট করে কাটুন বা groomer সাহায্য নিন।" },
    ],
  },
  {
    slug: "puppy-training-basic",
    date: "2026-01-04",
    title: "Puppy Training Basics: Potty, Bite Inhibition, Socialization",
    metaTitle: "Puppy Training Basics | Potty, Bite, Socialization",
    metaDescription:
      "পাপির potty training schedule, biting control, crate training, এবং safe socialization—সব এক জায়গায়।",
    keywords: ["puppy training", "potty training", "crate training"],
    content: `
পাপির training শুরু যত দ্রুত করবেন, adult stage তত সহজ হবে।

Potty schedule:
- sleep থেকে উঠেই, খাওয়ার পর, খেলার পর—potty break দিন
- same spot + praise + treats

Bite inhibition:
- "ouch" cue + toy redirect
- overexcited হলে break

Crate training:
- crate কে safe space বানান
- punishment নয়; calm routine

Socialization:
- vaccinated schedule মেনে safe exposure
- new sounds/people/places—controlled way

Short sessions + consistency = results।
`,
    faq: [
      { q: "পাপি কতদিনে potty শিখবে?", a: "প্রতি পাপি ভিন্ন—সাধারণত কয়েক সপ্তাহ থেকে কয়েক মাস।" },
      { q: "Crate কি cruel?", a: "না—ঠিকভাবে করলে crate safe space হয়।" },
    ],
  },
  {
    slug: "cat-health-warning-signs",
    date: "2026-01-02",
    title: "Cat Health Warning Signs: কখন Vet দেখানো জরুরি?",
    metaTitle: "Cat Health Warning Signs | When to Visit a Vet",
    metaDescription:
      "Cat-এর জরুরি লক্ষণ: খাওয়া বন্ধ, hiding, vomiting, litter box change, breathing issue—কখন vet দেখাবেন? practical guide।",
    keywords: ["cat health", "vet visit", "cat vomiting", "Bangladesh pet care"],
    content: `
Cat অনেক সময় pain লুকায়। কিছু লক্ষণ দেখলে দেরি না করে vet দেখান:

Red flags:
- 24 ঘন্টার বেশি না খাওয়া/না পান করা
- বারবার বমি বা ডায়রিয়া
- শ্বাসকষ্ট, mouth breathing
- litter box habit change (UTI risk)
- extreme lethargy / hiding behavior

Prevention:
- clean water, balanced diet
- regular deworming/vaccination schedule
- weight monitoring

Early action saves lives.
`,
    faq: [
      { q: "Cat না খেলে কতক্ষণ wait করব?", a: "24 ঘন্টার বেশি হলে vet consult ভালো।" },
      { q: "Litter box change কেন serious?", a: "UTI/blockage হতে পারে—তাড়াতাড়ি vet দেখান।" },
    ],
  },
  {
    slug: "inside-dhaka-outside-dhaka-delivery",
    date: "2026-01-01",
    title: "Inside Dhaka vs Outside Dhaka Delivery: চার্জ, সময়, এবং কীভাবে track করবেন",
    metaTitle: "Dhaka Delivery Charge & Tracking | Pet Shop Bangladesh",
    metaDescription:
      "Inside Dhaka ৳70, Outside Dhaka ৳130—ওজন অনুযায়ী চার্জ, কুরিয়ার tracking, এবং order status বোঝার সহজ গাইড।",
    keywords: ["delivery charge Dhaka", "courier tracking", "steadfast", "pathao", "sundorbon"],
    content: `
City Plus Pet Shop-এর delivery structure:
- Inside Dhaka: ৳70
- Outside Dhaka: ৳130
- Parcel weight অনুযায়ী বাড়তে পারে (admin-configurable rules)

Delivery timeline:
- Dhaka: 1–2 days
- Outside: 2–4 days (courier dependent)

Tracking:
- Track Order পেজ থেকে tracking number দিয়ে status দেখুন
- Admin order details এ courier rider note এবং shipment status দেখা যাবে

Tip: order confirm হওয়ার পরে SMS/WhatsApp update নিশ্চিত করুন।
`,
    faq: [
      { q: "চার্জ কেন ওজন অনুযায়ী বাড়ে?", a: "Courier weight slab pricing ব্যবহার করে।" },
      { q: "Tracking না দেখালে?", a: "কুরিয়ার update delay হতে পারে—কিছু সময় পরে আবার চেষ্টা করুন।" },
    ],
  },
  {
    slug: "pet-supplements-guide",
    date: "2025-12-30",
    title: "Pet Supplements Guide: Omega, Calcium, Multivitamin — কখন দরকার?",
    metaTitle: "Pet Supplements Guide | Omega, Calcium, Multivitamin",
    metaDescription:
      "Omega 3/6, calcium, multivitamin—কোন বয়সে/কোন condition এ দরকার, কীভাবে safe ভাবে ব্যবহার করবেন।",
    keywords: ["pet supplements", "omega for dogs", "cat multivitamin"],
    content: `
Supplements medicine না—support tool. প্রয়োজন না হলে avoid করা ভালো।

Common supplements:
- Omega 3/6: coat/skin support
- Calcium: vet advice ছাড়া avoid (especially growing pets)
- Multivitamin: picky eater বা specific deficiency

When needed:
- dull coat, shedding (Omega)
- recovery support (vet-guided)
- senior pets (joint support)

Safety:
- dosage follow করুন
- human supplements দেবেন না
- ongoing disease থাকলে vet consult mandatory.
`,
    faq: [
      { q: "সব পেটের জন্য multivitamin দরকার?", a: "না—balanced food হলে অনেক সময় লাগে না।" },
      { q: "Omega কবে results দেয়?", a: "সাধারণত 3–6 সপ্তাহে coat improvement দেখা যায়।" },
    ],
  },
  {
    slug: "how-to-choose-pet-accessories",
    date: "2025-12-28",
    title: "Pet Accessories: Collar, Leash, Harness, Bowl — কীভাবে সঠিকটা বাছাই করবেন",
    metaTitle: "Choose Pet Accessories | Collar Leash Harness Bowl Guide",
    metaDescription:
      "Collar vs harness, leash length, bowl material, size guide—dogs & cats accessories কেনার আগে যা জানা জরুরি।",
    keywords: ["pet accessories", "dog harness", "cat collar", "pet bowl"],
    content: `
Accessories choose করলে comfort + safety দুটোই important।

Collar vs Harness:
- leash pull বেশি হলে harness better
- ID tag collar এ রাখুন

Leash:
- training leash: 4–6 ft
- retractable leash beginnerদের জন্য recommended না

Bowls:
- stainless steel: best hygiene
- plastic: scratch হয়, bacteria hold করতে পারে

Sizing:
- neck/chest measure নিয়ে কিনুন
- growth stage এ adjustability দরকার

Right accessories = safer walks + happier pet.
`,
    faq: [
      { q: "Harness কি cat-এর জন্যও হয়?", a: "হ্যাঁ—cat harness available, proper fit জরুরি।" },
      { q: "Stainless bowl কেন best?", a: "Clean করা easy, bacteria কম জমে।" },
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
