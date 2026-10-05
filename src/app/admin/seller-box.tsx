"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type SellerInfo = {
  id: string;
  name: string | null;
  avatarPath: string | null;
  memberSince: string;
  history: { oldName: string | null; newName: string | null; changedAt: string }[];
};

const dateText = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** The seller of a reported horse: photo, name, name changes, and buttons to clear a bad photo or name. */
export function SellerBox({ seller, onChanged }: { seller: SellerInfo; onChanged: (message: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"photo" | "name" | null>(null);

  const avatarUrl = seller.avatarPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${seller.avatarPath}`
    : null;
  // The first entry is setting a name for the first time, not a change
  const changes = seller.history.filter((h) => h.oldName);

  async function clear(what: "photo" | "name") {
    setBusy(true);
    const supabase = createClient();
    const { data: oldPath, error } = await supabase.rpc("mod_clear_profile", { p_user_id: seller.id, p_what: what });
    if (!error && typeof oldPath === "string" && oldPath) {
      await supabase.storage.from("avatars").remove([oldPath]);
    }
    setBusy(false);
    setConfirm(null);
    onChanged(error ? "Couldn't update the seller's profile." : what === "photo" ? "Seller's photo removed." : "Seller's name removed.");
  }

  return (
    <div className="mt-3 rounded-lg border p-3 text-sm">
      <div className="flex items-center gap-3">
        <div className="size-10 shrink-0 overflow-hidden rounded-full bg-muted">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- small profile photo
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center font-semibold text-muted-foreground">
              {(seller.name || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            Seller: {seller.name || <span className="text-muted-foreground">no name</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            Member since {dateText(seller.memberSince)}
            {changes.length > 0 && ` · name changed ${changes.length} time${changes.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {changes.length > 0 && (
        <ul className="mt-2 grid gap-0.5 text-xs text-muted-foreground">
          {changes.slice(0, 5).map((h, i) => (
            <li key={i}>
              {dateText(h.changedAt)}: &ldquo;{h.oldName}&rdquo; → &ldquo;{h.newName ?? "(removed)"}&rdquo;
            </li>
          ))}
        </ul>
      )}

      {confirm ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-muted p-2">
          <span className="flex-1 text-xs">
            {confirm === "photo" ? "Remove this seller's profile photo?" : "Remove this seller's name? They can set a new one."}
          </span>
          <button type="button" onClick={() => setConfirm(null)} disabled={busy} className="rounded-lg border bg-background px-3 py-1.5">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => clear(confirm)}
            disabled={busy}
            className="rounded-lg bg-destructive px-3 py-1.5 font-medium text-white disabled:opacity-60"
          >
            {busy ? "Removing…" : "Remove"}
          </button>
        </div>
      ) : (
        (avatarUrl || seller.name) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {avatarUrl && (
              <button type="button" onClick={() => setConfirm("photo")} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                Remove photo
              </button>
            )}
            {seller.name && (
              <button type="button" onClick={() => setConfirm("name")} className="rounded-lg border px-3 py-1.5 hover:bg-muted">
                Remove name
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}
