"use client";

import { AuthUIProvider as BetterAuthUIProvider } from "@neondatabase/auth-ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { resolveRedirectTo } from "@/lib/auth/redirect-to";
import { cn } from "@/lib/utils";

interface AuthUIProviderProps {
  children: React.ReactNode;
}

export function AuthUIProvider({ children }: AuthUIProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = resolveRedirectTo(searchParams.get("redirectTo"));

  return (
    <div className={cn("neon-auth-ui")}>
      <BetterAuthUIProvider
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => router.refresh()}
        Link={Link}
        redirectTo={redirectTo}
        magicLink={false}
        multiSession={false}
        apiKey={false}
        passkey={false}
        oneTap={false}
        genericOAuth={undefined}
        twoFactor={undefined}
      >
        {children}
      </BetterAuthUIProvider>
    </div>
  );
}
