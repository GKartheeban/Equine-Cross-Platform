import type { MetadataRoute } from "next";
import { getLiveListingSlugs } from "@/lib/listings";
import { breeds, districts } from "@/lib/sample-data";
import { SITE_URL } from "@/lib/site";

// Rebuilt at most once an hour, so new horses reach Google quickly
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const horses = await getLiveListingSlugs();

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/horses`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    ...breeds.map((b) => ({
      url: `${SITE_URL}/breeds/${b.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...districts.map((d) => ({
      url: `${SITE_URL}/horses-for-sale/${d.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...horses.map((h) => ({
      url: `${SITE_URL}/horses/${h.slug}`,
      lastModified: new Date(h.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
