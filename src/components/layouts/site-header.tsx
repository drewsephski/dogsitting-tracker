import { LayoutGrid } from "lucide-react";
import Link from "next/link";

import { ModeToggle } from "@/components/layouts/mode-toggle";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-2 flex items-center md:mr-6 md:space-x-2">
          <LayoutGrid className="size-4" aria-hidden="true" />
          <span className="hidden font-bold md:inline-block">
            {siteConfig.name}
          </span>
        </Link>
        <nav className="flex flex-1 items-center gap-6 text-sm">
          <Link
            href="/bookings"
            className="text-foreground/60 transition-colors hover:text-foreground"
          >
            Bookings
          </Link>
          <Link
            href="/clients"
            className="text-foreground/60 transition-colors hover:text-foreground"
          >
            Clients
          </Link>
        </nav>
        <div className="flex items-center justify-end">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
