import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Equine<span className="text-primary">Trade</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/horses"
            className="hidden rounded-md px-3 py-2 text-muted-foreground hover:text-foreground sm:inline-block"
          >
            Browse horses
          </Link>
          <AccountMenu />
          <Link
            href="/sell/new"
            className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sell your horse
          </Link>
        </nav>
      </div>
    </header>
  );
}
