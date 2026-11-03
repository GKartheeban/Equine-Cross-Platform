"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export type ShowcaseItem = { key: string; href: string; img: string; price: string; title: string; place: string };

const SLIDE_MS = 6000;

/**
 * One large photo at a time, no price or details (a little suspense): the button on the photo
 * opens that listing. Every few seconds the next one fades in while the photo slowly drifts
 * closer; a brass line along the bottom shows the time left. Pauses while the pointer is over it.
 */
export function HeroShowcase({
  items,
  label,
  viewAll,
  viewAllHref,
  cta,
}: {
  items: ShowcaseItem[];
  label: string;
  viewAll: string;
  viewAllHref: string;
  /** Text of the button on the photo, e.g. "Take a closer look" */
  cta: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, count]);

  if (count === 0) return null;
  const current = items[index];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="w-full" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Title row */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <span className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-[#b07a3c]" />
          <span className="font-display text-[13px] font-semibold uppercase tracking-[0.28em] text-[#6a361d]">{label}</span>
        </span>
        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-1.5 border-b border-[#6a361d]/30 pb-0.5 text-sm font-medium text-[#6a361d] transition hover:border-[#6a361d]"
        >
          {viewAll}
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>

      {/* The photo */}
      <div className="group relative aspect-[5/4] overflow-hidden rounded-[28px] bg-[#e9dccb] shadow-[0_34px_70px_-34px_rgba(74,37,19,0.65)]">
        {items.map((it, i) => (
          <span
            key={it.key}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={it.img}
              alt=""
              fill
              sizes="(min-width: 1280px) 580px, 500px"
              priority={i === 0}
              className={`object-cover ${i === index ? "hm-kenburns" : ""}`}
              style={paused ? { animationPlayState: "paused" } : undefined}
            />
          </span>
        ))}

        {/* Soft shade at the bottom so the controls read on any photo */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#1c1210]/70 via-[#1c1210]/25 to-transparent" />

        {/* Bottom bar: the way in, and where we are */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
          <Link
            href={current.href}
            className="group/cta inline-flex items-center gap-2.5 rounded-full bg-white/15 py-2 pl-5 pr-2 text-sm font-medium text-white ring-1 ring-inset ring-white/35 backdrop-blur-md transition hover:bg-white hover:text-[#3b2417]"
          >
            {cta}
            <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#3b2417] transition group-hover/cta:bg-[#6a361d] group-hover/cta:text-white">
              <ArrowUpRight className="size-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" aria-hidden />
            </span>
          </Link>
          {count > 1 && (
            <div className="flex shrink-0 flex-col items-end gap-2.5">
              <span className="font-display text-sm font-semibold tracking-[0.2em] text-white">
                {pad(index + 1)} <span className="text-white/55">/ {pad(count)}</span>
              </span>
              <div className="flex gap-1.5" role="tablist" aria-label={label}>
                {items.map((it, i) => (
                  <button
                    key={it.key}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${i + 1} / ${count}`}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/75"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Time left for this photo, along the bottom edge */}
        {count > 1 && (
          <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
            <span
              key={`${current.key}-${index}`}
              className="hm-progress block h-full origin-left bg-[#e2b57a]"
              style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
            />
          </span>
        )}
      </div>
    </div>
  );
}
