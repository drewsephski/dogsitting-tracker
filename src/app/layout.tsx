import { SiteHeader } from "@/components/layouts/site-header";
import { ThemeProvider } from "@/components/providers";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { fontMono, fontSans } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "dog sitting",
    "pet care",
    "bookings",
    "small business",
    "revenue tracking",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
  icons: {
    icon: "/icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" className="h-dvh" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "flex h-dvh max-h-dvh flex-col overflow-hidden bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden">
              <SiteHeader />
              <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
                {children}
              </main>
            </div>
            <TailwindIndicator />
          </ThemeProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
