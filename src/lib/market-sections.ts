// The six sections next to horses: what each one is called, its web address,
// and the extra fields a post in it has. Shared by the posting form, the list
// pages and the detail pages. Labels live in messages (market.*).

import { breeds } from "@/lib/sample-data";

export const sectionKeys = ["transport", "event", "job", "shop", "farm", "stud"] as const;
export type SectionKey = (typeof sectionKeys)[number];

export const priceUnits = ["fixed", "per_km", "per_day", "per_month", "per_trip", "per_cover", "free", "ask"] as const;
export type PriceUnit = (typeof priceUnits)[number];

/** One extra field of a section. Values are stored in English in `details`. */
export type FieldDef =
  | { key: string; type: "select"; options: readonly string[]; required?: boolean; filter?: boolean }
  | { key: string; type: "multi"; options: readonly string[]; required?: boolean }
  | { key: string; type: "number"; min: number; max: number; required?: boolean; suffix?: string }
  | { key: string; type: "text"; max: number; required?: boolean }
  | { key: string; type: "yesno"; required?: boolean };

export type SectionDef = {
  key: SectionKey;
  /** Web address, e.g. "/transport" */
  path: string;
  /** Icon shown on tiles and cards */
  /** Price types the poster can choose; the first is the default */
  priceUnits: readonly PriceUnit[];
  /** Price must be given (except for "free" and "ask") */
  priceRequired: boolean;
  /** At least this many photos */
  minPhotos: number;
  /** Has a start date (and optional end date) */
  dated?: boolean;
  fields: readonly FieldDef[];
};

const breedNames = [...breeds.map((b) => b.name), "Other"] as const;

export const sections: Record<SectionKey, SectionDef> = {
  transport: {
    key: "transport",
    path: "/transport",
    priceUnits: ["per_km", "per_trip", "ask"],
    priceRequired: true,
    minPhotos: 0,
    fields: [
      {
        key: "vehicle",
        type: "select",
        required: true,
        filter: true,
        options: ["1-horse trailer", "2-horse trailer", "4-horse truck", "6-horse truck", "Pickup with horse box", "Other"],
      },
      { key: "capacity", type: "number", min: 1, max: 20, required: true },
      { key: "areas", type: "text", max: 120, required: true },
      { key: "outside_tn", type: "yesno" },
      { key: "attendant", type: "yesno" },
    ],
  },
  event: {
    key: "event",
    path: "/events",
    priceUnits: ["free", "fixed", "ask"],
    priceRequired: false,
    minPhotos: 0,
    dated: true,
    fields: [
      {
        key: "event_type",
        type: "select",
        required: true,
        filter: true,
        options: ["Horse show", "Fair / Mela", "Race", "Auction", "Training camp", "Competition", "Other"],
      },
      { key: "venue", type: "text", max: 120, required: true },
      { key: "organiser", type: "text", max: 80, required: true },
      { key: "timing", type: "text", max: 60 },
    ],
  },
  job: {
    key: "job",
    path: "/jobs",
    priceUnits: ["per_month", "per_day", "ask"],
    priceRequired: false,
    minPhotos: 0,
    fields: [
      {
        key: "role",
        type: "select",
        required: true,
        filter: true,
        options: ["Groom", "Rider", "Trainer", "Farrier", "Stable manager", "Vet assistant", "Horse transport driver", "Other"],
      },
      { key: "job_type", type: "select", required: true, options: ["Full-time", "Part-time", "Contract"] },
      { key: "experience", type: "number", min: 0, max: 40, suffix: "years" },
      { key: "stay", type: "yesno" },
      { key: "food", type: "yesno" },
    ],
  },
  shop: {
    key: "shop",
    path: "/shop",
    priceUnits: ["fixed"],
    priceRequired: true,
    minPhotos: 1,
    fields: [
      {
        key: "category",
        type: "select",
        required: true,
        filter: true,
        options: [
          "Saddles & tack",
          "Bridles & bits",
          "Feed & supplements",
          "Grooming",
          "Rider wear",
          "Stable equipment",
          "Horse carts",
          "Other",
        ],
      },
      { key: "condition", type: "select", required: true, options: ["New", "Used"] },
      { key: "negotiable", type: "yesno" },
      { key: "delivery", type: "yesno" },
    ],
  },
  farm: {
    key: "farm",
    path: "/stud-farms",
    priceUnits: ["ask"],
    priceRequired: false,
    minPhotos: 1,
    fields: [
      { key: "breeds_kept", type: "multi", required: true, options: breedNames },
      {
        key: "services",
        type: "multi",
        required: true,
        options: ["Breeding", "Boarding / stabling", "Training", "Riding lessons", "Horse sales", "Veterinary care"],
      },
      { key: "horses_count", type: "number", min: 1, max: 1000 },
      { key: "established", type: "number", min: 1900, max: 2100 },
      { key: "visitors", type: "yesno" },
    ],
  },
  stud: {
    key: "stud",
    path: "/studs",
    priceUnits: ["per_cover", "ask"],
    priceRequired: false,
    minPhotos: 1,
    fields: [
      { key: "breed", type: "select", required: true, filter: true, options: breedNames },
      { key: "age", type: "number", min: 2, max: 30, required: true, suffix: "years" },
      { key: "height", type: "number", min: 40, max: 80, required: true, suffix: "inches" },
      { key: "colour", type: "text", max: 40, required: true },
      { key: "sire", type: "text", max: 60 },
      { key: "dam", type: "text", max: 60 },
      { key: "certificate", type: "yesno" },
    ],
  },
};

export const sectionList = sectionKeys.map((k) => sections[k]);

export const sectionByPath = (path: string) => sectionList.find((s) => s.path === path);

export const isSectionKey = (v: string): v is SectionKey => (sectionKeys as readonly string[]).includes(v);

/** The field used as the main filter and card label (e.g. vehicle, role, category) */
export const mainField = (s: SectionDef) =>
  s.fields.find((f): f is Extract<FieldDef, { type: "select" }> => f.type === "select" && !!f.filter);

/** "Saddles & tack" -> "saddles_tack" (key for translated option labels) */
export const valueKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** Today's date in India as YYYY-MM-DD (events are shown until their last day) */
export function todayInIndia(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}
