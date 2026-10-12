"use client";

import type { UserIdentity } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/google-button";
import { RecoveryCodeCard } from "@/components/recovery-code-card";
import { dateLocale } from "@/lib/labels";

/** Profile section: recovery code + linked Google account. */
export function AccountSecurity() {
  const t = useTranslations("recovery");
  const locale = useLocale();
  const [codeDate, setCodeDate] = useState<string | null | undefined>(undefined); // undefined = loading
  const [newCode, setNewCode] = useState<string | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const [google, setGoogle] = useState<UserIdentity | null | undefined>(undefined);
  const [canUnlink, setCanUnlink] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: created }, { data: ids }] = await Promise.all([
      supabase.rpc("recovery_code_created_at"),
      supabase.auth.getUserIdentities(),
    ]);
    setCodeDate((created as string | null) ?? null);
    const list = ids?.identities ?? [];
    setGoogle(list.find((i) => i.provider === "google") ?? null);
    setCanUnlink(list.length > 1);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function makeCode() {
    setBusy(true);
    setError("");
    const { data, error } = await createClient().rpc("create_recovery_code");
    setBusy(false);
    setConfirmNew(false);
    if (error || typeof data !== "string") return setError(t("errGeneric"));
    setNewCode(data);
  }

  async function linkGoogle() {
    setBusy(true);
    setError("");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/account/profile")}`;
    const { error } = await createClient().auth.linkIdentity({ provider: "google", options: { redirectTo } });
    if (error) {
      setBusy(false);
      setError(t("googleNotSetUp"));
    }
  }

  async function unlinkGoogle() {
    if (!google) return;
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.unlinkIdentity(google);
    setBusy(false);
    if (error) return setError(t("errGeneric"));
    load();
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale(locale), { day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="mt-8 grid gap-4 rounded-xl border p-4">
      <div>
        <h2 className="font-semibold">{t("sectionTitle")}</h2>
        <p className="text-xs text-muted-foreground">{t("sectionIntro")}</p>
      </div>

      {/* Recovery code */}
      {newCode ? (
        <RecoveryCodeCard
          code={newCode}
          onDone={() => {
            setNewCode(null);
            load();
          }}
        />
      ) : (
        <div className="grid gap-2">
          <p className="text-sm font-medium">{t("codeTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {codeDate === undefined ? "…" : codeDate ? t("codeCreated", { date: fmt(codeDate) }) : t("codeNone")}
          </p>
          {confirmNew ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-2 text-xs">
              <span className="flex-1">{t("codeReplaceWarning")}</span>
              <button type="button" onClick={() => setConfirmNew(false)} className="rounded-lg border bg-background px-3 py-1.5">
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={makeCode}
                disabled={busy}
                className="rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground disabled:opacity-60"
              >
                {t("codeMake")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => (codeDate ? setConfirmNew(true) : makeCode())}
              disabled={busy || codeDate === undefined}
              className="h-11 rounded-lg border text-sm font-medium hover:bg-muted disabled:opacity-60"
            >
              {codeDate ? t("codeNew") : t("codeMake")}
            </button>
          )}
        </div>
      )}

      {/* Google */}
      <div className="grid gap-2 border-t pt-4">
        <p className="text-sm font-medium">{t("googleTitle")}</p>
        {google === undefined ? (
          <p className="text-xs text-muted-foreground">…</p>
        ) : google ? (
          <>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <GoogleIcon />
              {t("googleLinked", { email: String(google.identity_data?.email ?? "Google") })}
            </p>
            {canUnlink && (
              <button
                type="button"
                onClick={unlinkGoogle}
                disabled={busy}
                className="h-11 rounded-lg border text-sm text-destructive hover:bg-muted disabled:opacity-60"
              >
                {t("googleUnlink")}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{t("googleNotYet")}</p>
            <button
              type="button"
              onClick={linkGoogle}
              disabled={busy}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium hover:bg-muted disabled:opacity-60"
            >
              <GoogleIcon />
              {t("googleLink")}
            </button>
          </>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
