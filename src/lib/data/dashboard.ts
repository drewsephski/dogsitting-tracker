import "server-only";

import { count } from "drizzle-orm";
import { db } from "@/db";
import { bookings, clients } from "@/db/schema";
import type { DashboardSummary } from "@/lib/definitions";
import { sumRevenue, sumRevenueByMonth } from "@/lib/domain/revenue";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const bookingRows = await db
    .select({
      serviceType: bookings.serviceType,
      startAt: bookings.startAt,
      endAt: bookings.endAt,
      revenue: bookings.revenue,
    })
    .from(bookings);

  const clientCountRow = await db
    .select({ clientCount: count() })
    .from(clients)
    .then((rows) => rows[0]);

  const bookingCountRow = await db
    .select({ bookingCount: count() })
    .from(bookings)
    .then((rows) => rows[0]);

  return {
    totalRevenue: sumRevenue(bookingRows),
    bookingCount: bookingCountRow?.bookingCount ?? 0,
    clientCount: clientCountRow?.clientCount ?? 0,
    revenueByMonth: sumRevenueByMonth(bookingRows),
  };
}
