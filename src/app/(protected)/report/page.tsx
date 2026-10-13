import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getListingBySlug } from "@/lib/listings";
import { breedSlug, districtSlug, optionKey } from "@/lib/labels";
import { formatInr } from "@/lib/sample-data";
import { ReportForm } from "./report-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("report");
  return { title: `${t("metaTitle")} | HorseMart`, robots: { index: false } };
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ReportPage({ searchParams }: Props) {
  const raw = (await searchParams).listing;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  const listing = slug ? await getListingBySlug(slug) : null;
  const t = await getTranslations("report");
  const o = await getTranslations("options");
  const tc = await getTranslations("common");

  if (!listing) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">{t("notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("notFoundText")}
        </p>
        <Link href="/horses" className="mt-6 inline-block rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
          {tc("browseHorses")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {breedSlug(listing.breed) ? o(`breed.${breedSlug(listing.breed)}`) : listing.breed}{" "}
        {o(`gender.${optionKey(listing.gender)}`).toLowerCase()} · {formatInr(listing.priceInr)} ·{" "}
        {districtSlug(listing.district) ? o(`district.${districtSlug(listing.district)}`) : listing.district}
      </p>
      <ReportForm listingId={listing.id} slug={listing.slug} />
    </div>
  );
}
