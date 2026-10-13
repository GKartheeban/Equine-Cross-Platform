// The public address of the website, used for Google (sitemap) and share links.
// Set NEXT_PUBLIC_SITE_URL in Netlify, e.g. https://horsemart.com
// (later your own domain). On your laptop it falls back to localhost.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "HorseMart";

// Public launch switch. Until NEXT_PUBLIC_IS_LIVE is "true" (set in Netlify on launch day),
// the site asks Google not to list it and shows a small "Test version" strip.
export const IS_LIVE = process.env.NEXT_PUBLIC_IS_LIVE === "true";
