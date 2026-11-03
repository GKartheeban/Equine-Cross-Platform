import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { cache } from "react";
import { CalendarDays, ChevronRight, Clock, MapPin, ShieldCheck } from "lucide-react";
import { ContactPoster } from "@/components/contact-poster";
import { SectionIcon } from "@/components/section-icon";
import { MarketCard } from "@/components/market-card";
import { MediaGallery } from "@/components/media-gallery";
import { dateLocale, districtSlug } from "@/lib/labels";
import { getSellerProfile } from "@/lib/listings";
import { getMorePosts, getPostBySlug } from "@/lib/market";
import { eventDateText, fieldText, priceText } from "@/lib/market-format";
import { sections, type SectionKey } from "@/lib/market-sections";

type Params = Promise<{ slug: string }>;

const loadPost = cache(getPostBySlug);

/** Title, description and photo for Google and WhatsApp link previews. */
export async function postMetadata(section: SectionKey, params: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(section, slug);
  const m = await getTranslations("market");
  if (!post) return { title: `${m(`sections.${section}.title`)} | HorseMart` };
  const o = await getTranslations("options");
  const district = districtSlug(post.district) ? o(`district.${districtSlug(post.district)}`) : post.district;
  const description = `${priceText(post, m)} · ${post.town}, ${district}.${post.description ? ` ${post.description.slice(0, 200)}` : ""}`;
  return {
    title: `${post.title} | HorseMart`,
    description,
    alternates: { canonical: `${sections[section].path}/${post.slug}` },
    openGraph: { type: "article", title: post.title, description, images: post.photos[0] ? [{ url: post.photos[0] }] : ["/og"] },
  };
}

