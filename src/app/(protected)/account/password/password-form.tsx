"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PASSWORD_MAX, PASSWORD_MIN } from "../../../(auth)/login/login-form";

const inputClass =
  "h-12 w-full rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Set a new password (also used after an admin set a temporary one). */
export function PasswordForm({ next }: { next: string }) {
  const router = useRouter();
  const t = useTranslations("password");
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (!session) router.replace("/login?next=/account/password");
        else setReady(true);
      });
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password.length < PASSWORD_MIN) return setMessage({ ok: false, text: t("errShort", { min: PASSWORD_MIN }) });
    if (password !== confirm) return setMessage({ ok: false, text: t("errMatch") });
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error || !data.user) {
      setBusy(false);
      const same = error?.message.toLowerCase().includes("different");
      return setMessage({ ok: false, text: same ? t("errSame") : t("errSave") });
    }
    await supabase.from("profiles").update({ must_change_password: false }).eq("id", data.user.id);
    setBusy(false);
    setPassword("");
    setConfirm("");
    setMessage({ ok: true, text: t("saved") });
    router.replace(next === "/" ? "/account/profile" : next);
    router.refresh();
  }

  if (!ready) return null;

  return (
    <form onSubmit={save} className="mt-8 grid gap-4">
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
            autoFocus
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
        <p className="text-xs text-muted-foreground">{t("hint", { min: PASSWORD_MIN })}</p>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="confirm-password" className="text-sm font-medium">{t("confirm")}</label>
        <input
          id="confirm-password"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </div>
      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-green-700" : "text-destructive"}`}>{message.text}</p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="h-12 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? t("saving") : t("save")}
      </button>
    </form>
  );
}
