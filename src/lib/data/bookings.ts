import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, clients } from "@/db/schema";
import { ensureClientOwnedByUser } from "@/lib/data/ensure-client-owned";
import type { BookingInput } from "@/lib/definitions";
import { bookingInputSchema } from "@/lib/definitions";

export type BookingWithClient = typeof bookings.$inferSelect & {
  client: typeof clients.$inferSelect;
};

export async function listBookings(
  userId: string,
): Promise<BookingWithClient[]> {
  const rows = await db
    .select()
    .from(bookings)
    .innerJoin(
      clients,
      and(eq(bookings.clientId, clients.id), eq(clients.userId, userId)),
    )
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.startAt));

  return rows.map((row) => ({
    ...row.bookings,
    client: row.clients,
  }));
}

export async function getBookingById(
  userId: string,
  id: string,
): Promise<BookingWithClient | null> {
  const row = await db
    .select()
    .from(bookings)
    .innerJoin(
      clients,
      and(eq(bookings.clientId, clients.id), eq(clients.userId, userId)),
    )
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
    .then((rows) => rows[0]);

  if (!row) return null;

  return {
    ...row.bookings,
    client: row.clients,
  };
}

export async function createBooking(userId: string, input: BookingInput) {
  const data = bookingInputSchema.parse(input);

  const clientOwned = await ensureClientOwnedByUser(userId, data.clientId);
  if (!clientOwned) {
    return null;
  }

  const [created] = await db
    .insert(bookings)
    .values({
      userId,
      clientId: data.clientId,
      serviceType: data.serviceType,
      startAt: data.startAt,
      endAt: data.endAt,
      nights: data.nights,
      calendarDays: data.calendarDays,
      careHours: data.careHours,
      revenue: data.revenue,
      notes: data.notes,
      status: data.status ?? "completed",
    })
    .returning();

  return created;
}

export async function updateBooking(
  userId: string,
  id: string,
  input: BookingInput,
) {
  const data = bookingInputSchema.parse(input);

  const clientOwned = await ensureClientOwnedByUser(userId, data.clientId);
  if (!clientOwned) {
    return null;
  }

  const [updated] = await db
    .update(bookings)
    .set({
      clientId: data.clientId,
      serviceType: data.serviceType,
      startAt: data.startAt,
      endAt: data.endAt,
      nights: data.nights,
      calendarDays: data.calendarDays,
      careHours: data.careHours,
      revenue: data.revenue,
      notes: data.notes,
      status: data.status ?? "completed",
    })
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
    .returning();

  return updated ?? null;
}

export type BookingPatch = {
  nights?: number | null;
  calendarDays?: number | null;
  careHours?: number | null;
  revenue?: number;
  serviceType?: BookingInput["serviceType"];
  status?: NonNullable<BookingInput["status"]>;
  startAt?: Date;
  endAt?: Date;
};

export async function patchBooking(
  userId: string,
  id: string,
  patch: BookingPatch,
) {
  const existing = await getBookingById(userId, id);
  if (!existing) return null;

  const startAt = patch.startAt ?? existing.startAt;
  const endAt = patch.endAt ?? existing.endAt;

  if (endAt <= startAt) {
    throw new Error("End must be after start");
  }

  const updates: Partial<typeof bookings.$inferInsert> = {};

  if (patch.nights !== undefined) updates.nights = patch.nights;
  if (patch.calendarDays !== undefined) {
    updates.calendarDays = patch.calendarDays;
  }
  if (patch.careHours !== undefined) updates.careHours = patch.careHours;
  if (patch.revenue !== undefined) updates.revenue = patch.revenue;
  if (patch.serviceType !== undefined) {
    updates.serviceType = patch.serviceType;
  }
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.startAt !== undefined) updates.startAt = patch.startAt;
  if (patch.endAt !== undefined) updates.endAt = patch.endAt;

  if (Object.keys(updates).length === 0) {
    return existing;
  }

  const [updated] = await db
    .update(bookings)
    .set(updates)
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function deleteBooking(userId: string, id: string) {
  const [deleted] = await db
    .delete(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
    .returning({ id: bookings.id });

  return deleted ?? null;
}

export async function listBookingsForClient(userId: string, clientId: string) {
  const clientOwned = await ensureClientOwnedByUser(userId, clientId);
  if (!clientOwned) {
    return [];
  }

  return db
    .select()
    .from(bookings)
    .where(and(eq(bookings.clientId, clientId), eq(bookings.userId, userId)))
    .orderBy(asc(bookings.startAt));
}
