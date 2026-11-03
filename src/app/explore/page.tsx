import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MarketCard } from "@/components/market-card";
import { getLatestPosts, getSectionCounts } from "@/lib/market";
import { SectionTiles } from "@/components/section-tiles";
import { getDistrictCounts, getLatestListings } from "@/lib/listings";
import { breeds } from "@/lib/sample-data";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("market");
  return {
    title: `${m("exploreTitle")} | HorseMart`,
    description: m("exploreMeta"),
    alternates: { canonical: "/explore" },
    openGraph: { title: m("exploreTitle"), description: m("exploreMeta"), images: ["/og"] },
  };
}

/** Hub of everything on HorseMart: horses plus the six other sections. */
export default async function ExplorePage() {
  const [counts, latest, m, o, horses, districtCounts] = await Promise.all([
    getSectionCounts(),
    getLatestPosts(8),
    getTranslations("market"),
    getTranslations("options"),
    getLatestListings(6),
    getDistrictCounts(),
  ]);

  const horseCount = Object.values(districtCounts).reduce((a, b) => a + b, 0);
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:px-10">
      {/* Short heading: this page is simply the list of everything HorseMart offers */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a5a2e]">{m("nav")}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance text-[#2b1a10] sm:text-4xl">{m("exploreTitle")}</h1>
          <p className="mt-3 text-[#7a5d4c] sm:text-lg">{m("exploreIntro")}</p>
        </div>
        <Link
          href="/sell"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:self-auto"
        >
          <Plus className="size-4" aria-hidden />
          {m("postAnything")}
        </Link>
      </div>

      <SectionTiles
        counts={counts}
        m={m}
        horses={{
          photos: horses.map((l) => l.coverUrl).filter((u): u is string => !!u),
          count: horseCount,
          breeds: breeds.slice(0, 4).map((b) => ({ slug: b.slug, label: o(`breed.${b.slug}`) })),
        }}
      />

      {latest.length > 0 && (
        <section className="mt-16 border-t pt-10">
          <h2 className="text-xl font-semibold tracking-tight">{m("latestHeading")}</h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((post, i) => (
              <li key={post.id}>
                <MarketCard post={post} priority={i < 4} showSection />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
