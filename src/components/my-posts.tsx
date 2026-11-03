"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { SectionIcon } from "@/components/section-icon";
import { createClient } from "@/lib/supabase/client";
import { priceText } from "@/lib/market-format";
import { sections } from "@/lib/market-sections";
import { MARKET_COLUMNS, toMarketPost, type MarketPost, type MarketRow } from "@/lib/market-shape";
import { deletePost, setPostStatus } from "@/lib/submit-post";

/** "My listings": the user's posts in transport, events, jobs, shop, stud farms and studs. */
export function MyPosts() {
  const m = useTranslations("market");
  const [posts, setPosts] = useState<MarketPost[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setPosts([]);
      return;
    }
    const { data, error: err } = await supabase
      .from("market_posts")
      .select(MARKET_COLUMNS)
      .eq("owner_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (err) {
      setError(m("mine.errLoad"));
      setPosts([]);
      return;
    }
    setPosts(((data ?? []) as MarketRow[]).map(toMarketPost));
  }, [m]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(p: MarketPost, status: "live" | "closed") {
    setBusy(p.id);
    setError("");
    const ok = await setPostStatus(p.id, status);
    if (ok) setPosts((list) => list?.map((x) => (x.id === p.id ? { ...x, status } : x)) ?? null);
    else setError(m("mine.errUpdate"));
    setBusy(null);
  }

  async function remove(p: MarketPost) {
    setBusy(p.id);
    setError("");
    const ok = await deletePost(p.id, p.photoPaths);
    if (ok) setPosts((list) => list?.filter((x) => x.id !== p.id) ?? null);
    else setError(m("mine.errUpdate"));
    setConfirming(null);
    setBusy(null);
  }

  if (posts === null) return null;

  return (
    <section className="mt-10 border-t pt-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{m("mine.heading")}</h2>
        <Link href="/sell" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <Plus className="size-4" aria-hidden />
          {m("postAnything")}
        </Link>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-destructive p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {posts.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{m("mine.empty")}</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {posts.map((p) => {
            const def = sections[p.section];
            const badge =
              p.status === "live"
                ? ["bg-green-100 text-green-800", m("mine.live")]
                : p.status === "closed"
                  ? ["bg-muted text-muted-foreground", m(`sections.${p.section}.closed`)]
                  : ["bg-red-100 text-red-800", m("mine.removed")];
            const working = busy === p.id;
            return (
              <li key={p.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex gap-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {p.photos[0] ? (
                      <Image src={p.photos[0]} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <span aria-hidden className="flex size-full items-center justify-center text-primary/40">
                        <SectionIcon section={p.section} className="size-8" strokeWidth={1.25} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <SectionIcon section={p.section} className="size-3.5" strokeWidth={2} />
                      {m(`sections.${p.section}.name`)}
                    </p>
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="text-sm">{priceText(p, m)}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge[0]}`}>{badge[1]}</span>
                  </div>
                </div>

                {p.status !== "removed" && (
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    {p.status === "live" && (
                      <Link href={`${def.path}/${p.slug}`} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                        {m("mine.view")}
                      </Link>
                    )}
                    <Link href={`/sell/post/${p.section}?edit=${p.id}`} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                      {m("mine.edit")}
                    </Link>
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => changeStatus(p, p.status === "live" ? "closed" : "live")}
                      className="rounded-lg border px-3 py-1.5 hover:bg-muted disabled:opacity-60"
                    >
                      {p.status === "live" ? m(`sections.${p.section}.close`) : m("mine.reopen")}
                    </button>
                    {confirming === p.id ? (
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-destructive">{m("mine.confirmDelete")}</span>
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => remove(p)}
                          className="rounded-lg bg-destructive px-3 py-1.5 text-white disabled:opacity-60"
                        >
                          {m("mine.delete")}
                        </button>
                        <button type="button" onClick={() => setConfirming(null)} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                          {m("mine.cancel")}
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirming(p.id)}
                        className="rounded-lg border border-destructive/40 px-3 py-1.5 text-destructive hover:bg-destructive/5"
                      >
                        {m("mine.delete")}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
