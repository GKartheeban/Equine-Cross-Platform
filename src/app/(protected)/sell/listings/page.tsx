import type { Metadata } from "next";
import Link from "next/link";
import { MyListings } from "./my-listings";

export const metadata: Metadata = {
  title: "My listings | EquineTrade",
  robots: { index: false },
};

export default function MyListingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">My listings</h1>
        <Link
          href="/sell/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Post a horse
        </Link>
      </div>
      <MyListings />
    </div>
  );
}
