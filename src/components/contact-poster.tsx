"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/track";

type State =
  | { status: "loading" }
  | { status: "logged-out" }
  | { status: "ready"; phone: string }
  | { status: "error" };

/**
 * Call + WhatsApp buttons for a transport / event / job / shop / farm / stud post.
 * Same rule as horses: the number is only fetched for logged-in visitors.
 */
export function ContactPoster({
  postId,
  section,
  path,
  title,
  compact = false,
}: {
  postId: string;
  section: string;
  /** Page address, e.g. "/transport/4-horse-truck-3f9a2c" */
  path: string;
  title: string;
  compact?: boolean;
}) {
  const t = useTranslations("contact");
  const m = useTranslations("market");
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) setState({ status: "logged-out" });
        return;
      }
      const { data, error } = await supabase.rpc("get_post_phone", { p_post_id: postId });
      if (cancelled) return;
      const digits = typeof data === "string" ? data.replace(/\D/g, "") : "";
      const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
      setState(!error && local.length === 10 ? { status: "ready", phone: local } : { status: "error" });
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const size = compact ? "h-11 px-4" : "h-11 w-full px-4";
  const wrap = compact ? "flex gap-2" : "grid gap-2";

  if (state.status === "loading") {
    return <div className={`${compact ? "h-11 w-40" : "h-24 w-full"} animate-pulse rounded-lg bg-muted`} aria-hidden />;
  }

  if (state.status === "logged-out") {
    return (
      <div className={wrap}>
        <Link href={`/login?next=${encodeURIComponent(path)}`} className={`${base} ${size} border-primary text-primary hover:bg-primary/5`}>
          <Phone className="size-4" aria-hidden />
          {t("loginToContact")}
        </Link>
        {!compact && <p className="text-center text-xs text-muted-foreground">{t("loginHint")}</p>}
      </div>
    );
  }

  if (state.status === "error") {
    return <p className="text-sm text-muted-foreground">{t("unavailable")}</p>;
  }

  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : "";
  const whatsapp = `https://wa.me/91${state.phone}?text=${encodeURIComponent(m("whatsappMessage", { title, url: pageUrl }))}`;
  const display = `+91 ${state.phone.slice(0, 5)} ${state.phone.slice(5)}`;
  // Recorded for the admin dashboard (no listing id: posts aren't horses)
  const props = { post: postId, section };

  return (
    <div className={wrap}>
      <a
        href={`tel:+91${state.phone}`}
        onClick={() => track("call", { props })}
        className={`${base} ${size} border-primary text-primary hover:bg-primary/5`}
      >
        <Phone className="size-4" aria-hidden />
        {compact ? t("call") : t("callNumber", { number: display })}
      </a>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener"
        onClick={() => track("whatsapp", { props })}
        className={`${base} ${size} border-[#25D366] hover:bg-[#25D366]/5`}
      >
        <MessageCircle className="size-4 text-[#25D366]" aria-hidden />
        {t("whatsapp")}
      </a>
    </div>
  );
}
