import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PostHorseForm } from "./post-horse-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sell");
  return { title: `${t("newTitle")} | EquineTrade`, robots: { index: false } };
}

export default async function SellNewPage() {
  const t = await getTranslations("sell");
  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-6 sm:pb-16">
      <h1 className="text-2xl font-semibold tracking-tight">{t("newTitle")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("newIntro")}</p>
      <PostHorseForm />
    </div>
  );
}
