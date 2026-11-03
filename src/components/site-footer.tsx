import Link from "next/link";
import { ArrowRight, MapPin, Phone, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { SealBadge, Wordmark } from "@/components/brand-logo";
import { HorseIcon } from "@/components/section-icon";
import { districts } from "@/lib/sample-data";

// Footer palette: warm parchment, saddle-leather brown and brass.
const INK = "text-[#3b2417]";
const SOFT = "text-[#7a5d4c]";
const BRASS = "text-[#b07a3c]";

type FooterLink = { href: string; label: string };

function Column({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${BRASS}`}>{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={`group inline-flex items-center gap-1.5 text-sm ${SOFT} transition hover:text-[#3b2417]`}>
              <span className="h-px w-0 bg-[#b07a3c] transition-all duration-300 group-hover:w-3" aria-hidden />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Site footer: call to action, brand, link columns, popular districts, big wordmark, copyright band. */
export function SiteFooter() {
  const t = useTranslations("footer");
  const h = useTranslations("header");
  const m = useTranslations("market");
  const o = useTranslations("options");

  const marketplace: FooterLink[] = [
    { href: "/horses", label: m("horsesTile") },
    { href: "/transport", label: m("sections.transport.name") },
    { href: "/events", label: m("sections.event.name") },
    { href: "/jobs", label: m("sections.job.name") },
  ];
  const more: FooterLink[] = [
    { href: "/shop", label: m("sections.shop.name") },
    { href: "/stud-farms", label: m("sections.farm.name") },
    { href: "/studs", label: m("sections.stud.name") },
    { href: "/explore", label: m("nav") },
  ];
  const account: FooterLink[] = [
    { href: "/sell", label: h("postAd") },
    { href: "/sell/listings", label: h("myListings") },
    { href: "/saved", label: h("savedHorses") },
    { href: "/account/profile", label: h("myProfile") },
  ];
  const legal: FooterLink[] = [
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("terms") },
  ];
  const popular = districts.filter((d) => d.popular);

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#f6efe6]">
      {/* Brass hairline marking the start of the footer */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-[#b07a3c] to-transparent" aria-hidden />

      <div className="mx-auto max-w-[1440px] px-4 pt-14 sm:px-6 lg:px-10">
        {/* Call to action card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7a3f22] via-[#6a361d] to-[#4a2513] px-6 py-9 text-[#f6efe6] shadow-[0_24px_60px_-20px_rgba(74,37,19,0.55)] sm:px-12 sm:py-12">
          <HorseIcon
            className="pointer-events-none absolute -right-8 -top-10 size-64 text-[#f0cf9c]/[0.08]"
            strokeWidth={1}
          />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f0cf9c]">{t("ctaEyebrow")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{t("ctaTitle")}</h2>
              <p className="mt-3 text-[#f6efe6]/75">{t("ctaText")}</p>
            </div>
            <Link
              href="/sell"
              className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#f0cf9c] sm:w-auto sm:self-start lg:self-auto px-7 py-3.5 text-sm font-semibold text-[#3b2417] shadow-lg transition hover:bg-[#f6dcb3]"
            >
              {t("ctaButton")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Brand + link columns */}
        <div className="grid gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <SealBadge className="size-14" />
              <Wordmark className={`text-2xl ${INK}`} accent={BRASS} />
            </Link>
            <p className={`mt-5 max-w-sm text-sm leading-relaxed ${SOFT}`}>{t("about")}</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {(
                [
                  [Tag, m("benefit1Title")],
                  [Phone, m("benefit2Title")],
                  [MapPin, m("benefit3Title")],
                ] as const
              ).map(([Icon, label]) => (
                <li
                  key={label}
                  className={`inline-flex items-center gap-1.5 rounded-full border border-[#3b2417]/10 bg-white/60 px-3 py-1.5 text-xs ${INK}`}
                >
                  <Icon className={`size-3.5 ${BRASS}`} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <Column title={t("colMarket")} links={marketplace} />
            <Column title={t("colMore")} links={more} />
            <Column title={t("colAccount")} links={account} />
            <Column title={t("colLegal")} links={legal} />
          </div>
        </div>

        {/* Popular districts (also helps Google find district pages) */}
        <div className="border-t border-[#3b2417]/10 py-8">
          <h3 className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${BRASS}`}>{t("popular")}</h3>
          <ul className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            {popular.map((d) => (
              <li key={d.slug} className="shrink-0">
                <Link
                  href={`/horses-for-sale/${d.slug}`}
                  className={`inline-block rounded-full border border-[#3b2417]/10 bg-white/50 px-3.5 py-1.5 text-xs ${SOFT} transition hover:border-[#b07a3c]/60 hover:bg-white hover:text-[#3b2417]`}
                >
                  {t("horsesIn", { district: o(`district.${d.slug}`) })}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Big wordmark */}
      <p
        aria-hidden
        className="pointer-events-none select-none text-center text-[clamp(4rem,17vw,16rem)] font-semibold leading-[0.78] tracking-[-0.05em] text-[#3b2417]/[0.07]"
      >
        HorseMart
      </p>

      {/* Copyright band */}
      <div data-footer-end className="bg-[#3b2417] text-[#e9d9c6]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p className="flex items-center gap-2">
            <HorseIcon className="size-4 text-[#f0cf9c]" />
            © {new Date().getFullYear()} HorseMart. {t("rights")}
          </p>
          <p className="text-[#e9d9c6]/70">{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
