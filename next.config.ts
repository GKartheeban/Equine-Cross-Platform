import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets your phone on the same Wi-Fi use the dev server (npm run dev).
  // Only affects development, not the live website.
  allowedDevOrigins: ["192.168.1.9"],
};

export default nextConfig;
