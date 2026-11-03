import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AccountMenu } from "@/components/account-menu";
import { SealBadge, Wordmark } from "@/components/brand-logo";
import { LanguageSwitch } from "@/components/language-switch";
import { MobileSectionNav } from "@/components/mobile-section-nav";
import { HeaderNav } from "@/components/header-nav";
import { HeaderShell } from "@/components/header-shell";
import { HeaderFrieze } from "@/components/header-frieze";

export function SiteHeader() {
  const t = useTranslations("header");
  const m = useTranslations("market");
  return (
    <HeaderShell>
      <div className="relative">
      {/* Desert scene with a cowboy on horseback, across the full width (very light) */}
      <HeaderFrieze className="pointer-events-none absolute inset-x-0 top-1/2 h-16 w-full -translate-y-1/2 opacity-50" />
      <div className="relative mx-auto flex h-16 max-w-[1440px] lg:h-20 items-center justify-between gap-2 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="hm-logo hm-clear flex shrink-0 items-center gap-2.5 pr-3 sm:gap-3.5 sm:pr-5" aria-label="HorseMart home">
          <SealBadge className="hm-seal size-11 rounded-full shadow-[0_2px_8px_rgba(74,37,19,0.25)] sm:size-12 lg:size-14" />
          <Wordmark animated className="text-[17px] leading-none text-[#2b1a10] max-[359px]:hidden sm:text-xl lg:text-[26px]" />
        </Link>

        <nav className="hm-clear flex min-w-0 items-center gap-1 pl-2 text-sm sm:gap-2 sm:pl-3">
          <HeaderNav
            links={[
              { href: "/horses", label: t("browseHorses"), match: "^/(horses|breeds|horses-for-sale)(/|$)" },
              { href: "/explore", label: m("nav"), match: "^/(explore|transport|events|jobs|shop|stud-farms|studs)(/|$)" },
            ]}
          />
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-[#3b2417]/10 md:block" />
          <LanguageSwitch />
          <AccountMenu />
          <Link
            href="/sell"
            className="group ml-1 inline-flex items-center gap-1.5 truncate rounded-full bg-gradient-to-b from-[#7a3f22] to-[#5b2c17] px-4 py-2.5 font-medium text-[#fbf2e6] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_16px_-8px_rgba(74,37,19,0.7)] transition hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_22px_-8px_rgba(74,37,19,0.75)] sm:px-5"
          >
            <Plus className="size-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" aria-hidden />
            {t("postAd")}
          </Link>
        </nav>
      </div>
      </div>
      <MobileSectionNav />
    </HeaderShell>
  );
}
