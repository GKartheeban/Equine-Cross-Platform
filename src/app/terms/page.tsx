import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal-page";
import { LAST_UPDATED, termsOfUse } from "@/content/terms-of-use";

// Terms of Use, in the visitor's language (English / Tamil).
// The text itself lives in src/content/terms-of-use.ts.

async function terms() {
  const locale = await getLocale();
  return { locale, doc: locale === "ta" ? termsOfUse.ta : termsOfUse.en };
}

export async function generateMetadata(): Promise<Metadata> {
  const { doc } = await terms();
  return { title: `${doc.title} | HorseMart`, alternates: { canonical: "/terms" } };
}

export default async function TermsPage() {
  const { locale, doc } = await terms();
  return <LegalPage doc={doc} locale={locale} updated={LAST_UPDATED} />;
}
