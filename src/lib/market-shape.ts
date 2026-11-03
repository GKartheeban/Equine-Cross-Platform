// The shape of a post in the six extra sections (transport, events, jobs, shop,
// stud farms, studs), and how a database row becomes one.
// Shared by the server pages and the browser (My listings, admin).

import { mediaUrl } from "@/lib/media";
import type { PriceUnit, SectionKey } from "@/lib/market-sections";

export type DetailValue = string | number | boolean | string[];

export type MarketPost = {
  id: string;
  ownerId: string;
  section: SectionKey;
  slug: string;
  status: "live" | "closed" | "removed";
  title: string;
  description: string | null;
  district: string;
  town: string;
  priceInr: number | null;
  priceUnit: PriceUnit;
  details: Record<string, DetailValue>;
  /** Photo web addresses, in order (first = cover) */
  photos: string[];
  /** Storage paths of the photos (for editing and deleting) */
  photoPaths: string[];
  startsOn: string | null;
  endsOn: string | null;
  createdAt: string;
  postedDaysAgo: number;
};

export type MarketRow = {
  id: string;
  owner_id: string;
  section: SectionKey;
  slug: string;
  status: "live" | "closed" | "removed";
  title: string;
  description: string | null;
  district: string;
  town: string;
  price_inr: number | null;
  price_unit: PriceUnit;
  details: Record<string, DetailValue> | null;
  media: unknown;
  starts_on: string | null;
  ends_on: string | null;
  created_at: string;
};

export const MARKET_COLUMNS =
  "id, owner_id, section, slug, status, title, description, district, town, price_inr, price_unit, details, media, starts_on, ends_on, created_at";

export function photoPathsOf(media: unknown): string[] {
  if (!Array.isArray(media)) return [];
  return media
    .filter((m): m is { type: string; path: string } => !!m && typeof m === "object" && "path" in m)
    .filter((m) => m.type === "photo" && typeof m.path === "string" && m.path.length > 0)
    .map((m) => m.path);
}

export function toMarketPost(r: MarketRow): MarketPost {
  const paths = photoPathsOf(r.media);
  return {
    id: r.id,
    ownerId: r.owner_id,
    section: r.section,
    slug: r.slug,
    status: r.status,
    title: r.title,
    description: r.description,
    district: r.district,
    town: r.town,
    priceInr: r.price_inr,
    priceUnit: r.price_unit,
    details: r.details ?? {},
    photos: paths.map(mediaUrl),
    photoPaths: paths,
    startsOn: r.starts_on,
    endsOn: r.ends_on,
    createdAt: r.created_at,
    postedDaysAgo: Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86_400_000)),
  };
}
