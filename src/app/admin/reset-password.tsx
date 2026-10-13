"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Easy to read out on WhatsApp: no 0/O or 1/l look-alikes
const CHARS = "abcdefghjkmnpqrstuvwxyz23456789";
function tempPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join("");
}

function friendly(message: string) {
  if (message.includes("NO_USER")) return "No account with this number.";
  if (message.includes("BAD_PHONE")) return "Enter a valid 10-digit mobile number.";
  if (message.includes("BAD_PASSWORD")) return "The temporary password must be 6 to 72 characters.";
  if (message.includes("IS_ADMIN")) return "Admin passwords can't be reset here. Admins change their own password.";
  if (message.includes("Not allowed")) return "Only L2 admins can reset passwords.";
  if (message.includes("admin_reset_password")) return "Run supabase/018_password_login.sql in Supabase first.";
  return "Something went wrong. Please try again.";
}

/** L2 only: set a temporary password for a user who forgot theirs. */
export function ResetPassword() {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ phone: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(null);
    setCopied(false);
    if (!/^[6-9]\d{9}$/.test(phone)) return setError(friendly("BAD_PHONE"));
    const password = tempPassword();
    setBusy(true);
    const { error } = await createClient().rpc("admin_reset_password", { p_phone: phone, p_password: password });
    setBusy(false);
    if (error) return setError(friendly(error.message));
    setDone({ phone, password });
    setPhone("");
  }

  const message = done
    ? `HorseMart: your temporary password is ${done.password}\nLog in with your mobile number and this password. You'll be asked to choose a new password.`
    : "";

  return (
    <div className="mt-4 grid max-w-md gap-5">
      <section className="rounded-xl border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">When someone forgets their password</p>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5">
          <li>Make sure the request really comes from that number (e.g. they WhatsApp you from it).</li>
          <li>Enter the number below. A temporary password is created.</li>
          <li>Send it to them. At their next login they must choose a new password.</li>
        </ol>
      </section>

      <form onSubmit={reset} className="grid gap-3 rounded-xl border p-4">
        <label htmlFor="reset-phone" className="text-sm font-medium">Mobile number</label>
        <div className="flex">
          <span className="flex h-11 items-center rounded-l-lg border border-r-0 bg-muted px-3 text-muted-foreground">+91</span>
          <input
            id="reset-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="h-11 w-full rounded-r-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-11 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Resetting…" : "Create temporary password"}
        </button>
      </form>

      {done && (
        <section className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm">
          <p className="font-medium text-green-900">Temporary password for +91 {done.phone}</p>
          <p className="mt-2 rounded-lg bg-white px-3 py-2 text-center font-mono text-xl tracking-widest">{done.password}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(message).then(() => setCopied(true))}
              className="rounded-lg border bg-white px-3 py-2 hover:bg-muted"
            >
              {copied ? "Copied ✓" : "Copy message"}
            </button>
            <a
              href={`https://wa.me/91${done.phone}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener"
              className="rounded-lg border border-[#25D366] bg-white px-3 py-2 hover:bg-muted"
            >
              Send on WhatsApp
            </a>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">This password isn&apos;t stored anywhere you can see again. Send it now.</p>
        </section>
      )}
    </div>
  );
}
