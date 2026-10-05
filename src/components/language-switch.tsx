"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

/** EN / தமிழ் switch. Remembers the choice on this phone for a year. */
export function setLanguageCookie(locale: "en" | "ta") {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitch() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("header");
  const [pending, startTransition] = useTransition();
  const next = locale === "ta" ? "en" : "ta";

  return (
    <button
      type="button"
      onClick={() => {
        setLanguageCookie(next);
        startTransition(() => router.refresh());
      }}
      disabled={pending}
      aria-label={`${t("language")}: ${next === "ta" ? "தமிழ்" : "English"}`}
      lang={next}
      className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-60"
    >
      {next === "ta" ? "தமிழ்" : "EN"}
    </button>
  );
}
