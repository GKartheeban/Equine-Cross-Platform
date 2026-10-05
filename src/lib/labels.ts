// Turns stored English values (e.g. "Ridden and cart", "Madurai") into the keys
// used in messages/en.json and messages/ta.json, so they can be shown in Tamil.

import { breeds, districts } from "@/lib/sample-data";

/** "Ridden and cart" -> "ridden_and_cart", "Mare" -> "mare" */
export const optionKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** "Madurai" -> "madurai" (undefined if not one of our districts) */
export const districtSlug = (name: string) => districts.find((d) => d.name === name)?.slug;

/** "Marwari" -> "marwari", "Other" -> "other" */
export const breedSlug = (name: string) => breeds.find((b) => b.name === name)?.slug ?? (name === "Other" ? "other" : undefined);

/** Date format for each language, e.g. "2 Oct 2026" / "2 அக்., 2026" */
export const dateLocale = (locale: string) => (locale === "ta" ? "ta-IN" : "en-IN");
