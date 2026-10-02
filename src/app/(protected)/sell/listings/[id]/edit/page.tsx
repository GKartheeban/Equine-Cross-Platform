import type { Metadata } from "next";
import { EditListing } from "./edit-listing";

export const metadata: Metadata = {
  title: "Edit listing | EquineTrade",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-6 sm:pb-16">
      <h1 className="text-2xl font-semibold tracking-tight">Edit listing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Change anything below, then tap Save changes on the last step.
      </p>
      <EditListing listingId={id} />
    </div>
  );
}
