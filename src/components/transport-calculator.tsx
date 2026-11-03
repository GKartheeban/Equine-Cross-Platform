"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Route } from "lucide-react";
import { roadKm } from "@/lib/district-coords";
import { districts, formatInr } from "@/lib/sample-data";

const inputClass =
  "h-12 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring";

/** Pick two districts and a rate: shows the estimated road distance and cost. */
export function TransportCalculator() {
  const m = useTranslations("market.calc");
  const o = useTranslations("options");
  const [from, setFrom] = useState("madurai");
  const [to, setTo] = useState("chennai");
  const [rate, setRate] = useState("40");
  const [returnTrip, setReturnTrip] = useState(false);

  const km = roadKm(from, to);
  const perKm = Number(rate);
  const cost = km && perKm > 0 ? km * perKm * (returnTrip ? 2 : 1) : null;

  return (
    <section className="grid overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[1fr_320px]" aria-labelledby="calc-title">
      <div className="p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-inset ring-primary/15">
          <Route className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 id="calc-title" className="text-lg font-semibold tracking-tight">
            {m("title")}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{m("intro")}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_140px]">
        <label className="grid gap-1.5 text-sm font-medium">
          {m("from")}
          <select value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass}>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {o(`district.${d.slug}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {m("to")}
          <select value={to} onChange={(e) => setTo(e.target.value)} className={inputClass}>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {o(`district.${d.slug}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          {m("rate")}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={returnTrip} onChange={(e) => setReturnTrip(e.target.checked)} className="size-4 accent-primary" />
        {m("returnTrip")}
      </label>
      </div>

      <div className="flex flex-col justify-center bg-primary p-6 text-primary-foreground sm:p-7" aria-live="polite">
        {from === to ? (
          <p className="text-sm">{m("sameDistrict")}</p>
        ) : (
          <>
            <p className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
              <span className="truncate">{o(`district.${from}`)}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{o(`district.${to}`)}</span>
            </p>
            {km !== null && <p className="mt-1 text-sm text-primary-foreground/70">{m("distance", { km })}</p>}
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground/70">{m("estimate")}</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">{cost !== null ? formatInr(cost) : "—"}</p>
          </>
        )}
        <p className="mt-4 text-xs text-primary-foreground/70">{m("note")}</p>
      </div>
    </section>
  );
}
