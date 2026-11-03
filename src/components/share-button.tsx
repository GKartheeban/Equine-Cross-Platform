"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Share a horse or an ad. On phones this opens the phone's own share sheet (WhatsApp, Instagram,
 * SMS…). On laptops it shows a small menu: WhatsApp, Facebook, Telegram, Email and Copy link.
 * `path` is the page address (e.g. /horses/marwari-mare-…); the full link is built in the browser.
 */
export function ShareButton({ path, title, compact = false }: { path: string; title: string; compact?: boolean }) {
  const t = useTranslations("share");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Close the menu on an outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const link = () => `${window.location.origin}${path}`;
  const message = () => t("message", { title });

  async function share() {
    const url = link();
    // Phones (and some laptops): the system share sheet
    if (typeof navigator !== "undefined" && navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, text: message(), url });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return; // the person closed the sheet
      }
    }
    setOpen((o) => !o);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link());
    } catch {
      // Older browsers: select-and-copy fallback
      const input = document.createElement("textarea");
      input.value = link();
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1400);
  }

  const enc = encodeURIComponent;
  const targets = [
    {
      key: "whatsapp",
      label: t("whatsapp"),
      icon: <MessageCircle className="size-4 text-[#25D366]" aria-hidden />,
      href: () => `https://wa.me/?text=${enc(`${message()} ${link()}`)}`,
    },
    {
      key: "facebook",
      label: t("facebook"),
      icon: (
        <span aria-hidden className="flex size-4 items-center justify-center rounded-[4px] bg-[#1877F2] text-[11px] font-bold leading-none text-white">
          f
        </span>
      ),
      href: () => `https://www.facebook.com/sharer/sharer.php?u=${enc(link())}`,
    },
    {
      key: "telegram",
      label: t("telegram"),
      icon: <Send className="size-4 text-[#229ED9]" aria-hidden />,
      href: () => `https://t.me/share/url?url=${enc(link())}&text=${enc(message())}`,
    },
    {
      key: "email",
      label: t("email"),
      icon: <Mail className="size-4 text-[#7a5d4c]" aria-hidden />,
      href: () => `mailto:?subject=${enc(title)}&body=${enc(`${message()}\n\n${link()}`)}`,
    },
  ];

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        onClick={share}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? t("button") : undefined}
        className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          compact ? "w-10 justify-center px-0" : ""
        }`}
      >
        <Share2 className="size-4" aria-hidden />
        {!compact && t("button")}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border bg-popover p-1.5 text-sm shadow-[0_18px_40px_-16px_rgba(74,37,19,0.4)]"
        >
          {targets.map((x) => (
            <a
              key={x.key}
              role="menuitem"
              href={x.href()}
              target={x.key === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"
            >
              {x.icon}
              {x.label}
            </a>
          ))}
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={copy}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted"
          >
            {copied ? <Check className="size-4 text-green-700" aria-hidden /> : <Link2 className="size-4 text-[#7a5d4c]" aria-hidden />}
            <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
