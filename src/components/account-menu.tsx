"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type State = { status: "loading" } | { status: "out" } | { status: "in"; phone: string };

// Shows "Login" for visitors, or an "Account" menu with Logout when logged in.
// Runs in the browser and reads the saved login, so pages stay fast and cacheable.
export function AccountMenu() {
  const router = useRouter();
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

  const linkClass = "rounded-md px-3 py-2 text-muted-foreground hover:text-foreground";

  // Keeps the same width while checking, so the header doesn't jump
  if (state.status === "loading") {
    return <span className={`${linkClass} invisible`} aria-hidden>Login</span>;
  }

  if (state.status === "out") {
    return <Link href="/login" className={linkClass}>Login</Link>;
  }

  const close = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <details ref={menuRef} className="relative">
      <summary className={`${linkClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
        Account <span aria-hidden className="text-xs">▾</span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border bg-background py-1 text-sm shadow-lg">
        <p className="border-b px-4 py-2 text-xs text-muted-foreground">
          Logged in as <span className="font-medium text-foreground">{state.phone}</span>
        </p>
        <Link href="/account/profile" onClick={close} className="block px-4 py-2.5 hover:bg-muted">
          My profile
        </Link>
        <Link href="/sell/listings" onClick={close} className="block px-4 py-2.5 hover:bg-muted">
          My listings
        </Link>
        <Link href="/saved" onClick={close} className="block px-4 py-2.5 hover:bg-muted">
          Saved horses
        </Link>
        {isAdmin && (
          <Link href="/admin" onClick={close} className="block border-t px-4 py-2.5 font-medium hover:bg-muted">
            Admin
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          className="block w-full border-t px-4 py-2.5 text-left text-destructive hover:bg-muted"
        >
          Logout
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
