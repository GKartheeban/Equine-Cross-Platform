// Records activity for the admin dashboards. Fire-and-forget: it never slows
// the page down or shows errors to the visitor.

import { createClient } from "@/lib/supabase/client";

export type EventType = "view" | "call" | "whatsapp" | "save" | "search";

/** A random code for this device (not linked to a name or number). */
function sessionId() {
  try {
    let id = localStorage.getItem("et_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("et_sid", id);
    }
    return id;
  } catch {
    return null; // private browsing: still count the event, just without a device code
  }
}

export function track(type: EventType, opts: { listingId?: string; props?: Record<string, string> } = {}) {
  if (typeof window === "undefined") return;
  const device = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
  const locale = document.documentElement.lang === "ta" ? "ta" : "en";
  createClient()
    .rpc("track_event", {
      p_type: type,
      p_listing_id: opts.listingId ?? null,
      p_session_id: sessionId(),
      p_device: device,
      p_locale: locale,
      p_props: opts.props ?? {},
    })
    .then(() => {}, () => {});
}

/** Like track(), but at most once per browser visit for the same key (e.g. one view per horse). */
export function trackOnce(key: string, type: EventType, opts: Parameters<typeof track>[1] = {}) {
  try {
    const k = `et_once:${key}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
  } catch {
    // ignore: storage blocked, still count it
  }
  track(type, opts);
}
