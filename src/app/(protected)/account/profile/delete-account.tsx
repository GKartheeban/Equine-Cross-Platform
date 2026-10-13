"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { refreshAfterDeletion, refreshPublicPages } from "@/lib/refresh-pages";

const REASONS = ["sold", "not_useful", "too_many_calls", "privacy", "other"] as const;
type Reason = (typeof REASONS)[number];
type Step = "idle" | "checking" | "files" | "account";

/** Every file inside a user's folder (listing folders included). */
async function listFiles(supabase: SupabaseClient, bucket: string, folder: string): Promise<string[]> {
  const files: string[] = [];
  const queue = [folder];
  while (queue.length) {
    const dir = queue.shift()!;
    const { data, error } = await supabase.storage.from(bucket).list(dir, { limit: 1000 });
    if (error) throw new Error(`${bucket}: ${error.message}`);
    for (const item of data ?? []) {
      const path = `${dir}/${item.name}`;
      if (item.id === null) queue.push(path); // a folder
      else files.push(path);
    }
  }
  return files;
}

/** Removes all of the user's photos, videos, vet certificates and profile photo. Returns how many. */
async function deleteAllFiles(supabase: SupabaseClient, userId: string): Promise<number> {
  let count = 0;
  for (const bucket of ["listing-media", "documents", "avatars"]) {
    const files = await listFiles(supabase, bucket, userId);
    for (let i = 0; i < files.length; i += 100) {
      const batch = files.slice(i, i + 100);
      const { error } = await supabase.storage.from(bucket).remove(batch);
      if (error) throw new Error(`${bucket}: ${error.message}`);
      count += batch.length;
    }
  }
  return count;
}

/**
 * Profile section: "Delete my account".
 * The user confirms with their password; then their files, listings and login are
 * deleted, and each step is recorded in the account_deletions table.
 */
export function DeleteAccount() {
  const t = useTranslations("deleteAccount");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | "">("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const busy = step !== "idle";

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();

    // 1. Confirm it's really the account owner
    setStep("checking");
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user?.phone) {
      setStep("idle");
      return setError(t("errSession"));
    }
    const { error: pwError } = await supabase.auth.signInWithPassword({ phone: `+${user.phone}`, password });
    if (pwError) {
      setStep("idle");
      return setError(t("errPassword"));
    }

    // 2. Start the record (refused for admin accounts)
    const { data: deletionId, error: startError } = await supabase.rpc("start_account_deletion", {
      p_reason: reason || null,
    });
    if (startError || typeof deletionId !== "string") {
      setStep("idle");
      return setError(startError?.message.includes("IS_ADMIN") ? t("errAdmin") : t("errGeneric"));
    }

    try {
      // 3. Hide the horses from buyers straight away
      await supabase.from("listings").update({ status: "sold" }).eq("seller_id", user.id).eq("status", "live");
      await refreshPublicPages();

      // 4. Photos, videos, certificates and profile photo
      setStep("files");
      const files = await deleteAllFiles(supabase, user.id);
      await supabase.rpc("mark_deletion_files_removed", { p_id: deletionId, p_files: files });

      // 5. The account itself (listings, saved horses, reports and the rest go with it)
      setStep("account");
      const { error: finishError } = await supabase.rpc("complete_account_deletion", { p_id: deletionId });
      if (finishError) throw new Error(finishError.message);
    } catch (err) {
      await supabase.rpc("fail_account_deletion", {
        p_id: deletionId,
        p_error: err instanceof Error ? err.message : String(err),
      });
      setStep("idle");
      return setError(t("errGeneric"));
    }

    await refreshAfterDeletion(deletionId);
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
    setStep("idle");
    setDone(true);
  }

  if (done) {
    return (
      <section role="status" className="mt-8 grid gap-3 rounded-xl border p-5 text-center">
        <h2 className="font-semibold">{t("doneTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("doneText")}</p>
        {/* A plain link (full page load), so the whole site forgets the old login */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full reload on purpose */}
        <a
          href="/"
          className="mx-auto inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          {t("goHome")}
        </a>
      </section>
    );
  }

  return (
    <section className="mt-10 grid gap-3 rounded-xl border border-destructive/30 p-4">
      <div>
        <h2 className="font-semibold">{t("title")}</h2>
        <p className="text-xs text-muted-foreground">{t("intro")}</p>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-11 rounded-lg border border-destructive/40 text-sm font-medium text-destructive hover:bg-destructive/5"
        >
          {t("open")}
        </button>
      ) : (
        <form onSubmit={deleteAccount} className="grid gap-4">
          <div className="rounded-lg bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">{t("warningTitle")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>{t("what1")}</li>
              <li>{t("what2")}</li>
              <li>{t("what3")}</li>
              <li>{t("what4")}</li>
            </ul>
            <p className="mt-2 text-muted-foreground">{t("cannotUndo")}</p>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="delete-reason" className="text-sm font-medium">
              {t("reasonLabel")}
            </label>
            <select
              id="delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as Reason | "")}
              disabled={busy}
              className="h-12 rounded-lg border bg-background px-3 text-base"
            >
              <option value="">{t("reasonNone")}</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(`reasons.${r}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="delete-password" className="text-sm font-medium">
              {t("passwordLabel")}
            </label>
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              className="h-12 rounded-lg border bg-background px-3 text-base"
            />
            <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword("");
                setError("");
              }}
              disabled={busy}
              className="h-12 rounded-lg border text-sm font-medium hover:bg-muted disabled:opacity-60"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={busy || password.length < 6}
              className="h-12 rounded-lg bg-destructive text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-60"
            >
              {busy ? t(`step.${step}`) : t("confirm")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
