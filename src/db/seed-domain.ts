import { eq } from "drizzle-orm";

import { db } from "@/db";
import { bookings, clients, settings } from "@/db/schema";

const DAYCARE_HOURS = 9;

function localDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export async function seedDomainData(userId: string) {
  await db.delete(bookings).where(eq(bookings.userId, userId));
  await db.delete(clients).where(eq(clients.userId, userId));

  const [ylva] = await db
    .insert(clients)
    .values({ userId, dogName: "Ylva" })
    .returning();

  const [molly] = await db
    .insert(clients)
    .values({ userId, dogName: "Molly" })
    .returning();

  if (!ylva || !molly) {
    throw new Error("Failed to seed clients");
  }

  const ylvaDays = [
    { month: 8, day: 25 },
    { month: 8, day: 26 },
    { month: 8, day: 27 },
  ];

  await db.insert(bookings).values(
    ylvaDays.map(({ month, day }) => ({
      userId,
      clientId: ylva.id,
      serviceType: "daycare" as const,
      startAt: localDate(2026, month, day, 7, 0),
      endAt: localDate(2026, month, day, 16, 0),
      careHours: DAYCARE_HOURS,
      revenue: 20,
      status: "completed" as const,
    })),
  );

  await db.insert(bookings).values({
    userId,
    clientId: molly.id,
    serviceType: "overnight",
    startAt: localDate(2026, 8, 30, 10, 0),
    endAt: localDate(2026, 9, 15, 8, 0),
    nights: 16,
    calendarDays: 17,
    revenue: 550,
    status: "completed",
  });

  await db.insert(settings).values({ userId }).onConflictDoNothing();
}
