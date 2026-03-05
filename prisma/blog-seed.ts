/**
 * Blog categories and posts seed data for Phase 3.
 * Idempotent: upsert categories, create posts only if slug doesn't exist.
 */
import type { PrismaClient } from "@prisma/client";

const BLOG_CATEGORIES = [
  { slug: "dog-food", nameEn: "Dog Food", nameBn: "কুকুরের খাদ্য", sortOrder: 0 },
  { slug: "cat-food", nameEn: "Cat Food", nameBn: "বিড়ালের খাদ্য", sortOrder: 1 },
  { slug: "puppy-care", nameEn: "Puppy Care", nameBn: "কুকুরছানার যত্ন", sortOrder: 2 },
  { slug: "pet-accessories", nameEn: "Pet Accessories", nameBn: "পোষা প্রাণীর আনুষাঙ্গিক", sortOrder: 3 },
  { slug: "pet-grooming", nameEn: "Pet Grooming", nameBn: "পোষা প্রাণীর গোছগাছ", sortOrder: 4 },
  { slug: "pet-health", nameEn: "Pet Health", nameBn: "পোষা প্রাণীর স্বাস্থ্য", sortOrder: 5 },
];

const BLOG_POSTS: Array<{
  slug: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  seoTitle: string;
  seoDescription: string;
  categorySlug: string;
  ogImageUrl?: string;
}> = [
  {
    slug: "best-dog-food-bangladesh-2026",
    titleEn: "Best Dog Food in Bangladesh (2026 Guide)",
    excerptEn:
      "A comprehensive guide to choosing the best dog food in Bangladesh. Compare brands, ingredients, and feeding tips for adult dogs and puppies. Trusted by pet owners across Dhaka and beyond.",
    seoTitle: "Best Dog Food in Bangladesh 2026 | City Plus Pet Shop",
    seoDescription:
      "Complete guide to the best dog food brands in Bangladesh. Compare Royal Canin, Pedigree, Drools & more. Feeding tips, portions, and where to buy authentic pet food in Dhaka.",
    categorySlug: "dog-food",
    ogImageUrl: "/ui/blog-cover.svg",
    contentEn: `Choosing the right dog food is one of the most important decisions you'll make for your pet's health. In Bangladesh, the pet food market has grown significantly over the past few years, with more brands and options available than ever before. From Dhaka to Chittagong, Sylhet to Rajshahi, pet owners now have access to quality dog food delivered to their doorstep. This comprehensive 2026 guide will help you navigate the choices and find the best dog food for your furry friend.

## Why Quality Dog Food Matters

Dogs require a balanced diet rich in protein, fats, carbohydrates, vitamins, and minerals. Protein supports muscle development and repair; fats provide energy and support skin and coat health; carbohydrates offer quick energy; and vitamins and minerals are essential for immune function, bone health, and overall wellbeing. Poor-quality food—often filled with fillers, by-products, and artificial additives—can lead to skin issues, digestive problems, obesity, allergies, and a shorter lifespan. Investing in premium or mid-range dog food pays off in your pet's energy levels, coat condition, digestive health, and overall vitality. In Bangladesh's humid climate, a good diet also helps support your dog's immune system against common parasites and infections.

## Understanding Dog Food Labels

When shopping for dog food, read the label carefully. Look for named protein sources (e.g., "chicken meal," "lamb") as the first ingredients. Avoid vague terms like "meat by-products" or "animal digest." The guaranteed analysis shows minimum protein and fat and maximum fiber and moisture. AAFCO (Association of American Feed Control Officials) statements indicate whether the food meets nutritional standards for a specific life stage. While AAFCO is a US standard, many international brands follow similar guidelines. In Bangladesh, buy from authorized dealers to ensure you receive genuine, unexpired products.

## Top Dog Food Brands Available in Bangladesh

### Royal Canin
Royal Canin offers breed-specific and life-stage formulas. Their products are widely available in Dhaka pet shops and through online retailers like City Plus Pet Shop. Ideal for owners who want tailored nutrition—whether for a German Shepherd, Labrador, or small breed. Royal Canin Adult, Puppy, and Senior formulas cater to different life stages. Prices are on the higher end but reflect the research and quality behind the brand.

### Pedigree
Pedigree is one of the most accessible brands in Bangladesh. Available in wet and dry forms, it suits adult dogs and provides balanced nutrition at an affordable price point. Pedigree Adult Complete Nutrition and Pedigree Puppy are commonly found in pet stores and supermarkets. It's a solid choice for budget-conscious owners who still want a recognized brand.

### Drools
Drools has gained popularity for its quality-to-price ratio. Their adult and puppy formulas are commonly stocked by pet retailers across the country. Drools Focus and Drools Absolute are popular lines. The brand offers both chicken and egg-based options for dogs with sensitivities.

### Other Brands
Brands like Farmina, Acana, and Orijen are available through select retailers for those seeking premium or grain-free options. These are ideal for dogs with allergies or owners who prefer limited-ingredient or high-protein diets.

## Feeding Guidelines for Adult Dogs

Adult dogs typically need 2–3% of their body weight in food per day, split into two meals. A 20 kg dog might need 400–600 grams daily. Adjust based on activity level, breed, and metabolism. Working dogs and highly active pets need more; sedentary or senior dogs may need less. Always follow the feeding chart on the packaging—these are guidelines, not rules. Monitor your dog's weight and condition; if they're gaining or losing weight, adjust portions. Consult your vet for specific needs, especially for dogs with health conditions.

## Puppy vs Adult Food

Puppies need more protein and calories for growth. Puppy food is formulated with higher levels of protein, fat, DHA (for brain development), and calcium. Switch to adult food when your dog reaches maturity—around 12 months for small breeds and 18–24 months for large breeds. Transition gradually over 7–10 days by mixing increasing amounts of adult food with puppy food to avoid digestive upset.

## Senior Dogs

Senior dogs (typically 7+ years for large breeds, 10+ for small) may benefit from senior formulas with joint support (glucosamine, chondroitin), reduced calories to prevent obesity, and easier-to-digest ingredients. Consult your vet for recommendations.

## Delivery and Authenticity in Bangladesh

City Plus Pet Shop and other reputable retailers ensure 100% authentic products. We source directly from authorized distributors. Avoid buying from unknown sources, street vendors, or unverified online sellers to prevent counterfeit or expired food. Check manufacturing and expiry dates. We deliver across Dhaka (typically 1–3 days) and outside Dhaka (3–7 days) with COD and online payment options. Free delivery on orders over ৳2000.

## FAQ

**What is the best dog food brand in Bangladesh?**
Royal Canin and Pedigree are among the most trusted. Choose based on your dog's breed, age, and dietary needs. Drools offers good value for money.

**How much should I feed my dog?**
Follow the package guidelines. Generally 2–3% of body weight daily for adults, split into two meals. Adjust for activity and metabolism.

**Can I give my dog homemade food?**
Homemade meals can supplement commercial food but should be vet-approved. Commercial dog food is formulated for complete nutrition. Homemade diets often lack balance.

**Where can I buy dog food in Dhaka?**
City Plus Pet Shop, pet stores in Mirpur, Dhanmondi, and Gulshan, and online at citypetshop.bd with delivery across Bangladesh.

Shop dog food at City Plus Pet Shop for authentic brands and fast delivery. Visit https://citypetshop.bd/shop for the full range.`,
  },
  {
    slug: "puppy-care-bangladesh-feeding-vaccines-training",
    titleEn: "Puppy Care in Bangladesh: Feeding, Vaccines, Training",
    excerptEn:
      "Complete puppy care guide for Bangladesh. Learn about feeding schedules, vaccination requirements, basic training, and health tips. Essential reading for new puppy parents in Dhaka and beyond.",
    seoTitle: "Puppy Care Bangladesh: Feeding, Vaccines, Training | City Plus Pet Shop",
    seoDescription:
      "Puppy care guide for Bangladesh: feeding schedules, vaccination timeline, training tips, and health essentials. Trusted advice for new puppy owners in Dhaka.",
    categorySlug: "puppy-care",
    ogImageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200",
    contentEn: `Bringing a puppy home is exciting, but it comes with responsibilities. This guide covers everything you need to know about puppy care in Bangladesh—from feeding and vaccinations to basic training and health.

## Feeding Your Puppy

Puppies need more frequent meals than adult dogs. Feed 3–4 times daily until 6 months, then 2–3 times until maturity. Use high-quality puppy food rich in protein and DHA for brain development. Brands like Royal Canin Puppy, Pedigree Puppy, and Drools Puppy are available in Bangladesh.

## Vaccination Schedule in Bangladesh

Core vaccines include:
- **6–8 weeks:** First DHPP (distemper, hepatitis, parvo, parainfluenza)
- **10–12 weeks:** Second DHPP
- **14–16 weeks:** Third DHPP + rabies
- **Annual:** Booster shots

Consult a local vet for the exact schedule. Many clinics in Dhaka offer vaccination packages.

## Deworming and Parasite Control

Deworm every 2 weeks until 12 weeks, then monthly until 6 months. Use vet-recommended dewormers. Tick and flea prevention is essential—especially in humid Bangladesh. Topical or oral treatments are available at pet shops.

## Basic Training

Start house training and basic commands (sit, stay, come) early. Use positive reinforcement. Puppy classes are available in Dhaka for socialization and obedience.

## Socialization

Expose your puppy to different people, sounds, and environments between 8–16 weeks. This reduces fear and aggression later.

## Common Health Issues in Bangladesh

Watch for heat stress, skin infections, and digestive upsets. Keep your puppy cool in summer, provide clean water, and avoid feeding table scraps.

## Where to Get Puppy Supplies

City Plus Pet Shop offers puppy food, bowls, beds, and toys. We deliver across Dhaka and outside with COD. Visit [our shop](/shop) for all your puppy needs.

## FAQ

**When should I vaccinate my puppy?**
Start at 6–8 weeks with DHPP. Rabies at 12–16 weeks. Follow your vet's schedule.

**How often should I feed a puppy?**
3–4 times daily until 6 months, then 2–3 times until 12–18 months.

**What puppy food is best in Bangladesh?**
Royal Canin Puppy, Pedigree Puppy, and Drools Puppy are reliable choices available locally.

**Where can I find a vet in Dhaka?**
Many veterinary clinics operate in Mirpur, Dhanmondi, Gulshan, and Uttara. Ask your pet shop for recommendations.`,
  },
  {
    slug: "cat-food-guide-bd-nutrition-portions",
    titleEn: "Cat Food Guide BD: Nutrition, Portions, Indoor vs Outdoor",
    excerptEn:
      "Complete cat food guide for Bangladesh. Learn about nutrition, portion sizes, and differences between indoor and outdoor cat diets. Find the best cat food brands available in Dhaka.",
    seoTitle: "Cat Food Guide Bangladesh: Nutrition & Portions | City Plus Pet Shop",
    seoDescription:
      "Cat food guide for Bangladesh: nutrition basics, portion control, indoor vs outdoor cats. Best brands like Whiskas, Royal Canin, and Drools available in Dhaka.",
    categorySlug: "cat-food",
    ogImageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=1200",
    contentEn: `Cats have unique nutritional needs. This guide helps you choose the right cat food in Bangladesh, understand portion sizes, and cater to indoor vs outdoor lifestyles.

## Cat Nutrition Basics

Cats are obligate carnivores—they need animal protein. Look for food with high protein (30%+), moderate fat, and minimal carbohydrates. Taurine is essential for heart and eye health.

## Top Cat Food Brands in Bangladesh

### Whiskas
Widely available in wet and dry forms. Good for adult cats and kittens. Affordable and easy to find.

### Royal Canin
Breed and life-stage specific. Royal Canin Indoor and Persian formulas are popular. Premium pricing.

### Drools
Quality dry food for cats. Good value. Available at pet shops and online.

### Others
Sheba, Fancy Feast, and local options are also available through select retailers.

## Portion Guidelines

Adult cats typically need 200–300 calories daily depending on size and activity. Follow package guidelines. Overfeeding leads to obesity—a common issue in indoor cats.

## Indoor vs Outdoor Cats

**Indoor cats** are less active and need fewer calories. Choose "indoor" formulas to prevent weight gain. Provide enrichment and play to keep them active.

**Outdoor cats** burn more calories and may need higher-protein, higher-calorie food. Ensure they have access to fresh water and shelter.

## Wet vs Dry Food

Wet food provides moisture and palatability. Dry food is convenient and helps dental health. Many owners feed a mix. Ensure fresh water is always available.

## Kitten Food

Kittens need kitten-specific food until 12 months. Higher protein and calories support growth. Switch gradually to adult food.

## Where to Buy Cat Food in Bangladesh

City Plus Pet Shop stocks authentic Whiskas, Royal Canin, Drools, and more. We deliver across Dhaka and outside. COD and online payment available. Shop [cat food](/shop?category=cat-food) now.

## FAQ

**What is the best cat food in Bangladesh?**
Whiskas, Royal Canin, and Drools are trusted brands. Choose based on your cat's age and lifestyle.

**How much should I feed my cat?**
200–300 calories daily for adults. Follow package guidelines and adjust for weight.

**Should I feed wet or dry food?**
Both work. A mix is often ideal. Ensure fresh water is always available.

**When should I switch from kitten to adult food?**
Around 12 months of age. Transition gradually over 7–10 days.`,
  },
  {
    slug: "best-pet-accessories-bd-leashes-beds-bowls-toys",
    titleEn: "Must-Have Pet Accessories in BD: Leashes, Beds, Bowls, Toys",
    excerptEn:
      "Essential pet accessories for dog and cat owners in Bangladesh. Leashes, beds, bowls, toys, and more. Where to buy quality products in Dhaka with delivery across the country.",
    seoTitle: "Best Pet Accessories Bangladesh: Leashes, Beds, Bowls | City Plus Pet Shop",
    seoDescription:
      "Must-have pet accessories in Bangladesh: leashes, beds, bowls, toys. Quality products for dogs and cats. Shop at City Plus Pet Shop with delivery across Dhaka and BD.",
    categorySlug: "pet-accessories",
    ogImageUrl: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200",
    contentEn: `Every pet needs the right accessories for comfort, safety, and enrichment. This guide covers must-have items for dog and cat owners in Bangladesh.

## Leashes and Collars

A sturdy leash and well-fitted collar are essential for dogs. Choose nylon or leather. Retractable leashes offer freedom but require control. For cats, harnesses work better than collars for outdoor walks. Available at pet shops in Dhaka and online.

## Beds and Mats

Dogs and cats need a comfortable place to sleep. Orthopedic beds help older pets. Washable covers are practical in humid Bangladesh. Place beds away from drafts and direct sunlight.

## Food and Water Bowls

Stainless steel bowls are durable and easy to clean. Ceramic is another option. Elevated bowls help large dogs and those with joint issues. Use separate bowls for food and water.

## Toys

Toys prevent boredom and destructive behavior. Dogs enjoy chew toys, balls, and tug ropes. Cats need scratching posts, interactive toys, and feather wands. Rotate toys to maintain interest.

## Grooming Supplies

Brushes, combs, nail clippers, and shampoo are basics. Regular grooming keeps coats healthy and reduces shedding. Tick and flea combs are important in Bangladesh.

## Carriers and Crates

For travel or vet visits, a secure carrier is essential. Soft carriers work for cats; hard crates suit dogs. Ensure proper ventilation.

## Where to Buy Pet Accessories in Bangladesh

City Plus Pet Shop offers leashes, beds, bowls, toys, and grooming supplies. We deliver across Dhaka and outside Dhaka. COD available. Browse [pet accessories](/shop?category=pet-accessories) on our site.

## FAQ

**What leash is best for a dog in Bangladesh?**
Nylon or leather, 4–6 feet. Avoid retractable for strong or untrained dogs.

**Do cats need beds?**
Yes. A comfortable bed reduces stress and gives them a safe space.

**What bowl material is best for pets?**
Stainless steel is durable and hygienic. Avoid plastic which can harbor bacteria.

**Where can I buy pet accessories in Dhaka?**
City Plus Pet Shop, pet stores in Mirpur, Dhanmondi, and online retailers with nationwide delivery.`,
  },
  {
    slug: "pet-grooming-guide-bd-bathing-nail-ear-tick-flea",
    titleEn: "Pet Grooming Guide BD: Bathing, Nail, Ear, Tick & Flea Prevention",
    excerptEn:
      "Complete pet grooming guide for Bangladesh. Bathing, nail trimming, ear care, and tick/flea prevention. Essential tips for dog and cat owners in Dhaka's humid climate.",
    seoTitle: "Pet Grooming Guide Bangladesh: Bathing, Nail, Tick Prevention | City Plus Pet Shop",
    seoDescription:
      "Pet grooming guide for Bangladesh: bathing, nail trimming, ear care, tick and flea prevention. Tips for dogs and cats in Dhaka's climate.",
    categorySlug: "pet-grooming",
    ogImageUrl: "/ui/blog-cover.svg",
    contentEn: `Regular grooming keeps your pet healthy and comfortable. In Bangladesh's humid climate, grooming is especially important to prevent skin issues, parasites, and infections.

## Bathing Your Dog

Bathe dogs every 2–4 weeks, or when dirty. Use pet-specific shampoo—human shampoo can irritate skin. Rinse thoroughly. Dry with a towel or blow dryer on low. Over-bathing strips natural oils.

## Bathing Your Cat

Most cats groom themselves. Bath only when necessary (e.g., they get into something). Use cat shampoo. Work quickly and keep them warm. Many cats dislike water—consider waterless shampoo for routine cleaning.

## Nail Trimming

Trim nails every 2–4 weeks. Use guillotine or scissor-style clippers. Avoid the quick (pink part)—it bleeds if cut. If unsure, ask a vet or groomer to demonstrate. Long nails cause discomfort and posture issues.

## Ear Care

Check ears weekly. Clean with vet-approved ear cleaner and cotton. Never insert objects deep into the ear. Signs of infection: odor, discharge, scratching. Seek vet care if concerned.

## Tick and Flea Prevention

In Bangladesh, ticks and fleas are common. Use monthly topical or oral preventives. Check your pet after walks. Remove ticks with tweezers, grasping close to the skin. Consult your vet for the best product.

## Brushing

Brush dogs and cats regularly to remove loose fur and prevent mats. Long-haired breeds need daily brushing. Short-haired pets benefit from weekly brushing.

## Dental Care

Dental chews and brushing help prevent tartar. Start young. Use pet toothpaste—never human. Annual dental check-ups are recommended.

## Grooming Supplies to Buy

City Plus Pet Shop stocks shampoo, brushes, nail clippers, tick combs, and more. We deliver across Bangladesh. Shop [grooming supplies](/shop) for all your pet care needs.

## FAQ

**How often should I bathe my dog in Bangladesh?**
Every 2–4 weeks. More often if they get dirty. Use pet shampoo.

**How do I prevent ticks and fleas?**
Monthly topical or oral preventives. Check after outdoor time. Keep environment clean.

**Can I use human shampoo on my pet?**
No. Use pet-specific shampoo to avoid skin irritation.

**Where can I buy grooming supplies in Dhaka?**
City Plus Pet Shop and pet stores across the city. We offer delivery with COD.`,
  },
];

export async function seedBlog(prisma: PrismaClient) {
  // 1. Seed blog categories (idempotent)
  for (const cat of BLOG_CATEGORIES) {
    await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        nameEn: cat.nameEn,
        nameBn: cat.nameBn,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      update: {},
    });
  }
  console.log("Blog categories seeded");

  // 2. Get category IDs
  const categories = await prisma.blogCategory.findMany();
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // 3. Create blog posts (only if slug doesn't exist)
  for (const post of BLOG_POSTS) {
    const existing = await prisma.cmsPage.findUnique({
      where: { slug: post.slug },
    });
    if (existing) continue;

    await prisma.cmsPage.create({
      data: {
        slug: post.slug,
        titleEn: post.titleEn,
        excerptEn: post.excerptEn,
        contentEn: post.contentEn,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        ogImageUrl: post.ogImageUrl ?? "/ui/blog-cover.svg",
        template: "blog",
        isPublished: true,
        publishedAt: new Date(),
        blogCategoryId: catBySlug[post.categorySlug] ?? null,
      },
    });
    console.log(`Blog post created: ${post.slug}`);
  }
  console.log("Blog posts seeded");
}
