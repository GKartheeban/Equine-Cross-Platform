import type { Metadata } from "next";
import { safeNext } from "@/lib/safe-next";
import { CallbackHandler } from "./callback-handler";

export const metadata: Metadata = { title: "EquineTrade", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Google sends people back here after "Continue with Google" or "Link Google". */
export default async function AuthCallbackPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-16 text-center">
      <CallbackHandler next={safeNext(next)} />
    </div>
  );
}
