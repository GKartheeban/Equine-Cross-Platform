import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HorseIcon, SectionBadge } from "@/components/section-icon";
import { sectionList } from "@/lib/market-sections";

/** Horses (featured) plus the six sections, each with its number of live posts. Used on Home and Explore. */
export function SectionTiles({
  counts,
  m,
  heading,
  horses,
}: {
  counts: Partial<Record<string, number>>;
  /** Latest horse photos, live horse count and breed links for the big Horses tile */
  horses?: HorsesInfo;
  m: (key: string, values?: Record<string, string | number>) => string;
  heading?: string;
}) {
  return (
    <section className="mt-10">
      {heading && (
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
          <Link href="/explore" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
            {m("viewAll")}
          </Link>
        </div>
      )}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        <li className="col-span-2 xl:row-span-2">
          <HorsesTile m={m} horses={horses} />
        </li>
        {sectionList.map((s) => (
          <li key={s.key}>
            <Link
              href={s.path}
              className="group flex h-full flex-col rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-5"
            >
              <span className="flex items-start justify-between gap-2">
                <SectionBadge section={s.key} />
                <ArrowUpRight
                  className="size-4 text-muted-foreground/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden
                />
              </span>
              <span className="mt-4 font-semibold tracking-tight">{m(`sections.${s.key}.name`)}</span>
              <span className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{m(`sections.${s.key}.short`)}</span>
              {(counts[s.key] ?? 0) > 0 ? (
                <span className="mt-auto pt-3 text-xs font-medium tabular-nums text-muted-foreground">
                  {m("count", { count: counts[s.key] ?? 0 })}
                </span>
              ) : (
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-[#9a5a2e]">
                  {m("firstToPost")}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type HorsesInfo = { photos: string[]; count: number; breeds: { slug: string; label: string }[] };

// Where each photo sits in the collage: big one behind, two smaller in front
const frames = [
  "right-[18%] top-[8%] w-[58%] rotate-[4deg]",
  "right-[2%] bottom-[10%] w-[40%] -rotate-[5deg]",
  "left-[4%] bottom-[16%] w-[36%] -rotate-[3deg]",
];

/** The featured Horses tile: text and breeds on the left, a fan of the latest horse photos on the right. */
function HorsesTile({ m, horses }: { m: (key: string, values?: Record<string, string | number>) => string; horses?: HorsesInfo }) {
  const photos = horses?.photos.slice(0, 3) ?? [];
  return (
    <div className="group relative flex h-full min-h-72 overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a3f22] via-[#6a361d] to-[#4a2513] text-[#f6efe6] shadow-[0_20px_50px_-24px_rgba(74,37,19,0.6)]">
      {/* Fine diagonal texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(135deg,#f0cf9c_0_1px,transparent_1px_14px)]"
      />
      <HorseIcon className="pointer-events-none absolute -bottom-10 -left-10 size-56 text-[#f0cf9c]/[0.07]" strokeWidth={1} />

      <div className="relative z-10 flex w-full flex-col justify-between p-6 sm:w-[48%] sm:p-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f0cf9c]">HorseMart</p>
          {horses && (
            horses.count > 0 ? (
              <p className="mt-5 flex items-center gap-3.5">
                <span className="font-display text-5xl font-bold leading-none tabular-nums text-[#f0cf9c]">{horses.count}</span>
                <span aria-hidden className="h-10 w-px bg-gradient-to-b from-transparent via-[#f0cf9c]/50 to-transparent" />
                <span className="max-w-[7rem] text-[11px] font-medium uppercase leading-snug tracking-[0.2em] text-[#f6efe6]/75">
                  {m("horsesForSale", { count: horses.count })}
                </span>
              </p>
            ) : (
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#f6efe6]/75">{m("horsesCount", { count: 0 })}</p>
            )
          )}
        </div>
        {/* Photo stack (phones) */}
        {photos.length > 0 && (
          <Link href="/horses" aria-hidden tabIndex={-1} className="mt-6 flex sm:hidden">
            {photos.map((src, i) => (
              <span
                key={src}
                className={`relative -ml-3 aspect-[4/5] w-[30%] overflow-hidden rounded-xl bg-[#4a2513] shadow-xl ring-[3px] ring-[#f6efe6] first:ml-0 ${
                  i === 0 ? "-rotate-[4deg]" : i === 1 ? "z-10 rotate-[2deg]" : "rotate-[5deg]"
                }`}
              >
                <Image src={src} alt="" fill sizes="30vw" className="object-cover" />
              </span>
            ))}
          </Link>
        )}
        <div className="mt-8 sm:mt-10">
          <Link href="/horses" className="block">
            <span className="block text-3xl font-semibold tracking-tight sm:text-4xl">{m("horsesTile")}</span>
            <span className="mt-1.5 block max-w-xs text-sm text-[#f6efe6]/75">{m("horsesTileText")}</span>
          </Link>
          {horses && horses.breeds.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {horses.breeds.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/breeds/${b.slug}`}
                    className="inline-block rounded-full border border-white/20 px-3 py-1 text-xs text-[#f6efe6]/85 transition hover:border-[#f0cf9c] hover:text-white"
                  >
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/horses"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#f0cf9c] px-5 py-2.5 text-sm font-semibold text-[#3b2417] shadow-md transition hover:bg-[#f6dcb3]"
          >
            {m("viewAll")}
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      {/* Photo fan (laptops and tablets) */}
      {photos.length > 0 && (
        <Link href="/horses" aria-hidden tabIndex={-1} className="absolute inset-y-0 right-0 hidden w-[52%] sm:block">
          {photos.map((src, i) => (
            <span
              key={src}
              className={`absolute aspect-[4/5] overflow-hidden rounded-xl bg-[#4a2513] shadow-2xl ring-4 ring-[#f6efe6] transition-transform duration-500 group-hover:rotate-0 ${frames[i]}`}
              style={{ zIndex: i === 0 ? 1 : 2 }}
            >
              <Image src={src} alt="" fill sizes="(min-width: 1280px) 20vw, 30vw" className="object-cover" />
            </span>
          ))}
        </Link>
      )}
    </div>
  );
}
