"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatInr } from "@/lib/sample-data";

type ListingInfo = {
  id: string;
  slug: string;
  breed: string;
  gender: string;
  district: string;
  town: string;
  price_inr: number;
  status: string;
  created_at: string;
  photo_paths: Record<string, string> | null;
};

type Report = {
  id: string;
  reason: string;
  details: string | null;
  created_at: string;
  listing_id: string;
  listing: ListingInfo | null;
};

type ReportGroup = { listing: ListingInfo; reports: Report[] };

const LISTING_COLUMNS = "id, slug, breed, gender, district, town, price_inr, status, created_at, photo_paths";

const thumbUrl = (l: ListingInfo) => {
  const p = l.photo_paths?.front ?? Object.values(l.photo_paths ?? {})[0];
  return p ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${p}` : null;
};

const dateText = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function AdminPanel() {
  const [access, setAccess] = useState<"checking" | "denied" | "ok">("checking");
  const [tab, setTab] = useState<"reports" | "recent">("reports");
  const [groups, setGroups] = useState<ReportGroup[]>([]);
  const [recent, setRecent] = useState<ListingInfo[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();

    const [reportsRes, recentRes, liveRes] = await Promise.all([
      supabase
        .from("reports")
        .select(`id, reason, details, created_at, listing_id, listing:listings(${LISTING_COLUMNS})`)
        .eq("status", "open")
        .order("created_at", { ascending: false }),
      supabase.from("listings").select(LISTING_COLUMNS).order("created_at", { ascending: false }).limit(30),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "live"),
    ]);

    // Group open reports by listing, most-reported first
    const byListing = new Map<string, ReportGroup>();
    for (const r of (reportsRes.data as unknown as Report[] | null) ?? []) {
      if (!r.listing) continue;
      const g = byListing.get(r.listing_id) ?? { listing: r.listing, reports: [] };
      g.reports.push(r);
      byListing.set(r.listing_id, g);
    }
    setGroups([...byListing.values()].sort((a, b) => b.reports.length - a.reports.length));
    setRecent((recentRes.data as unknown as ListingInfo[] | null) ?? []);
    setLiveCount(liveRes.count ?? 0);
  }, []);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setAccess("denied");
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (!isAdmin) return setAccess("denied");
      setAccess("ok");
      load();
    })();
  }, [load]);

  async function setListingStatus(listing: ListingInfo, status: "removed" | "live") {
    setBusy(listing.id);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("listings").update({ status }).eq("id", listing.id);
    if (!error && status === "removed") {
      await supabase.from("reports").update({ status: "resolved" }).eq("listing_id", listing.id).eq("status", "open");
    }
    setBusy(null);
    setMessage(error ? "Couldn't update the listing." : status === "removed" ? "Listing removed." : "Listing restored.");
    load();
  }

  async function dismissReports(listingId: string) {
    setBusy(listingId);
    setMessage("");
    const { error } = await createClient()
      .from("reports")
      .update({ status: "resolved" })
      .eq("listing_id", listingId)
      .eq("status", "open");
    setBusy(null);
    setMessage(error ? "Couldn't dismiss the reports." : "Reports dismissed. The listing stays live.");
    load();
  }

  if (access === "checking") return <p className="text-sm text-muted-foreground">Checking access…</p>;

  if (access === "denied") {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">Go to Home</Link>
      </div>
    );
  }

  const openReports = groups.reduce((n, g) => n + g.reports.length, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4">
          <dt className="text-sm text-muted-foreground">Live horses</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{liveCount}</dd>
        </div>
        <div className={`rounded-xl border p-4 ${openReports ? "border-destructive" : ""}`}>
          <dt className="text-sm text-muted-foreground">Open reports</dt>
          <dd className={`mt-1 text-2xl font-semibold tabular-nums ${openReports ? "text-destructive" : ""}`}>{openReports}</dd>
        </div>
      </dl>

      <div className="mt-6 flex gap-2 border-b text-sm" role="tablist">
        {(
          [
            ["reports", `Reported (${groups.length})`],
            ["recent", "Newest listings"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-3 py-2 ${tab === key ? "border-primary font-medium" : "border-transparent text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && <p role="status" className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm">{message}</p>}

      {tab === "reports" && (
        <ul className="mt-4 grid gap-3">
          {groups.length === 0 && (
            <li className="rounded-xl border px-6 py-10 text-center text-sm text-muted-foreground">
              No open reports. All clear.
            </li>
          )}
          {groups.map(({ listing, reports }) => (
            <li key={listing.id} className="rounded-xl border p-3">
              <ListingRow listing={listing} />
              <ul className="mt-3 grid gap-1.5 text-sm">
                {reports.map((r) => (
                  <li key={r.id} className="rounded-lg bg-muted px-3 py-2">
                    <span className="font-medium">{r.reason}</span>
                    <span className="text-muted-foreground"> · {dateText(r.created_at)}</span>
                    {r.details && <p className="mt-0.5 text-muted-foreground">{r.details}</p>}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <button
                  type="button"
                  disabled={busy === listing.id}
                  onClick={() => setListingStatus(listing, "removed")}
                  className="rounded-lg bg-destructive px-3 py-2 font-medium text-white disabled:opacity-60"
                >
                  Remove listing
                </button>
                <button
                  type="button"
                  disabled={busy === listing.id}
                  onClick={() => dismissReports(listing.id)}
                  className="rounded-lg border px-3 py-2 hover:bg-muted disabled:opacity-60"
                >
                  Dismiss reports
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "recent" && (
        <ul className="mt-4 grid gap-3">
          {recent.map((listing) => (
            <li key={listing.id} className="rounded-xl border p-3">
              <ListingRow listing={listing} />
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {listing.status === "removed" ? (
                  <button
                    type="button"
                    disabled={busy === listing.id}
                    onClick={() => setListingStatus(listing, "live")}
                    className="rounded-lg border px-3 py-2 hover:bg-muted disabled:opacity-60"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy === listing.id}
                    onClick={() => setListingStatus(listing, "removed")}
                    className="rounded-lg border px-3 py-2 text-destructive hover:bg-muted disabled:opacity-60"
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

function ListingRow({ listing }: { listing: ListingInfo }) {
  const thumb = thumbUrl(listing);
  return (
    <div className="flex gap-3">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
        {thumb && <img src={thumb} alt="" loading="lazy" className="size-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-medium">
            {listing.breed} {listing.gender.toLowerCase()} · {formatInr(listing.price_inr)}
          </p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
              listing.status === "live" ? "bg-green-100 text-green-800" : listing.status === "removed" ? "bg-red-100 text-red-800" : "bg-muted"
            }`}
          >
            {listing.status}
          </span>
        </div>
        <p className="truncate text-muted-foreground">
          {listing.town}, {listing.district} · {dateText(listing.created_at)}
        </p>
        {listing.status === "live" && (
          <Link href={`/horses/${listing.slug}`} target="_blank" className="text-primary hover:underline">
            Open listing
          </Link>
        )}
      </div>
    </div>
  );
}
