import Link from "next/link";

const links = [
  { href: "/horses", label: "Browse horses" },
  { href: "/sell/new", label: "Sell your horse" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-foreground">EquineTrade</span>
          {" · "}Buy and sell horses across Tamil Nadu
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="pb-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EquineTrade
      </p>
    </footer>
  );
}
