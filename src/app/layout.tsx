import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Tamil } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { IS_LIVE, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Clean Tamil letters; only downloaded when the page shows Tamil text
const notoTamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("meta"), getLocale()]);
  return {
    // Turns relative image/page addresses into full links for Google and WhatsApp
    metadataBase: new URL(SITE_URL),
    title: t("siteTitle"),
    description: t("siteDescription"),
    applicationName: SITE_NAME,
    // Test version: ask search engines not to list any page
    ...(IS_LIVE ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "ta" ? "ta_IN" : "en_IN",
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: [{ url: "/og", width: 1200, height: 630, alt: "HorseMart" }],
    },
    twitter: { card: "summary_large_image", images: ["/og"] },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = await getMessages();
  const testNote = (await getTranslations("common"))("testVersion");

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {!IS_LIVE && (
            <p className="bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900">{testNote}</p>
          )}
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
