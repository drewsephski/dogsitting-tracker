import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { clients } from "@/db/schema";

export async function ensureClientOwnedByUser(
  userId: string,
  clientId: string,
): Promise<boolean> {
  const row = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
    .then((rows) => rows[0]);

  return row !== undefined;
}
