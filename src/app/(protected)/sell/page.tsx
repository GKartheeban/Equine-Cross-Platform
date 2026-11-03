import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HorseIcon, SectionBadge } from "@/components/section-icon";
import { sectionList } from "@/lib/market-sections";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("market");
  return { title: `${m("chooseTitle")} | HorseMart`, robots: { index: false } };
}

/** "What do you want to post?": a horse, or one of the six other sections. */
export default async function SellChooserPage() {
  const m = await getTranslations("market");
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{m("chooseTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{m("chooseIntro")}</p>

      <Link
        href="/sell/new"
        className="group relative mt-8 flex items-center gap-5 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm transition hover:shadow-lg sm:p-8"
      >
        <HorseIcon className="pointer-events-none absolute -right-6 -top-4 size-40 text-primary-foreground/10" strokeWidth={1.25} />
        <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15 ring-1 ring-inset ring-primary-foreground/20">
          <HorseIcon className="size-7" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-xl font-semibold tracking-tight">{m("chooseHorse")}</span>
          <span className="mt-0.5 block text-sm text-primary-foreground/80">{m("chooseHorseText")}</span>
        </span>
        <ArrowRight className="relative size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
      </Link>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {sectionList.map((s) => (
          <li key={s.key}>
            <Link
              href={`/sell/post/${s.key}`}
              className="group flex h-full items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <SectionBadge section={s.key} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold tracking-tight">{m(`sections.${s.key}.postShort`)}</span>
                <span className="block text-sm text-muted-foreground">{m(`sections.${s.key}.short`)}</span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
