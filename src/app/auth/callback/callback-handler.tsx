"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

type State = { status: "working" } | { status: "error"; key: "googleFailed" | "googleNotLinked" | "googleInUse" };

export function CallbackHandler({ next }: { next: string }) {
  const router = useRouter();
  const t = useTranslations("recovery");
  const [state, setState] = useState<State>({ status: "working" });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const params = new URLSearchParams(window.location.search);

      // Google or Supabase said no (e.g. this Google account is already linked to someone else)
      const problem = params.get("error_description") ?? params.get("error");
      if (problem) {
        setState({ status: "error", key: /already|exists|linked/i.test(problem) ? "googleInUse" : "googleFailed" });
        return;
      }

      let session = (await supabase.auth.getSession()).data.session;
      const code = params.get("code");
      if (!session && code) {
        session = (await supabase.auth.exchangeCodeForSession(code)).data.session;
      }
      if (!session) {
        setState({ status: "error", key: "googleFailed" });
        return;
      }

      // A Google login with no mobile account behind it: remove it again
      if (!session.user.phone) {
        await supabase.rpc("discard_unlinked_google_account");
        await supabase.auth.signOut();
        setState({ status: "error", key: "googleNotLinked" });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", session.user.id)
        .maybeSingle();
      router.replace(profile?.must_change_password ? "/account/password?forced=1" : next);
      router.refresh();
    })();
  }, [next, router]);

  if (state.status === "working") return <p className="text-sm text-muted-foreground">{t("googleWorking")}</p>;

  return (
    <div className="rounded-xl border p-6">
      <p className="font-medium">{t(state.key)}</p>
      <Link
        href="/login"
        className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        {t("backToLogin")}
      </Link>
    </div>
  );
}
