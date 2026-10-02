import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import {
  formatInr,
  getListing,
  latestListings,
  photoAngles,
  postedLabel,
} from "@/lib/sample-data";

type Props = { params: Promise<{ slug: string }> };

// Page title and description for Google and WhatsApp link previews
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const horse = getListing(slug);
  if (!horse) return { title: "Horse not found – EquineTrade" };
  const title = `${horse.breed} ${horse.gender.toLowerCase()} for sale in ${horse.district} – ${formatInr(horse.priceInr)}`;
  return {
    title: `${title} | EquineTrade`,
    description: `${horse.ageYears} years, ${horse.heightInches} inches, ${horse.colour}. ${horse.description}`,
    openGraph: { title, description: horse.description },
  };
}

export default async function HorseDetailPage({ params }: Props) {
  const { slug } = await params;
  const horse = getListing(slug);
  if (!horse) notFound();

  const title = `${horse.breed} ${horse.gender.toLowerCase()}`;
  const similar = latestListings
    .filter((l) => l.slug !== horse.slug)
    .sort((a, b) => Number(b.breed === horse.breed) - Number(a.breed === horse.breed))
    .slice(0, 3);

  const facts: [string, string][] = [
    ["Breed", horse.breed],
    ["Gender", horse.gender],
    ["Age", `${horse.ageYears} years`],
    ["Height", `${horse.heightInches} inches`],
    ["Colour", horse.colour],
    ["Markings", horse.markings],
  ];
  const health: [string, string][] = [
    ["Vaccinated", horse.vaccinated ? "Yes" : "No"],
    ["Vet certificate", horse.vetCertificate ? "Available" : "Not provided"],
    ["Training", horse.trainingLevel],
    ["Handler's Experience", horse.handlerExperience],
  ];

  // Structured data: lets Google show price and availability in search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${title} – ${horse.district}`,
    description: horse.description,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
          {/* Walking video (placeholder) */}
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
            {horse.hasVideo ? "▶ Walking video" : "No video yet"}
          </div>

          {/* Photo angles */}
          <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Photos">
            {photoAngles.map((angle) => (
              <li
                key={angle}
                className="flex aspect-square items-end justify-center rounded-lg bg-muted p-1 text-center text-[11px] leading-tight text-muted-foreground sm:text-xs"
              >
                {angle}
              </li>
            ))}
          </ul>

          {/* Title block (on phones it sits here; on laptops price is in the side panel too) */}
          <header className="mt-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {horse.town}, {horse.district} · Posted {postedLabel(horse.postedDaysAgo)} · {horse.views} views
            </p>
            <p className="mt-3 text-2xl font-semibold lg:hidden">
              {formatInr(horse.priceInr)}
              {horse.negotiable && (
                <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">Negotiable</span>
              )}
            </p>
          </header>

          <DetailList heading="Horse details" rows={facts} />
          <DetailList heading="Health & training" rows={health} />

          <section className="mt-8">
            <h2 className="text-lg font-semibold">From the seller</h2>
            <p className="mt-2 max-w-prose leading-relaxed">{horse.description}</p>
          </section>

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
            <ContactButtons slug={horse.slug} />
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
      <section className="mt-10 border-t pt-8">
        <h2 className="text-lg font-semibold">Similar horses</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((h) => (
            <li key={h.slug}>
              <ListingCard horse={h} />
            </li>
          ))}
        </ul>
      </section>

      {/* Sticky contact bar on phones */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{formatInr(horse.priceInr)}</p>
            <p className="truncate text-xs text-muted-foreground">{horse.district}</p>
          </div>
          <Link
            href={`/saved?add=${horse.slug}`}
            className="rounded-lg border px-4 py-3 text-sm font-medium"
          >
            Save
          </Link>
          <Link
            href={`/chats?listing=${horse.slug}`}
            className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Chat with seller
          </Link>
        </div>
      </div>
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

function ContactButtons({ slug }: { slug: string }) {
  return (
    <div className="grid gap-2">
      <Link
        href={`/chats?listing=${slug}`}
        className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Chat with seller
      </Link>
      <Link
        href={`/saved?add=${slug}`}
        className="rounded-lg border px-4 py-3 text-center text-sm font-medium hover:bg-muted"
      >
        Save horse
      </Link>
    </div>
  );
}

function SellerInfo({ horse }: { horse: { seller: { name: string; memberSince: string; listings: number } } }) {
  const { seller } = horse;
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4 lg:border-0 lg:p-0">
      <div
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold"
      >
        {seller.name.charAt(0)}
      </div>
      <div className="text-sm">
        <p className="font-medium">{seller.name}</p>
        <p className="text-muted-foreground">
          Member since {seller.memberSince} · {seller.listings} {seller.listings === 1 ? "listing" : "listings"}
        </p>
      </div>
    </div>
  );
}
