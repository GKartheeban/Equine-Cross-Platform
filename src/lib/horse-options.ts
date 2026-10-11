// Fixed choices used by the "Post a horse" form, filters and the database.

export const genders = ["Mare", "Stallion", "Gelding", "Colt", "Filly"] as const;

// Training: sellers tick all that apply. "Untrained" can't be combined with the others.
export const trainingLevels = ["Untrained", "Ridden", "Cart", "Race", "Dance"] as const;

/** Old single values (before update 017) -> the new tick boxes */
export function trainingFromOld(value: string | null | undefined): string[] {
  if (!value) return [];
  if (value === "Ridden and cart") return ["Ridden", "Cart"];
  if (value === "Dance only") return ["Dance"];
  if (value === "All") return ["Ridden", "Cart", "Race", "Dance"];
  return [value];
}

// How experienced the person handling this horse needs to be
export const handlerExperience = ["Beginner", "Intermediate", "Expert"] as const;

// What a seller can upload: any mix of photos and videos.
// Same rules are checked in the database (supabase/016_flexible_media.sql).
export const mediaRules = {
  maxFiles: 10,
  maxPhotos: 8,
  maxVideos: 2,
  minPhotosWithoutVideo: 2, // photos only -> at least 2; with a video, any number is fine
};

export type MediaKind = "photo" | "video";

export const limits = {
  photoMb: 10,
  videoSeconds: 20, // longer videos are shortened on the phone (seller picks the part)
  videoKeepAsIsMb: 15, // smaller videos upload as they are; bigger ones are shrunk to 720p
  videoUploadMb: 50, // Supabase free plan: max 50 MB per file
  descriptionChars: 1000,
};
