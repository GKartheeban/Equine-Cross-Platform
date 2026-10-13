import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BrowseListings } from "@/components/browse-listings";
import { searchListings } from "@/lib/listings";
import { breeds } from "@/lib/sample-data";

// Database results are reused for up to a minute; only our 7 breeds have pages
export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return breeds.map((b) => ({ breed: b.slug }));
}

type Props = { params: Promise<{ breed: string }> };

async function texts(slug: string) {
  const [t, o, intro] = await Promise.all([
    getTranslations("browse"),
    getTranslations("options"),
    getTranslations("breedIntro"),
  ]);
  const name = o(`breed.${slug}`);
  const heading = t("breedHeading", { breed: name });
  return { t, o, name, heading, intro: intro(slug) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { breed: slug } = await params;
  if (!breeds.some((b) => b.slug === slug)) return {};
  const { t, heading, intro } = await texts(slug);
  return {
    title: `${heading} | HorseMart`,
    description: `${t("breedMeta", { heading })} ${intro}`,
    alternates: { canonical: `/breeds/${slug}` },
    openGraph: { title: heading, description: intro, images: ["/og"] },
  };
}

export default async function BreedPage({ params }: Props) {
  const { breed: slug } = await params;
  if (!breeds.some((b) => b.slug === slug)) notFound();

  const [listings, { t, o, heading, intro }] = await Promise.all([
    searchListings({ breed: slug, district: "", price: "", gender: "", sort: "newest" }),
    texts(slug),
  ]);

  return (
    <BrowseListings
      heading={heading}
      intro={intro}
      listings={listings}
      searchHref={`/horses?breed=${slug}`}
      chipsHeading={t("otherBreeds")}
      chips={breeds.map((b) => ({ href: `/breeds/${b.slug}`, label: o(`breed.${b.slug}`), active: b.slug === slug }))}
    />
  );
}
