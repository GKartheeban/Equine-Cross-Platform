import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");
  const h = useTranslations("header");
  const links = [
    { href: "/horses", label: h("browseHorses") },
    { href: "/sell/new", label: h("sellYourHorse") },
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("terms") },
  ];

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-foreground">EquineTrade</span>
          {" · "}
          {t("tagline")}
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="pb-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EquineTrade
      </p>
    </footer>
  );
}
