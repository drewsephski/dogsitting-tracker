import type { Booking } from "@/db/schema";

/** Month key in `YYYY-MM` for dashboard revenue attribution. */
export function getBookingRevenueMonthKey(
  booking: Pick<Booking, "serviceType" | "startAt" | "endAt">,
): string {
  const date =
    booking.serviceType === "overnight" ? booking.endAt : booking.startAt;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function sumRevenueByMonth(
  bookings: Pick<Booking, "serviceType" | "startAt" | "endAt" | "revenue">[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const booking of bookings) {
    const key = getBookingRevenueMonthKey(booking);
    totals[key] = (totals[key] ?? 0) + booking.revenue;
  }

  return totals;
}

export function sumRevenue(bookings: Pick<Booking, "revenue">[]): number {
  return bookings.reduce((sum, booking) => sum + booking.revenue, 0);
}
