import "server-only";

import { auth } from "@/lib/auth/server";

export async function requireSession() {
  const { data } = await auth.getSession();

  if (!data?.user) {
    return null;
  }

  return data;
}
