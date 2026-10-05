import Link from "next/link";
import { useTranslations } from "next-intl";

// Shown for any address that doesn't exist (e.g. a sold or removed horse)
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("text")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/horses" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          {t("browse")}
        </Link>
        <Link href="/" className="rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
