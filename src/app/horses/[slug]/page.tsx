import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { cache } from "react";
import { ContactSeller } from "@/components/contact-seller";
import { ListingCard } from "@/components/listing-card";
import { SaveButton } from "@/components/save-button";
import { TrackEvent } from "@/components/track-event";
import { MediaGallery } from "@/components/media-gallery";
import { breedSlug, dateLocale, districtSlug, optionKey } from "@/lib/labels";
import {
  getListingBySlug,
  getSellerProfile,
  getSimilarListings,
  type Listing,
  type SellerProfile,
} from "@/lib/listings";
import { formatInr } from "@/lib/sample-data";

// Database results are reused for up to a minute (e.g. after it's marked sold)
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

// Loads the listing once, shared by the page and its metadata
const loadListing = cache(getListingBySlug);

/** Breed, gender, district, training, handler shown in the visitor's language. */
async function labelsFor(horse: Listing) {
  const o = await getTranslations("options");
  const b = breedSlug(horse.breed);
  const d = districtSlug(horse.district);
  return {
    breed: b ? o(`breed.${b}`) : horse.breed,
    gender: o(`gender.${optionKey(horse.gender)}`),
    district: d ? o(`district.${d}`) : horse.district,
    training: horse.trainingLevels.map((v) => o(`training.${optionKey(v)}`)).join(", "),
    handler: o(`handler.${optionKey(horse.handlerExperience)}`),
  };
}

// Page title, description and photo for Google and WhatsApp link previews
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const horse = await loadListing(slug);
  const t = await getTranslations("detail");
  if (!horse) return { title: `${t("notFound")} | EquineTrade` };
  const [l, c] = await Promise.all([labelsFor(horse), getTranslations("common")]);
  const title = t("metaTitle", { breed: l.breed, gender: l.gender, district: l.district, price: formatInr(horse.priceInr) });
  const description = `${c("yearsLong", { count: horse.ageYears })}, ${c("inches", { count: horse.heightInches })}, ${horse.colour}. ${horse.town}, ${l.district}.${
    horse.description ? ` ${horse.description}` : ""
  }`;
  return {
    title: `${title} | EquineTrade`,
    description,
    alternates: { canonical: `/horses/${horse.slug}` },
    openGraph: { type: "article", title, description, images: horse.coverUrl ? [{ url: horse.coverUrl }] : undefined },
  };
}

