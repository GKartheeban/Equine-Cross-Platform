import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { breeds, districts, priceRanges } from "@/lib/sample-data";
import { getDistrictCounts, getLatestListings } from "@/lib/listings";

// Rebuild this page at most once a minute, so new horses appear quickly
// while most visitors get an instant, cached page.
export const revalidate = 60;

const selectClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function HomePage() {
  const [latest, counts] = await Promise.all([getLatestListings(6), getDistrictCounts()]);

  // Top 8 districts: most live horses first, then fill with the big districts
  const TOP = 8;
  const withHorses = districts
    .filter((d) => (counts[d.name] ?? 0) > 0)
    .sort((a, b) => (counts[b.name] ?? 0) - (counts[a.name] ?? 0));
  const top = [...withHorses, ...districts.filter((d) => d.popular && !counts[d.name])].slice(0, TOP);
  const rest = districts.filter((d) => !top.includes(d));

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero + search */}
      <section className="py-10 sm:py-16">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Find the right horse in Tamil Nadu
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground sm:text-lg">
          Every listing shows photos, a walking video, price and location, so you
          know the horse before you travel.
        </p>

        {/* A plain GET form: works without JavaScript and loads instantly */}
        <form
          action="/horses"
          method="get"
          className="mt-8 grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:p-4"
        >
          <label className="sr-only" htmlFor="breed">Breed</label>
          <select id="breed" name="breed" defaultValue="" className={selectClass}>
            <option value="">Any breed</option>
            {breeds.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="district">District</label>
          <select id="district" name="district" defaultValue="" className={selectClass}>
            <option value="">Any district</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="price">Price</label>
          <select id="price" name="price" defaultValue="" className={selectClass}>
            <option value="">Any price</option>
            {priceRanges.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <button
            type="submit"
            className="h-11 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Search
          </button>
        </form>
      </section>

      {/* Browse by breed */}
      <section className="border-t py-8">
        <h2 className="text-lg font-semibold">Browse by breed</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {breeds.map((b) => (
            <Link
              key={b.slug}
              href={`/breeds/${b.slug}`}
              className="rounded-full border px-4 py-2 text-sm hover:border-primary hover:text-primary"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by district */}
      <section className="border-t py-8">
        <h2 className="text-lg font-semibold">Browse by district</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {top.map((d) => (
            <DistrictChip key={d.slug} slug={d.slug} name={d.name} count={counts[d.name]} />
          ))}
        </div>

        {/* Native <details>: opens without any JavaScript */}
        <details className="group mt-3">
          <summary className="inline-block cursor-pointer list-none text-sm text-primary hover:underline [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show all {districts.length} districts</span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {rest.map((d) => (
              <DistrictChip key={d.slug} slug={d.slug} name={d.name} count={counts[d.name]} />
            ))}
          </div>
        </details>
      </section>

      {/* Latest horses */}
      <section className="border-t py-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">Latest horses</h2>
          <Link href="/horses" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {latest.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((horse, i) => (
              <li key={horse.id}>
                <ListingCard horse={horse} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl border px-6 py-10 text-center">
            <p className="font-medium">No horses listed yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to post a horse for sale.</p>
            <Link
              href="/sell/new"
              className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Post your horse
            </Link>
          </div>
        )}
      </section>

      {/* Why trust us */}
      <section className="border-t py-8">
        <h2 className="text-lg font-semibold">Why buy here</h2>
        <dl className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="font-medium">Walking video on listings</dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              See how the horse moves, not just how it looks in one photo.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Talk before you travel</dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              Call or WhatsApp the seller to ask questions and get more videos first.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Verified sellers</dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              Every seller logs in with an OTP-verified mobile number, and fake listings can be reported.
            </dd>
          </div>
        </dl>
      </section>

      {/* Seller call to action */}
      <section className="my-8 rounded-xl bg-muted px-5 py-8 sm:flex sm:items-center sm:justify-between sm:px-8">
        <div>
          <h2 className="text-lg font-semibold">Selling a horse?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Post it free in a few minutes and reach buyers across Tamil Nadu.
          </p>
        </div>
        <Link
          href="/sell/new"
          className="mt-4 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:mt-0"
        >
          Post your horse
        </Link>
      </section>
    </div>
  );
}

function DistrictChip({ slug, name, count }: { slug: string; name: string; count?: number }) {
  return (
    <Link
      href={`/horses-for-sale/${slug}`}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:border-primary hover:text-primary"
    >
      {name}
      {count ? (
        <span className="text-xs tabular-nums text-muted-foreground" aria-label={`${count} horses`}>
          {count}
        </span>
      ) : null}
    </Link>
  );
}
