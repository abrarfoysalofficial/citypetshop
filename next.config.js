/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["prisma", "@prisma/client"],
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "https", hostname: "**.citypluspetshop.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    // CSP: permissive but blocks XSS. Tighten script-src when GTM/FB pixels are known.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http://localhost",
      "connect-src 'self' https://graph.facebook.com https://www.google-analytics.com https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        // Cache Next.js static assets aggressively
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Product feeds: cacheable for 1 hour
        source: "/api/feeds/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=7200" },
        ],
      },
      {
        // No cache for all other API routes
        source: "/api/((?!feeds).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/my-account", destination: "/account", permanent: false },
      { source: "/my-account/orders", destination: "/account/orders", permanent: false },
      { source: "/my-account/orders/:id", destination: "/account/orders/:id", permanent: false },
      { source: "/my-account/invoices", destination: "/account/invoices", permanent: false },
      { source: "/my-account/returns", destination: "/account/returns", permanent: false },
      { source: "/admin/products/new", destination: "/admin/products/upload", permanent: false },
    ];
  },
};

module.exports = nextConfig;
