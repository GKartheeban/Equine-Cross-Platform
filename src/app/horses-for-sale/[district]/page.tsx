import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrowseListings } from "@/components/browse-listings";
import { searchListings } from "@/lib/listings";
import { districts } from "@/lib/sample-data";

// Refresh at most once a minute; all 38 district pages are built ahead of time
export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return districts.map((d) => ({ district: d.slug }));
}

type Props = { params: Promise<{ district: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { district: slug } = await params;
  const district = districts.find((d) => d.slug === slug);
  if (!district) return {};
  const title = `Horses for sale in ${district.name}`;
  return {
    title: `${title} | EquineTrade`,
    description: `${title}, Tamil Nadu. Marwari, Kathiawari, country horses and more, with photos, walking videos and prices. Call or WhatsApp sellers directly.`,
  };
}

export default async function DistrictPage({ params }: Props) {
  const { district: slug } = await params;
  const district = districts.find((d) => d.slug === slug);
  if (!district) notFound();

  const listings = await searchListings({ breed: "", district: slug, price: "", gender: "", sort: "newest" });

  return (
    <BrowseListings
      heading={`Horses for sale in ${district.name}`}
      intro={`Horses listed by sellers in and around ${district.name}. See each horse's photos and walking video, then call or WhatsApp the seller before you travel.`}
      listings={listings}
      searchHref={`/horses?district=${slug}`}
      chipsHeading="Other districts"
      chips={districts.map((d) => ({ href: `/horses-for-sale/${d.slug}`, label: d.name, active: d.slug === slug }))}
    />
  );
}
