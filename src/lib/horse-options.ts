// Fixed choices used by the "Post a horse" form, filters and the database.

export const genders = ["Mare", "Stallion", "Gelding", "Colt", "Filly"] as const;

export const trainingLevels = [
  "Untrained",
  "Ridden",
  "Cart",
  "Ridden and cart",
  "Race",
  "Dance only",
  "All",
] as const;

// How experienced the person handling this horse needs to be
export const handlerExperience = ["Beginner", "Intermediate", "Expert"] as const;

// Photo angles every seller is asked for. The first one is the cover photo.
export const photoSlots = [
  { key: "front", label: "Front", hint: "Head-on, full body" },
  { key: "left", label: "Left side", hint: "Whole horse, standing straight" },
  { key: "right", label: "Right side", hint: "Whole horse, standing straight" },
  { key: "rear", label: "Rear", hint: "From behind, legs visible" },
  { key: "teeth", label: "Teeth", hint: "Close-up of the teeth (shows age)" },
] as const;

export type PhotoKey = (typeof photoSlots)[number]["key"];

export const limits = {
  photoMb: 10,
  videoSeconds: 20, // longer videos are shortened on the phone (seller picks the part)
  videoKeepAsIsMb: 15, // smaller videos upload as they are; bigger ones are shrunk to 720p
  videoUploadMb: 50, // Supabase free plan: max 50 MB per file
  descriptionChars: 1000,
};
