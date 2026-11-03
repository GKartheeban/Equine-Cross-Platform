import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SectionIcon } from "@/components/section-icon";
import { districtSlug } from "@/lib/labels";
import { eventDateText, optionLabel, priceText } from "@/lib/market-format";
import { mainField, sections } from "@/lib/market-sections";
import type { MarketPost } from "@/lib/market-shape";

/** Day + short month block shown on event cards ("14 / DEC"). */
function DateBlock({ iso, locale }: { iso: string; locale: string }) {
  const d = new Date(`${iso}T00:00:00`);
  const loc = locale === "ta" ? "ta-IN" : "en-IN";
  return (
    <span className="absolute right-3 top-3 flex w-12 flex-col items-center overflow-hidden rounded-lg bg-background text-center shadow-md">
      <span className="w-full bg-primary py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
        {d.toLocaleDateString(loc, { month: "short" })}
      </span>
      <span className="py-1 text-lg font-semibold leading-none tabular-nums">{d.getDate()}</span>
    </span>
  );
}

/** Card for a transport / event / job / shop / farm / stud post. */
export function MarketCard({ post, priority = false, showSection = false }: { post: MarketPost; priority?: boolean; showSection?: boolean }) {
  const m = useTranslations("market");
  const o = useTranslations("options");
  const c = useTranslations("common");
  const locale = useLocale();
  const def = sections[post.section];
  const main = mainField(def);
  const mainValue = main ? post.details[main.key] : undefined;
  const district = districtSlug(post.district) ? o(`district.${districtSlug(post.district)}`) : post.district;
  const dates = def.dated ? eventDateText(post.startsOn, post.endsOn, locale, m) : null;
  const posted = post.postedDaysAgo === 0 ? c("today") : c("daysAgo", { count: post.postedDaysAgo });
  const label = showSection ? m(`sections.${post.section}.name`) : typeof mainValue === "string" ? optionLabel(mainValue, m, o) : null;

  return (
    <Link
      href={`${def.path}/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {post.photos[0] ? (
          <Image
            src={post.photos[0]}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        ) : (
          <span
            aria-hidden
            className="flex size-full items-center justify-center bg-gradient-to-br from-primary/[0.10] via-muted to-primary/[0.04] text-primary/40"
          >
            <SectionIcon section={post.section} className="size-14" strokeWidth={1.25} />
          </span>
        )}
        {label && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
            <SectionIcon section={post.section} className="size-3.5 text-primary" strokeWidth={2} />
            {label}
          </span>
        )}
        {def.dated && post.startsOn && <DateBlock iso={post.startsOn} locale={locale} />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 font-semibold leading-snug tracking-tight group-hover:text-primary">{post.title}</p>
        {dates && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            {dates}
          </p>
        )}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3 border-t pt-3">
          <span className="min-w-0">
            <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {post.town}, {district}
              </span>
            </span>
            {!def.dated && <span className="mt-0.5 block text-xs text-muted-foreground/80">{posted}</span>}
          </span>
          <span className="shrink-0 text-right text-base font-semibold tabular-nums">{priceText(post, m)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
