"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/track";

/** Save / Saved toggle for a horse. Logged-out visitors are sent to Login first. */
export function SaveButton({ listingId, slug }: { listingId: string; slug: string }) {
  const router = useRouter();
  const t = useTranslations("save");
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);
      const { data } = await supabase
        .from("saved_listings")
        .select("listing_id")
        .eq("listing_id", listingId)
        .maybeSingle();
      setSaved(!!data);
    })();
  }, [listingId]);

  async function toggle() {
    if (!userId) {
      router.push(`/login?next=/horses/${slug}`);
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const next = !saved;
    setSaved(next); // update instantly, undo if it fails
    const { error } = next
      ? await supabase.from("saved_listings").insert({ listing_id: listingId })
      : await supabase.from("saved_listings").delete().eq("listing_id", listingId).eq("user_id", userId);
    if (error && error.code !== "23505") setSaved(!next);
    else if (next) track("save", { listingId });
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        saved ? "border-primary text-primary" : "hover:bg-muted"
      }`}
    >
      <Heart className={`size-4 ${saved ? "fill-current" : ""}`} aria-hidden />
      {saved ? t("saved") : t("save")}
    </button>
  );
}
