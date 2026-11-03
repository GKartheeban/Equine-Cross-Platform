import Link from "next/link";
import { MapPin, Phone, Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ListingCard } from "@/components/listing-card";
import { breeds, districts, formatInr, priceRanges } from "@/lib/sample-data";
import { getDistrictCounts, getLatestListings } from "@/lib/listings";
import { getSectionCounts } from "@/lib/market";
import { SectionTiles } from "@/components/section-tiles";
import { HorseshoeIcon } from "@/components/brand-logo";
import { HeroShowcase } from "@/components/hero-showcase";
import { breedSlug, districtSlug, optionKey } from "@/lib/labels";
import { HowItWorks } from "@/components/how-it-works";

// Database results are reused for up to a minute, so new horses appear quickly
// while the page stays fast.
export const revalidate = 60;

// The one official address of the Home page (for Google)
export const metadata = { alternates: { canonical: "/" } };

const selectClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function HomePage() {
  const [latest, counts, t, o, c, s, sectionCounts, m] = await Promise.all([
    getLatestListings(8),
    getDistrictCounts(),
    getTranslations("home"),
    getTranslations("options"),
    getTranslations("common"),
    getTranslations("search"),
    getSectionCounts(),
    getTranslations("market"),
  ]);

  // Top 8 districts: most live horses first, then fill with the big districts
  const TOP = 8;
  const withHorses = districts
    .filter((d) => (counts[d.name] ?? 0) > 0)
    .sort((a, b) => (counts[b.name] ?? 0) - (counts[a.name] ?? 0));
  const top = [...withHorses, ...districts.filter((d) => d.popular && !counts[d.name])].slice(0, TOP);
  const rest = districts.filter((d) => !top.includes(d));

  return (
    <div>
      {/* Hero band: cream, search on the left, the seal on the right */}
      <section className="relative overflow-hidden border-b border-[#3b2417]/[0.06] bg-[#f6efe6]">
        <HorseshoeIcon className="pointer-events-none absolute -left-24 -top-24 size-[26rem] text-[#6a361d]/[0.035]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-4 pb-24 pt-10 sm:px-6 sm:pb-28 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,580px)] lg:gap-14 lg:px-10">
          <div className="min-w-0">
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{t("title")}</h1>
            <p className="mt-3 max-w-xl text-muted-foreground sm:text-lg">{t("subtitle")}</p>

            {/* A plain GET form: works without JavaScript and loads instantly */}
            <form
              action="/horses"
              method="get"
              className="mt-8 grid gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:grid-cols-[1fr_1fr_1fr_auto] sm:p-4"
            >
              <label className="sr-only" htmlFor="breed">{s("breed")}</label>
              <select id="breed" name="breed" defaultValue="" className={selectClass}>
                <option value="">{t("anyBreed")}</option>
                {breeds.map((b) => (
                  <option key={b.slug} value={b.slug}>{o(`breed.${b.slug}`)}</option>
                ))}
              </select>

              <label className="sr-only" htmlFor="district">{s("district")}</label>
              <select id="district" name="district" defaultValue="" className={selectClass}>
                <option value="">{t("anyDistrict")}</option>
                {districts.map((d) => (
                  <option key={d.slug} value={d.slug}>{o(`district.${d.slug}`)}</option>
                ))}
              </select>

              <label className="sr-only" htmlFor="price">{s("price")}</label>
              <select id="price" name="price" defaultValue="" className={selectClass}>
                <option value="">{t("anyPrice")}</option>
                {priceRanges.map((p) => (
                  <option key={p.value} value={p.value}>{o(`price.${p.value}`)}</option>
                ))}
              </select>

              <button
                type="submit"
                className="h-11 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("search")}
              </button>
            </form>

            {/* Three promises in one quiet line */}
            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[#3b2417]">
              {(
                [
                  [Tag, 1],
                  [Phone, 2],
                  [MapPin, 3],
                ] as const
              ).map(([Icon, n], i) => (
                <li key={n} className="flex items-center gap-5">
                  {i > 0 && <span aria-hidden className="hidden size-1 rounded-full bg-[#b07a3c] sm:block" />}
                  <span className="inline-flex items-center gap-2" title={m(`benefit${n}Text`)}>
                    <Icon className="size-4 text-[#b07a3c]" aria-hidden />
                    <span className="font-medium">{m(`benefit${n}Title`)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block">
            <HeroShowcase
              items={latest
                .filter((h) => h.coverUrl)
                .map((h) => ({
                  key: h.id,
                  href: `/horses/${h.slug}`,
                  img: h.coverUrl as string,
                  price: formatInr(h.priceInr),
                  title: `${breedSlug(h.breed) ? o(`breed.${breedSlug(h.breed)}`) : h.breed} · ${o(`gender.${optionKey(h.gender)}`)}`,
                  place: districtSlug(h.district) ? o(`district.${districtSlug(h.district)}`) : h.district,
                }))}
              label={t("latestHorses")}
              viewAll={t("viewAll")}
              cta={m("closerLook")}
              viewAllHref="/horses"
            />
          </div>
        </div>
      </section>

    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <HowItWorks m={m} className="-mt-14" />


      {/* Everything else on HorseMart: transport, events, jobs, shop, stud farms, studs */}
      <div className="pb-8 [&>section]:mt-12">
        <SectionTiles
          counts={sectionCounts}
          m={m}
          heading={m("sectionsHeading")}
          horses={{
            photos: latest.map((l) => l.coverUrl).filter((u): u is string => !!u),
            count: Object.values(counts).reduce((a, b) => a + b, 0),
            breeds: breeds.slice(0, 4).map((b) => ({ slug: b.slug, label: o(`breed.${b.slug}`) })),
          }}
        />
      </div>

      {/* Browse by breed */}
      <section className="border-t py-8">
        <h2 className="text-lg font-semibold">{t("browseByBreed")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {breeds.map((b) => (
            <Link
              key={b.slug}
              href={`/breeds/${b.slug}`}
              className="rounded-full border px-4 py-2 text-sm hover:border-primary hover:text-primary"
            >
              {o(`breed.${b.slug}`)}
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by district */}
      <section className="border-t py-8">
        <h2 className="text-lg font-semibold">{t("browseByDistrict")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {top.map((d) => (
            <DistrictChip key={d.slug} slug={d.slug} label={o(`district.${d.slug}`)} count={counts[d.name]} />
          ))}
        </div>

        {/* Native <details>: opens without any JavaScript */}
        <details className="group mt-3">
          <summary className="inline-block cursor-pointer list-none text-sm text-primary hover:underline [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">{t("showAllDistricts", { count: districts.length })}</span>
            <span className="hidden group-open:inline">{t("showFewer")}</span>
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {rest.map((d) => (
              <DistrictChip key={d.slug} slug={d.slug} label={o(`district.${d.slug}`)} count={counts[d.name]} />
            ))}
          </div>
        </details>
      </section>

      {/* Latest horses */}
      <section className="border-t py-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">{t("latestHorses")}</h2>
          <Link href="/horses" className="text-sm text-primary hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        {latest.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((horse, i) => (
              <li key={horse.id}>
                <ListingCard horse={horse} priority={i < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl border px-6 py-10 text-center">
            <p className="font-medium">{t("noHorsesTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("noHorsesText")}</p>
            <Link
              href="/sell/new"
              className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              {c("postYourHorse")}
            </Link>
          </div>
        )}
      </section>

      {/* Why trust us */}
      <section className="border-t py-8">
        <h2 className="text-lg font-semibold">{t("whyBuyHere")}</h2>
        <dl className="mt-4 grid gap-6 sm:grid-cols-3">
          {([1, 2, 3] as const).map((n) => (
            <div key={n}>
              <dt className="font-medium">{t(`why${n}Title`)}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{t(`why${n}Text`)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
    </div>
  );
}

function DistrictChip({ slug, label, count }: { slug: string; label: string; count?: number }) {
  return (
    <Link
      href={`/horses-for-sale/${slug}`}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:border-primary hover:text-primary"
    >
      {label}
      {count ? <span className="text-xs tabular-nums text-muted-foreground">{count}</span> : null}
    </Link>
  );
}
