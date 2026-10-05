import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MyListings } from "./my-listings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("myListings");
  return { title: `${t("title")} | EquineTrade`, robots: { index: false } };
}

export default async function MyListingsPage() {
  const t = await getTranslations("myListings");
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <Link
          href="/sell/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + {t("postHorse")}
        </Link>
      </div>
      <MyListings />
    </div>
  );
}
