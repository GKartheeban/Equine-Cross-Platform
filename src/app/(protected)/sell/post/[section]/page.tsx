import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MarketPostForm } from "@/components/market-post-form";
import { SectionBadge } from "@/components/section-icon";
import { isSectionKey } from "@/lib/market-sections";

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const m = await getTranslations("market");
  const title = isSectionKey(section) ? m(`sections.${section}.post`) : m("chooseTitle");
  return { title: `${title} | HorseMart`, robots: { index: false } };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Post (or, with ?edit=<id>, edit) a transport / event / job / shop / farm / stud ad. */
export default async function PostSectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  if (!isSectionKey(section)) notFound();
  const sp = await searchParams;
  const edit = typeof sp.edit === "string" && UUID.test(sp.edit) ? sp.edit : undefined;
  const m = await getTranslations("market");
  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-8 sm:pb-16">
      <div className="flex items-start gap-4">
        <SectionBadge section={section} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{m(`sections.${section}.post`)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{m(`sections.${section}.intro`)}</p>
        </div>
      </div>
      <MarketPostForm key={edit ?? "new"} section={section} postId={edit} />
    </div>
  );
}
