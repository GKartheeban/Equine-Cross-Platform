import { createClient } from "@/lib/supabase/client";
import type { MediaKind } from "@/lib/horse-options";
import { storedMedia, type StoredMedia } from "@/lib/media";
import { AppError, type ProgressFn } from "@/lib/app-error";

/** One photo or video in the form. New ones have a file; saved ones only a path. */
export type DraftMedia = { type: MediaKind; file: File | null; path?: string; seconds?: number };

export type ListingDraft = {
  breed: string;
  gender: string;
  ageYears: number;
  heightInches: number;
  colour: string;
  markings: string;
  /** Photos and videos in the seller's order (first photo = cover) */
  media: DraftMedia[];
  vaccinated: boolean;
  vetCertificate: File | null;
  trainingLevels: string[];
  handlerExperience: string;
  pregnant: boolean | null;
  priceInr: number;
  negotiable: boolean;
  district: string;
  town: string;
  description: string;
};

type Uploader = (bucket: string, path: string, body: Blob, contentType: string) => Promise<string>;

/**
 * Uploads the new photos/videos (photos are shrunk on the phone first) and returns
 * the full media list to save, in order. Saved files keep their path.
 */
async function uploadMedia(
  media: DraftMedia[],
  folder: string,
  stamp: number,
  upload: Uploader,
  onProgress: ProgressFn,
): Promise<StoredMedia[]> {
  const toUpload = media.filter((m) => m.file).length;
  let n = 0;
  const result: StoredMedia[] = [];
  for (let i = 0; i < media.length; i++) {
    const m = media[i];
    if (!m.file) {
      if (m.path) result.push({ type: m.type, path: m.path, ...(m.type === "video" ? { seconds: m.seconds ?? 20 } : {}) });
      continue;
    }
    n++;
    if (m.type === "photo") {
      onProgress("media", { n, total: toUpload });
      const small = await shrinkImage(m.file);
      const ext = small.type === "image/jpeg" ? "jpg" : extensionOf(m.file);
      const path = await upload("listing-media", `${folder}/photo-${stamp}-${i + 1}.${ext}`, small, small.type || m.file.type);
      result.push({ type: "photo", path });
    } else {
      onProgress("mediaVideo", { n, total: toUpload, mb: (m.file.size / 1024 / 1024).toFixed(0) });
      const path = await upload(
        "listing-media",
        `${folder}/video-${stamp}-${i + 1}.${extensionOf(m.file)}`,
        m.file,
        m.file.type || "video/mp4",
      );
      result.push({ type: "video", path, seconds: Math.round(m.seconds ?? 20) });
    }
  }
  return result;
}

/** Database "MEDIA_RULES" errors -> plain message */
function saveError(message: string) {
  if (/DAILY_LIMIT/.test(message)) return new AppError("dailyLimit");
  if (/MEDIA_RULES/.test(message)) return new AppError("mediaRules");
  return new AppError("saveFailed", { detail: message });
}

/**
 * Uploads the photos, videos and vet certificate, then saves the listing
 * as "live" straight away. Reports progress in plain words.
 * Returns the new listing's slug.
 */
export async function submitListing(
  draft: ListingDraft,
  onProgress: ProgressFn,
): Promise<string> {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new AppError("loginExpired");

  const listingId = newId();
  const folder = `${userId}/${listingId}`;
  const uploaded: { bucket: string; path: string }[] = [];

  async function upload(bucket: string, path: string, body: Blob, contentType: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, body, { contentType, cacheControl: "31536000", upsert: false });
    if (error) throw uploadError(error.message);
    uploaded.push({ bucket, path });
    return path;
  }

  try {
    // 1. Photos and videos, in order
    const media = await uploadMedia(draft.media, folder, Date.now(), upload, onProgress);

    // 2. Vet certificate (private bucket)
    let vetPath: string | null = null;
    if (draft.vetCertificate) {
      onProgress("certificate");
      vetPath = await upload(
        "documents",
        `${folder}/vet-certificate.${extensionOf(draft.vetCertificate)}`,
        draft.vetCertificate,
        draft.vetCertificate.type,
      );
    }

    // 3. Save the listing
    onProgress("saving");
    const slug = makeSlug(draft, listingId);
    const { error } = await supabase.from("listings").insert({
      id: listingId,
      seller_id: userId,
      slug,
      status: "live",
      breed: draft.breed,
      gender: draft.gender,
      age_years: draft.ageYears,
      height_inches: draft.heightInches,
      colour: draft.colour,
      markings: draft.markings.trim() || null,
      vaccinated: draft.vaccinated,
      vet_certificate_path: vetPath,
      training_levels: draft.trainingLevels,
      handler_experience: draft.handlerExperience,
      pregnant: draft.pregnant,
      price_inr: draft.priceInr,
      negotiable: draft.negotiable,
      district: draft.district,
      town: draft.town.trim(),
      description: draft.description.trim() || null,
      media,
    });
    if (error) throw saveError(error.message);

    return slug;
  } catch (err) {
    // Clean up files from a failed attempt so they don't use storage
    for (const f of uploaded) {
      await supabase.storage.from(f.bucket).remove([f.path]).catch(() => {});
    }
    throw err;
  }
}

