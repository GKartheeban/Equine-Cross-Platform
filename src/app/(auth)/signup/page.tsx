import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { safeNext } from "@/lib/safe-next";
import { AuthTabs } from "../login/auth-tabs";
import { LoginForm } from "../login/login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return { title: `${t("signupTitle")} | HorseMart`, robots: { index: false } };
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SignupPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const t = await getTranslations("login");
  const nextPath = safeNext(next);

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-12 sm:py-20">
      <AuthTabs mode="signup" next={nextPath} />
      <h1 className="text-2xl font-semibold tracking-tight">{t("signupTitle")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("signupIntro")}</p>
      <LoginForm next={nextPath} mode="signup" />
    </div>
  );
}
