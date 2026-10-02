import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/listings";
import { formatInr, postedLabel } from "@/lib/sample-data";

export function ListingCard({ horse, priority = false }: { horse: Listing; priority?: boolean }) {
  return (
    <Link
      href={`/horses/${horse.slug}`}
      className="group block overflow-hidden rounded-xl border hover:border-primary/60"
    >
      <div className="relative aspect-[4/3] bg-muted">
        {horse.coverUrl ? (
          <Image
            src={horse.coverUrl}
            alt={`${horse.breed} ${horse.gender.toLowerCase()} for sale in ${horse.district}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-sm text-muted-foreground">No photo</span>
        )}
        {horse.hasVideo && (
          <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
            ▶ Video
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-base font-semibold">{formatInr(horse.priceInr)}</p>
        <p className="mt-0.5 font-medium group-hover:text-primary">
          {horse.breed} {horse.gender.toLowerCase()}
        </p>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {horse.ageYears} yrs · {horse.heightInches}″ · {horse.colour}
        </p>
        <p className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{horse.district}</span>
          <span className="shrink-0">{postedLabel(horse.postedDaysAgo)}</span>
        </p>
      </div>
    </Link>
  );
}
