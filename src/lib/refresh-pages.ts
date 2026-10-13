// Asks the website to clear its 60-second page cache after a change,
// so buyers see the new/edited/removed horse straight away.
// Never throws: if it fails, the pages simply update within a minute.

import { createClient } from "@/lib/supabase/client";

export async function refreshPublicPages(): Promise<void> {
  try {
    const { data } = await createClient().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/refresh-pages", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      keepalive: true,
    });
  } catch {
    // ignore: the cache runs out by itself within 60 seconds
  }
}

/** After an account is deleted there is no login any more, so the deletion ID is used instead. */
export async function refreshAfterDeletion(deletionId: string): Promise<void> {
  try {
    await fetch("/api/refresh-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletionId }),
      keepalive: true,
    });
  } catch {
    // ignore
  }
}
