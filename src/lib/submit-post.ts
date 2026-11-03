// Saves, edits, closes and deletes posts in the six extra sections (runs in the browser).
// Photos are shrunk on the phone, then uploaded to the seller's own folder:
//   listing-media/<user id>/posts/<post id>/photo-<time>-<n>.jpg

import { createClient } from "@/lib/supabase/client";
import { refreshPublicPages } from "@/lib/refresh-pages";
import { extensionOf, newId, shrinkImage } from "@/lib/submit-listing";
import { photoPathsOf, type DetailValue } from "@/lib/market-shape";
import type { PriceUnit, SectionKey } from "@/lib/market-sections";

/** A photo in the form: a new file, or one already saved (path). */
export type DraftPhoto = { file: File | null; path?: string };

export type PostDraft = {
  section: SectionKey;
  title: string;
  description: string;
  district: string;
  town: string;
  priceInr: number | null;
  priceUnit: PriceUnit;
  details: Record<string, DetailValue>;
  startsOn: string | null;
  endsOn: string | null;
  photos: DraftPhoto[];
};

/** Error with a key from messages (market.form.*) */
export class PostError extends Error {
  constructor(public key: "errDailyLimit" | "errSave" | "errUpload" | "errNotFound" | "loginFirst") {
    super(key);
  }
}

export type PostProgress = { key: "uploading"; n: number; total: number } | { key: "saving" };

// e.g. "4-horse-truck-madurai-3f9a2c"; Tamil-only titles fall back to the section name
function makeSlug(d: PostDraft, id: string) {
  const words = d.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50)
    .replace(/-$/, "");
  return `${words || d.section}-${id.slice(0, 6)}`;
}

/**
 * Creates a new post (postId undefined) or saves changes to one.
 * Only new photos are uploaded; photos removed while editing are deleted afterwards.
 * Returns the post's slug.
 */
export async function savePost(draft: PostDraft, onProgress: (p: PostProgress) => void, postId?: string): Promise<string> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new PostError("loginFirst");

  const id = postId ?? newId();
  const folder = `${userId}/posts/${id}`;
  const stamp = Date.now();
  const uploaded: string[] = [];

  // Photos already saved before this edit (to delete the ones removed)
  let before: string[] = [];
  let slug = "";
  if (postId) {
    const { data, error } = await supabase.from("market_posts").select("slug, media").eq("id", postId).single();
    if (error || !data) throw new PostError("errNotFound");
    before = photoPathsOf(data.media);
    slug = data.slug;
  }

  try {
    const total = draft.photos.filter((p) => p.file).length;
    let n = 0;
    const media: { type: "photo"; path: string }[] = [];
    for (let i = 0; i < draft.photos.length; i++) {
      const p = draft.photos[i];
      if (!p.file) {
        if (p.path) media.push({ type: "photo", path: p.path });
        continue;
      }
      n++;
      onProgress({ key: "uploading", n, total });
      const small = await shrinkImage(p.file);
      const ext = small.type === "image/jpeg" ? "jpg" : extensionOf(p.file);
      const path = `${folder}/photo-${stamp}-${i + 1}.${ext}`;
      const { error } = await supabase.storage
        .from("listing-media")
        .upload(path, small, { contentType: small.type || p.file.type, cacheControl: "31536000", upsert: false });
      if (error) throw new PostError("errUpload");
      uploaded.push(path);
      media.push({ type: "photo", path });
    }

    onProgress({ key: "saving" });
    const row = {
      section: draft.section,
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      district: draft.district,
      town: draft.town.trim(),
      price_inr: draft.priceUnit === "free" || draft.priceUnit === "ask" ? null : draft.priceInr,
      price_unit: draft.priceUnit,
      details: draft.details,
      starts_on: draft.startsOn,
      ends_on: draft.endsOn,
      media,
    };

    if (postId) {
      const { error } = await supabase.from("market_posts").update(row).eq("id", postId);
      if (error) throw saveError(error.message);
    } else {
      slug = makeSlug(draft, id);
      const { error } = await supabase.from("market_posts").insert({ id, slug, status: "live", ...row });
      if (error) throw saveError(error.message);
    }
  } catch (err) {
    // Remove photos of a failed attempt so they don't use storage
    if (uploaded.length) await supabase.storage.from("listing-media").remove(uploaded).catch(() => {});
    throw err;
  }

  // Delete photos that were removed or replaced while editing
  const kept = new Set(draft.photos.map((p) => p.path).filter(Boolean));
  const removed = before.filter((p) => !kept.has(p));
  if (removed.length) await supabase.storage.from("listing-media").remove(removed).catch(() => {});

  await refreshPublicPages();
  return slug;
}

function saveError(message: string) {
  if (/DAILY_LIMIT/.test(message)) return new PostError("errDailyLimit");
  return new PostError("errSave");
}

/** Closes (sold / filled / cancelled) or re-opens a post. */
export async function setPostStatus(postId: string, status: "live" | "closed"): Promise<boolean> {
  const { error } = await createClient().from("market_posts").update({ status }).eq("id", postId);
  if (!error) await refreshPublicPages();
  return !error;
}

/** Deletes a post and its photos. */
export async function deletePost(postId: string, photoPaths: string[]): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("market_posts").delete().eq("id", postId);
  if (error) return false;
  if (photoPaths.length) await supabase.storage.from("listing-media").remove(photoPaths).catch(() => {});
  await refreshPublicPages();
  return true;
}
