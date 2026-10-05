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
  | { status: "ready"; phone: string } // phone as 10 digits
  | { status: "error" };

/**
 * Call + WhatsApp buttons for a horse. Logged-out visitors are asked to log in;
 * the seller's number is only fetched for logged-in users.
 * `compact` is the slim version for the sticky bar on phones.
 */
export function ContactSeller({
  listingId,
  slug,
  title,
  compact = false,
}: {
  listingId: string;
  slug: string;
  title: string;
  compact?: boolean;
}) {
  const t = useTranslations("contact");
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
      const { data, error } = await supabase.rpc("get_seller_phone", { p_listing_id: listingId });
      if (cancelled) return;
      const digits = typeof data === "string" ? data.replace(/\D/g, "") : "";
      const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
      setState(!error && local.length === 10 ? { status: "ready", phone: local } : { status: "error" });
    })();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  // Subtle outline buttons: Call in the brand colour, WhatsApp neutral with a green icon
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
        <Link
          href={`/login?next=/horses/${slug}`}
          className={`${base} ${size} border-primary text-primary hover:bg-primary/5`}
        >
          <Phone className="size-4" aria-hidden />
          {compact ? t("loginToContact") : t("loginToContactSeller")}
        </Link>
        {!compact && (
          <p className="text-center text-xs text-muted-foreground">{t("loginHint")}</p>
        )}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <p className="text-sm text-muted-foreground">{t("unavailable")}</p>
    );
  }

  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/horses/${slug}` : "";
  const message = t("whatsappMessage", { title, url: pageUrl });
  const whatsapp = `https://wa.me/91${state.phone}?text=${encodeURIComponent(message)}`;
  const display = `+91 ${state.phone.slice(0, 5)} ${state.phone.slice(5)}`;

  return (
    <div className={wrap}>
      <a
        href={`tel:+91${state.phone}`}
        onClick={() => track("call", { listingId })}
        className={`${base} ${size} border-primary text-primary hover:bg-primary/5`}>
        <Phone className="size-4" aria-hidden />
        {compact ? t("call") : t("callNumber", { number: display })}
      </a>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener"
        onClick={() => track("whatsapp", { listingId })}
        className={`${base} ${size} border-[#25D366] hover:bg-[#25D366]/5`}>
        <MessageCircle className="size-4 text-[#25D366]" aria-hidden />
        {t("whatsapp")}
      </a>
    </div>
  );
}
