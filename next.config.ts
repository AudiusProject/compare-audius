import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google profile pics
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary CDN
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net', // External logo (Bandcamp)
      },
    ],
  },
  // Ensure @libsql/client is bundled instead of externalized
  // This is needed for Cloudflare Pages/Workers deployment
  // Empty array means no packages are externalized (all are bundled)
  serverExternalPackages: [],
  // Explicitly configure which packages should NOT be externalized
  // This overrides Next.js defaults that include @libsql/client
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