/**
 * Makes a random ID like "3f9a2c1e-…".
 * crypto.randomUUID only exists on https:// or localhost, so phones testing on
 * http://192.168.x.x need this fallback (getRandomValues works everywhere).
 */
function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Resizes a photo to max 1600px and saves it as JPEG (~200–400 KB). */
async function shrinkImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    // Some formats (e.g. HEIC on Android) can't be resized in the browser; upload as is
    return file;
  }
}

function extensionOf(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5 && fromName !== file.name.toLowerCase()) return fromName;
  return file.type.split("/")[1]?.replace("quicktime", "mov") || "bin";
}

// e.g. "marwari-mare-madurai-3f9a2c"
function makeSlug(d: ListingDraft, id: string) {
  const words = `${d.breed} ${d.gender} ${d.district}`
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${words}-${id.slice(0, 6)}`;
}

function uploadError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("size") || m.includes("too large")) return new AppError("fileTooLarge");
  if (m.includes("mime") || m.includes("type")) return new AppError("badFormat");
  if (m.includes("bucket")) return new AppError("storageNotSetUp");
  if (m.includes("row-level") || m.includes("policy") || m.includes("unauthorized")) return new AppError("uploadBlocked");
  return new AppError("uploadFailed", { detail: message });
}

/* ---------- Editing an existing listing ---------- */

export type ListingEdit = Omit<ListingDraft, "vetCertificate"> & {
  vetCertificate: { file: File | null; path?: string } | null;
};

/**
 * Saves changes to a listing. Only new photos/videos/certificate are uploaded;
 * files the seller removed or replaced are deleted afterwards. Returns the slug.
 */
export async function updateListing(
  listingId: string,
  draft: ListingEdit,
  onProgress: ProgressFn,
): Promise<string> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new AppError("loginExpired");

  const folder = `${userId}/${listingId}`;
  const stamp = Date.now(); // new file names, so phones don't show old cached photos
  const uploaded: { bucket: string; path: string }[] = [];
  let removedFiles: { bucket: string; path: string }[] = [];

  async function upload(bucket: string, path: string, body: Blob, contentType: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, body, { contentType, cacheControl: "31536000", upsert: false });
    if (error) throw uploadError(error.message);
    uploaded.push({ bucket, path });
    return path;
  }

  // What is saved now, to know which files are no longer used
  const { data: current, error: loadError } = await supabase
    .from("listings")
    .select("slug, media, photo_paths, video_path, video_seconds, vet_certificate_path")
    .eq("id", listingId)
    .single();
  if (loadError || !current) throw new AppError("listingMissing");
  const before = storedMedia(current);

  try {
    // 1. Photos and videos: upload only the new ones
    const media = await uploadMedia(draft.media, folder, stamp, upload, onProgress);

    // 2. Vet certificate
    let vetPath: string | null = current.vet_certificate_path;
    const oldVet: string | null = current.vet_certificate_path;
    if (draft.vetCertificate?.file) {
      onProgress("certificate");
      vetPath = await upload(
        "documents",
        `${folder}/vet-certificate-${stamp}.${extensionOf(draft.vetCertificate.file)}`,
        draft.vetCertificate.file,
        draft.vetCertificate.file.type,
      );
    }

    // 3. Save the changes
    onProgress("savingChanges");
    const { error } = await supabase
      .from("listings")
      .update({
        breed: draft.breed,
        gender: draft.gender,
        age_years: draft.ageYears,
        height_inches: draft.heightInches,
        colour: draft.colour,
        markings: draft.markings.trim() || null,
        vaccinated: draft.vaccinated,
        vet_certificate_path: vetPath,
        training_levels: draft.trainingLevels,
        handler_experience: draft.handlerExperience,
        pregnant: draft.pregnant,
        price_inr: draft.priceInr,
        negotiable: draft.negotiable,
        district: draft.district,
        town: draft.town.trim(),
        description: draft.description.trim() || null,
        media,
        // The old fixed-photo columns aren't used any more
        photo_paths: {},
        video_path: null,
        video_seconds: null,
      })
      .eq("id", listingId);
    if (error) throw saveError(error.message);

    const kept = new Set(media.map((m) => m.path));
    removedFiles = before.filter((m) => !kept.has(m.path)).map((m) => ({ bucket: "listing-media", path: m.path }));
    if (draft.vetCertificate?.file && oldVet) removedFiles.push({ bucket: "documents", path: oldVet });
  } catch (err) {
    for (const f of uploaded) {
      await supabase.storage.from(f.bucket).remove([f.path]).catch(() => {});
    }
    throw err;
  }

  // 4. Delete the files that were removed or replaced (not needed any more)
  for (const bucket of ["listing-media", "documents"]) {
    const paths = removedFiles.filter((f) => f.bucket === bucket).map((f) => f.path);
    if (paths.length) await supabase.storage.from(bucket).remove(paths).catch(() => {});
  }

  return current.slug as string;
}
