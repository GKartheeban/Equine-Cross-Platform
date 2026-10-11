// Reads listings from Supabase for the public pages (Home, Search, Horse detail).
// Runs on the server. Only "live" listings are visible here: the database
// security rules hide everything else from the public.

import { createClient } from "@supabase/supabase-js";
import { coverOf, mediaUrl, storedMedia, type MediaItem } from "@/lib/media";
import { trainingFromOld } from "@/lib/horse-options";
import { breeds, districts } from "@/lib/sample-data";

export type Listing = {
  id: string;
  sellerId: string;
  slug: string;
  breed: string;
  gender: string;
  ageYears: number;
  heightInches: number;
  colour: string;
  markings: string | null;
  priceInr: number;
  negotiable: boolean;
  district: string;
  town: string;
  createdAt: string;
  postedDaysAgo: number;
  /** All photos and videos, in the seller's order (first photo = cover) */
  media: MediaItem[];
  /** Cover photo for cards and sharing (null for video-only listings) */
  coverUrl: string | null;
  /** For video-only listings: the first video, shown on the card instead of a photo */
  coverVideoUrl: string | null;
  hasVideo: boolean;
  vaccinated: boolean;
  vetCertificate: boolean;
  /** e.g. ["Ridden", "Cart"] */
  trainingLevels: string[];
  handlerExperience: string;
  pregnant: boolean | null;
  description: string | null;
  views: number;
};

export type Row = {
  id: string;
  seller_id: string;
  slug: string;
  breed: string;
  gender: string;
  age_years: number;
  height_inches: number;
  colour: string;
  markings: string | null;
  price_inr: number;
  negotiable: boolean;
  district: string;
  town: string;
  created_at: string;
  media: unknown;
  photo_paths: Record<string, string> | null;
  video_path: string | null;
  video_seconds: number | null;
  vaccinated: boolean;
  vet_certificate_path: string | null;
  training_level: string | null;
  training_levels: string[] | null;
  handler_experience: string;
  pregnant: boolean | null;
  description: string | null;
  views: number;
};

export const LISTING_COLUMNS =
  // (kept in one place for the server pages and the Saved page)
  "id, seller_id, slug, breed, gender, age_years, height_inches, colour, markings, price_inr, negotiable, district, town, created_at, media, photo_paths, video_path, video_seconds, vaccinated, vet_certificate_path, training_level, training_levels, handler_experience, pregnant, description, views";
const COLUMNS = LISTING_COLUMNS;

// A simple public client: no login needed to read live listings
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function toListing(r: Row): Listing {
  const saved = storedMedia(r);
  const cover = coverOf(saved);
  const days = Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86_400_000));
  return {
    id: r.id,
    sellerId: r.seller_id,
    slug: r.slug,
    breed: r.breed,
    gender: r.gender,
    ageYears: r.age_years,
    heightInches: r.height_inches,
    colour: r.colour,
    markings: r.markings,
    priceInr: r.price_inr,
    negotiable: r.negotiable,
    district: r.district,
    town: r.town,
    createdAt: r.created_at,
    postedDaysAgo: days,
    media: saved.map((m) => ({ type: m.type, url: mediaUrl(m.path), seconds: m.seconds })),
    coverUrl: cover?.type === "photo" ? cover.url : null,
    coverVideoUrl: cover?.type === "video" ? cover.url : null,
    hasVideo: saved.some((m) => m.type === "video"),
    vaccinated: r.vaccinated,
    vetCertificate: !!r.vet_certificate_path,
    trainingLevels: r.training_levels?.length ? r.training_levels : trainingFromOld(r.training_level),
    handlerExperience: r.handler_experience,
    pregnant: r.pregnant,
    description: r.description,
    views: r.views,
  };
}

/** Newest live listings, for the Home page. */
export async function getLatestListings(limit = 6): Promise<Listing[]> {
  const { data, error } = await db()
    .from("listings")
    .select(COLUMNS)
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getLatestListings:", error.message);
    return [];
  }
  return (data as unknown as Row[]).map(toListing);
}

