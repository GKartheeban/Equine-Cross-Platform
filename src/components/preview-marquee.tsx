import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

export type PreviewItem = { key: string; href: string; img: string; price: string; title: string; place: string };

function PreviewCard({ item, hidden }: { item: PreviewItem; hidden?: boolean }) {
  return (
    <li aria-hidden={hidden || undefined}>
      <Link
        href={item.href}
        tabIndex={hidden ? -1 : undefined}
        className="group block overflow-hidden rounded-2xl border border-[#3b2417]/[0.08] bg-card shadow-[0_10px_30px_-18px_rgba(74,37,19,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(74,37,19,0.55)]"
      >
        <span className="relative block aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={item.img}
            alt={hidden ? "" : item.title}
            fill
            sizes="220px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </span>
        <span className="block p-3">
          <span className="block text-sm font-semibold tabular-nums text-[#2b1a10]">{item.price}</span>
          <span className="mt-0.5 block truncate text-sm text-[#3b2417]">{item.title}</span>
          <span className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{item.place}</span>
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * Two columns of real listings that drift slowly up and down (pauses on hover).
 * Each column holds its cards twice so the loop is seamless; the copy is hidden from screen readers.
 */
export function PreviewMarquee({ items, label, viewAll, viewAllHref }: { items: PreviewItem[]; label: string; viewAll: string; viewAllHref: string }) {
  if (items.length === 0) return null;
  // At least 6 cards so each column is taller than the window
  const pool: PreviewItem[] = [];
  while (pool.length < 6) pool.push(...items);
  const cols = [pool.filter((_, i) => i % 2 === 0), pool.filter((_, i) => i % 2 === 1)];

  return (
    <div className="flex w-[460px] flex-col xl:w-[500px]">
      <div className="mb-4 flex items-end justify-between gap-4">
        <span className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gradient-to-r from-transparent to-[#b07a3c]" />
          <span className="font-display text-[13px] font-semibold uppercase tracking-[0.28em] text-[#6a361d]">{label}</span>
          <span aria-hidden className="relative flex size-2">
            <span className="hm-live absolute inline-flex size-full rounded-full bg-[#b07a3c]" />
            <span className="relative inline-flex size-2 rounded-full bg-[#9a5a2e]" />
          </span>
        </span>
        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-1.5 border-b border-[#6a361d]/30 pb-0.5 text-sm font-medium text-[#6a361d] transition hover:border-[#6a361d]"
        >
          {viewAll}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
      <div className="hm-marquee relative h-[520px] overflow-hidden">
        <div className="grid h-full grid-cols-2 gap-4">
          {cols.map((col, c) => (
            <ul key={c} className={`hm-marquee-col flex flex-col gap-4 ${c === 1 ? "hm-marquee-down" : ""}`}>
              {col.map((it, i) => (
                <PreviewCard key={`${it.key}-${i}`} item={it} />
              ))}
              {col.map((it, i) => (
                <PreviewCard key={`${it.key}-copy-${i}`} item={it} hidden />
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
