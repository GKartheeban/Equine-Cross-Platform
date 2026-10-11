"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type GalleryItem = { type: "photo" | "video"; url: string; seconds?: number };

/**
 * Swipeable photos and videos.
 *  - Phone: swipe left/right with a finger.
 *  - Laptop: drag with the mouse, use the ‹ › arrows, or the keyboard arrow keys.
 *  - Small pictures underneath jump straight to any photo or video.
 * Nothing opens in a new tab. Used on the horse page and in the "Preview" step.
 */
export function MediaGallery({
  items,
  alt,
  labels,
}: {
  items: GalleryItem[];
  alt: string;
  labels: { photo: string; video: string; noMedia: string; previous?: string; next?: string };
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const goTo = useCallback(
    (i: number) => {
      const el = scroller.current;
      if (!el) return;
      const target = Math.max(0, Math.min(items.length - 1, i));
      el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
      setIndex(target);
    },
    [items.length],
  );

  // Which slide is showing (updates while swiping)
  function onScroll() {
    const el = scroller.current;
    if (!el || dragging) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  }

  // Pause videos that are swiped away
  useEffect(() => {
    scroller.current?.querySelectorAll("video").forEach((v) => {
      if (Number(v.dataset.slide) !== index && !v.paused) v.pause();
    });
  }, [index]);

  // Mouse drag on laptops (phones already swipe natively)
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("video")) return; // keep video controls usable
    const el = scroller.current;
    if (!el) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false };
    setDragging(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    const el = scroller.current;
    if (!drag.current || !el) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.left - dx;
  }
  function endDrag() {
    const el = scroller.current;
    if (!drag.current || !el) return;
    const start = drag.current.left / el.clientWidth;
    const now = el.scrollLeft / el.clientWidth;
    // A short drag is enough to move one slide
    const target = now > start + 0.15 ? Math.ceil(start) + 1 : now < start - 0.15 ? Math.floor(start) - 1 : Math.round(start);
    drag.current = null;
    setDragging(false);
    goTo(target);
  }

  if (items.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        {labels.noMedia}
      </div>
    );
  }

  const many = items.length > 1;

  return (
    <div
      className="select-none"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(index + 1);
        if (e.key === "ArrowLeft") goTo(index - 1);
      }}
    >
      <div className="relative">
        <div
          ref={scroller}
          tabIndex={0}
          aria-roledescription="carousel"
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          className={`flex overflow-x-auto overscroll-x-contain rounded-xl bg-black/90 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            dragging ? "cursor-grabbing" : `snap-x snap-mandatory ${many ? "cursor-grab" : ""}`
          }`}
        >
          {items.map((item, i) => (
            <div
              key={`${item.url}-${i}`}
              className="relative aspect-[4/3] w-full shrink-0 snap-center"
              aria-label={`${item.type === "video" ? labels.video : labels.photo} ${i + 1} / ${items.length}`}
            >
              {item.type === "video" ? (
                <video
                  data-slide={i}
                  src={item.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="size-full object-contain"
                />
              ) : item.url.startsWith("http") ? (
                <Image
                  src={item.url}
                  alt={`${alt} – ${labels.photo} ${i + 1}`}
                  fill
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="pointer-events-none object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- local preview of the seller's own photo
                <img
                  src={item.url}
                  alt={`${alt} – ${labels.photo} ${i + 1}`}
                  draggable={false}
                  className="pointer-events-none size-full object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {many && (
          <>
            {/* Counter, e.g. 2 / 5 */}
            <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white tabular-nums">
              {index + 1} / {items.length}
            </span>
            {/* Arrows (laptops) */}
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label={labels.previous ?? "Previous"}
              className="absolute left-2 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl text-black shadow hover:bg-white disabled:opacity-0 sm:flex"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === items.length - 1}
              aria-label={labels.next ?? "Next"}
              className="absolute right-2 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl text-black shadow hover:bg-white disabled:opacity-0 sm:flex"
            >
              ›
            </button>
            {/* Dots (phones) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5 sm:hidden">
              {items.map((_, i) => (
                <span key={i} className={`size-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/45"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {many && (
        <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <li key={`${item.url}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-pressed={i === index}
                aria-label={`${item.type === "video" ? labels.video : labels.photo} ${i + 1}`}
                className={`relative block size-16 overflow-hidden rounded-lg bg-muted sm:size-20 ${
                  i === index ? "ring-2 ring-primary ring-offset-2" : "opacity-75 hover:opacity-100"
                }`}
              >
                {item.type === "video" ? (
                  <>
                    <video src={`${item.url}#t=0.1`} muted playsInline preload="metadata" className="pointer-events-none size-full bg-black object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center text-lg text-white drop-shadow" aria-hidden>
                      ▶
                    </span>
                  </>
                ) : item.url.startsWith("http") ? (
                  <Image src={item.url} alt="" fill draggable={false} sizes="80px" className="pointer-events-none object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- local preview
                  <img src={item.url} alt="" draggable={false} className="pointer-events-none size-full object-cover" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
