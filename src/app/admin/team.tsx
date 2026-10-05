"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Member = { user_id: string; phone: string; name: string | null; level: 1 | 2; added_at: string; is_me: boolean };

const inputClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";

const phoneText = (p: string) => {
  const d = p.replace(/\D/g, "");
  return d.length === 12 ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : p;
};

// Turns database error codes into plain words
function friendly(message: string) {
  if (message.includes("NO_USER")) return "No account with this number. Ask them to log in to EquineTrade once, then add them.";
  if (message.includes("BAD_PHONE")) return "Enter a valid 10-digit mobile number.";
  if (message.includes("LAST_L1")) return "There must always be at least one L1 admin.";
  return "Something went wrong. Please try again.";
}

/** L1 only: who the admins are, add a new one, change level, remove. */
export function Team() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<1 | 2>(2);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await createClient().rpc("admin_team");
    if (error) setMessage({ ok: false, text: friendly(error.message) });
    setMembers((data as Member[] | null) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!/^[6-9]\d{9}$/.test(phone)) return setMessage({ ok: false, text: friendly("BAD_PHONE") });
    setBusy("add");
    const { error } = await createClient().rpc("admin_add", { p_phone: phone, p_level: level });
    setBusy(null);
    if (error) return setMessage({ ok: false, text: friendly(error.message) });
    setPhone("");
    setMessage({ ok: true, text: `Added as L${level}.` });
    load();
  }

  async function changeLevel(m: Member, to: 1 | 2) {
    setMessage(null);
    setBusy(m.user_id);
    const { error } = await createClient().rpc("admin_add", { p_phone: m.phone, p_level: to });
    setBusy(null);
    setMessage(error ? { ok: false, text: friendly(error.message) } : { ok: true, text: `Changed to L${to}.` });
    load();
  }

  async function remove(m: Member) {
    setMessage(null);
    setBusy(m.user_id);
    const { error } = await createClient().rpc("admin_remove", { p_user_id: m.user_id });
    setBusy(null);
    setConfirmRemove(null);
    setMessage(error ? { ok: false, text: friendly(error.message) } : { ok: true, text: "Admin removed." });
    load();
  }

  return (
    <div className="mt-4 grid gap-6">
      <section className="rounded-xl border p-4 text-sm">
        <h3 className="font-semibold">Admin levels</h3>
        <ul className="mt-2 grid gap-1 text-muted-foreground">
          <li><span className="font-medium text-foreground">L1 · Owner:</span> everything, including this Team page, the action log and the full dashboard.</li>
          <li><span className="font-medium text-foreground">L2 · Moderator:</span> handles reports and seller profiles, sees a smaller dashboard. Can&apos;t see who the admins are.</li>
        </ul>
      </section>

      <form onSubmit={add} className="grid gap-3 rounded-xl border p-4">
        <h3 className="font-semibold">Add an admin</h3>
        <p className="-mt-2 text-xs text-muted-foreground">They must have logged in to EquineTrade once with this number.</p>
        <div className="flex">
          <span className="flex h-11 items-center rounded-l-lg border border-r-0 bg-muted px-3 text-muted-foreground">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className={`${inputClass} rounded-l-none`}
            aria-label="Mobile number"
          />
        </div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Level">
          {([2, 1] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={level === l}
              onClick={() => setLevel(l)}
              className={`h-11 rounded-lg border text-sm font-medium ${level === l ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              {l === 2 ? "L2 · Moderator" : "L1 · Owner"}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={busy === "add"}
          className="h-11 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy === "add" ? "Adding…" : "Add admin"}
        </button>
      </form>

      {message && (
        <p role="status" className={`rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-muted" : "border border-destructive text-destructive"}`}>
          {message.text}
        </p>
      )}

      <section>
        <h3 className="mb-2 font-semibold">Admins</h3>
        {members === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="grid gap-2">
            {members.map((m) => (
              <li key={m.user_id} className="rounded-xl border p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {m.name || "No name"} {m.is_me && <span className="font-normal text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {phoneText(m.phone)} · since{" "}
                      {new Date(m.added_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.level === 1 ? "bg-primary/10 text-primary" : "bg-muted"
                    }`}
                  >
                    L{m.level}
                  </span>
                </div>

                {!m.is_me &&
                  (confirmRemove === m.user_id ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-muted p-2">
                      <span className="flex-1 text-xs">Remove admin access for this person?</span>
                      <button type="button" onClick={() => setConfirmRemove(null)} className="rounded-lg border bg-background px-3 py-1.5">
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(m)}
                        disabled={busy === m.user_id}
                        className="rounded-lg bg-destructive px-3 py-1.5 font-medium text-white disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => changeLevel(m, m.level === 1 ? 2 : 1)}
                        disabled={busy === m.user_id}
                        className="rounded-lg border px-3 py-1.5 hover:bg-muted disabled:opacity-60"
                      >
                        {m.level === 1 ? "Make L2" : "Make L1"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(m.user_id)}
                        className="rounded-lg border px-3 py-1.5 text-destructive hover:bg-muted"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
