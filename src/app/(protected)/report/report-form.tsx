"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const reportReasons = [
  "Fake or misleading listing",
  "Horse already sold",
  "Wrong price or details",
  "Sick, injured or underage horse",
  "Scam or asked for advance payment",
  "Other",
] as const;

export function ReportForm({ listingId, slug }: { listingId: string; slug: string }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Reporting needs a login, so reports come from real, verified numbers
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (!session) router.replace(`/login?next=${encodeURIComponent(`/report?listing=${slug}`)}`);
        else setReady(true);
      });
  }, [router, slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return setError("Choose a reason.");
    if (reason === "Other" && !details.trim()) return setError("Tell us briefly what's wrong.");
    setBusy(true);
    setError("");
    const { error } = await createClient()
      .from("reports")
      .insert({ listing_id: listingId, reason, details: details.trim() || null });
    setBusy(false);
    if (error) {
      if (error.code === "23505") return setDone(true); // already reported by this person
      return setError("Couldn't send the report. Please try again.");
    }
    setDone(true);
  }

  if (!ready) return <p className="mt-6 text-sm text-muted-foreground">Checking your login…</p>;

  if (done) {
    return (
      <div className="mt-6 rounded-xl border p-6 text-center">
        <p className="font-semibold">Thank you. We&apos;ve received your report</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We review every report and remove listings that break the rules.
        </p>
        <Link href="/horses" className="mt-5 inline-block rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
          Back to horses
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5">
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">What&apos;s wrong with this listing?</legend>
        {reportReasons.map((r) => (
          <label
            key={r}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm ${
              reason === r ? "border-primary bg-primary/5" : "hover:bg-muted"
            }`}
          >
            <input
              type="radio"
              name="reason"
              value={r}
              checked={reason === r}
              onChange={() => {
                setReason(r);
                setError("");
              }}
              className="accent-[var(--primary)]"
            />
            {r}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-1.5">
        <label htmlFor="details" className="text-sm font-medium">
          Details {reason === "Other" ? "" : "(optional)"}
        </label>
        <textarea
          id="details"
          rows={3}
          maxLength={500}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full rounded-lg border bg-background p-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="h-12 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}
