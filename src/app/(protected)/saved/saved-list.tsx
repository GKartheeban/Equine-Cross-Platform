"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ListingCard } from "@/components/listing-card";
import { createClient } from "@/lib/supabase/client";
import { LISTING_COLUMNS, toListing, type Listing, type Row } from "@/lib/listings";

type SavedItem = { listingId: string; listing: Listing | null };

export function SavedList() {
  const router = useRouter();
  const t = useTranslations("saved");
  const tc = useTranslations("common");
  const [items, setItems] = useState<SavedItem[] | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?next=/saved");
        return;
      }
      setUserId(session.user.id);
      const { data } = await supabase
        .from("saved_listings")
        .select(`listing_id, created_at, listing:listings(${LISTING_COLUMNS}, status)`)
        .order("created_at", { ascending: false });

      const rows = (data as unknown as { listing_id: string; listing: (Row & { status: string }) | null }[]) ?? [];
      setItems(
        rows.map((r) => ({
          listingId: r.listing_id,
          // Sold or removed horses show as "no longer available"
          listing: r.listing && r.listing.status === "live" ? toListing(r.listing) : null,
        })),
      );
    })();
  }, [router]);

  async function unsave(listingId: string) {
    setItems((all) => all?.filter((i) => i.listingId !== listingId) ?? null);
    await createClient().from("saved_listings").delete().eq("listing_id", listingId).eq("user_id", userId);
  }

  if (items === null) return <p className="mt-8 text-sm text-muted-foreground">{tc("loading")}</p>;

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-xl border px-6 py-12 text-center">
        <p className="font-medium">{t("emptyTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("emptyText")}</p>
        <Link href="/horses" className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          {tc("browseHorses")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li key={item.listingId} className="grid gap-2">
          {item.listing ? (
            <ListingCard horse={item.listing} priority={i < 3} />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted p-4 text-center text-sm text-muted-foreground">
              {t("unavailable")}
            </div>
          )}
          <button
            type="button"
            onClick={() => unsave(item.listingId)}
            className="justify-self-start text-sm text-muted-foreground underline hover:text-foreground"
          >
            {t("remove")}
          </button>
        </li>
      ))}
    </ul>
  );
}
