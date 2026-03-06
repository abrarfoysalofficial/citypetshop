/**
 * Smoke check — HTTP GET against key routes.
 * Run with dev server: npm run dev (in one terminal), npm run smoke (in another).
 * Or: PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test tests/smoke.spec.ts
 */
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

const ROUTES = [
  "/",
  "/shop",
  "/blog",
  "/terms",
  "/privacy",
  "/refund",
  "/track-order",
  "/site-map",
  "/sitemap.xml",
  "/robots.txt",
  "/cart",
  "/checkout",
  "/about",
  "/contact",
];

async function check(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(url, { method: "GET" });
    return { ok: res.ok || res.status === 307, status: res.status };
  } catch (e) {
    return { ok: false, status: 0 };
  }
}

async function main() {
  console.log(`Smoke check: ${BASE}\n`);
  let failed = 0;
  for (const path of ROUTES) {
    const url = `${BASE.replace(/\/$/, "")}${path}`;
    const { ok, status } = await check(url);
    const icon = ok ? "✓" : "✗";
    console.log(`${icon} ${path} ${status}`);
    if (!ok) failed++;
  }
  // Sample product page (use sample-product slug if seeded)
  const { ok: productOk, status: productStatus } = await check(`${BASE}/product/sample-product`);
  console.log(`${productOk ? "✓" : "✗"} /product/sample-product ${productStatus}`);
  if (!productOk && productStatus !== 404) failed++;

  // Sample blog slug from static posts
  const { ok: blogOk, status: blogStatus } = await check(`${BASE}/blog/best-dog-food-bangladesh-2026`);
  console.log(`${blogOk ? "✓" : "✗"} /blog/[slug] ${blogStatus}`);
  if (!blogOk && blogStatus !== 404) failed++;
  console.log(failed === 0 ? "\n✓ Smoke check passed" : `\n✗ ${failed} route(s) failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
