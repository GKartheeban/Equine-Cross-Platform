import type { Metadata } from "next";
import { PostHorseForm } from "./post-horse-form";

export const metadata: Metadata = {
  title: "Post your horse | EquineTrade",
  robots: { index: false },
};

export default function SellNewPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-6 sm:pb-16">
      <h1 className="text-2xl font-semibold tracking-tight">Post your horse</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Clear photos and a walking video help your horse sell faster.
      </p>
      <PostHorseForm />
    </div>
  );
}
