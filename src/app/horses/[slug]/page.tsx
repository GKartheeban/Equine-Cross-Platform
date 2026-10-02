import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ContactSeller } from "@/components/contact-seller";
import { ListingCard } from "@/components/listing-card";
import { photoSlots } from "@/lib/horse-options";
import { getListingBySlug, getSimilarListings, type Listing } from "@/lib/listings";
import { formatInr, postedLabel } from "@/lib/sample-data";

// Rebuild each horse page at most once a minute (e.g. after it's marked sold)
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

// Loads the listing once, shared by the page and its metadata
const loadListing = cache(getListingBySlug);

// Page title, description and photo for Google and WhatsApp link previews
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const horse = await loadListing(slug);
  if (!horse) return { title: "Horse not found | EquineTrade" };
  const title = `${horse.breed} ${horse.gender.toLowerCase()} for sale in ${horse.district} – ${formatInr(horse.priceInr)}`;
  const description = `${horse.ageYears} years, ${horse.heightInches} inches, ${horse.colour}. ${horse.town}, ${horse.district}.${
    horse.description ? ` ${horse.description}` : ""
  }`;
  return {
    title: `${title} | EquineTrade`,
    description,
    openGraph: {
      title,
      description,
      images: horse.coverUrl ? [{ url: horse.coverUrl }] : undefined,
    },
  };
}

export default async function HorseDetailPage({ params }: Props) {
  const { slug } = await params;
  const horse = await loadListing(slug);
  if (!horse) notFound();

  const similar = await getSimilarListings(horse);
  const title = `${horse.breed} ${horse.gender.toLowerCase()}`;

  const facts: [string, string][] = [
    ["Breed", horse.breed],
    ["Gender", horse.gender],
    ["Age", `${horse.ageYears} years`],
    ["Height", `${horse.heightInches} inches`],
    ["Colour", horse.colour],
    ...(horse.markings ? [["Markings", horse.markings] as [string, string]] : []),
  ];
  const health: [string, string][] = [
    ["Vaccinated", horse.vaccinated ? "Yes" : "No"],
    ["Vet certificate", horse.vetCertificate ? "Available" : "Not provided"],
    ["Training", horse.trainingLevel],
    ["Handler's Experience", horse.handlerExperience],
    ...(horse.pregnant !== null ? [["Pregnant", horse.pregnant ? "Yes" : "No"] as [string, string]] : []),
  ];

  // Structured data: lets Google show price and photo in search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${title} – ${horse.district}`,
    description: horse.description ?? `${title} for sale in ${horse.town}, ${horse.district}`,
    image: Object.values(horse.photoUrls),
    offers: {
      "@type": "Offer",
      price: horse.priceInr,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 lg:pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <Link href="/horses" className="hover:text-foreground">Horses</Link>
        {" / "}
        <span className="text-foreground">{title}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left column: media and details */}
        <div className="min-w-0">
          <Media horse={horse} />

          <header className="mt-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {horse.town}, {horse.district} · Posted {postedLabel(horse.postedDaysAgo).toLowerCase()}
            </p>
            <p className="mt-3 text-2xl font-semibold lg:hidden">
              {formatInr(horse.priceInr)}
              <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">
                {horse.negotiable ? "Negotiable" : "Fixed price"}
              </span>
            </p>
          </header>

          <DetailList heading="Horse details" rows={facts} />
          <DetailList heading="Health & training" rows={health} />

          {horse.description && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">From the seller</h2>
              <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed">{horse.description}</p>
            </section>
          )}

          <section className="mt-8 rounded-xl border p-4 text-sm">
            <h2 className="font-semibold">Before you travel</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Ask the seller for a fresh video of the horse walking and trotting.</li>
              <li>Check the teeth and legs in person, ideally with a vet.</li>
              <li>Never pay an advance before seeing the horse.</li>
            </ul>
          </section>
        </div>

        {/* Right column: price and contact (sticky on laptops) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4 rounded-xl border p-5">
            <div>
              <p className="text-3xl font-semibold">{formatInr(horse.priceInr)}</p>
              <p className="text-sm text-muted-foreground">
                {horse.negotiable ? "Price negotiable" : "Fixed price"}
              </p>
            </div>
            <ContactSeller listingId={horse.id} slug={horse.slug} title={title} />
            <SellerInfo horse={horse} />
          </div>
        </aside>
      </div>

      {/* Seller info for phones */}
      <div className="mt-8 lg:hidden">
        <SellerInfo horse={horse} />
      </div>

      <p className="mt-6 text-sm">
        <Link href={`/report?listing=${horse.slug}`} className="text-muted-foreground underline hover:text-foreground">
          Report this listing
        </Link>
      </p>

      {/* Similar horses */}
      {similar.length > 0 && (
        <section className="mt-10 border-t pt-8">
          <h2 className="text-lg font-semibold">Similar horses</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((h) => (
              <li key={h.id}>
                <ListingCard horse={h} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sticky contact bar on phones */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{formatInr(horse.priceInr)}</p>
            <p className="truncate text-xs text-muted-foreground">{horse.district}</p>
          </div>
          <ContactSeller listingId={horse.id} slug={horse.slug} title={title} compact />
        </div>
      </div>
    </div>
  );
}

/** Walking video on top, then the 5 photos. Tap a photo to open it full size. */
function Media({ horse }: { horse: Listing }) {
  return (
    <div>
      {horse.videoUrl ? (
        <video
          src={horse.videoUrl}
          poster={horse.coverUrl ?? undefined}
          controls
          playsInline
          muted
          preload="metadata"
          className="aspect-video w-full rounded-xl bg-black object-contain"
        />
      ) : horse.coverUrl ? (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          <Image src={horse.coverUrl} alt={horse.breed} fill priority sizes="(min-width: 1024px) 66vw, 100vw" className="object-contain" />
        </div>
      ) : null}

      <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Photos">
        {photoSlots.map((slot) => {
          const url = horse.photoUrls[slot.key];
          return (
            <li key={slot.key} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {url ? (
                <a href={url} target="_blank" rel="noopener" aria-label={`Open ${slot.label} photo`}>
                  <Image src={url} alt={`${slot.label} view`} fill sizes="(min-width: 1024px) 13vw, 20vw" className="object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 text-center text-[10px] text-white sm:text-xs">
                    {slot.label}
                  </span>
                </a>
              ) : (
                <span className="flex size-full items-end justify-center p-1 text-center text-[10px] text-muted-foreground">
                  {slot.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DetailList({ heading, rows }: { heading: string; rows: [string, string][] }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <dl className="mt-3 grid grid-cols-1 border-t text-sm sm:grid-cols-2 sm:gap-x-8">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SellerInfo({ horse }: { horse: Listing }) {
  const listed = new Date(horse.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4 lg:border-0 lg:p-0">
      <div aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
        ✓
      </div>
      <div className="text-sm">
        <p className="font-medium">Verified seller</p>
        <p className="text-muted-foreground">Mobile number verified · Listed {listed}</p>
      </div>
    </div>
  );
}
