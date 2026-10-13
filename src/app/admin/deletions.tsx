"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Deletion = {
  id: string;
  phone_masked: string | null;
  phone_hash: string | null;
  account_created_at: string | null;
  reason: string | null;
  listings_count: number;
  files_count: number;
  deleted_by: "self" | "admin";
  status: "requested" | "files_removed" | "completed" | "failed";
  requested_at: string;
  files_removed_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  error: string | null;
};

const reasonLabel: Record<string, string> = {
  sold: "Sold their horse",
  not_useful: "Website wasn't useful",
  too_many_calls: "Too many calls or messages",
  privacy: "Privacy concerns",
  other: "Another reason",
};

const statusStyle: Record<Deletion["status"], string> = {
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  requested: "bg-amber-100 text-amber-900",
  files_removed: "bg-amber-100 text-amber-900",
};

const statusLabel: Record<Deletion["status"], string> = {
  completed: "Completed",
  failed: "Failed",
  requested: "In progress",
  files_removed: "In progress",
};

const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

/** L1 only: every account deletion with its timeline (newest first). */
export function Deletions() {
  const [rows, setRows] = useState<Deletion[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    createClient()
      .from("account_deletions")
      .select("*")
      .order("requested_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) setError("Couldn't load deleted accounts. Has update 020 been run in Supabase?");
        setRows((data as Deletion[] | null) ?? []);
      });
  }, []);

  // How many times the same mobile number has deleted an account
  const repeats = new Map<string, number>();
  for (const r of rows ?? []) if (r.phone_hash) repeats.set(r.phone_hash, (repeats.get(r.phone_hash) ?? 0) + 1);

  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground">
        Last 200 deletions. Numbers are masked; the full number is never kept.
      </p>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {rows === null && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      {rows && rows.length === 0 && !error && (
        <p className="mt-4 rounded-xl border px-6 py-10 text-center text-sm text-muted-foreground">No accounts deleted yet.</p>
      )}

      <ul className="mt-4 grid gap-2">
        {(rows ?? []).map((r) => {
          const times = (r.phone_hash && repeats.get(r.phone_hash)) || 1;
          return (
            <li key={r.id} className="rounded-xl border p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">
                  {r.phone_masked ?? "Unknown number"}
                  {times > 1 && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-900">
                      deleted {times} times
                    </span>
                  )}
                </p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusStyle[r.status]}`}>
                  {statusLabel[r.status]}
                </span>
              </div>
              <p className="mt-0.5 text-muted-foreground">
                {r.reason ? reasonLabel[r.reason] ?? r.reason : "No reason given"} · {r.listings_count} listing
                {r.listings_count === 1 ? "" : "s"} · {r.files_count} file{r.files_count === 1 ? "" : "s"} ·{" "}
                {r.deleted_by === "self" ? "by the user" : "by an admin"}
              </p>
              <ol className="mt-2 grid gap-0.5 border-l-2 pl-3 text-xs text-muted-foreground">
                {r.account_created_at && <li>Account created: {when(r.account_created_at)}</li>}
                <li>Deletion requested: {when(r.requested_at)}</li>
                {r.files_removed_at && <li>Files removed: {when(r.files_removed_at)}</li>}
                {r.completed_at && <li className="text-green-700">Account deleted: {when(r.completed_at)}</li>}
                {r.failed_at && (
                  <li className="text-destructive">
                    Failed: {when(r.failed_at)}
                    {r.error ? ` (${r.error})` : ""}
                  </li>
                )}
              </ol>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
