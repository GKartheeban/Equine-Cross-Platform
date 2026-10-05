import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Listing } from "@/lib/listings";
import { breedSlug, districtSlug, optionKey } from "@/lib/labels";
import { formatInr } from "@/lib/sample-data";

export function ListingCard({ horse, priority = false }: { horse: Listing; priority?: boolean }) {
  const t = useTranslations("common");
  const o = useTranslations("options");
  const breed = breedSlug(horse.breed) ? o(`breed.${breedSlug(horse.breed)}`) : horse.breed;
  const gender = o(`gender.${optionKey(horse.gender)}`);
  const district = districtSlug(horse.district) ? o(`district.${districtSlug(horse.district)}`) : horse.district;
  const posted = horse.postedDaysAgo === 0 ? t("today") : t("daysAgo", { count: horse.postedDaysAgo });

  return (
    <Link
      href={`/horses/${horse.slug}`}
      className="group block overflow-hidden rounded-xl border hover:border-primary/60"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {horse.coverUrl ? (
          <Image
            src={horse.coverUrl}
            alt={`${breed} ${gender} – ${district}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            // The first cards on screen load straight away (faster page); the rest load as you scroll
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-sm text-muted-foreground">{t("noPhoto")}</span>
        )}
        {horse.hasVideo && (
          <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
            ▶ {t("video")}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-base font-semibold">{formatInr(horse.priceInr)}</p>
        <p className="mt-0.5 font-medium group-hover:text-primary">
          {breed} · {gender}
        </p>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {t("years", { count: horse.ageYears })} · {horse.heightInches}″ · {horse.colour}
        </p>
        <p className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{district}</span>
          <span className="shrink-0">{posted}</span>
        </p>
      </div>
    </Link>
  );
}
