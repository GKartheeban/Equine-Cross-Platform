// The shape of a horse listing, and how a database row becomes one.
// Shared by the server pages (src/lib/listings.ts) and the browser (Saved page).

import { coverOf, mediaUrl, storedMedia, type MediaItem } from "@/lib/media";
import { trainingFromOld } from "@/lib/horse-options";

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
