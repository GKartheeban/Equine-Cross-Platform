"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { mediaUrl, storedMedia } from "@/lib/media";
import { trainingFromOld } from "@/lib/horse-options";
import { PostHorseForm, newMediaId, type ListingFormData } from "../../../new/post-horse-form";

/** Loads the seller's listing and opens the listing form, already filled in. */
export function EditListing({ listingId }: { listingId: string }) {
  const router = useRouter();
  const t = useTranslations("editListing");
  const [state, setState] = useState<
    { status: "loading" } | { status: "missing"; reason: "notFound" | "removed" } | { status: "ready"; initial: ListingFormData }
  >({ status: "loading" });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?next=/sell/listings/${listingId}/edit`);
        return;
      }
      const { data: l } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .eq("seller_id", session.user.id)
        .maybeSingle();

      if (!l) return setState({ status: "missing", reason: "notFound" });
      if (l.status === "removed")
        return setState({ status: "missing", reason: "removed" });

      // Saved photos and videos, in order (older listings: their 5 photos + walking video)
      const media = storedMedia(l).map((m) => ({
        id: newMediaId(),
        type: m.type,
        file: null,
        url: mediaUrl(m.path),
        path: m.path,
        seconds: m.seconds,
      }));

      setState({
        status: "ready",
        initial: {
          breed: l.breed,
          gender: l.gender,
          ageYears: String(l.age_years),
          heightInches: String(l.height_inches),
          colour: l.colour,
          markings: l.markings ?? "",
          media,
          vaccinated: l.vaccinated ? "yes" : "no",
          vetCertificate: l.vet_certificate_path ? { file: null, url: "", path: l.vet_certificate_path } : null,
          trainingLevels: l.training_levels?.length ? l.training_levels : trainingFromOld(l.training_level),
          handlerExperience: l.handler_experience,
          pregnant: l.pregnant === null ? "" : l.pregnant ? "yes" : "no",
          priceInr: String(l.price_inr),
          negotiable: l.negotiable,
          district: l.district,
          town: l.town,
          description: l.description ?? "",
        },
      });
    })();
  }, [listingId, router]);

  if (state.status === "loading") {
    return <p className="mt-8 text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (state.status === "missing") {
    return (
      <div className="mt-8 rounded-xl border p-6 text-center">
        <p className="font-medium">{state.reason === "removed" ? t("removed") : t("notFound")}</p>
        <Link href="/sell/listings" className="mt-4 inline-block rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
          {t("backToMyListings")}
        </Link>
      </div>
    );
  }

  return <PostHorseForm edit={{ listingId, initial: state.initial }} />;
}
