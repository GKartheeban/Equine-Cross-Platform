import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { safeNext } from "@/lib/safe-next";
import { PasswordForm } from "./password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("password");
  return { title: `${t("title")} | EquineTrade`, robots: { index: false } };
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PasswordPage({ searchParams }: Props) {
  const { next, forced } = await searchParams;
  const t = await getTranslations("password");
  const isForced = forced === "1";
  return (
    <div className="mx-auto max-w-sm px-4 py-10 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{isForced ? t("forcedTitle") : t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{isForced ? t("forcedIntro") : t("intro")}</p>
      <PasswordForm next={safeNext(next)} />
    </div>
  );
}
