import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
      {
        // Neon / generic HTTPS images as fallback
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
