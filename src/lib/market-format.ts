// Turns stored post values into text in the visitor's language:
// prices ("₹45 per km"), option values ("4-horse truck" -> "4 குதிரை லாரி"),
// yes/no fields and event dates. Works on the server and in the browser.

import { breedSlug, dateLocale } from "@/lib/labels";
import { formatInr } from "@/lib/sample-data";
import { valueKey, type FieldDef, type PriceUnit, type SectionKey } from "@/lib/market-sections";
import type { DetailValue } from "@/lib/market-shape";

/** A translator, e.g. from useTranslations("market") or getTranslations("market") */
export type Translate = (key: string, values?: Record<string, string | number>) => string;

/** "₹45 per km", "Free", "Price on request" */
export function priceText(
  p: { section: SectionKey; priceInr: number | null; priceUnit: PriceUnit },
  m: Translate,
): string {
  if (p.priceUnit === "free") return m("priceFree");
  if (p.priceUnit === "ask" || p.priceInr === null) return p.section === "job" ? m("salaryAsk") : m("priceAsk");
  if (p.priceUnit === "fixed") return formatInr(p.priceInr);
  return `${formatInr(p.priceInr)} ${m(`units.${p.priceUnit}`)}`;
}

/** One stored option value in the visitor's language. Breeds use the existing breed names. */
export function optionLabel(value: string, m: Translate, o: Translate): string {
  const b = breedSlug(value);
  if (b && b !== "other") return o(`breed.${b}`);
  return m(`options.${valueKey(value)}`);
}

/** A field's value as text, or null when it wasn't filled in. */
export function fieldText(def: FieldDef, value: DetailValue | undefined, m: Translate, o: Translate): string | null {
  if (value === undefined || value === null || value === "") return null;
  switch (def.type) {
    case "select":
      return typeof value === "string" ? optionLabel(value, m, o) : null;
    case "multi":
      return Array.isArray(value) && value.length ? value.map((v) => optionLabel(v, m, o)).join(", ") : null;
    case "yesno":
      return typeof value === "boolean" ? (value ? m("form.yes") : m("form.no")) : null;
    case "number":
      return typeof value === "number" ? String(value) : null;
    case "text":
      return typeof value === "string" ? value : null;
  }
}

/** "12 Jan 2027" or "12 Jan – 14 Jan 2027" */
export function eventDateText(startsOn: string | null, endsOn: string | null, locale: string, m: Translate): string | null {
  if (!startsOn) return null;
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00+05:30`).toLocaleDateString(dateLocale(locale), {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  if (!endsOn || endsOn === startsOn) return m("eventDate", { date: fmt(startsOn) });
  return m("eventDates", { start: fmt(startsOn), end: fmt(endsOn) });
}
