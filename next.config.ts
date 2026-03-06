import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Hostinger (and some deployment UIs) may fail to detect hidden folders like `.next`
  // when asking for an "output directory". Use a non-hidden build directory instead.
  distDir: "build",
  async redirects() {
    return [
      {
        source: "/en/en/:path*",
        destination: "/en/:path*",
        permanent: false,
      },
      {
        source: "/ar/ar/:path*",
        destination: "/ar/:path*",
        permanent: false,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
