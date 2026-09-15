import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, clients } from "@/db/schema";
import type { BookingInput } from "@/lib/definitions";
import { bookingInputSchema } from "@/lib/definitions";

export type BookingWithClient = typeof bookings.$inferSelect & {
  client: typeof clients.$inferSelect;
};

export async function listBookings(): Promise<BookingWithClient[]> {
  const rows = await db
    .select()
    .from(bookings)
    .innerJoin(clients, eq(bookings.clientId, clients.id))
    .orderBy(desc(bookings.startAt));

  return rows.map((row) => ({
    ...row.bookings,
    client: row.clients,
  }));
}

export async function getBookingById(
  id: string,
): Promise<BookingWithClient | null> {
  const row = await db
    .select()
    .from(bookings)
    .innerJoin(clients, eq(bookings.clientId, clients.id))
    .where(eq(bookings.id, id))
    .then((rows) => rows[0]);

  if (!row) return null;

  return {
    ...row.bookings,
    client: row.clients,
  };
}

export async function createBooking(input: BookingInput) {
  const data = bookingInputSchema.parse(input);

  const [created] = await db
    .insert(bookings)
    .values({
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

export async function updateBooking(id: string, input: BookingInput) {
  const data = bookingInputSchema.parse(input);

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
    .where(eq(bookings.id, id))
    .returning();

  return updated ?? null;
}

export async function deleteBooking(id: string) {
  const [deleted] = await db
    .delete(bookings)
    .where(eq(bookings.id, id))
    .returning({ id: bookings.id });

  return deleted ?? null;
}

export async function listBookingsForClient(clientId: string) {
  return db
    .select()
    .from(bookings)
    .where(eq(bookings.clientId, clientId))
    .orderBy(asc(bookings.startAt));
}
