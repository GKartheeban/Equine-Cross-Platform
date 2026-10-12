"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/** Shows a new recovery code once, with copy and "I've saved it" buttons. */
export function RecoveryCodeCard({ code, onDone }: { code: string; onDone: () => void }) {
  const t = useTranslations("recovery");
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
      <h2 className="text-lg font-semibold">{t("cardTitle")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("cardIntro")}</p>
      <p className="mt-4 select-all rounded-lg bg-background px-3 py-3 text-center font-mono text-2xl font-semibold tracking-[0.2em]">
        {code}
      </p>
      <ul className="mt-3 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
        <li>{t("cardTip1")}</li>
        <li>{t("cardTip2")}</li>
      </ul>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(code).then(() => setCopied(true))}
          className="h-11 rounded-lg border bg-background text-sm font-medium hover:bg-muted"
        >
          {copied ? t("copied") : t("copy")}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-11 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("saved")}
        </button>
      </div>
    </div>
  );
}
