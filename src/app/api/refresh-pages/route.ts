// Clears the 60-second cache of public horse pages, so a change shows at once.
// Called by the website after a seller posts, edits, sells or deletes a horse,
// changes their name or photo, or an admin removes/restores a listing.
// Only logged-in users can call it (checked with their login token).

import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_CACHE_TAG } from "@/lib/listings";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ ok: false }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return Response.json({ ok: false }, { status: 401 });

  // expire: 0 -> the very next visitor gets fresh data (not the old copy)
  revalidateTag(PUBLIC_CACHE_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