export default async function HorseDetailPage({ params }: Props) {
  const { slug } = await params;
  const horse = await loadListing(slug);
  if (!horse) notFound();

  const [similar, seller, l, t, c, locale] = await Promise.all([
    getSimilarListings(horse),
    getSellerProfile(horse.sellerId),
    labelsFor(horse),
    getTranslations("detail"),
    getTranslations("common"),
    getLocale(),
  ]);
  const title = `${l.breed} · ${l.gender}`;
  const posted = horse.postedDaysAgo === 0 ? c("today") : c("daysAgo", { count: horse.postedDaysAgo });

  const facts: [string, string][] = [
    [t("breed"), l.breed],
    [t("gender"), l.gender],
    [t("age"), c("yearsLong", { count: horse.ageYears })],
    [t("height"), c("inches", { count: horse.heightInches })],
    [t("colour"), horse.colour],
    ...(horse.markings ? [[t("markings"), horse.markings] as [string, string]] : []),
  ];
  const health: [string, string][] = [
    [t("vaccinated"), horse.vaccinated ? c("yes") : c("no")],
    [t("vetCertificate"), horse.vetCertificate ? t("available") : t("notProvided")],
    [t("training"), l.training],
    [t("handler"), l.handler],
    ...(horse.pregnant !== null ? [[t("pregnant"), horse.pregnant ? c("yes") : c("no")] as [string, string]] : []),
  ];

  // Structured data (always English): lets Google show price and photo in search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${horse.breed} ${horse.gender.toLowerCase()} – ${horse.district}`,
    description: horse.description ?? `${horse.breed} ${horse.gender.toLowerCase()} for sale in ${horse.town}, ${horse.district}`,
    image: horse.media.filter((m) => m.type === "photo").map((m) => m.url),
    offers: {
      "@type": "Offer",
      price: horse.priceInr,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  // Plain English title for the WhatsApp message, so sellers recognise their horse either way
  const whatsappTitle = `${horse.breed} ${horse.gender.toLowerCase()}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 lg:pb-12">
      {/* Counts one view per visit, for the admin dashboard */}
      <TrackEvent type="view" onceKey={`view:${horse.id}`} listingId={horse.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">{c("home")}</Link>
        {" / "}
        <Link href="/horses" className="hover:text-foreground">{c("horses")}</Link>
        {" / "}
        <span className="text-foreground">{title}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Left column: media and details */}
        <div className="min-w-0">
          <Media horse={horse} t={t} />

          <header className="mt-6">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              <SaveButton listingId={horse.id} slug={horse.slug} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {horse.town}, {l.district} · {t("posted", { when: posted })}
            </p>
            <p className="mt-3 text-2xl font-semibold lg:hidden">
              {formatInr(horse.priceInr)}
              <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">
                {horse.negotiable ? c("negotiable") : c("fixedPrice")}
              </span>
            </p>
          </header>

          <DetailList heading={t("horseDetails")} rows={facts} />
          <DetailList heading={t("healthTraining")} rows={health} />

          {horse.description && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">{t("fromSeller")}</h2>
              <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed">{horse.description}</p>
            </section>
          )}

          <section className="mt-8 rounded-xl border p-4 text-sm">
            <h2 className="font-semibold">{t("beforeTravel")}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>{t("tip1")}</li>
              <li>{t("tip2")}</li>
              <li>{t("tip3")}</li>
            </ul>
          </section>
        </div>

        {/* Right column: price and contact (sticky on laptops) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4 rounded-xl border p-5">
            <div>
              <p className="text-3xl font-semibold">{formatInr(horse.priceInr)}</p>
              <p className="text-sm text-muted-foreground">
                {horse.negotiable ? c("priceNegotiable") : c("fixedPrice")}
              </p>
            </div>
            <ContactSeller listingId={horse.id} slug={horse.slug} title={whatsappTitle} />
            <SellerInfo horse={horse} seller={seller} t={t} locale={locale} />
          </div>
        </aside>
      </div>

      {/* Seller info for phones */}
      <div className="mt-8 lg:hidden">
        <SellerInfo horse={horse} seller={seller} t={t} locale={locale} />
      </div>

      <p className="mt-6 text-sm">
        <Link href={`/report?listing=${horse.slug}`} className="text-muted-foreground underline hover:text-foreground">
          {t("report")}
        </Link>
      </p>

      {/* Similar horses */}
      {similar.length > 0 && (
        <section className="mt-10 border-t pt-8">
          <h2 className="text-lg font-semibold">{t("similar")}</h2>
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
            <p className="truncate text-xs text-muted-foreground">{l.district}</p>
          </div>
          <ContactSeller listingId={horse.id} slug={horse.slug} title={whatsappTitle} compact />
        </div>
      </div>
    </div>
  );
}

// A translator for the "detail" texts, passed to the small parts below
type T = (key: string, values?: Record<string, string | number>) => string;

/** All photos and videos: one big, the rest underneath. */
function Media({ horse, t }: { horse: Listing; t: T }) {
  return (
    <MediaGallery
      items={horse.media}
      alt={horse.breed}
      labels={{ photo: t("photo"), video: t("video"), noMedia: t("noMedia"), previous: t("previous"), next: t("next") }}
    />
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

function SellerInfo({ horse, seller, t, locale }: { horse: Listing; seller: SellerProfile; t: T; locale: string }) {
  const fmt = (iso: string, withDay = true) =>
    new Date(iso).toLocaleDateString(
      dateLocale(locale),
      withDay ? { day: "numeric", month: "short", year: "numeric" } : { month: "short", year: "numeric" },
    );
  // Show a notice for 30 days after the seller changed their name
  const recentNameChange =
    seller.nameChangedAt && Date.now() - new Date(seller.nameChangedAt).getTime() < 30 * 86_400_000;

  return (
    <div className="rounded-xl border p-4 lg:border-0 lg:p-0">
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
          {seller.avatarUrl ? (
            <Image src={seller.avatarUrl} alt={seller.name ?? t("verifiedSeller")} fill sizes="48px" className="object-cover" />
          ) : (
            <span aria-hidden className="flex size-full items-center justify-center font-semibold text-muted-foreground">
              {seller.name ? seller.name.charAt(0).toUpperCase() : "S"}
            </span>
          )}
        </div>
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium">{seller.name ?? t("verifiedSeller")}</p>
          {seller.memberSince && (
            <p className="text-muted-foreground">{t("memberSince", { date: fmt(seller.memberSince, false) })}</p>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("listed", { date: fmt(horse.createdAt) })}</p>
      {recentNameChange && seller.nameChangedAt && (
        <p className="mt-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
          {t("nameChanged", { date: fmt(seller.nameChangedAt) })}
        </p>
      )}
    </div>
  );
}
