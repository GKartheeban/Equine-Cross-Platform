import { createClient } from "@/lib/supabase/client";
import type { PhotoKey } from "@/lib/horse-options";

export type ListingDraft = {
  breed: string;
  gender: string;
  ageYears: number;
  heightInches: number;
  colour: string;
  markings: string;
  photos: Partial<Record<PhotoKey, File>>;
  video: { file: File; seconds: number } | null;
  vaccinated: boolean;
  vetCertificate: File | null;
  trainingLevel: string;
  handlerExperience: string;
  pregnant: boolean | null;
  priceInr: number;
  negotiable: boolean;
  district: string;
  town: string;
  description: string;
};

/**
 * Uploads the photos, video and vet certificate, then saves the listing
 * as "pending" (waiting for approval). Reports progress in plain words.
 * Returns the new listing's slug.
 */
export async function submitListing(
  draft: ListingDraft,
  onProgress: (message: string) => void,
): Promise<string> {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Your login has expired. Please log in again.");

  const listingId = newId();
  const folder = `${userId}/${listingId}`;
  const uploaded: { bucket: string; path: string }[] = [];

  async function upload(bucket: string, path: string, body: Blob, contentType: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, body, { contentType, cacheControl: "31536000", upsert: false });
    if (error) throw new Error(uploadErrorMessage(error.message));
    uploaded.push({ bucket, path });
    return path;
  }

  try {
    // 1. Photos: shrunk on the phone first so uploads are quick on mobile data
    const photoPaths: Partial<Record<PhotoKey, string>> = {};
    const entries = Object.entries(draft.photos) as [PhotoKey, File][];
    for (let i = 0; i < entries.length; i++) {
      const [key, file] = entries[i];
      onProgress(`Uploading photos (${i + 1} of ${entries.length})…`);
      const small = await shrinkImage(file);
      const ext = small.type === "image/jpeg" ? "jpg" : extensionOf(file);
      photoPaths[key] = await upload("listing-media", `${folder}/${key}.${ext}`, small, small.type || file.type);
    }

    // 2. Walking video
    let videoPath: string | null = null;
    if (draft.video) {
      const mb = (draft.video.file.size / 1024 / 1024).toFixed(0);
      onProgress(`Uploading video (${mb} MB). Keep this page open…`);
      videoPath = await upload(
        "listing-media",
        `${folder}/walking.${extensionOf(draft.video.file)}`,
        draft.video.file,
        draft.video.file.type,
      );
    }

    // 3. Vet certificate (private bucket)
    let vetPath: string | null = null;
    if (draft.vetCertificate) {
      onProgress("Uploading vet certificate…");
      vetPath = await upload(
        "documents",
        `${folder}/vet-certificate.${extensionOf(draft.vetCertificate)}`,
        draft.vetCertificate,
        draft.vetCertificate.type,
      );
    }

    // 4. Save the listing
    onProgress("Saving your listing…");
    const slug = makeSlug(draft, listingId);
    const { error } = await supabase.from("listings").insert({
      id: listingId,
      seller_id: userId,
      slug,
      status: "pending",
      breed: draft.breed,
      gender: draft.gender,
      age_years: draft.ageYears,
      height_inches: draft.heightInches,
      colour: draft.colour,
      markings: draft.markings.trim() || null,
      vaccinated: draft.vaccinated,
      vet_certificate_path: vetPath,
      training_level: draft.trainingLevel,
      handler_experience: draft.handlerExperience,
      pregnant: draft.pregnant,
      price_inr: draft.priceInr,
      negotiable: draft.negotiable,
      district: draft.district,
      town: draft.town.trim(),
      description: draft.description.trim() || null,
      photo_paths: photoPaths,
      video_path: videoPath,
      video_seconds: draft.video?.seconds ?? null,
    });
    if (error) throw new Error(`Couldn't save the listing: ${error.message}`);

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

function uploadErrorMessage(message: string) {
  const m = message.toLowerCase();
  if (m.includes("size") || m.includes("too large")) return "A file is too large to upload. Choose the video again so it can be shrunk.";
  if (m.includes("mime") || m.includes("type")) return "One of the files is in a format we can't accept.";
  if (m.includes("bucket")) return "Storage isn't set up yet. Run the database setup script in Supabase.";
  if (m.includes("row-level") || m.includes("policy") || m.includes("unauthorized"))
    return "Upload was blocked. Please log in again and retry.";
  return `Upload failed: ${message}`;
}
