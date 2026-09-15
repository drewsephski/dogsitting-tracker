import "server-only";

import { type BookingWithClient, listBookings } from "@/lib/data/bookings";
import {
  type BookingStatus,
  bookingStatuses,
  type ServiceType,
  serviceTypes,
} from "@/lib/definitions";

import type { GetBookingsSchema } from "./validations";

export type BookingTableRow = BookingWithClient & {
  dogName: string;
};

function toTableRow(booking: BookingWithClient): BookingTableRow {
  return {
    ...booking,
    dogName: booking.client.dogName,
  };
}

function compareValues(
  a: string | number | Date | null | undefined,
  b: string | number | Date | null | undefined,
) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return String(a).localeCompare(String(b));
}

function sortBookings(
  rows: BookingTableRow[],
  sort: GetBookingsSchema["sort"],
): BookingTableRow[] {
  if (sort.length === 0) return rows;

  const sorted = [...rows];
  sorted.sort((a, b) => {
    for (const item of sort) {
      const cmp = compareValues(
        getSortValue(a, item.id),
        getSortValue(b, item.id),
      );
      if (cmp !== 0) {
        return item.desc ? -cmp : cmp;
      }
    }
    return 0;
  });
  return sorted;
}

function getSortValue(
  row: BookingTableRow,
  id: string,
): string | number | Date | null | undefined {
  switch (id) {
    case "dogName":
      return row.dogName;
    case "serviceType":
      return row.serviceType;
    case "startAt":
      return row.startAt;
    case "endAt":
      return row.endAt;
    case "nights":
      return row.nights;
    case "calendarDays":
      return row.calendarDays;
    case "careHours":
      return row.careHours;
    case "revenue":
      return row.revenue;
    case "status":
      return row.status;
    default:
      return row.startAt;
  }
}

export async function getBookings(userId: string, input: GetBookingsSchema) {
  let rows = (await listBookings(userId)).map(toTableRow);

  if (input.dogName) {
    const query = input.dogName.toLowerCase();
    rows = rows.filter((row) => row.dogName.toLowerCase().includes(query));
  }

  if (input.serviceType.length > 0) {
    rows = rows.filter((row) => input.serviceType.includes(row.serviceType));
  }

  if (input.status.length > 0) {
    rows = rows.filter((row) => input.status.includes(row.status));
  }

  rows = sortBookings(rows, input.sort);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / input.perPage) || 1);
  const offset = (input.page - 1) * input.perPage;
  const data = rows.slice(offset, offset + input.perPage);

  return { data, pageCount };
}

export async function getBookingStatusCounts(
  userId: string,
): Promise<Record<BookingStatus, number>> {
  const rows = await listBookings(userId);
  const counts = Object.fromEntries(
    bookingStatuses.map((status) => [status, 0]),
  ) as Record<BookingStatus, number>;

  for (const row of rows) {
    counts[row.status] += 1;
  }

  return counts;
}

export async function getBookingServiceTypeCounts(
  userId: string,
): Promise<Record<ServiceType, number>> {
  const rows = await listBookings(userId);
  const counts = Object.fromEntries(
    serviceTypes.map((type) => [type, 0]),
  ) as Record<ServiceType, number>;

  for (const row of rows) {
    counts[row.serviceType] += 1;
  }

  return counts;
}
