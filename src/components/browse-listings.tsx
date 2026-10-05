import Link from "next/link";
import { useTranslations } from "next-intl";
import { ListingCard } from "@/components/listing-card";
import type { Listing } from "@/lib/listings";

type Chip = { href: string; label: string; active?: boolean };

/** Shared layout for the Breed and District pages. */
export function BrowseListings({
  heading,
  intro,
  listings,
  searchHref,
  chipsHeading,
  chips,
}: {
  heading: string;
  intro: string;
  listings: Listing[];
  searchHref: string;
  chipsHeading: string;
  chips: Chip[];
}) {
  const t = useTranslations("browse");
  const c = useTranslations("common");
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">{c("home")}</Link>
        {" / "}
        <Link href="/horses" className="hover:text-foreground">{c("horses")}</Link>
        {" / "}
        <span className="text-foreground">{heading}</span>
      </nav>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{heading}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t("forSale", { count: listings.length })}</p>
        <Link href={searchHref} className="text-sm text-primary hover:underline">
          {t("filterMore")}
        </Link>
      </div>

      {listings.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((horse, i) => (
            <li key={horse.id}>
              <ListingCard horse={horse} priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border px-6 py-12 text-center">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyText")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/horses" className="rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
              {c("browseHorses")}
            </Link>
            <Link href="/sell/new" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              {c("postYourHorse")}
            </Link>
          </div>
        </div>
      )}

      <section className="mt-10 border-t pt-8">
        <h2 className="text-lg font-semibold">{chipsHeading}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              aria-current={chip.active ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm hover:border-primary hover:text-primary ${
                chip.active ? "border-primary text-primary" : ""
              }`}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
