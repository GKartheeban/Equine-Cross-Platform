import Link from "next/link";
import { useTranslations } from "next-intl";
import { AccountMenu } from "@/components/account-menu";
import { LanguageSwitch } from "@/components/language-switch";

export function SiteHeader() {
  const t = useTranslations("header");
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
          Equine<span className="text-primary">Trade</span>
        </Link>

        <nav className="flex min-w-0 items-center gap-1 text-sm sm:gap-2">
          <Link
            href="/horses"
            className="hidden rounded-md px-3 py-2 text-muted-foreground hover:text-foreground md:inline-block"
          >
            {t("browseHorses")}
          </Link>
          <LanguageSwitch />
          <AccountMenu />
          <Link
            href="/sell/new"
            className="truncate rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("sellYourHorse")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
