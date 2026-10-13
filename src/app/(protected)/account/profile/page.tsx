import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "./profile-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: `${t("title")} | HorseMart`, robots: { index: false } };
}

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>
      <ProfileForm />
    </div>
  );
}
