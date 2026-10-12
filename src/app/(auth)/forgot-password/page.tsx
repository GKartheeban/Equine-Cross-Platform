import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotForm } from "./forgot-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("recovery");
  return { title: `${t("forgotTitle")} | EquineTrade`, robots: { index: false } };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("recovery");
  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-12 sm:py-20">
      <h1 className="text-2xl font-semibold tracking-tight">{t("forgotTitle")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("forgotIntro")}</p>
      <ForgotForm />
    </div>
  );
}
