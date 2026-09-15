"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ reset }: AuthErrorProps) {
  return (
    <div className="container flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-4 py-10 text-center">
      <h1 className="font-semibold text-lg">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground text-sm">
        We could not load the authentication page. You can try again or return
        to sign in.
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button asChild>
          <Link href="/auth/sign-in">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
