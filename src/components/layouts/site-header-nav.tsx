"use client";

import { UserButton } from "@neondatabase/auth-ui";
import { Dog } from "lucide-react";
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
      <div className="container flex h-14 min-w-0 items-center gap-2 sm:gap-4">
        <Link
          href="/"
          className="mr-1 flex shrink-0 items-center gap-2 sm:mr-2 md:mr-4"
        >
          <Dog className="size-4" aria-hidden="true" />
          <span className="max-w-[9rem] truncate font-bold text-sm sm:max-w-none sm:text-base">
            {siteConfig.name}
          </span>
        </Link>

        {isPending ? (
          <Skeleton className="hidden h-4 w-48 md:block" aria-hidden="true" />
        ) : (
          <nav
            className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto text-sm md:flex lg:gap-6"
            aria-label="Main"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-foreground/60 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <Link
                href="/"
                className="whitespace-nowrap text-foreground/60 transition-colors hover:text-foreground"
              >
                Home
              </Link>
            ) : null}
          </nav>
        )}

        <div className="ms-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2">
          {isPending ? (
            <Skeleton className="size-8 rounded-full" aria-hidden="true" />
          ) : isAuthenticated ? (
            <UserButton size="icon" />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 sm:px-3"
                asChild
              >
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" className="px-2 sm:px-3" asChild>
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
