import {
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Target,
  Users,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const appLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Revenue, activity, and planning progress at a glance.",
    icon: LayoutDashboard,
  },
  {
    href: "/bookings",
    label: "Bookings",
    description: "Daycare, overnights, rates, and schedules in one table.",
    icon: CalendarDays,
  },
  {
    href: "/clients",
    label: "Clients",
    description: "Dog and owner records with totals derived from bookings.",
    icon: Users,
  },
  {
    href: "/chat",
    label: "Chat",
    description: "Ask the assistant to list or update your business data.",
    icon: MessageSquare,
  },
] as const;

const highlights = [
  {
    title: "Revenue and dashboard",
    description:
      "Monthly income, booking counts, and charts driven by your booking records—not manual spreadsheets.",
    icon: LayoutDashboard,
  },
  {
    title: "Bookings and clients",
    description:
      "Add and edit stays, tie them to clients, and keep repeat status and revenue in sync.",
    icon: CalendarDays,
  },
  {
    title: "AI-assisted updates",
    description:
      "Use natural language in chat to query bookings, clients, and settings through the same database as the UI.",
    icon: WandSparkles,
  },
  {
    title: "Planning and goals",
    description:
      "Set monthly income targets, expenses, and savings goals alongside real revenue from bookings.",
    icon: Target,
  },
] as const;

interface LandingPageProps {
  isAuthenticated: boolean;
}

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <div className="flex flex-col">
      <section className="container flex flex-col gap-8 py-10 md:py-16">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 text-center">
          <p className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
            {siteConfig.name}
          </p>
          <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
            Your dog-sitting business in one place
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed md:text-lg">
            {siteConfig.description}
          </p>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="sm:min-w-44">
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="sm:min-w-36">
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="sm:min-w-36"
                >
                  <Link href="/auth/sign-up">Create account</Link>
                </Button>
              </>
            )}
          </div>
          {!isAuthenticated ? (
            <p className="text-muted-foreground text-sm">
              New here?{" "}
              <Link
                href="/auth/sign-up"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Create an account
              </Link>{" "}
              or use{" "}
              <Link
                href="/login"
                className="text-foreground underline-offset-4 hover:underline"
              >
                /login
              </Link>{" "}
              and{" "}
              <Link
                href="/register"
                className="text-foreground underline-offset-4 hover:underline"
              >
                /register
              </Link>{" "}
              as shortcuts to the same auth pages.
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-border/40 border-t bg-muted/20">
        <div className="container flex flex-col gap-6 py-10 md:py-14">
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-xl tracking-tight">In the app</h2>
            <p className="max-w-2xl text-muted-foreground text-sm">
              Jump straight to a section. If you are signed out, you will be
              asked to sign in and returned to the page you chose.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {appLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block h-full">
                  <Card className="h-full transition-colors hover:bg-muted/40">
                    <CardHeader className="gap-3">
                      <div className="flex items-center gap-2">
                        <item.icon
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <CardTitle className="text-base">
                          {item.label}
                        </CardTitle>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container flex flex-col gap-6 py-10 md:py-14">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-xl tracking-tight">
            What you can track
          </h2>
          <p className="max-w-2xl text-muted-foreground text-sm">
            Built for a single sitter operation: bookings are the source of
            truth for revenue and client stats.
          </p>
        </div>
        <ul className="grid gap-6 md:grid-cols-2">
          {highlights.map((item) => (
            <li key={item.title} className="flex gap-4">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background"
                aria-hidden="true"
              >
                <item.icon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-border/40 border-t">
        <div className="container flex flex-col items-center gap-4 py-10 text-center md:py-12">
          <p className="max-w-lg text-muted-foreground text-sm">
            {isAuthenticated
              ? "Head to the dashboard to review revenue and planning targets."
              : "Sign in to manage bookings and clients, or create an account to get started."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="secondary">
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
