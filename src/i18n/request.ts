import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "ta"] as const;
export type Locale = (typeof locales)[number];
export const LOCALE_COOKIE = "NEXT_LOCALE";

// Each visitor's language comes from a cookie set by the EN / தமிழ் switch.
// No cookie yet: English.
export default getRequestConfig(async () => {
  const store = await cookies();
  const locale: Locale = store.get(LOCALE_COOKIE)?.value === "ta" ? "ta" : "en";
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "Asia/Kolkata",
  };
});
