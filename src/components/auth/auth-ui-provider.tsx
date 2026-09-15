"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { resolveRedirectTo } from "@/lib/auth/redirect-to";

interface AuthUIProviderProps {
  children: React.ReactNode;
}

export function AuthUIProvider({ children }: AuthUIProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = resolveRedirectTo(searchParams.get("redirectTo"));

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
      redirectTo={redirectTo}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
