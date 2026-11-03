"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Laptop menu links (`match`: a pattern of page addresses that count as "this section"): a brass line grows under the link on hover and stays under the current page. */
export function HeaderNav({ links }: { links: { href: string; label: string; match: string }[] }) {
  const pathname = usePathname() ?? "/";
  return (
    <>
      {links.map((l) => {
        const active = new RegExp(l.match).test(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`group relative hidden px-3 py-2 text-[15px] transition-colors md:inline-block ${
              active ? "font-medium text-[#2b1a10]" : "text-[#7a5d4c] hover:text-[#2b1a10]"
            }`}
          >
            {l.label}
            <span
              aria-hidden
              className={`absolute inset-x-3 -bottom-0.5 h-[2px] origin-left rounded-full bg-[#b07a3c] transition-transform duration-300 ease-out ${
                active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
        );
      })}
    </>
  );
}
