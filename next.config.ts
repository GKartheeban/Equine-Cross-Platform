import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets your phone on the same Wi-Fi use the dev server (npm run dev).
  // Only affects development, not the live website.
  allowedDevOrigins: ["192.168.1.9"],

  // Allow horse photos from Supabase Storage to be resized and served fast by Next.js
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
