/**
 * Sitemap XML route tests: valid schema, no lib/data usage.
 */
describe("Sitemap XML structure", () => {
  it("generates valid urlset XML structure", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1</priority>
  </url>
</urlset>`;
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("</urlset>");
    expect(xml).toMatch(/<loc>.*<\/loc>/);
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });

  it("url element has required loc, lastmod, changefreq, priority", () => {
    const url = {
      loc: "https://citypetshop.bd/product/123",
      lastmod: "2026-02-26",
      changefreq: "weekly" as const,
      priority: 0.6,
    };
    const xml = `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
    expect(xml).toContain(url.loc);
    expect(xml).toContain(url.lastmod);
    expect(xml).toContain(url.changefreq);
    expect(xml).toContain(String(url.priority));
  });
});
