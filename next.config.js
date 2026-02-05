/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseImagePattern = supabaseUrl
  ? [{ protocol: 'https', hostname: new URL(supabaseUrl).hostname, pathname: '/storage/v1/object/**' }]
  : [];

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sanity', 'next-sanity'],
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
      ...supabaseImagePattern,
    ],
  },
  async redirects() {
    return [
      { source: '/my-account', destination: '/account', permanent: false },
      { source: '/my-account/orders', destination: '/account/orders', permanent: false },
      { source: '/my-account/orders/:id', destination: '/account/orders/:id', permanent: false },
      { source: '/my-account/invoices', destination: '/account/invoices', permanent: false },
      { source: '/my-account/returns', destination: '/account/returns', permanent: false },
    ];
  },
};

module.exports = nextConfig;
