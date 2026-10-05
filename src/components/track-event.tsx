"use client";

import { useEffect } from "react";
import { trackOnce, type EventType } from "@/lib/track";

/**
 * Invisible: records one event when the page opens (once per visit per `onceKey`).
 * Used for horse page views and searches.
 */
export function TrackEvent({
  type,
  onceKey,
  listingId,
  props,
}: {
  type: EventType;
  onceKey: string;
  listingId?: string;
  props?: Record<string, string>;
}) {
  useEffect(() => {
    trackOnce(onceKey, type, { listingId, props });
    // Only when the key changes (a new horse or a new search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onceKey]);
  return null;
}
