import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  // Login pages don't need to appear in Google
  return { title: `${t("title")} | EquineTrade`, robots: { index: false } };
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Only allow redirects to our own pages, e.g. /sell/new (never other websites)
function safeNext(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/";
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const t = await getTranslations("login");

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-12 sm:py-20">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>
      <LoginForm next={safeNext(next)} />
    </div>
  );
}
