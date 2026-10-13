import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ListingCard } from "@/components/listing-card";
import { TrackEvent } from "@/components/track-event";
import { breeds, districts, priceRanges } from "@/lib/sample-data";
import { genders } from "@/lib/horse-options";
import { optionKey } from "@/lib/labels";
import { searchListings } from "@/lib/listings";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Props = { searchParams: SearchParams };

// Reads one value from the URL, e.g. /horses?breed=marwari
function pick(params: Record<string, string | string[] | undefined>, key: string) {
  const v = params[key];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

async function readFilters(searchParams: SearchParams) {
  const p = await searchParams;
  return {
    breed: pick(p, "breed"),
    district: pick(p, "district"),
    price: pick(p, "price"),
    gender: pick(p, "gender"),
    sort: pick(p, "sort") || "newest",
  };
}
type Filters = Awaited<ReturnType<typeof readFilters>>;

const isBreed = (slug: string) => breeds.some((b) => b.slug === slug);
const isDistrict = (slug: string) => districts.some((d) => d.slug === slug);
const isPrice = (v: string) => priceRanges.some((p) => p.value === v);

// Builds a readable heading in the visitor's language,
// e.g. "Marwari horses for sale in Madurai" / "மதுரை — விற்பனைக்கு மார்வாரி குதிரைகள்"
async function headingFor(f: Filters) {
  const [t, o] = await Promise.all([getTranslations("search"), getTranslations("options")]);
  return t("heading", {
    breed: isBreed(f.breed) ? o(`breed.${f.breed}`) : "none",
    district: isDistrict(f.district) ? o(`district.${f.district}`) : t("tamilNadu"),
  });
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const f = await readFilters(searchParams);
  const [heading, t] = await Promise.all([headingFor(f), getTranslations("search")]);
  return {
    title: `${heading} | HorseMart`,
    description: t("metaDescription", { heading }),
    // Filtered results all point Google to the main list (breed and district
    // pages have their own addresses for those searches)
    alternates: { canonical: "/horses" },
    openGraph: { title: heading, description: t("metaDescription", { heading }), images: ["/og"] },
  };
}

const selectClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function SearchPage({ searchParams }: Props) {
  const f = await readFilters(searchParams);
  const [results, heading, t, o] = await Promise.all([
    searchListings(f),
    headingFor(f),
    getTranslations("search"),
    getTranslations("options"),
  ]);

  const sortOptions = [
    { value: "newest", label: t("newest") },
    { value: "price-asc", label: t("priceAsc") },
    { value: "price-desc", label: t("priceDesc") },
  ];

  // Chips showing active filters, each with a link that removes it
  const active = (
    [
      ["breed", isBreed(f.breed) ? o(`breed.${f.breed}`) : undefined],
      ["district", isDistrict(f.district) ? o(`district.${f.district}`) : undefined],
      ["price", isPrice(f.price) ? o(`price.${f.price}`) : undefined],
      ["gender", f.gender ? o(`gender.${optionKey(f.gender)}`) : undefined],
    ] as const
  ).filter(([, label]) => label);

  const urlWithout = (key: string) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) {
      if (k !== key && v && !(k === "sort" && v === "newest")) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/horses?${qs}` : "/horses";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Records what buyers search for (only searches with filters), for the admin dashboard */}
      {(f.breed || f.district || f.price || f.gender) && (
        <TrackEvent
          type="search"
          onceKey={`search:${f.breed}|${f.district}|${f.price}|${f.gender}`}
          props={{
            breed: f.breed,
            district: f.district,
            price: f.price,
            gender: f.gender,
            results: String(results.length),
          }}
        />
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{heading}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("found", { count: results.length })}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Closed by default on phones so results show first; on laptops the
            content is forced visible (older browsers just need one click). */}
        <details className="group self-start rounded-xl border lg:[&::details-content]:[content-visibility:visible] lg:[&::details-content]:block">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
            <span>
              {t("filters")}
              {active.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {active.length}
                </span>
              )}
            </span>
            <span className="text-muted-foreground lg:hidden">
              <span className="group-open:hidden">{t("show")}</span>
              <span className="hidden group-open:inline">{t("hide")}</span>
            </span>
          </summary>

          <form action="/horses" method="get" className="grid gap-4 border-t p-4">
            <Field label={t("breed")} id="breed">
              <select id="breed" name="breed" defaultValue={f.breed} className={selectClass}>
                <option value="">{t("anyBreed")}</option>
                {breeds.map((b) => (
                  <option key={b.slug} value={b.slug}>{o(`breed.${b.slug}`)}</option>
                ))}
              </select>
            </Field>

            <Field label={t("district")} id="district">
              <select id="district" name="district" defaultValue={f.district} className={selectClass}>
                <option value="">{t("anyDistrict")}</option>
                {districts.map((d) => (
                  <option key={d.slug} value={d.slug}>{o(`district.${d.slug}`)}</option>
                ))}
              </select>
            </Field>

            <Field label={t("price")} id="price">
              <select id="price" name="price" defaultValue={f.price} className={selectClass}>
                <option value="">{t("anyPrice")}</option>
                {priceRanges.map((p) => (
                  <option key={p.value} value={p.value}>{o(`price.${p.value}`)}</option>
                ))}
              </select>
            </Field>

            <Field label={t("gender")} id="gender">
              <select id="gender" name="gender" defaultValue={f.gender} className={selectClass}>
                <option value="">{t("anyGender")}</option>
                {genders.map((g) => (
                  <option key={g} value={g}>{o(`gender.${optionKey(g)}`)}</option>
                ))}
              </select>
            </Field>

            <Field label={t("sortBy")} id="sort">
              <select id="sort" name="sort" defaultValue={f.sort} className={selectClass}>
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>

            <div className="flex gap-2">
              <button
                type="submit"
                className="h-11 flex-1 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t("showResults")}
              </button>
              <Link href="/horses" className="flex h-11 items-center rounded-lg border px-4 text-sm hover:bg-muted">
                {t("clear")}
              </Link>
            </div>
          </form>
        </details>

        {/* Results */}
        <div className="min-w-0">
          {active.length > 0 && (
            <ul className="mb-4 flex flex-wrap gap-2" aria-label={t("filters")}>
              {active.map(([key, label]) => (
                <li key={key}>
                  <Link
                    href={urlWithout(key)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:border-primary"
                    aria-label={t("removeFilter", { label: label ?? "" })}
                  >
                    {label} <span aria-hidden className="text-muted-foreground">×</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {results.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((horse, i) => (
                <li key={horse.id}>
                  <ListingCard horse={horse} priority={i < 3} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border px-6 py-12 text-center">
              <p className="font-medium">{t("noMatchTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("noMatchText")}</p>
              <Link href="/horses" className="mt-4 inline-block rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                {t("clearAll")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
