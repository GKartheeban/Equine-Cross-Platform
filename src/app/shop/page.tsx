import { MarketListPage, sectionMetadata } from "@/components/market-list-page";

// Live posts are cached for up to a minute (cleared straight away when someone posts)
export const revalidate = 60;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export function generateMetadata() {
  return sectionMetadata("shop");
}

export default function Page({ searchParams }: Props) {
  return <MarketListPage section="shop" searchParams={searchParams} />;
}
