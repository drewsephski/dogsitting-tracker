import "server-only";

import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/require-session";

export async function requireUserId(): Promise<string> {
  const session = await requireSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return session.user.id;
}
