import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SavedList } from "./saved-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("saved");
  return { title: `${t("title")} | EquineTrade`, robots: { index: false } };
}

export default async function SavedPage() {
  const t = await getTranslations("saved");
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>
      <SavedList />
    </div>
  );
}
