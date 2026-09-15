import "server-only";

import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, clients } from "@/db/schema";
import type { DashboardSummary } from "@/lib/definitions";
import { sumRevenue, sumRevenueByMonth } from "@/lib/domain/revenue";

export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummary> {
  const bookingRows = await db
    .select({
      serviceType: bookings.serviceType,
      startAt: bookings.startAt,
      endAt: bookings.endAt,
      revenue: bookings.revenue,
    })
    .from(bookings)
    .where(eq(bookings.userId, userId));

  const clientCountRow = await db
    .select({ clientCount: count() })
    .from(clients)
    .where(eq(clients.userId, userId))
    .then((rows) => rows[0]);

  const bookingCountRow = await db
    .select({ bookingCount: count() })
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .then((rows) => rows[0]);

  return {
    totalRevenue: sumRevenue(bookingRows),
    bookingCount: bookingCountRow?.bookingCount ?? 0,
    clientCount: clientCountRow?.clientCount ?? 0,
    revenueByMonth: sumRevenueByMonth(bookingRows),
  };
}
