import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrowseListings } from "@/components/browse-listings";
import { searchListings } from "@/lib/listings";
import { breeds } from "@/lib/sample-data";

// Refresh at most once a minute; all breed pages are built ahead of time
export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return breeds.map((b) => ({ breed: b.slug }));
}

// One short, plain line about each breed
const breedIntro: Record<string, string> = {
  marwari: "Marwari horses come from Rajasthan and are known for their inward-curving ears, hardiness and graceful gait.",
  kathiawari: "Kathiawari horses come from the Kathiawar region of Gujarat, with curved ears, a strong build and great stamina.",
  thoroughbred: "Thoroughbreds are tall, fast horses bred for racing, also used for show jumping and riding.",
  "country-horse": "Country horses are hardy local horses, used for riding, carts and weddings across Tamil Nadu.",
  pony: "Ponies are small horses, usually under 58 inches. Gentle ponies are popular for children and riding lessons.",
  sindhi: "Sindhi horses come from the Sindh region and are known for their endurance and curved ears.",
  cross: "Cross-bred horses combine two breeds, often mixing the build of one with the temperament of another.",
};

type Props = { params: Promise<{ breed: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { breed: slug } = await params;
  const breed = breeds.find((b) => b.slug === slug);
  if (!breed) return {};
  const title = `${breed.name} horses for sale in Tamil Nadu`;
  return {
    title: `${title} | EquineTrade`,
    description: `${title}. Photos, walking videos, prices and direct contact with sellers. ${breedIntro[slug] ?? ""}`,
  };
}

export default async function BreedPage({ params }: Props) {
  const { breed: slug } = await params;
  const breed = breeds.find((b) => b.slug === slug);
  if (!breed) notFound();

  const listings = await searchListings({ breed: slug, district: "", price: "", gender: "", sort: "newest" });

  return (
    <BrowseListings
      heading={`${breed.name} horses for sale in Tamil Nadu`}
      intro={breedIntro[slug] ?? `Browse ${breed.name} horses for sale across Tamil Nadu.`}
      listings={listings}
      searchHref={`/horses?breed=${slug}`}
      chipsHeading="Other breeds"
      chips={breeds.map((b) => ({ href: `/breeds/${b.slug}`, label: b.name, active: b.slug === slug }))}
    />
  );
}