/** Detail page of a transport / event / job / shop / farm / stud post. */
export async function MarketDetailPage({ section, params }: { section: SectionKey; params: Params }) {
  const { slug } = await params;
  const post = await loadPost(section, slug);
  if (!post) notFound();

  const def = sections[section];
  const path = `${def.path}/${post.slug}`;
  const [more, owner, m, o, c, d, locale] = await Promise.all([
    getMorePosts(post),
    getSellerProfile(post.ownerId),
    getTranslations("market"),
    getTranslations("options"),
    getTranslations("common"),
    getTranslations("detail"),
    getLocale(),
  ]);
  const district = districtSlug(post.district) ? o(`district.${districtSlug(post.district)}`) : post.district;
  const posted = post.postedDaysAgo === 0 ? c("today") : c("daysAgo", { count: post.postedDaysAgo });
  const dates = def.dated ? eventDateText(post.startsOn, post.endsOn, locale, m) : null;
  const price = priceText(post, m);
  const priceLabel = section === "event" ? m("entryFee") : null;

  // Every filled-in field, in the section's order
  const rows: [string, string][] = def.fields
    .map((f) => [m(`fields.${f.key}`), fieldText(f, post.details[f.key], m, o)] as const)
    .filter((r): r is [string, string] => r[1] !== null);

  // Structured data for Google (events and shop items)
  const jsonLd =
    section === "event" && post.startsOn
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: post.title,
          startDate: post.startsOn,
          endDate: post.endsOn ?? post.startsOn,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: String(post.details.venue ?? post.town),
            address: `${post.town}, ${post.district}, Tamil Nadu, India`,
          },
          image: post.photos,
          description: post.description ?? undefined,
        }
      : section === "shop" && post.priceInr !== null
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: post.title,
            image: post.photos,
            description: post.description ?? undefined,
            offers: { "@type": "Offer", price: post.priceInr, priceCurrency: "INR", availability: "https://schema.org/InStock" },
          }
        : null;

  const memberSince = owner.memberSince
    ? d("memberSince", {
        date: new Date(owner.memberSince).toLocaleDateString(dateLocale(locale), { month: "short", year: "numeric" }),
      })
    : null;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-28 pt-4 lg:pb-12">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      )}

      <nav className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="shrink-0 hover:text-foreground">
          {c("home")}
        </Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden />
        <Link href={def.path} className="shrink-0 hover:text-foreground">
          {m(`sections.${section}.name`)}
        </Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate text-foreground">{post.title}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] xl:gap-12">
        <div className="min-w-0">
          {post.photos.length > 0 ? (
            <MediaGallery
              items={post.photos.map((url) => ({ type: "photo" as const, url }))}
              alt={post.title}
              labels={{ photo: m("form.photos"), video: c("video"), noMedia: c("noPhoto") }}
            />
          ) : (
            <div
              aria-hidden
              className="flex aspect-[16/7] items-center justify-center rounded-2xl bg-gradient-to-br from-primary/[0.10] via-muted to-primary/[0.04] text-primary/35"
            >
              <SectionIcon section={section} className="size-24" strokeWidth={1} />
            </div>
          )}

          <header className="mt-6">
            <Link
              href={def.path}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.08] px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/15 hover:bg-primary/[0.12]"
            >
              <SectionIcon section={section} className="size-3.5" strokeWidth={2} />
              {m(`sections.${section}.name`)}
            </Link>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-4xl">{post.title}</h1>
            {dates && (
              <p className="mt-3 flex items-center gap-2 text-lg font-medium">
                <CalendarDays className="size-5 text-primary" aria-hidden />
                {dates}
              </p>
            )}
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden />
                {post.town}, {district}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {m("posted", { when: posted })}
              </span>
            </p>
            <p className="mt-3 text-2xl font-semibold lg:hidden">
              {priceLabel && <span className="mr-2 text-sm font-normal text-muted-foreground">{priceLabel}</span>}
              {price}
            </p>
          </header>

          {rows.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold tracking-tight">{m("details")}</h2>
              <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border text-sm sm:grid-cols-3">
                {rows.map(([label, value]) => (
                  <div key={label} className="bg-card p-4">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {post.description && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold tracking-tight">{m("about")}</h2>
              <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed">{post.description}</p>
            </section>
          )}

          <section className="mt-10 rounded-2xl border bg-muted/40 p-5 text-sm">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-5 text-primary" aria-hidden />
              {m("beforeDeal")}
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>{m("tip1")}</li>
              <li>{m("tip2")}</li>
              <li>{m("tip3")}</li>
            </ul>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 lg:top-28 space-y-5 rounded-2xl border bg-card p-6 shadow-lg shadow-foreground/[0.04]">
            <div>
              {priceLabel && <p className="text-sm text-muted-foreground">{priceLabel}</p>}
              <p className="text-3xl font-semibold tracking-tight tabular-nums">{price}</p>
            </div>
            <div className="h-px bg-border" />
            <ContactPoster postId={post.id} section={section} path={path} title={post.title} />
            <Owner name={owner.name} avatarUrl={owner.avatarUrl} memberSince={memberSince} m={m} />
          </div>
        </aside>
      </div>

      <div className="mt-8 rounded-2xl border p-4 lg:hidden">
        <Owner name={owner.name} avatarUrl={owner.avatarUrl} memberSince={memberSince} m={m} />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{m("reportByEmail")}</p>

      {more.length > 0 && (
        <section className="mt-14 border-t pt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">{m("more", { section: m(`sections.${section}.name`) })}</h2>
            <Link href={def.path} className="text-sm text-primary hover:underline">
              {m("viewAll")}
            </Link>
          </div>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <li key={p.id}>
                <MarketCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sticky contact bar on phones */}
      <div data-sticky-bar className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{price}</p>
            <p className="truncate text-xs text-muted-foreground">{district}</p>
          </div>
          <ContactPoster postId={post.id} section={section} path={path} title={post.title} compact />
        </div>
      </div>
    </div>
  );
}

function Owner({
  name,
  avatarUrl,
  memberSince,
  m,
}: {
  name: string | null;
  avatarUrl: string | null;
  memberSince: string | null;
  m: (key: string) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name ?? ""} fill sizes="48px" className="object-cover" />
        ) : (
          <span aria-hidden className="flex size-full items-center justify-center font-semibold text-muted-foreground">
            {name ? name.charAt(0).toUpperCase() : "H"}
          </span>
        )}
      </div>
      <div className="min-w-0 text-sm">
        <p className="text-xs text-muted-foreground">{m("postedBy")}</p>
        <p className="truncate font-medium">{name ?? "HorseMart"}</p>
        {memberSince && <p className="text-xs text-muted-foreground">{memberSince}</p>}
      </div>
    </div>
  );
}
