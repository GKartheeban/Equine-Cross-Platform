"use client";

import { useEffect, useState } from "react";

/** The sticky header bar: blends into the cream page at the top, turns white with a soft shadow once you scroll. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="sticky top-0 z-40 bg-[#fbf7f1]/85 backdrop-blur-md transition-[background-color,box-shadow] duration-300 data-[scrolled]:bg-[#fbf7f1]/95 data-[scrolled]:shadow-[0_10px_30px_-18px_rgba(74,37,19,0.35)]"
    >
      {children}
      {/* Brass hairline along the bottom edge */}
      <span aria-hidden className="block h-px bg-gradient-to-r from-transparent via-[#b07a3c]/45 to-transparent" />
    </header>
  );
}
