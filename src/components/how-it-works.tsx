/** "How it works" in four steps (I–IV), shown in a white card. Used on Home and Explore. */
export function HowItWorks({
  m,
  className = "",
}: {
  m: (key: string, values?: Record<string, string | number>) => string;
  className?: string;
}) {
  return (
      <ol className={`relative grid overflow-hidden rounded-2xl border bg-card shadow-[0_18px_40px_-24px_rgba(74,37,19,0.35)] sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {(["I", "II", "III", "IV"] as const).map((numeral, i) => (
          <li
            key={numeral}
            className={`flex items-start gap-4 p-5 sm:p-6 ${i > 0 ? "border-t sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""} ${i >= 2 ? "sm:border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#b07a3c]/40 bg-[#f6efe6] font-display text-sm font-bold text-[#9a5a2e]"
            >
              {numeral}
            </span>
            <span>
              <span className="block font-semibold tracking-tight text-[#2b1a10]">{m(`how${i + 1}Title`)}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{m(`how${i + 1}Text`)}</span>
            </span>
          </li>
        ))}
      </ol>
  );
}
