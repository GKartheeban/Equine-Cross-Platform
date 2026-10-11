import type { MetadataRoute } from "next";
import { IS_LIVE, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Test version: keep Google out completely
  if (!IS_LIVE) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or personal pages: nothing useful for Google here
      disallow: ["/admin", "/login", "/signup", "/account", "/sell", "/saved", "/report"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
