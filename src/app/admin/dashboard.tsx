"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { breeds, districts, formatInr, priceRanges } from "@/lib/sample-data";

/* ---------- Data shape returned by admin_dashboard() ---------- */

type Daily = { day: string; views: number; contacts: number; listings: number; users: number };
// L1 gets everything. L2 gets only: totals (no user/sold numbers), daily (no users),
// searchBreeds, searchDistricts and unmet. The database decides this, not the page.
type Stats = {
  level?: 1 | 2;
  days: number;
  totals: Record<
    | "live" | "sold" | "removed" | "users" | "newUsers" | "newListings" | "soldInPeriod" | "views" | "contacts"
    | "calls" | "whatsapps" | "saves" | "searches" | "visitors" | "openReports",
    number
  >;
  daily: Daily[];
  devices: Record<string, number>;
  locales: Record<string, number>;
  searchBreeds: { key: string; n: number }[];
  searchDistricts: { key: string; n: number }[];
  unmet: { breed: string; district: string; n: number }[];
  byBreed: { breed: string; live: number; sold: number; medianPrice: number | null; minPrice: number | null; maxPrice: number | null }[];
  byDistrict: { district: string; live: number; sold: number; views: number; contacts: number }[];
  byAge: { group: string; live: number; sold: number; medianPrice: number | null }[];
  byPrice: { range: string; n: number }[];
  daysToSell: { count: number; median: number | null; average: number | null };
  topHorses: { slug: string; breed: string; gender: string; district: string; price: number; views: number; contacts: number }[];
};

// Chart colours (checked for colour-blind safety): two series = blue + orange.
// Single-series bars use the site's chestnut brand colour.
const VIEWS = "#2a78d6";
const CONTACTS = "#eb6834";

const breedName = (slug: string) => breeds.find((b) => b.slug === slug)?.name ?? slug;
const districtName = (slug: string) => districts.find((d) => d.slug === slug)?.name ?? slug;
const priceLabel = (v: string) => priceRanges.find((p) => p.value === v)?.label ?? v;
const num = (n: number) => n.toLocaleString("en-IN");
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");
const lakh = (n: number | null) =>
  n == null ? "–" : n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : formatInr(n);

/* ---------- Dashboard ---------- */

export function Dashboard() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStats(null);
    setError("");
    createClient()
      .rpc("admin_dashboard", { p_days: days })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message.includes("admin_dashboard") ? "Run supabase/014_admin_dashboard.sql in Supabase first." : error.message);
        else setStats(data as Stats);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="mt-4 grid gap-6">
      {/* Period filter: one row above everything */}
      <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Period">
        <span className="text-muted-foreground">Period:</span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={days === d}
            onClick={() => setDays(d)}
            className={`rounded-full border px-3 py-1 ${days === d ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-muted"}`}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg border border-destructive p-3 text-sm text-destructive">{error}</p>}
      {!stats && !error && <p className="text-sm text-muted-foreground">Loading dashboard…</p>}
      {stats && <DashboardBody s={stats} />}
    </div>
  );
}

function DashboardBody({ s }: { s: Stats }) {
  if (s.level === 2) return <ModeratorBody s={s} />;
  return <OwnerBody s={s} />;
}

