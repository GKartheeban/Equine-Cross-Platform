import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { breeds, districts, priceRanges } from "@/lib/sample-data";
import { genders } from "@/lib/horse-options";
import { searchListings } from "@/lib/listings";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Props = { searchParams: SearchParams };

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

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

const breedName = (slug: string) => breeds.find((b) => b.slug === slug)?.name;
const districtName = (slug: string) => districts.find((d) => d.slug === slug)?.name;
const priceLabel = (v: string) => priceRanges.find((p) => p.value === v)?.label;

// Builds a readable heading, e.g. "Marwari horses for sale in Madurai"
function headingFor(f: Filters) {
  const breed = breedName(f.breed);
  const district = districtName(f.district);
  return `${breed ? `${breed} horses` : "Horses"} for sale in ${district ?? "Tamil Nadu"}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const f = await readFilters(searchParams);
  return {
    title: `${headingFor(f)} | EquineTrade`,
    description: `Browse ${headingFor(f).toLowerCase()} with photos, walking videos, prices and seller chat.`,
  };
}

const selectClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function SearchPage({ searchParams }: Props) {
  const f = await readFilters(searchParams);
  const results = await searchListings(f);

  // Chips showing active filters, each with a link that removes it
  const active = (
    [
      ["breed", breedName(f.breed)],
      ["district", districtName(f.district)],
      ["price", priceLabel(f.price)],
      ["gender", f.gender || undefined],
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
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{headingFor(f)}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "horse" : "horses"} found
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filters: collapsible on phones, always open on laptops */}
        {/* Closed by default on phones so results show first; on laptops the
            content is forced visible (older browsers just need one click). */}
        <details className="group self-start rounded-xl border lg:[&::details-content]:[content-visibility:visible] lg:[&::details-content]:block">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
            <span>
              Filters
              {active.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {active.length}
                </span>
              )}
            </span>
            <span className="text-muted-foreground lg:hidden">
              <span className="group-open:hidden">Show</span>
              <span className="hidden group-open:inline">Hide</span>
            </span>
          </summary>

          <form action="/horses" method="get" className="grid gap-4 border-t p-4">
            <Field label="Breed" id="breed">
              <select id="breed" name="breed" defaultValue={f.breed} className={selectClass}>
                <option value="">Any breed</option>
                {breeds.map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </Field>

            <Field label="District" id="district">
              <select id="district" name="district" defaultValue={f.district} className={selectClass}>
                <option value="">Any district</option>
                {districts.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Price" id="price">
              <select id="price" name="price" defaultValue={f.price} className={selectClass}>
                <option value="">Any price</option>
                {priceRanges.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Gender" id="gender">
              <select id="gender" name="gender" defaultValue={f.gender} className={selectClass}>
                <option value="">Any gender</option>
                {genders.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>

            <Field label="Sort by" id="sort">
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
                Show results
              </button>
              <Link
                href="/horses"
                className="flex h-11 items-center rounded-lg border px-4 text-sm hover:bg-muted"
              >
                Clear
              </Link>
            </div>
          </form>
        </details>

        {/* Results */}
        <div className="min-w-0">
          {active.length > 0 && (
            <ul className="mb-4 flex flex-wrap gap-2" aria-label="Active filters">
              {active.map(([key, label]) => (
                <li key={key}>
                  <Link
                    href={urlWithout(key)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hover:border-primary"
                    aria-label={`Remove filter ${label}`}
                  >
                    {label} <span aria-hidden className="text-muted-foreground">×</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {results.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((horse) => (
                <li key={horse.slug}>
                  <ListingCard horse={horse} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border px-6 py-12 text-center">
              <p className="font-medium">No horses match these filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a nearby district, a wider price range, or clear the filters.
              </p>
              <Link
                href="/horses"
                className="mt-4 inline-block rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Clear all filters
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
