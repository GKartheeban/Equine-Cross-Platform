// Reads listings from Supabase for the public pages (Home, Search, Horse detail).
// Runs on the server. Only "live" listings are visible here: the database
// security rules hide everything else from the public.

import { createClient } from "@supabase/supabase-js";
import type { PhotoKey } from "@/lib/horse-options";
import { photoSlots } from "@/lib/horse-options";
import { breeds, districts } from "@/lib/sample-data";

export type Listing = {
  id: string;
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
  photoUrls: Partial<Record<PhotoKey, string>>;
  coverUrl: string | null;
  videoUrl: string | null;
  hasVideo: boolean;
  vaccinated: boolean;
  vetCertificate: boolean;
  trainingLevel: string;
  handlerExperience: string;
  pregnant: boolean | null;
  description: string | null;
  views: number;
};

type Row = {
  id: string;
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
  photo_paths: Record<string, string> | null;
  video_path: string | null;
  vaccinated: boolean;
  vet_certificate_path: string | null;
  training_level: string;
  handler_experience: string;
  pregnant: boolean | null;
  description: string | null;
  views: number;
};

const COLUMNS =
  "id, slug, breed, gender, age_years, height_inches, colour, markings, price_inr, negotiable, district, town, created_at, photo_paths, video_path, vaccinated, vet_certificate_path, training_level, handler_experience, pregnant, description, views";

const MEDIA_BUCKET = "listing-media";

// A simple public client: no login needed to read live listings
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function publicUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

function toListing(r: Row): Listing {
  const photoUrls: Partial<Record<PhotoKey, string>> = {};
  for (const slot of photoSlots) {
    const p = r.photo_paths?.[slot.key];
    if (p) photoUrls[slot.key] = publicUrl(p);
  }
  const days = Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86_400_000));
  return {
    id: r.id,
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
    photoUrls,
    coverUrl: photoUrls.front ?? Object.values(photoUrls)[0] ?? null,
    videoUrl: r.video_path ? publicUrl(r.video_path) : null,
    hasVideo: !!r.video_path,
    vaccinated: r.vaccinated,
    vetCertificate: !!r.vet_certificate_path,
    trainingLevel: r.training_level,
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
