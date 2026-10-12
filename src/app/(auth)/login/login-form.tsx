"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { IS_LIVE } from "@/lib/site";
import { RecoveryCodeCard } from "@/components/recovery-code-card";
import { GoogleButton } from "@/components/google-button";

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 72; // longest password the login system accepts

const inputClass =
  "h-12 w-full rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";
const primaryButton =
  "h-12 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50";

/**
 * Mobile number + password, in two modes:
 *  - "login":  existing users.
 *  - "signup": new users: name, mobile number, password (typed twice).
 * Passwords: any mix of letters, numbers and special characters, at least 6.
 */
export function LoginForm({ next, mode }: { next: string; mode: "login" | "signup" }) {
  const router = useRouter();
  const t = useTranslations("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"" | ErrorKey>("");
  // Test version only: Supabase's own error text, to help find setup problems
  const [detail, setDetail] = useState("");
  // After sign-up: the new recovery code, shown once before continuing
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const fullPhone = `+91${phone}`;
  const nextQuery = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDetail("");
    if (mode === "signup" && name.trim().length < 2) return setError("errName");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("errPhone");
    if (password.length < PASSWORD_MIN) return setError("errPasswordShort");
    if (mode === "signup" && password !== confirm) return setError("errPasswordMatch");

    setBusy(true);
    const supabase = createClient();
    const { data, error } =
      mode === "signup"
        ? await supabase.auth.signUp({ phone: fullPhone, password })
        : await supabase.auth.signInWithPassword({ phone: fullPhone, password });

    if (error || !data.session || !data.user) {
      setBusy(false);
      setDetail(error ? `${error.status ?? ""} ${error.message}`.trim() : "No session returned (phone confirmation may still be on)");
      return setError(friendlyError(error?.message ?? "", mode));
    }

    // New account: save the name (only fills an empty name) and show a recovery code
    if (mode === "signup") {
      await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", data.user.id).is("full_name", null);
      const { data: code } = await supabase.rpc("create_recovery_code");
      if (typeof code === "string") {
        setBusy(false);
        setRecoveryCode(code);
        return;
      }
    }

    // After an admin reset, the user must choose a new password first
    const { data: profile } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", data.user.id)
      .maybeSingle();
    setBusy(false);
    if (profile?.must_change_password) {
      router.replace(`/account/password?forced=1${next !== "/" ? `&next=${encodeURIComponent(next)}` : ""}`);
    } else {
      router.replace(next);
    }
    router.refresh();
  }

  function continueAfterCode() {
    router.replace(next);
    router.refresh();
  }

  if (recoveryCode) {
    return (
      <div className="mt-8">
        <RecoveryCodeCard code={recoveryCode} onDone={continueAfterCode} />
      </div>
    );
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
      : error === "errExists"
        ? t.rich("errExists", {
            login: (c) => (
              <Link href={`/login${nextQuery}`} className="font-medium underline">
                {c}
              </Link>
            ),
          })
        : error
          ? t(error, { min: PASSWORD_MIN })
          : null;

  const toggle = (
    <button
      type="button"
      onClick={() => setShow((s) => !s)}
      aria-label={show ? t("hidePassword") : t("showPassword")}
      className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
    >
      {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
    </button>
  );

  return (
    <div className="mt-8">
      <form onSubmit={submit} className="grid gap-4">
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

        <div className="grid gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">{t("password")}</label>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              maxLength={PASSWORD_MAX}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-12`}
            />
            {toggle}
          </div>
          {mode === "signup" && (
            <p className="text-xs text-muted-foreground">{t("passwordHint", { min: PASSWORD_MIN })}</p>
          )}
        </div>

        {mode === "signup" && (
          <div className="grid gap-1.5">
            <label htmlFor="confirm" className="text-sm font-medium">{t("confirmPassword")}</label>
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
        )}

        {errorText && <p role="alert" className="text-sm text-destructive">{errorText}</p>}
        {!IS_LIVE && detail && <p className="-mt-2 break-words text-xs text-muted-foreground">Supabase: {detail}</p>}

        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? t("checking") : mode === "signup" ? t("createAccount") : t("loginButton")}
        </button>

        {mode === "login" && (
          <Link href="/forgot-password" className="justify-self-center text-sm text-primary hover:underline">
            {t("forgotLink")}
          </Link>
        )}
      </form>

      {/* Google: only for accounts that linked Google in their profile */}
      {mode === "login" && (
        <div className="mt-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("or")}
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton next={next} className="mt-4" />
          <p className="mt-2 text-center text-xs text-muted-foreground">{t("googleHint")}</p>
        </div>
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
  | "errName" | "errPhone" | "errPasswordShort" | "errPasswordMatch"
  | "errNoAccount" | "errExists" | "errWrongPassword" | "errTooMany" | "errNotSetUp" | "errGeneric";

// Turns technical Supabase messages into a plain-language message key
function friendlyError(message: string, mode: "login" | "signup"): ErrorKey {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) return "errExists";
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "errWrongPassword";
  if (m.includes("password") && (m.includes("short") || m.includes("at least") || m.includes("weak"))) return "errPasswordShort";
  if (m.includes("rate") || m.includes("too many")) return "errTooMany";
  if (m.includes("signups not allowed") || m.includes("provider") || m.includes("disabled") || m.includes("confirm")) {
    return mode === "signup" ? "errNotSetUp" : "errGeneric";
  }
  return "errGeneric";
}
