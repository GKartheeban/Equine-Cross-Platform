import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BrowseListings } from "@/components/browse-listings";
import { searchListings } from "@/lib/listings";
import { districts } from "@/lib/sample-data";

// Database results are reused for up to a minute; only the 38 districts have pages
export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return districts.map((d) => ({ district: d.slug }));
}

type Props = { params: Promise<{ district: string }> };

async function texts(slug: string) {
  const [t, o] = await Promise.all([getTranslations("browse"), getTranslations("options")]);
  const name = o(`district.${slug}`);
  return { t, o, name, heading: t("districtHeading", { district: name }) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { district: slug } = await params;
  if (!districts.some((d) => d.slug === slug)) return {};
  const { t, heading } = await texts(slug);
  return {
    title: `${heading} | EquineTrade`,
    description: t("districtMeta", { heading }),
    alternates: { canonical: `/horses-for-sale/${slug}` },
    openGraph: { title: heading, description: t("districtMeta", { heading }), images: ["/og"] },
  };
}

export default async function DistrictPage({ params }: Props) {
  const { district: slug } = await params;
  if (!districts.some((d) => d.slug === slug)) notFound();

  const [listings, { t, o, name, heading }] = await Promise.all([
    searchListings({ breed: "", district: slug, price: "", gender: "", sort: "newest" }),
    texts(slug),
  ]);

  return (
    <BrowseListings
      heading={heading}
      intro={t("districtIntro", { district: name })}
      listings={listings}
      searchHref={`/horses?district=${slug}`}
      chipsHeading={t("otherDistricts")}
      chips={districts.map((d) => ({ href: `/horses-for-sale/${d.slug}`, label: o(`district.${d.slug}`), active: d.slug === slug }))}
    />
  );
}
