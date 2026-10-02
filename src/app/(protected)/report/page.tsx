import type { Metadata } from "next";
import Link from "next/link";
import { getListingBySlug } from "@/lib/listings";
import { formatInr } from "@/lib/sample-data";
import { ReportForm } from "./report-form";

export const metadata: Metadata = {
  title: "Report a listing | EquineTrade",
  robots: { index: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ReportPage({ searchParams }: Props) {
  const raw = (await searchParams).listing;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  const listing = slug ? await getListingBySlug(slug) : null;

  if (!listing) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This horse may already be sold or removed. Thank you for helping keep EquineTrade safe.
        </p>
        <Link href="/horses" className="mt-6 inline-block rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
          Browse horses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Report this listing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {listing.breed} {listing.gender.toLowerCase()} · {formatInr(listing.priceInr)} · {listing.district}
      </p>
      <ReportForm listingId={listing.id} slug={listing.slug} />
    </div>
  );
}
