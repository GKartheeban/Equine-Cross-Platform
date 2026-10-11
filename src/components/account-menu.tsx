"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type State = { status: "loading" } | { status: "out" } | { status: "in"; phone: string };

// Visitors: one "Log in / Sign up" button on laptops; an account icon with both options on phones.
// Logged in: an "Account" menu (an icon on phones) with profile, listings, saved, logout.
// Runs in the browser and reads the saved login, so pages stay fast and cacheable.
export function AccountMenu() {
  const router = useRouter();
  const t = useTranslations("header");
  const [state, setState] = useState<State>({ status: "loading" });
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const apply = (phone: string | undefined | null, loggedIn: boolean) => {
      setState(loggedIn ? { status: "in", phone: formatPhone(phone) } : { status: "out" });
      // Show the Admin link only to admins (the admin page checks again itself)
      if (loggedIn) supabase.rpc("is_admin").then(({ data }) => setIsAdmin(data === true));
      else setIsAdmin(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      apply(data.session?.user.phone, !!data.session);
    });
    // Updates instantly on login/logout, including in other tabs
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session?.user.phone, !!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Close the menu when tapping anywhere outside it
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const menu = menuRef.current;
      if (menu?.open && !menu.contains(e.target as Node)) menu.open = false;
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function logout() {
    if (menuRef.current) menuRef.current.open = false;
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Round icon button used on phones
  const iconButton =
    "flex size-9 cursor-pointer list-none items-center justify-center rounded-full border text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden";
  const menuPanel = "absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border bg-background py-1 text-sm shadow-lg";

  const close = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  // Keeps the same space while checking, so the header doesn't jump
  if (state.status === "loading") {
    return (
      <span aria-hidden className="invisible flex items-center">
        <span className="size-9 sm:hidden" />
        <span className="hidden rounded-md border px-3 py-1.5 sm:inline-block">{t("loginSignup")}</span>
      </span>
    );
  }

  if (state.status === "out") {
    return (
      <>
        {/* Laptop / tablet: one button; the page has Log in and Sign up tabs */}
        <Link
          href="/login"
          className="hidden items-center gap-2 rounded-md border px-3 py-1.5 font-medium text-foreground hover:border-primary/60 hover:text-primary sm:inline-flex"
        >
          <UserRound className="size-4" aria-hidden />
          {t("loginSignup")}
        </Link>

        {/* Phone: one account icon that opens Log in / Sign up */}
        <details ref={menuRef} className="relative sm:hidden">
          <summary className={iconButton} aria-label={t("account")}>
            <UserRound className="size-5" aria-hidden />
          </summary>
          <div className={menuPanel}>
            <p className="border-b px-4 py-2 text-xs text-muted-foreground">{t("welcome")}</p>
            <Link href="/login" onClick={close} className="block px-4 py-2.5 hover:bg-muted">
              {t("login")}
            </Link>
            <Link href="/signup" onClick={close} className="block px-4 py-2.5 font-medium text-primary hover:bg-muted">
              {t("signup")}
            </Link>
          </div>
        </details>
      </>
    );
  }

  return (
    <details ref={menuRef} className="relative">
      <summary
        aria-label={t("account")}
        className={`${iconButton} sm:size-auto sm:rounded-md sm:border-0 sm:px-3 sm:py-2`}
      >
        <UserRound className="size-5 sm:hidden" aria-hidden />
        <span className="hidden sm:inline">
          {t("account")} <span aria-hidden className="text-xs">▾</span>
        </span>
      </summary>
      <div className={menuPanel}>
        <p className="border-b px-4 py-2 text-xs text-muted-foreground">
          {t.rich("loggedInAs", { phone: state.phone, b: (c) => <span className="font-medium text-foreground">{c}</span> })}
        </p>
        <Link href="/account/profile" onClick={close} className="block px-4 py-2.5 hover:bg-muted">
          {t("myProfile")}
        </Link>
        <Link href="/sell/listings" onClick={close} className="block px-4 py-2.5 hover:bg-muted">
          {t("myListings")}
        </Link>
        <Link href="/saved" onClick={close} className="block px-4 py-2.5 hover:bg-muted">
          {t("savedHorses")}
        </Link>
        {isAdmin && (
          <Link href="/admin" onClick={close} className="block border-t px-4 py-2.5 font-medium hover:bg-muted">
            {t("admin")}
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          className="block w-full border-t px-4 py-2.5 text-left text-destructive hover:bg-muted"
        >
          {t("logout")}
        </button>
      </div>
    </details>
  );
}

// "919876543210" -> "+91 98765 43210"
function formatPhone(phone: string | undefined | null) {
  if (!phone) return "your account";
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : `+${digits}`;
}
