import type { Block, Item, LegalDocument } from "@/content/legal";

// Layout for the legal pages (Privacy Policy, Terms of Use):
// title, "Last updated" date, intro, a clickable contents list, then the sections.
// Numbers and letters hang to the left so wrapped lines stay neatly aligned.

const LETTERS = {
  en: "abcdefghijklmnopqrstuvwxyz".split(""),
  ta: ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ", "க", "ச", "ட", "த", "ப", "ற"],
};

function ItemText({ item }: { item: Item }) {
  if (typeof item === "string") return <>{item}</>;
  return (
    <>
      <span className="font-medium text-foreground">{item.label}</span> {item.text}
    </>
  );
}

function Lettered({ items, locale }: { items: Item[]; locale: "en" | "ta" }) {
  const letters = LETTERS[locale];
  return (
    <ol className="mt-2 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[2.25rem_1fr]">
          <span aria-hidden className="tabular-nums">
            ({letters[i]})
          </span>
          <span>
            <ItemText item={item} />
          </span>
        </li>
      ))}
    </ol>
  );
}

function Blocks({ blocks, locale }: { blocks: Block[]; locale: "en" | "ta" }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("h3" in b)
          return (
            <h3 key={i} className="mt-6 font-semibold text-foreground">
              {b.h3}
            </h3>
          );
        if ("p" in b)
          return (
            <p key={i} className="mt-3">
              {b.p}
            </p>
          );
        if ("list" in b)
          return (
            <ul key={i} className="mt-3 list-disc space-y-2 pl-5 marker:text-muted-foreground">
              {b.list.map((item, j) => (
                <li key={j}>
                  <ItemText item={item} />
                </li>
              ))}
            </ul>
          );
        if ("lettered" in b)
          return (
            <div key={i} className="mt-3">
              <Lettered items={b.lettered} locale={locale} />
            </div>
          );
        return (
          <ol key={i} className="mt-3 space-y-3">
            {b.clauses.map((c) => (
              <li key={c.n} className="grid grid-cols-[2.75rem_1fr]">
                <span className="tabular-nums text-foreground">{c.n}</span>
                <div>
                  <p>{c.text}</p>
                  {c.items && <Lettered items={c.items} locale={locale} />}
                </div>
              </li>
            ))}
          </ol>
        );
      })}
    </>
  );
}

export function LegalPage({
  doc,
  locale,
  updated,
}: {
  doc: LegalDocument;
  locale: string;
  /** Date the text last changed, e.g. "2026-10-13" */
  updated: string;
}) {
  const lang = locale === "ta" ? "ta" : "en";
  const date = new Intl.DateTimeFormat(lang === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${updated}T00:00:00+05:30`));

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header className="border-b pb-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{doc.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {doc.lastUpdated}: <time dateTime={updated}>{date}</time>
        </p>
      </header>

      <div className="mt-6 leading-relaxed text-muted-foreground">
        <Blocks blocks={doc.intro} locale={lang} />
      </div>

      {/* Contents: jump to any section */}
      <nav aria-label={doc.contentsTitle} className="mt-8 rounded-xl border bg-muted/40 p-5">
        <h2 className="text-sm font-semibold">{doc.contentsTitle}</h2>
        <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {doc.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {doc.sections.map((s) => (
        <section key={s.id} id={s.id} className="mt-10 scroll-mt-20">
          <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
          <div className="leading-relaxed text-muted-foreground">
            <Blocks blocks={s.blocks} locale={lang} />
          </div>
        </section>
      ))}
    </article>
  );
}
