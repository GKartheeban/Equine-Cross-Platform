import { MarketDetailPage, postMetadata } from "@/components/market-detail-page";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export function generateMetadata({ params }: Props) {
  return postMetadata("event", params);
}

export default function Page({ params }: Props) {
  return <MarketDetailPage section="event" params={params} />;
}
