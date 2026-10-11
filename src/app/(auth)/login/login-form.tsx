"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const RESEND_SECONDS = 30;

const inputClass =
  "h-12 w-full rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";
const primaryButton =
  "h-12 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50";

/**
 * Phone + one-time code, in two modes:
 *  - "login":  existing users only. A number with no account gets "Sign up instead".
 *  - "signup": new users. Also asks for their name, saved to their profile.
 *    (If the number already has an account, it simply logs them in.)
 */
export function LoginForm({ next, mode }: { next: string; mode: "login" | "signup" }) {
  const router = useRouter();
  const t = useTranslations("login");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"" | ErrorKey>("");
  const [resendIn, setResendIn] = useState(0);

  // Countdown before "Resend code" becomes available
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const fullPhone = `+91${phone}`;
  const nextQuery = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  async function sendCode() {
    setError("");
    if (mode === "signup" && name.trim().length < 2) return setError("errName");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("errPhone");
    setBusy(true);
    const { error } = await createClient().auth.signInWithOtp({
      phone: fullPhone,
      // Log in never creates a new account
      options: { shouldCreateUser: mode === "signup" },
    });
    setBusy(false);
    if (error) return setError(friendlyError(error.message));
    setStep("code");
    setCode("");
    setResendIn(RESEND_SECONDS);
  }

  async function verifyCode() {
    setError("");
    if (!/^\d{6}$/.test(code)) return setError("errCode");
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: code, type: "sms" });
    if (error) {
      setBusy(false);
      return setError(friendlyError(error.message));
    }
    // New account: save the name. Only fills an empty name, never replaces an existing one.
    if (mode === "signup" && data.user) {
      await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", data.user.id).is("full_name", null);
    }
    setBusy(false);
    router.replace(next);
    router.refresh();
  }

  const errorText =
    error === "errNoAccount"
      ? t.rich("errNoAccount", {
          signup: (c) => (
            <Link href={`/signup${nextQuery}`} className="font-medium underline">
              {c}
            </Link>
          ),
        })
      : error
        ? t(error)
        : null;

  return (
    <div className="mt-8">
      {step === "phone" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
          }}
          className="grid gap-4"
        >
          {mode === "signup" && (
            <div className="grid gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">{t("name")}</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                maxLength={60}
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">{t("nameHint")}</p>
            </div>
          )}
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
                autoFocus={mode === "login"}
              />
            </div>
          </div>
          {errorText && <p role="alert" className="text-sm text-destructive">{errorText}</p>}
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? t("sending") : t("sendCode")}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyCode();
          }}
          className="grid gap-4"
        >
          <p className="text-sm">
            {t.rich("codeSent", { phone: `+91 ${phone}`, b: (c) => <span className="font-medium">{c}</span> })}{" "}
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
              className="text-primary hover:underline"
            >
              {t("changeNumber")}
            </button>
          </p>
          <div className="grid gap-1.5">
            <label htmlFor="code" className="text-sm font-medium">{t("codeLabel")}</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${inputClass} text-center text-xl tracking-[0.5em]`}
              autoFocus
            />
          </div>
          {errorText && <p role="alert" className="text-sm text-destructive">{errorText}</p>}
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? t("checking") : mode === "signup" ? t("verifySignup") : t("verify")}
          </button>
          <button
            type="button"
            onClick={sendCode}
            disabled={busy || resendIn > 0}
            className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {resendIn > 0 ? t("resendIn", { seconds: resendIn }) : t("resend")}
          </button>
        </form>
      )}

      {/* Wrong form? Switch here */}
      <div className="mt-8 border-t pt-6 text-center">
        <p className="text-sm text-muted-foreground">{mode === "login" ? t("newHere") : t("haveAccount")}</p>
        <Link
          href={`${mode === "login" ? "/signup" : "/login"}${nextQuery}`}
          replace
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-1 rounded-lg border text-sm font-medium hover:border-primary/60 hover:text-primary"
        >
          {mode === "login" ? t("signupLink") : t("loginLink")}
          <span aria-hidden>→</span>
        </Link>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        {t.rich("agree", {
          terms: (c) => <Link href="/terms" className="underline">{c}</Link>,
          privacy: (c) => <Link href="/privacy" className="underline">{c}</Link>,
        })}
      </p>
    </div>
  );
}

type ErrorKey =
  | "errName" | "errPhone" | "errCode" | "errNoAccount"
  | "errWrongCode" | "errTooMany" | "errNotSetUp" | "errGeneric";

// Turns technical Supabase messages into a plain-language message key
function friendlyError(message: string): ErrorKey {
  const m = message.toLowerCase();
  // Log in with a number that has no account yet
  if (m.includes("signups not allowed") || m.includes("user not found")) return "errNoAccount";
  if (m.includes("expired") || m.includes("invalid")) return "errWrongCode";
  if (m.includes("rate") || m.includes("too many")) return "errTooMany";
  if (m.includes("provider") || m.includes("disabled") || m.includes("unsupported")) return "errNotSetUp";
  return "errGeneric";
}
