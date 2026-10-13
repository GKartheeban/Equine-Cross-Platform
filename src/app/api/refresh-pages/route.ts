// Clears the 60-second cache of public horse pages, so a change shows at once.
// Called by the website after a seller posts, edits, sells or deletes a horse,
// changes their name or photo, deletes their account, or an admin removes/restores a listing.
// Allowed for logged-in users (checked with their login token), or right after an
// account deletion (the account no longer exists, so its deletion ID is checked instead).

import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_CACHE_TAG } from "@/lib/listings";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  let allowed = false;
  if (token) {
    const { data, error } = await supabase.auth.getUser(token);
    allowed = !error && !!data.user;
  } else {
    const body = (await request.json().catch(() => null)) as { deletionId?: unknown } | null;
    const id = typeof body?.deletionId === "string" ? body.deletionId : "";
    if (/^[0-9a-f-]{36}$/i.test(id)) {
      const { data } = await supabase.rpc("deletion_just_completed", { p_id: id });
      allowed = data === true;
    }
  }
  if (!allowed) return Response.json({ ok: false }, { status: 401 });

  // expire: 0 -> the very next visitor gets fresh data (not the old copy)
  revalidateTag(PUBLIC_CACHE_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
