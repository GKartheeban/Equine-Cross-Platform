"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { photoSlots, type PhotoKey } from "@/lib/horse-options";
import { PostHorseForm, type ListingFormData, type Media } from "../../../new/post-horse-form";

const mediaUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${path}`;

/** Loads the seller's listing and opens the listing form, already filled in. */
export function EditListing({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [state, setState] = useState<
    { status: "loading" } | { status: "missing"; message: string } | { status: "ready"; initial: ListingFormData }
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

      if (!l) return setState({ status: "missing", message: "This listing wasn't found in your account." });
      if (l.status === "removed")
        return setState({ status: "missing", message: "This listing was removed by EquineTrade and can't be edited." });

      const photos: Partial<Record<PhotoKey, Media>> = {};
      for (const slot of photoSlots) {
        const path = (l.photo_paths as Record<string, string> | null)?.[slot.key];
        if (path) photos[slot.key] = { file: null, url: mediaUrl(path), path };
      }

      setState({
        status: "ready",
        initial: {
          breed: l.breed,
          gender: l.gender,
          ageYears: String(l.age_years),
          heightInches: String(l.height_inches),
          colour: l.colour,
          markings: l.markings ?? "",
          photos,
          video: l.video_path
            ? { file: null, url: mediaUrl(l.video_path), path: l.video_path, seconds: l.video_seconds ?? 0 }
            : null,
          vaccinated: l.vaccinated ? "yes" : "no",
          vetCertificate: l.vet_certificate_path ? { file: null, url: "", path: l.vet_certificate_path } : null,
          trainingLevel: l.training_level,
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
    return <p className="mt-8 text-sm text-muted-foreground">Loading your listing…</p>;
  }

  if (state.status === "missing") {
    return (
      <div className="mt-8 rounded-xl border p-6 text-center">
        <p className="font-medium">{state.message}</p>
        <Link href="/sell/listings" className="mt-4 inline-block rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
          Back to My listings
        </Link>
      </div>
    );
  }

  return <PostHorseForm edit={{ listingId, initial: state.initial }} />;
}
