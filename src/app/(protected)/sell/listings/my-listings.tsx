"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatInr } from "@/lib/sample-data";

type Status = "pending" | "live" | "sold" | "expired" | "rejected" | "removed";

type MyListing = {
  id: string;
  slug: string;
  status: Status;
  breed: string;
  gender: string;
  price_inr: number;
  district: string;
  town: string;
  created_at: string;
  photo_paths: Record<string, string> | null;
  video_path: string | null;
  vet_certificate_path: string | null;
};

const statusStyle: Record<Status, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-green-100 text-green-800" },
  sold: { label: "Sold", className: "bg-muted text-foreground" },
  pending: { label: "Waiting", className: "bg-amber-100 text-amber-800" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  removed: { label: "Removed", className: "bg-red-100 text-red-800" },
};

const mediaUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${path}`;

export function MyListings() {
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login?next=/sell/listings");
      return;
    }
    const { data, error } = await supabase
      .from("listings")
      .select("id, slug, status, breed, gender, price_inr, district, town, created_at, photo_paths, video_path, vet_certificate_path")
      .eq("seller_id", session.user.id)
      .order("created_at", { ascending: false });
    if (error) setError("Couldn't load your listings. Please refresh the page.");
    setListings((data as MyListing[] | null) ?? []);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(listing: MyListing, status: "live" | "sold") {
    setBusyId(listing.id);
    setError("");
    const { error } = await createClient().from("listings").update({ status }).eq("id", listing.id);
    setBusyId(null);
    if (error) return setError("Couldn't update the listing. Please try again.");
    setListings((all) => all?.map((l) => (l.id === listing.id ? { ...l, status } : l)) ?? null);
  }

  async function remove(listing: MyListing) {
    setBusyId(listing.id);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.from("listings").delete().eq("id", listing.id);
    if (error) {
      setBusyId(null);
      return setError("Couldn't delete the listing. Please try again.");
    }
    // Also delete its photos, video and certificate from storage
    const media = [...Object.values(listing.photo_paths ?? {}), ...(listing.video_path ? [listing.video_path] : [])];
    if (media.length) await supabase.storage.from("listing-media").remove(media);
    if (listing.vet_certificate_path) await supabase.storage.from("documents").remove([listing.vet_certificate_path]);
    setBusyId(null);
    setConfirmDelete(null);
    setListings((all) => all?.filter((l) => l.id !== listing.id) ?? null);
  }

  if (listings === null) {
    return <p className="mt-8 text-sm text-muted-foreground">Loading your listings…</p>;
  }

  return (
    <div className="mt-6">
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-destructive p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {listings.length === 0 ? (
        <div className="rounded-xl border px-6 py-12 text-center">
          <p className="font-medium">You haven&apos;t posted any horses yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Post your first horse. It takes about 5 minutes.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {listings.map((l) => {
            const cover = l.photo_paths?.front ?? Object.values(l.photo_paths ?? {})[0];
            const status = statusStyle[l.status] ?? statusStyle.pending;
            const busy = busyId === l.id;
            const posted = new Date(l.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            return (
              <li key={l.id} className="rounded-xl border p-3">
                <div className="flex gap-3">
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element -- small thumbnail, already resized on upload
                      <img src={mediaUrl(cover)} alt="" loading="lazy" className="size-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-medium">
                        {l.breed} {l.gender.toLowerCase()}
                      </p>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 font-semibold">{formatInr(l.price_inr)}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {l.town}, {l.district} · Posted {posted}
                    </p>
                  </div>
                </div>

                {l.status === "removed" && (
                  <p className="mt-3 text-xs text-destructive">
                    This listing was removed by EquineTrade for breaking the listing rules.
                  </p>
                )}

                {/* Actions */}
                {confirmDelete === l.id ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                    <span className="flex-1">Delete this listing and its photos? This can&apos;t be undone.</span>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(null)}
                      disabled={busy}
                      className="rounded-lg border bg-background px-3 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(l)}
                      disabled={busy}
                      className="rounded-lg bg-destructive px-3 py-2 font-medium text-white disabled:opacity-60"
                    >
                      {busy ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    {l.status === "live" && (
                      <>
                        <Link href={`/horses/${l.slug}`} className="rounded-lg border px-3 py-2 hover:bg-muted">
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setStatus(l, "sold")}
                          disabled={busy}
                          className="rounded-lg border px-3 py-2 hover:bg-muted disabled:opacity-60"
                        >
                          {busy ? "Saving…" : "Mark as sold"}
                        </button>
                      </>
                    )}
                    {l.status === "sold" && (
                      <button
                        type="button"
                        onClick={() => setStatus(l, "live")}
                        disabled={busy}
                        className="rounded-lg border px-3 py-2 hover:bg-muted disabled:opacity-60"
                      >
                        {busy ? "Saving…" : "Not sold? Show again"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(l.id)}
                      className="rounded-lg border px-3 py-2 text-destructive hover:bg-muted"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
