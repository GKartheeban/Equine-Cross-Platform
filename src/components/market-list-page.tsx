import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SectionBadge } from "@/components/section-icon";
import { MarketCard } from "@/components/market-card";
import { TransportCalculator } from "@/components/transport-calculator";
import { getSectionPosts } from "@/lib/market";
import { optionLabel } from "@/lib/market-format";
import { mainField, sections, type SectionKey } from "@/lib/market-sections";
import { districts } from "@/lib/sample-data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pick(p: Record<string, string | string[] | undefined>, key: string) {
  const v = p[key];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

/** Title and description for a section's list page (Google and link previews). */
export async function sectionMetadata(section: SectionKey): Promise<Metadata> {
  const m = await getTranslations("market");
  const title = m(`sections.${section}.title`);
  const description = m(`sections.${section}.intro`);
  return {
    title: `${title} | HorseMart`,
    description,
    alternates: { canonical: sections[section].path },
    openGraph: { title, description, images: ["/og"] },
  };
}

const selectClass =
  "h-12 w-full rounded-xl border-0 bg-muted/60 px-4 text-sm outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring";

/** List page of one section: heading, filters (district + main type), results. */
export async function MarketListPage({ section, searchParams }: { section: SectionKey; searchParams: SearchParams }) {
  const p = await searchParams;
  const def = sections[section];
  const main = mainField(def);
  const district = districts.some((d) => d.slug === pick(p, "district")) ? pick(p, "district") : "";
  const kind = main && main.options.includes(pick(p, "type")) ? pick(p, "type") : "";

  const [posts, m, o, c] = await Promise.all([
    getSectionPosts(section, { district, kind }),
    getTranslations("market"),
    getTranslations("options"),
    getTranslations("common"),
  ]);
  const filtered = Boolean(district || kind);

  return (
    <div>
      {/* Header band */}
      <section className="border-b bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-transparent">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-8 pt-5 sm:pb-10">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground">
              {c("home")}
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href="/explore" className="hover:text-foreground">
              {m("nav")}
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span className="text-foreground">{m(`sections.${section}.name`)}</span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
            <div className="flex max-w-2xl items-start gap-4">
              <span className="hidden sm:inline-flex"><SectionBadge section={section} size="lg" /></span>
              <span className="sm:hidden"><SectionBadge section={section} /></span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{m(`sections.${section}.title`)}</h1>
                <p className="mt-2 text-muted-foreground sm:text-lg">{m(`sections.${section}.intro`)}</p>
              </div>
            </div>
            <Link
              href={`/sell/post/${section}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-md sm:w-auto"
            >
              <Plus className="size-4" aria-hidden />
              {m(`sections.${section}.post`)}
            </Link>
          </div>

          {/* Filters: a plain GET form, works without JavaScript */}
          <form
            action={def.path}
            method="get"
            className="mt-6 grid gap-2 rounded-2xl sm:mt-8 border bg-background p-2 shadow-sm sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="sr-only" htmlFor="district">
              {m("form.district")}
            </label>
            <select id="district" name="district" defaultValue={district} className={selectClass}>
              <option value="">{m("anyDistrict")}</option>
              {districts.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {o(`district.${d.slug}`)}
                </option>
              ))}
            </select>
            {main ? (
              <>
                <label className="sr-only" htmlFor="type">
                  {m(`fields.${main.key}`)}
                </label>
                <select id="type" name="type" defaultValue={kind} className={selectClass}>
                  <option value="">
                    {m(`fields.${main.key}`)}: {m("anyKind")}
                  </option>
                  {main.options.map((v) => (
                    <option key={v} value={v}>
                      {optionLabel(v, m, o)}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <span className="hidden sm:block" />
            )}
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-medium text-background transition hover:bg-foreground/85"
            >
              <Search className="size-4" aria-hidden />
              {m("filter")}
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8">
        {section === "transport" && (
          <div className="mb-10">
            <TransportCalculator />
          </div>
        )}

        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-medium tabular-nums">{m("results", { count: posts.length })}</p>
          {filtered && (
            <Link href={def.path} className="text-sm text-primary hover:underline">
              {m("anyKind")}
            </Link>
          )}
        </div>

        {posts.length > 0 ? (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post, i) => (
              <li key={post.id}>
                <MarketCard post={post} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
            <SectionBadge section={section} size="lg" />
            <p className="mt-4 text-lg font-semibold tracking-tight">{m(`sections.${section}.empty`)}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{m("emptyText")}</p>
            <Link
              href={`/sell/post/${section}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" aria-hidden />
              {m(`sections.${section}.post`)}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
