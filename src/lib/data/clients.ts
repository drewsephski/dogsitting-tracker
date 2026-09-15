import "server-only";

import { asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, clients } from "@/db/schema";
import type { ClientInput, ClientWithStats } from "@/lib/definitions";
import { clientInputSchema } from "@/lib/definitions";
import { mergeClientStats } from "@/lib/domain/client-stats";

export async function listClients(): Promise<ClientWithStats[]> {
  const clientRows = await db
    .select()
    .from(clients)
    .orderBy(asc(clients.dogName));

  const statsRows = await db
    .select({
      clientId: bookings.clientId,
      totalRevenue: sql<number>`coalesce(sum(${bookings.revenue}), 0)`.mapWith(
        Number,
      ),
      bookingCount: count(),
    })
    .from(bookings)
    .groupBy(bookings.clientId);

  const statsByClientId = new Map(
    statsRows.map((row) => [
      row.clientId,
      {
        clientId: row.clientId,
        totalRevenue: row.totalRevenue,
        bookingCount: row.bookingCount,
      },
    ]),
  );

  return mergeClientStats(clientRows, statsByClientId);
}

export async function getClientById(
  id: string,
): Promise<ClientWithStats | null> {
  const client = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .then((rows) => rows[0]);

  if (!client) return null;

  const stats = await db
    .select({
      clientId: bookings.clientId,
      totalRevenue: sql<number>`coalesce(sum(${bookings.revenue}), 0)`.mapWith(
        Number,
      ),
      bookingCount: count(),
    })
    .from(bookings)
    .where(eq(bookings.clientId, id))
    .groupBy(bookings.clientId)
    .then((rows) => rows[0]);

  const statsByClientId = new Map(
    stats
      ? [
          [
            stats.clientId,
            {
              clientId: stats.clientId,
              totalRevenue: stats.totalRevenue,
              bookingCount: stats.bookingCount,
            },
          ],
        ]
      : [],
  );

  return mergeClientStats([client], statsByClientId)[0] ?? null;
}

export type ClientPatch = {
  dogName?: string;
  ownerName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

export async function patchClient(id: string, patch: ClientPatch) {
  const existing = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .then((rows) => rows[0]);

  if (!existing) return null;

  const merged = clientInputSchema.parse({
    id,
    dogName: patch.dogName ?? existing.dogName,
    ownerName:
      patch.ownerName !== undefined
        ? patch.ownerName?.trim()
          ? patch.ownerName.trim()
          : undefined
        : (existing.ownerName ?? undefined),
    contactEmail:
      patch.contactEmail !== undefined
        ? patch.contactEmail?.trim()
          ? patch.contactEmail.trim()
          : ""
        : (existing.contactEmail ?? ""),
    contactPhone:
      patch.contactPhone !== undefined
        ? patch.contactPhone?.trim()
          ? patch.contactPhone.trim()
          : undefined
        : (existing.contactPhone ?? undefined),
  });

  return upsertClient(merged);
}

export async function upsertClient(input: ClientInput) {
  const data = clientInputSchema.parse(input);

  const values = {
    dogName: data.dogName,
    ownerName: data.ownerName ?? null,
    contactEmail: data.contactEmail ? data.contactEmail : null,
    contactPhone: data.contactPhone ?? null,
  };

  if (data.id) {
    const [updated] = await db
      .update(clients)
      .set(values)
      .where(eq(clients.id, data.id))
      .returning();

    return updated ?? null;
  }

  const [created] = await db.insert(clients).values(values).returning();

  return created;
}

export async function deleteClient(id: string) {
  const [deleted] = await db
    .delete(clients)
    .where(eq(clients.id, id))
    .returning({ id: clients.id });

  return deleted ?? null;
}
