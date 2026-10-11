import Link from "next/link";
import { getTranslations } from "next-intl/server";

/** "Log in | Sign up" tabs at the top of both pages. Keeps ?next= so people return where they were. */
export async function AuthTabs({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const t = await getTranslations("login");
  const query = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  const tabs = [
    { key: "login", href: `/login${query}`, label: t("tabLogin") },
    { key: "signup", href: `/signup${query}`, label: t("tabSignup") },
  ] as const;

  return (
    <nav className="mb-8 grid grid-cols-2 rounded-lg bg-muted p-1 text-sm" aria-label={`${t("tabLogin")} / ${t("tabSignup")}`}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          replace
          aria-current={mode === tab.key ? "page" : undefined}
          className={`rounded-md py-2 text-center font-medium ${
            mode === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
