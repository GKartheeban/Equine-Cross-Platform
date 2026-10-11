// Photos and videos of a listing, as saved in the database "media" column (see 016).
// Works in the browser and on the server.

import type { MediaKind } from "@/lib/horse-options";

/** One saved file: [{ type: "photo", path }, { type: "video", path, seconds }] */
export type StoredMedia = { type: MediaKind; path: string; seconds?: number };

/** The same file with a web address, ready to show */
export type MediaItem = { type: MediaKind; url: string; seconds?: number };

const OLD_PHOTO_ORDER = ["front", "left", "right", "rear", "teeth"];

/** Public web address of a file in the "listing-media" bucket. */
export function mediaUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${path}`;
}

/**
 * The listing's media in order. Uses the "media" list; for listings saved before
 * update 016 it falls back to the old 5 photos + walking video.
 */
export function storedMedia(row: {
  media?: unknown;
  photo_paths?: Record<string, string> | null;
  video_path?: string | null;
  video_seconds?: number | null;
}): StoredMedia[] {
  if (Array.isArray(row.media) && row.media.length > 0) {
    return (row.media as StoredMedia[]).filter((m) => m && (m.type === "photo" || m.type === "video") && m.path);
  }
  const old: StoredMedia[] = [];
  for (const key of OLD_PHOTO_ORDER) {
    const p = row.photo_paths?.[key];
    if (p) old.push({ type: "photo", path: p });
  }
  for (const p of Object.entries(row.photo_paths ?? {})) {
    if (!OLD_PHOTO_ORDER.includes(p[0])) old.push({ type: "photo", path: p[1] });
  }
  if (row.video_path) old.push({ type: "video", path: row.video_path, seconds: row.video_seconds ?? undefined });
  return old;
}

/** Cover for cards: the first photo; for video-only listings, the first video. */
export function coverOf(media: StoredMedia[]): { type: MediaKind; url: string } | null {
  const first = media.find((m) => m.type === "photo") ?? media.find((m) => m.type === "video");
  return first ? { type: first.type, url: mediaUrl(first.path) } : null;
}
