import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// English / Tamil text: see src/i18n/request.ts and the messages/ folder
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Lets your phone on the same Wi-Fi use the dev server (npm run dev).
  // Only affects development, not the live website.
  // The router can give the laptop a new address (e.g. .9 one day, .5 the next),
  // so any 192.168.1.x address is allowed.
  allowedDevOrigins: ["192.168.1.*", "192.168.1.5", "192.168.1.9"],

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

export default withNextIntl(nextConfig);
