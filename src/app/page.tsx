import type { Metadata } from "next";

import { LandingPage } from "@/app/_components/landing-page";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: session } = await auth.getSession();
  const isAuthenticated = Boolean(session?.user);

  return <LandingPage isAuthenticated={isAuthenticated} />;
}
