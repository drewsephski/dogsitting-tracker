"use client";

import { authViewPaths } from "@neondatabase/auth-ui/server";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "@/lib/auth/client";
import { resolveRedirectTo } from "@/lib/auth/redirect-to";

interface RedirectIfAuthenticatedProps {
  path: string;
}

export function RedirectIfAuthenticated({
  path,
}: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || !session?.user) {
      return;
    }

    if (path !== authViewPaths.SIGN_IN && path !== authViewPaths.SIGN_UP) {
      return;
    }

    const redirectParam = searchParams.get("redirectTo");
    router.replace(resolveRedirectTo(redirectParam));
  }, [isPending, path, router, searchParams, session?.user]);

  return null;
}
