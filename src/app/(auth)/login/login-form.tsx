"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const RESEND_SECONDS = 30;

const inputClass =
  "h-12 w-full rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";
const primaryButton =
  "h-12 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);

  // Countdown before "Resend code" becomes available
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const fullPhone = `+91${phone}`;

  async function sendCode() {
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    const { error } = await createClient().auth.signInWithOtp({ phone: fullPhone });
    setBusy(false);
    if (error) {
      setError(friendlyError(error.message));
      return;
    }
    setStep("code");
    setCode("");
    setResendIn(RESEND_SECONDS);
  }

  async function verifyCode() {
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from the SMS.");
      return;
    }
    setBusy(true);
    const { error } = await createClient().auth.verifyOtp({
      phone: fullPhone,
      token: code,
      type: "sms",
    });
    setBusy(false);
    if (error) {
      setError(friendlyError(error.message));
      return;
    }
    router.replace(next);
    router.refresh();
  }

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
          <div className="grid gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium">Mobile number</label>
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
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? "Sending code…" : "Send code"}
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
            Code sent to <span className="font-medium">+91 {phone}</span>.{" "}
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError("");
              }}
              className="text-primary hover:underline"
            >
              Change number
            </button>
          </p>
          <div className="grid gap-1.5">
            <label htmlFor="code" className="text-sm font-medium">6-digit code</label>
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
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? "Checking…" : "Verify and continue"}
          </button>
          <button
            type="button"
            onClick={sendCode}
            disabled={busy || resendIn > 0}
            className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </form>
      )}

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline">Terms of use</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy policy</Link>.
      </p>
    </div>
  );
}

// Turns technical Supabase messages into plain language
function friendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("expired") || m.includes("invalid")) return "That code is wrong or has expired. Try again or resend the code.";
  if (m.includes("rate") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("provider") || m.includes("disabled") || m.includes("unsupported"))
    return "Phone login isn't switched on yet in Supabase. (Setup step pending.)";
  return "Something went wrong. Please try again.";
}
