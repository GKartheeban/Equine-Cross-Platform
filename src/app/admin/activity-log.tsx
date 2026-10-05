"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Entry = {
  id: number;
  created_at: string;
  action: string;
  note: string | null;
  admin_name: string | null;
  admin_phone: string | null;
  admin_level: 1 | 2 | null;
  listing_slug: string | null;
};

const actionLabel: Record<string, string> = {
  remove_listing: "Removed listing",
  restore_listing: "Restored listing",
  dismiss_reports: "Dismissed reports",
  remove_photo: "Removed seller's photo",
  remove_name: "Removed seller's name",
  add_admin: "Added admin",
  change_level: "Changed admin level",
  remove_admin: "Removed admin",
};

const phoneText = (p: string | null) => {
  const d = (p ?? "").replace(/\D/g, "");
  return d.length === 12 ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : "unknown";
};

/** L1 only: every moderation and admin action, newest first, with who did it. */
export function ActivityLog() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [filter, setFilter] = useState<"all" | "L2">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    createClient()
      .rpc("admin_log", { p_limit: 200 })
      .then(({ data, error }) => {
        if (error) setError("Couldn't load the action log.");
        setEntries((data as Entry[] | null) ?? []);
      });
  }, []);

  const shown = (entries ?? []).filter((e) => filter === "all" || e.admin_level === 2);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Filter">
        {(
          [
            ["all", "All admins"],
            ["L2", "L2 only"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 ${filter === key ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-muted"}`}
          >
            {label}
          </button>
        ))}
        <span className="text-xs text-muted-foreground">Last 200 actions</span>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {entries === null && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      {entries && shown.length === 0 && !error && (
        <p className="mt-4 rounded-xl border px-6 py-10 text-center text-sm text-muted-foreground">No actions yet.</p>
      )}

      <ul className="mt-4 grid gap-2">
        {shown.map((e) => (
          <li key={e.id} className="rounded-xl border p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{actionLabel[e.action] ?? e.action}</p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(e.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            {e.note && (
              <p className="mt-0.5 text-muted-foreground">
                {e.listing_slug ? (
                  <Link href={`/horses/${e.listing_slug}`} target="_blank" className="hover:text-primary hover:underline">
                    {e.note}
                  </Link>
                ) : (
                  e.note
                )}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              By {e.admin_name || "No name"} · {phoneText(e.admin_phone)}
              {e.admin_level ? ` · L${e.admin_level}` : " · no longer an admin"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
