import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EditListing } from "./edit-listing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("editListing");
  return { title: `${t("title")} | HorseMart`, robots: { index: false } };
}

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("editListing");
  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-6 sm:pb-16">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>
      <EditListing listingId={id} />
    </div>
  );
}
