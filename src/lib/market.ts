// Reads posts of the six extra sections for the public pages. Runs on the server.
// Same 60-second shared cache as horses (cleared at once by /api/refresh-pages
// whenever someone posts, edits or removes something). Errors are never kept.

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_CACHE_TAG } from "@/lib/listings";
import { districts } from "@/lib/sample-data";
import { MARKET_COLUMNS, toMarketPost, type MarketPost, type MarketRow } from "@/lib/market-shape";
import { mainField, sections, todayInIndia, type SectionKey } from "@/lib/market-sections";

export { type MarketPost } from "@/lib/market-shape";

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function cached<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, [name], { revalidate: 60, tags: [PUBLIC_CACHE_TAG] });
}

async function safely<R>(name: string, read: () => Promise<R>, fallback: R): Promise<R> {
  try {
    return await read();
  } catch (e) {
    console.error(`${name}:`, e instanceof Error ? e.message : e);
    return fallback;
  }
}

export type MarketFilters = {
  /** District slug, e.g. "madurai" */
  district: string;
  /** Value of the section's main field, e.g. "4-horse truck" */
  kind: string;
};

const listCached = cached(
  "market-list",
  async (section: SectionKey, district: string, kind: string, today: string, limit: number) => {
    const def = sections[section];
    let q = db().from("market_posts").select(MARKET_COLUMNS).eq("status", "live").eq("section", section);

    const districtName = districts.find((d) => d.slug === district)?.name;
    if (districtName) q = q.eq("district", districtName);

    const main = mainField(def);
    if (main && kind && main.options.includes(kind)) q = q.eq(`details->>${main.key}`, kind);

    if (def.dated) {
      // Upcoming and running events, soonest first
      q = q.or(`ends_on.gte.${today},and(ends_on.is.null,starts_on.gte.${today})`).order("starts_on", { ascending: true });
    } else {
      q = q.order("created_at", { ascending: false });
    }

    const { data, error } = await q.limit(limit);
    if (error) throw new Error(error.message);
    return (data as unknown as MarketRow[]).map(toMarketPost);
  },
);

/** Live posts of one section, with optional district and main-field filters. */
export function getSectionPosts(section: SectionKey, f: MarketFilters, limit = 60): Promise<MarketPost[]> {
  return safely("getSectionPosts", () => listCached(section, f.district, f.kind, todayInIndia(), limit), []);
}

const bySlugCached = cached("market-by-slug", async (section: SectionKey, slug: string) => {
  const { data, error } = await db()
    .from("market_posts")
    .select(MARKET_COLUMNS)
    .eq("section", section)
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toMarketPost(data as unknown as MarketRow) : null;
});

/** One live post by its address, e.g. /transport/<slug>. */
export function getPostBySlug(section: SectionKey, slug: string): Promise<MarketPost | null> {
  return safely("getPostBySlug", () => bySlugCached(section, slug), null);
}

const moreCached = cached("market-more", async (section: SectionKey, id: string, district: string, limit: number) => {
  const { data, error } = await db()
    .from("market_posts")
    .select(MARKET_COLUMNS)
    .eq("status", "live")
    .eq("section", section)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(limit * 3);
  if (error) throw new Error(error.message);
  const rows = (data as unknown as MarketRow[]).map(toMarketPost);
  // Same district first
  return [...rows.filter((r) => r.district === district), ...rows.filter((r) => r.district !== district)].slice(0, limit);
});

/** Other posts in the same section, same district first. */
export function getMorePosts(post: MarketPost, limit = 3): Promise<MarketPost[]> {
  return safely("getMorePosts", () => moreCached(post.section, post.id, post.district, limit), []);
}

const countsCached = cached("market-counts", async () => {
  const { data, error } = await db().from("live_section_counts").select("section, posts");
  if (error) throw new Error(error.message);
  return Object.fromEntries(((data as { section: string; posts: number }[]) ?? []).map((r) => [r.section, r.posts])) as Partial<
    Record<SectionKey, number>
  >;
});

/** Number of live posts per section. */
export function getSectionCounts(): Promise<Partial<Record<SectionKey, number>>> {
  return safely("getSectionCounts", () => countsCached(), {});
}

const latestCached = cached("market-latest", async (limit: number, today: string) => {
  const { data, error } = await db()
    .from("market_posts")
    .select(MARKET_COLUMNS)
    .eq("status", "live")
    .or(`section.neq.event,ends_on.gte.${today},and(ends_on.is.null,starts_on.gte.${today})`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as unknown as MarketRow[]).map(toMarketPost);
});

/** Newest posts across all six sections (for the Explore page). */
export function getLatestPosts(limit = 6): Promise<MarketPost[]> {
  return safely("getLatestPosts", () => latestCached(limit, todayInIndia()), []);
}

const slugsCached = cached("market-slugs", async () => {
  const { data, error } = await db()
    .from("market_posts")
    .select("section, slug, created_at")
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data as { section: SectionKey; slug: string; created_at: string }[]).map((r) => ({
    path: `${sections[r.section].path}/${r.slug}`,
    updatedAt: r.created_at,
  }));
});

/** Every live post's address, for the Google sitemap. */
export function getLivePostPaths(): Promise<{ path: string; updatedAt: string }[]> {
  return safely("getLivePostPaths", () => slugsCached(), []);
}
