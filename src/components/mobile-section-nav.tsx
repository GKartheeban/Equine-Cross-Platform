"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { SectionIcon } from "@/components/section-icon";
import { sectionList, type SectionKey } from "@/lib/market-sections";

/** Phones and tablets: a swipeable row of all sections under the header. */
export function MobileSectionNav() {
  const pathname = usePathname() ?? "/";
  const m = useTranslations("market");

  // Not on forms, account and admin pages
  if (/^\/(sell|admin|account|login|signup|forgot-password|report|auth)(\/|$)/.test(pathname)) return null;

  const items: { href: string; key: SectionKey | "horse"; label: string }[] = [
    { href: "/horses", key: "horse", label: m("horsesTile") },
    ...sectionList.map((s) => ({ href: s.path, key: s.key, label: m(`sections.${s.key}.name`) })),
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`) || (href === "/horses" && /^\/(breeds|horses-for-sale)\//.test(pathname));

  return (
    <nav aria-label={m("nav")} className="border-t border-[#3b2417]/[0.06] md:hidden">
      <ul className="flex gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active ? "bg-primary text-primary-foreground" : "bg-card/80 text-[#3b2417] ring-1 ring-inset ring-[#3b2417]/[0.08] hover:bg-card"
                }`}
              >
                <SectionIcon section={it.key} className="size-3.5" strokeWidth={2} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
