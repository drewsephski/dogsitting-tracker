"use client";

import { UserButton } from "@neondatabase/auth-ui";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";

import { ModeToggle } from "@/components/layouts/mode-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { authClient } from "@/lib/auth/client";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/bookings", label: "Bookings" },
  { href: "/clients", label: "Clients" },
  { href: "/chat", label: "Chat" },
] as const;

export function SiteHeaderNav() {
  const { data: session, isPending } = authClient.useSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        <Link
          href={isAuthenticated ? "/dashboard" : "/auth/sign-in"}
          className="mr-2 flex items-center md:mr-4 md:space-x-2"
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
          <span className="hidden font-bold md:inline-block">
            {siteConfig.name}
          </span>
        </Link>

        {isPending ? (
          <Skeleton className="h-4 w-48" aria-hidden="true" />
        ) : isAuthenticated ? (
          <nav className="flex flex-1 items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/60 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center justify-end gap-2">
          {isPending ? (
            <Skeleton className="size-8 rounded-full" aria-hidden="true" />
          ) : isAuthenticated ? (
            <UserButton size="icon" />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
