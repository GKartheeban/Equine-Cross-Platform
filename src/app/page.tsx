import Link from "next/link";
import {
  breeds,
  districts,
  priceRanges,
  latestListings,
  formatInr,
  type Listing,
} from "@/lib/sample-data";

const selectClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function HomePage() {
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
          {districts
            .filter((d) => d.popular)
            .map((d) => (
              <DistrictChip key={d.slug} slug={d.slug} name={d.name} />
            ))}
        </div>

        {/* Native <details>: opens without any JavaScript */}
        <details className="group mt-3">
          <summary className="inline-block cursor-pointer list-none text-sm text-primary hover:underline [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show all {districts.length} districts</span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {districts
              .filter((d) => !d.popular)
              .map((d) => (
                <DistrictChip key={d.slug} slug={d.slug} name={d.name} />
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
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestListings.map((horse) => (
            <li key={horse.slug}>
              <ListingCard horse={horse} />
            </li>
          ))}
        </ul>
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
            <dt className="font-medium">Chat before you travel</dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              Ask the seller questions and request more photos first.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Listings are checked</dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              Every listing is reviewed, and fake ones can be reported.
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

function DistrictChip({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/horses-for-sale/${slug}`}
      className="rounded-full border px-4 py-2 text-sm hover:border-primary hover:text-primary"
    >
      {name}
    </Link>
  );
}

function ListingCard({ horse }: { horse: Listing }) {
  return (
    <Link
      href={`/horses/${horse.slug}`}
      className="group block overflow-hidden rounded-xl border hover:border-primary/60"
    >
      {/* Photo placeholder until real images come from storage */}
      <div className="relative flex aspect-[4/3] items-center justify-center bg-muted text-sm text-muted-foreground">
        Photo
        {horse.hasVideo && (
          <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
            ▶ Video
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-base font-semibold">{formatInr(horse.priceInr)}</p>
        <p className="mt-0.5 font-medium group-hover:text-primary">
          {horse.breed} {horse.gender.toLowerCase()}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {horse.ageYears} yrs · {horse.heightInches}″ · {horse.colour}
        </p>
        <p className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{horse.district}</span>
          <span>
            {horse.postedDaysAgo === 1 ? "1 day ago" : `${horse.postedDaysAgo} days ago`}
          </span>
        </p>
      </div>
    </Link>
  );
}
