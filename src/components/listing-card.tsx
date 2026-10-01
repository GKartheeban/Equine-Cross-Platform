import Link from "next/link";
import { formatInr, postedLabel, type Listing } from "@/lib/sample-data";

export function ListingCard({ horse }: { horse: Listing }) {
  return (
    <Link
      href={`/horses/${horse.slug}`}
      className="group block overflow-hidden rounded-xl border hover:border-primary/60"
    >
      {/* Photo placeholder until real images come from storage */}
      <div className="relative flex aspect-[4/3] items-center justify-center bg-muted text-sm text-muted-foreground">
        Photo
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
        <p className="mt-1 text-sm text-muted-foreground">
          {horse.ageYears} yrs · {horse.heightInches}″ · {horse.colour}
        </p>
        <p className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{horse.district}</span>
          <span>{postedLabel(horse.postedDaysAgo)}</span>
        </p>
      </div>
    </Link>
  );
}
