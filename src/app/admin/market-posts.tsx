"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { refreshPublicPages } from "@/lib/refresh-pages";
import { SectionBadge } from "@/components/section-icon";
import { sections, type SectionKey } from "@/lib/market-sections";
import { MARKET_COLUMNS, toMarketPost, type MarketPost, type MarketRow } from "@/lib/market-shape";

const sectionName: Record<SectionKey, string> = {
  transport: "Transport",
  event: "Event",
  job: "Job",
  shop: "Shop",
  farm: "Stud farm",
  stud: "Stud",
};

const statusStyle: Record<MarketPost["status"], string> = {
  live: "bg-green-100 text-green-800",
  closed: "bg-muted text-muted-foreground",
  removed: "bg-red-100 text-red-800",
};

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Newest posts in transport, events, jobs, shop, stud farms and studs, with Remove / Restore. */
export function MarketPosts() {
  const [posts, setPosts] = useState<MarketPost[] | null>(null);
  const [filter, setFilter] = useState<SectionKey | "">("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    let q = createClient().from("market_posts").select(MARKET_COLUMNS).order("created_at", { ascending: false }).limit(100);
    if (filter) q = q.eq("section", filter);
    const { data, error } = await q;
    if (error) {
      setMessage(`Couldn't load posts: ${error.message}`);
      setPosts([]);
      return;
    }
    setPosts(((data ?? []) as MarketRow[]).map(toMarketPost));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(p: MarketPost, status: "live" | "removed") {
    if (status === "removed" && !window.confirm(`Remove "${p.title}" from the site?`)) return;
    setBusy(p.id);
    setMessage("");
    const { error } = await createClient().rpc("mod_set_post_status", { p_post_id: p.id, p_status: status });
    if (error) setMessage(`Couldn't update: ${error.message}`);
    else {
      setPosts((list) => list?.map((x) => (x.id === p.id ? { ...x, status } : x)) ?? null);
      setMessage(status === "removed" ? "Post removed." : "Post restored.");
      await refreshPublicPages();
    }
    setBusy(null);
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="mp-section" className="text-sm text-muted-foreground">
          Section
        </label>
        <select
          id="mp-section"
          value={filter}
          onChange={(e) => setFilter(e.target.value as SectionKey | "")}
          className="h-9 rounded-lg border bg-background px-2 text-sm"
        >
          <option value="">All</option>
          {(Object.keys(sectionName) as SectionKey[]).map((k) => (
            <option key={k} value={k}>
              {sectionName[k]}
            </option>
          ))}
        </select>
      </div>

      {message && <p role="status" className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">{message}</p>}

      {posts === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="mt-4 rounded-xl border px-6 py-10 text-center text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-start gap-3 rounded-xl border p-3 text-sm">
              <SectionBadge section={p.section} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  <a href={`${sections[p.section].path}/${p.slug}`} target="_blank" rel="noreferrer" className="hover:underline">
                    {p.title}
                  </a>
                </p>
                <p className="text-muted-foreground">
                  {sectionName[p.section]} · {p.town}, {p.district} · {when(p.createdAt)} · {p.photos.length} photo(s)
                </p>
                {p.description && <p className="mt-1 line-clamp-2 text-muted-foreground">{p.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[p.status]}`}>{p.status}</span>
                {p.status === "removed" ? (
                  <button
                    type="button"
                    disabled={busy === p.id}
                    onClick={() => setStatus(p, "live")}
                    className="rounded-lg border px-3 py-1.5 hover:bg-muted disabled:opacity-60"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy === p.id}
                    onClick={() => setStatus(p, "removed")}
                    className="rounded-lg border border-destructive/40 px-3 py-1.5 text-destructive hover:bg-destructive/5 disabled:opacity-60"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