/** L2: buyer activity, new horses, reports and search demand. */
function ModeratorBody({ s }: { s: Stats }) {
  const t = s.totals;
  return (
    <>
      <section>
        <SectionTitle title="At a glance" note={`Last ${s.days} days, except live horses and open reports`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Live horses" value={num(t.live)} sub={`${num(t.newListings)} new`} />
          <Kpi label="Horse views" value={num(t.views)} />
          <Kpi label="Calls + WhatsApps" value={num(t.contacts)} sub={`${pct(t.contacts, t.views)} of views`} />
          <Kpi
            label="Open reports"
            value={num(t.openReports)}
            tone={t.openReports > 0 ? "alert" : undefined}
            sub={t.openReports > 0 ? "needs review" : "all clear"}
          />
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <SectionTitle title="Buyer activity per day" note="Horse page views and Call/WhatsApp taps" />
        <LineChart data={s.daily} />
      </section>

      <section className="rounded-xl border p-4">
        <SectionTitle title="New horses per day" />
        <MiniBars data={s.daily.map((d) => ({ day: d.day, value: d.listings }))} label="New horses" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SearchDemand s={s} />
        <UnmetSearches s={s} />
      </div>
    </>
  );
}

/** L1: everything. */
function OwnerBody({ s }: { s: Stats }) {
  const t = s.totals;
  const supplyDemand = useMemo(
    () =>
      s.byDistrict
        .map((d) => ({ ...d, perHorse: d.live > 0 ? d.contacts / d.live : d.contacts }))
        .sort((a, b) => b.perHorse - a.perHorse)
        .slice(0, 8),
    [s.byDistrict],
  );

  return (
    <>
      {/* ===== Headline numbers ===== */}
      <section>
        <SectionTitle title="At a glance" note={`Last ${s.days} days, except live and sold totals`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Live horses" value={num(t.live)} sub={`${num(t.newListings)} new`} />
          <Kpi label="Sold" value={num(t.soldInPeriod)} sub={`${num(t.sold)} all time`} />
          <Kpi label="Users" value={num(t.users)} sub={`${num(t.newUsers)} new`} />
          <Kpi label="Visitors" value={num(t.visitors)} sub="unique devices" />
          <Kpi label="Horse views" value={num(t.views)} />
          <Kpi label="Calls + WhatsApps" value={num(t.contacts)} sub={`${pct(t.contacts, t.views)} of views`} />
          <Kpi label="Saves" value={num(t.saves)} />
          <Kpi
            label="Open reports"
            value={num(t.openReports)}
            tone={t.openReports > 0 ? "alert" : undefined}
            sub={t.openReports > 0 ? "needs review" : "all clear"}
          />
        </div>
      </section>

      {/* ===== Activity over time ===== */}
      <section className="rounded-xl border p-4">
        <SectionTitle title="Buyer activity per day" note="Horse page views and Call/WhatsApp taps" />
        <LineChart data={s.daily} />
        <Insight>
          {t.views > 0
            ? `${pct(t.contacts, t.views)} of horse views led to a call or WhatsApp. ${
                t.whatsapps >= t.calls ? "Buyers prefer WhatsApp" : "Buyers prefer calling"
              } (${num(t.whatsapps)} WhatsApp, ${num(t.calls)} calls).`
            : "No views recorded yet in this period."}
        </Insight>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border p-4">
          <SectionTitle title="New horses and users per day" />
          <MiniBars data={s.daily.map((d) => ({ day: d.day, value: d.listings }))} label="New horses" />
          <div className="mt-4" />
          <MiniBars data={s.daily.map((d) => ({ day: d.day, value: d.users }))} label="New users" />
        </section>

        <section className="rounded-xl border p-4">
          <SectionTitle title="How people use the site" note="Share of all activity" />
          <SplitBar
            label="Device"
            parts={[
              { name: "Phone", value: s.devices.mobile ?? 0 },
              { name: "Laptop", value: s.devices.desktop ?? 0 },
            ]}
          />
          <div className="mt-5" />
          <SplitBar
            label="Language"
            parts={[
              { name: "English", value: s.locales.en ?? 0 },
              { name: "Tamil", value: s.locales.ta ?? 0 },
            ]}
          />
        </section>
      </div>

      {/* ===== Trade ===== */}
      <h2 className="mt-2 border-t pt-6 text-xl font-semibold tracking-tight">Horse trade</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border p-4">
          <SectionTitle title="Horses by breed" note="Live and sold, with median asking price" />
          <BarList
            rows={s.byBreed.map((b) => ({
              label: b.breed,
              value: b.live + b.sold,
              right: `${b.live} live · ${b.sold} sold`,
              sub: b.medianPrice ? `Median ${lakh(b.medianPrice)} (${lakh(b.minPrice)} – ${lakh(b.maxPrice)})` : undefined,
            }))}
            empty="No horses posted yet."
          />
        </section>

        <section className="rounded-xl border p-4">
          <SectionTitle title="Horses by age" note="Live and sold, with median asking price" />
          <BarList
            rows={s.byAge.map((a) => ({
              label: `${a.group} years`,
              value: a.live + a.sold,
              right: `${a.live} live · ${a.sold} sold`,
              sub: a.medianPrice ? `Median ${lakh(a.medianPrice)}` : undefined,
            }))}
            empty="No horses posted yet."
          />
        </section>

        <section className="rounded-xl border p-4">
          <SectionTitle title="Live horses by price" />
          <BarList
            rows={priceRanges.map((p) => ({
              label: priceLabel(p.value),
              value: s.byPrice.find((x) => x.range === p.value)?.n ?? 0,
            }))}
            empty="No live horses."
          />
        </section>

        <section className="rounded-xl border p-4">
          <SectionTitle title="How fast horses sell" note="From posting to marked sold" />
          {s.daysToSell.count > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <Kpi label="Median" value={`${s.daysToSell.median} days`} />
              <Kpi label="Average" value={`${s.daysToSell.average} days`} sub={`${s.daysToSell.count} horses sold`} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No horses marked sold yet.</p>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border p-4">
          <SectionTitle title="Where buyers are keenest" note="Calls + WhatsApps per live horse, by district" />
          <BarList
            rows={supplyDemand.map((d) => ({
              label: d.district,
              value: Math.round(d.perHorse * 10) / 10,
              right: `${d.perHorse.toFixed(1)} per horse`,
              sub: `${d.live} live horses · ${d.contacts} contacts · ${d.views} views`,
            }))}
            empty="Not enough activity yet."
          />
          <Insight>
            {supplyDemand[0] && supplyDemand[0].contacts > 0
              ? `${supplyDemand[0].district} has the most buyer interest per horse. Good place to find more sellers.`
              : "Buyer interest will show here as people contact sellers."}
          </Insight>
        </section>

        <SearchDemand s={s} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UnmetSearches s={s} />

        <section className="rounded-xl border p-4">
          <SectionTitle title="Most viewed horses" />
          {s.topHorses.length > 0 ? (
            <ol className="grid gap-2 text-sm">
              {s.topHorses.map((h, i) => (
                <li key={h.slug} className="flex items-center justify-between gap-3 border-b pb-2 last:border-0">
                  <span className="min-w-0">
                    <span className="mr-2 tabular-nums text-muted-foreground">{i + 1}.</span>
                    <Link href={`/horses/${h.slug}`} target="_blank" className="hover:text-primary hover:underline">
                      {h.breed} {h.gender.toLowerCase()} · {h.district}
                    </Link>
                    <span className="ml-2 text-muted-foreground">{lakh(h.price)}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {h.views} views · {h.contacts} contacts
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">No views recorded yet.</p>
          )}
        </section>
      </div>
    </>
  );
}

/* ---------- Sections shared by L1 and L2 ---------- */

function SearchDemand({ s }: { s: Stats }) {
  return (
    <section className="rounded-xl border p-4">
      <SectionTitle title="What buyers search for" note="Searches with a filter" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Breed</p>
          <BarList rows={s.searchBreeds.map((b) => ({ label: breedName(b.key), value: b.n }))} empty="No searches yet." compact />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">District</p>
          <BarList
            rows={s.searchDistricts.slice(0, 8).map((d) => ({ label: districtName(d.key), value: d.n }))}
            empty="No searches yet."
            compact
          />
        </div>
      </div>
    </section>
  );
}

function UnmetSearches({ s }: { s: Stats }) {
  return (
    <section className="rounded-xl border p-4">
      <SectionTitle title="Searches with no results" note="Demand you aren't meeting yet" />
      {s.unmet.length > 0 ? (
        <ul className="grid gap-2 text-sm">
          {s.unmet.map((u, i) => (
            <li key={i} className="flex justify-between gap-3 border-b pb-2 last:border-0">
              <span>
                {u.breed ? breedName(u.breed) : "Any breed"} in {u.district ? districtName(u.district) : "any district"}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{u.n} searches</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Every search found at least one horse.</p>
      )}
    </section>
  );
}

/* ---------- Building blocks ---------- */

function SectionTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-3">
      <h3 className="font-semibold">{title}</h3>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

function Insight({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">{children}</p>;
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "alert" }) {
  return (
    <div className={`rounded-xl border p-3 ${tone === "alert" ? "border-destructive" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone === "alert" ? "text-destructive" : ""}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/** Horizontal bars with the value written at the end, so no hover is needed to read them. */
function BarList({
  rows,
  empty,
  compact = false,
}: {
  rows: { label: string; value: number; right?: string; sub?: string }[];
  empty: string;
  compact?: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0 || rows.every((r) => r.value === 0)) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className={`grid ${compact ? "gap-2" : "gap-3"}`}>
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${r.right ?? r.value}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{r.label}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{r.right ?? num(r.value)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(r.value > 0 ? 3 : 0, (r.value / max) * 100)}%` }}
            />
          </div>
          {r.sub && <p className="mt-1 text-xs text-muted-foreground">{r.sub}</p>}
        </li>
      ))}
    </ul>
  );
}

/** Two-part bar (e.g. phone vs laptop) with the shares written out. */
function SplitBar({ label, parts }: { label: string; parts: { name: string; value: number }[] }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  const colors = [VIEWS, CONTACTS];
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
            {parts.map((p, i) =>
              p.value > 0 ? (
                <div key={p.name} title={`${p.name}: ${pct(p.value, total)}`} style={{ flexGrow: p.value, background: colors[i] }} />
              ) : null,
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-4 text-xs">
            {parts.map((p, i) => (
              <span key={p.name} className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: colors[i] }} aria-hidden />
                {p.name} <span className="font-medium tabular-nums">{pct(p.value, total)}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Small daily bar chart (one series, one colour). Hover a bar for the date and count. */
function MiniBars({ data, label }: { data: { day: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{num(total)} total</span>
      </div>
      <div className="mt-2 flex h-16 items-end gap-[2px]">
        {data.map((d) => (
          <div
            key={d.day}
            title={`${shortDate(d.day)}: ${d.value}`}
            className="group relative flex h-full flex-1 items-end"
          >
            <div
              className="w-full rounded-t-[3px] bg-primary/85 group-hover:bg-primary"
              style={{ height: `${d.value > 0 ? Math.max(6, (d.value / max) * 100) : 0}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{shortDate(data[0]?.day)}</span>
        <span>{shortDate(data[data.length - 1]?.day)}</span>
      </div>
    </div>
  );
}

function shortDate(day?: string) {
  if (!day) return "";
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Two-line chart (views and contacts per day) with a hover crosshair and tooltip. */
function LineChart({ data }: { data: Daily[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 200;
  const pad = { l: 36, r: 12, t: 12, b: 24 };
  const max = Math.max(4, ...data.map((d) => Math.max(d.views, d.contacts)));
  const niceMax = Math.ceil(max / 4) * 4;
  const x = (i: number) => pad.l + (data.length <= 1 ? 0 : (i * (W - pad.l - pad.r)) / (data.length - 1));
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / niceMax);
  const path = (key: "views" | "contacts") => data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d[key])}`).join(" ");
  const ticks = [0, niceMax / 4, niceMax / 2, (3 * niceMax) / 4, niceMax];
  const h = hover != null ? data[hover] : null;

  return (
    <div className="relative">
      {/* Legend: two series */}
      <div className="mb-2 flex gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ background: VIEWS }} aria-hidden /> Views
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ background: CONTACTS }} aria-hidden /> Calls + WhatsApps
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Views and contacts per day"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1));
          setHover(Math.min(data.length - 1, Math.max(0, i)));
        }}
      >
        {/* Recessive grid and axis labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-border" strokeWidth={1} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize={11} className="fill-muted-foreground">
              {Math.round(t)}
            </text>
          </g>
        ))}
        <text x={pad.l} y={H - 6} fontSize={11} className="fill-muted-foreground">
          {shortDate(data[0]?.day)}
        </text>
        <text x={W - pad.r} y={H - 6} fontSize={11} textAnchor="end" className="fill-muted-foreground">
          {shortDate(data[data.length - 1]?.day)}
        </text>

        <path d={path("views")} fill="none" stroke={VIEWS} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={path("contacts")} fill="none" stroke={CONTACTS} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Crosshair on hover */}
        {h && hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="currentColor" className="text-muted-foreground" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(h.views)} r={4} fill={VIEWS} stroke="white" strokeWidth={2} />
            <circle cx={x(hover)} cy={y(h.contacts)} r={4} fill={CONTACTS} stroke="white" strokeWidth={2} />
          </g>
        )}
      </svg>
      {h && hover != null && (
        <div
          className="pointer-events-none absolute top-6 rounded-lg border bg-background px-3 py-2 text-xs shadow-sm"
          style={{ left: `clamp(0px, calc(${(x(hover) / W) * 100}% - 70px), calc(100% - 140px))` }}
        >
          <p className="font-medium">{shortDate(h.day)}</p>
          <p className="tabular-nums">{h.views} views</p>
          <p className="tabular-nums">{h.contacts} calls + WhatsApps</p>
        </div>
      )}
    </div>
  );
}
