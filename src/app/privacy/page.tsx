import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal-page";
import { LAST_UPDATED, privacyPolicy } from "@/content/privacy-policy";

// Privacy Policy, in the visitor's language (English / Tamil).
// The text itself lives in src/content/privacy-policy.ts.

async function policy() {
  const locale = await getLocale();
  return { locale, doc: locale === "ta" ? privacyPolicy.ta : privacyPolicy.en };
}

export async function generateMetadata(): Promise<Metadata> {
  const { doc } = await policy();
  return { title: `${doc.title} | EquineTrade`, alternates: { canonical: "/privacy" } };
}

export default async function PrivacyPage() {
  const { locale, doc } = await policy();
  return <LegalPage doc={doc} locale={locale} updated={LAST_UPDATED} />;
}
