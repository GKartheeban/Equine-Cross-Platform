// Reads listings from Supabase for the public pages (Home, Search, Horse detail).
// Runs on the server. Only "live" listings are visible here: the database
// security rules hide everything else from the public.
//
// Short caching: each answer from Supabase is kept for 60 seconds and shared by
// every visitor, so busy pages don't ask Supabase again and again.
// When a seller posts, edits, sells or deletes a horse (or an admin removes one),
// the website clears this cache straight away (see /api/refresh-pages), so
// changes still show up at once. Errors are never kept.

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { LISTING_COLUMNS, toListing, type Listing, type Row } from "@/lib/listing-shape";
import { breeds, districts } from "@/lib/sample-data";

export { LISTING_COLUMNS, toListing, type Listing, type Row } from "@/lib/listing-shape";

const COLUMNS = LISTING_COLUMNS;

// A simple public client: no login needed to read live listings
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Cache label used for all public listing data (cleared by /api/refresh-pages). */
export const PUBLIC_CACHE_TAG = "public-listings";
const CACHE_SECONDS = 60;

/** Keeps a Supabase read for 60 seconds. Errors are thrown so they are not kept. */
function cached<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, [name], { revalidate: CACHE_SECONDS, tags: [PUBLIC_CACHE_TAG] });
}

/** Runs a cached read; if Supabase fails, logs it and shows the fallback instead. */
async function safely<R>(name: string, read: () => Promise<R>, fallback: R): Promise<R> {
  try {
    return await read();
  } catch (e) {
    console.error(`${name}:`, e instanceof Error ? e.message : e);
    return fallback;
  }
}

const latestCached = cached("latest-listings", async (limit: number) => {
  const { data, error } = await db()
    .from("listings")
    .select(COLUMNS)
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as unknown as Row[]).map(toListing);
});

/** Newest live listings, for the Home page. */
export function getLatestListings(limit = 6): Promise<Listing[]> {
  return safely("getLatestListings", () => latestCached(limit), []);
}

const bySlugCached = cached("listing-by-slug", async (slug: string) => {
  const { data, error } = await db()
    .from("listings")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toListing(data as unknown as Row) : null;
});

/** One live listing by its web address slug, for the Horse detail page. */
export function getListingBySlug(slug: string): Promise<Listing | null> {
  return safely("getListingBySlug", () => bySlugCached(slug), null);
}

const similarCached = cached("similar-listings", async (id: string, breed: string, limit: number) => {
  const sameBreed = await db()
    .from("listings")
    .select(COLUMNS)
    .eq("status", "live")
    .eq("breed", breed)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (sameBreed.error) throw new Error(sameBreed.error.message);
  const rows = (sameBreed.data as unknown as Row[] | null) ?? [];
  if (rows.length < limit) {
    const others = await db()
      .from("listings")
      .select(COLUMNS)
      .eq("status", "live")
      .neq("breed", breed)
      .order("created_at", { ascending: false })
      .limit(limit - rows.length);
    if (others.error) throw new Error(others.error.message);
    rows.push(...((others.data as unknown as Row[] | null) ?? []));
  }
  return rows.map(toListing);
});

/** Other live horses, same breed first, for "Similar horses". */
export function getSimilarListings(listing: Listing, limit = 3): Promise<Listing[]> {
  return safely("getSimilarListings", () => similarCached(listing.id, listing.breed, limit), []);
}

export type SearchFilters = {
  breed: string; // breed slug, e.g. "marwari"
  district: string; // district slug, e.g. "madurai"
  price: string; // e.g. "50000-100000"
  gender: string;
  sort: string; // "newest" | "price-asc" | "price-desc"
};

const searchCached = cached("search-listings", async (f: SearchFilters, limit: number) => {
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
  if (error) throw new Error(error.message);
  return (data as unknown as Row[]).map(toListing);
});

/** Live listings matching the search filters, for the Search page. */
export function searchListings(f: SearchFilters, limit = 60): Promise<Listing[]> {
  // Same filters in the same order -> same cache entry
  const key: SearchFilters = { breed: f.breed, district: f.district, price: f.price, gender: f.gender, sort: f.sort };
  return safely("searchListings", () => searchCached(key, limit), []);
}

const districtCountsCached = cached("district-counts", async () => {
  const { data, error } = await db().from("live_district_counts").select("district, horses");
  if (error) throw new Error(error.message);
  return Object.fromEntries(
    ((data as unknown as { district: string; horses: number }[]) ?? []).map((r) => [r.district, r.horses]),
  ) as Record<string, number>;
});

/** Number of live horses in each district (district name -> count). */
export function getDistrictCounts(): Promise<Record<string, number>> {
  return safely("getDistrictCounts", () => districtCountsCached(), {});
}

export type SellerProfile = {
  name: string | null;
  avatarUrl: string | null;
  memberSince: string | null; // ISO date the account's profile was created
  nameChangedAt: string | null; // ISO date of the last name change (null if never changed)
};

const sellerCached = cached("seller-profile", async (sellerId: string): Promise<SellerProfile> => {
  const { data, error } = await db()
    .from("profiles")
    .select("full_name, avatar_path, created_at, name_changed_at")
    .eq("id", sellerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
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
});

/** The seller's public profile: name, photo, member-since and last name change. */
export function getSellerProfile(sellerId: string): Promise<SellerProfile> {
  return safely("getSellerProfile", () => sellerCached(sellerId), {
    name: null,
    avatarUrl: null,
    memberSince: null,
    nameChangedAt: null,
  });
}

const slugsCached = cached("live-slugs", async () => {
  const { data, error } = await db()
    .from("listings")
    .select("slug, updated_at")
    .eq("status", "live")
    .order("updated_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);
  return ((data as unknown as { slug: string; updated_at: string }[]) ?? []).map((r) => ({
    slug: r.slug,
    updatedAt: r.updated_at,
  }));
});

/** Every live horse's address and last change, for the Google sitemap. */
export function getLiveListingSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  return safely("getLiveListingSlugs", () => slugsCached(), []);
}
