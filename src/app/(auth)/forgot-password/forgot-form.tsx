"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/google-button";
import { RecoveryCodeCard } from "@/components/recovery-code-card";
import { PASSWORD_MAX, PASSWORD_MIN } from "../login/login-form";

const inputClass =
  "h-12 w-full rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Forgot password: mobile number + recovery code + new password.
 * After that the user is logged in and gets a NEW recovery code (each code works once).
 */
export function ForgotForm() {
  const router = useRouter();
  const t = useTranslations("recovery");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newCode, setNewCode] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError(t("errPhone"));
    if (code.replace(/[^A-Za-z0-9]/g, "").length !== 8) return setError(t("errCodeFormat"));
    if (password.length < PASSWORD_MIN) return setError(t("errShort", { min: PASSWORD_MIN }));
    if (password !== confirm) return setError(t("errMatch"));

    setBusy(true);
    const supabase = createClient();
    const { data: result, error: rpcError } = await supabase.rpc("recover_with_code", {
      p_phone: phone,
      p_code: code,
      p_password: password,
    });
    if (rpcError || result !== "ok") {
      setBusy(false);
      const key =
        result === "too_many" ? "errTooMany" : result === "wrong" ? "errWrong" : result === "bad_phone" ? "errPhone" : "errGeneric";
      return setError(t(key, { min: PASSWORD_MIN }));
    }

    // Log in with the new password, then make a fresh recovery code
    const { error: loginError } = await supabase.auth.signInWithPassword({ phone: `+91${phone}`, password });
    if (loginError) {
      setBusy(false);
      router.replace("/login");
      return;
    }
    const { data: fresh } = await supabase.rpc("create_recovery_code");
    setBusy(false);
    if (typeof fresh === "string") setNewCode(fresh);
    else finish();
  }

  function finish() {
    router.replace("/");
    router.refresh();
  }

  if (newCode) {
    return (
      <div className="mt-8 grid gap-4">
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{t("resetDone")}</p>
        <RecoveryCodeCard code={newCode} onDone={finish} />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium">{t("mobile")}</label>
          <div className="flex">
            <span className="flex h-12 items-center rounded-l-lg border border-r-0 bg-muted px-3 text-base text-muted-foreground">
              +91
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`${inputClass} rounded-l-none`}
              autoFocus
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="code" className="text-sm font-medium">{t("code")}</label>
          <input
            id="code"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={9}
            placeholder="XXXX-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={`${inputClass} font-mono tracking-widest`}
          />
          <p className="text-xs text-muted-foreground">{t("codeHint")}</p>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="new-password" className="text-sm font-medium">{t("newPassword")}</label>
          <div className="relative">
            <input
              id="new-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              maxLength={PASSWORD_MAX}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? t("hide") : t("show")}
              className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="confirm" className="text-sm font-medium">{t("confirm")}</label>
          <input
            id="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            maxLength={PASSWORD_MAX}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-12 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? t("resetting") : t("reset")}
        </button>
      </form>

      {/* Other ways back in */}
      <div className="mt-8 grid gap-3 border-t pt-6 text-sm">
        <p className="font-medium">{t("otherWays")}</p>
        <GoogleButton next="/account/password" />
        <p className="text-xs text-muted-foreground">{t("googleWay")}</p>
        <p className="text-xs text-muted-foreground">{t("adminWay")}</p>
        <Link href="/login" className="mt-2 text-center text-sm text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