/** One live listing by its web address slug, for the Horse detail page. */
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const { data, error } = await db()
    .from("listings")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();
  if (error) console.error("getListingBySlug:", error.message);
  return data ? toListing(data as unknown as Row) : null;
}

/** Other live horses, same breed first, for "Similar horses". */
export async function getSimilarListings(listing: Listing, limit = 3): Promise<Listing[]> {
  const sameBreed = await db()
    .from("listings")
    .select(COLUMNS)
    .eq("status", "live")
    .eq("breed", listing.breed)
    .neq("id", listing.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (sameBreed.data as unknown as Row[] | null) ?? [];
  if (rows.length < limit) {
    const others = await db()
      .from("listings")
      .select(COLUMNS)
      .eq("status", "live")
      .neq("breed", listing.breed)
      .order("created_at", { ascending: false })
      .limit(limit - rows.length);
    rows.push(...((others.data as unknown as Row[] | null) ?? []));
  }
  return rows.map(toListing);
}

export type SearchFilters = {
  breed: string; // breed slug, e.g. "marwari"
  district: string; // district slug, e.g. "madurai"
  price: string; // e.g. "50000-100000"
  gender: string;
  sort: string; // "newest" | "price-asc" | "price-desc"
};

/** Live listings matching the search filters, for the Search page. */
export async function searchListings(f: SearchFilters, limit = 60): Promise<Listing[]> {
  let q = db().from("listings").select(COLUMNS).eq("status", "live");

  const breedName = breeds.find((b) => b.slug === f.breed)?.name;
  const districtName = districts.find((d) => d.slug === f.district)?.name;
  if (breedName) q = q.eq("breed", breedName);
  if (districtName) q = q.eq("district", districtName);
  if (f.gender) q = q.eq("gender", f.gender);
  if (f.price) {
    const [min, max] = f.price.split("-");
    if (min) q = q.gte("price_inr", Number(min));
    if (max) q = q.lte("price_inr", Number(max));
  }

  if (f.sort === "price-asc") q = q.order("price_inr", { ascending: true });
  else if (f.sort === "price-desc") q = q.order("price_inr", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  const { data, error } = await q.limit(limit);
  if (error) {
    console.error("searchListings:", error.message);
    return [];
  }
  return (data as unknown as Row[]).map(toListing);
}

/** Number of live horses in each district (district name -> count). */
export async function getDistrictCounts(): Promise<Record<string, number>> {
  const { data, error } = await db().from("live_district_counts").select("district, horses");
  if (error) {
    console.error("getDistrictCounts:", error.message);
    return {};
  }
  return Object.fromEntries(
    ((data as unknown as { district: string; horses: number }[]) ?? []).map((r) => [r.district, r.horses]),
  );
}

export type SellerProfile = {
  name: string | null;
  avatarUrl: string | null;
  memberSince: string | null; // ISO date the account's profile was created
  nameChangedAt: string | null; // ISO date of the last name change (null if never changed)
};

/** The seller's public profile: name, photo, member-since and last name change. */
export async function getSellerProfile(sellerId: string): Promise<SellerProfile> {
  const { data } = await db()
    .from("profiles")
    .select("full_name, avatar_path, created_at, name_changed_at")
    .eq("id", sellerId)
    .maybeSingle();
  const p = data as {
    full_name: string | null;
    avatar_path: string | null;
    created_at: string;
    name_changed_at: string | null;
  } | null;
  return {
    name: p?.full_name?.trim() || null,
    avatarUrl: p?.avatar_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${p.avatar_path}`
      : null,
    memberSince: p?.created_at ?? null,
    nameChangedAt: p?.name_changed_at ?? null,
  };
}

/** Every live horse's address and last change, for the Google sitemap. */
export async function getLiveListingSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const { data, error } = await db()
    .from("listings")
    .select("slug, updated_at")
    .eq("status", "live")
    .order("updated_at", { ascending: false })
    .limit(5000);
  if (error) {
    console.error("getLiveListingSlugs:", error.message);
    return [];
  }
  return ((data as unknown as { slug: string; updated_at: string }[]) ?? []).map((r) => ({
    slug: r.slug,
    updatedAt: r.updated_at,
  }));
}
