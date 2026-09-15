"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { AuthUIProvider } from "@/components/auth/auth-ui-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <TooltipProvider delayDuration={120}>
        <NuqsAdapter>
          <Suspense fallback={null}>
            <AuthUIProvider>{children}</AuthUIProvider>
          </Suspense>
        </NuqsAdapter>
      </TooltipProvider>
    </NextThemesProvider>
  );
}
