import type { BookingWithClient } from "@/lib/data/bookings";
import type { ClientWithStats } from "@/lib/definitions";

export function serializeBooking(booking: BookingWithClient) {
  return {
    id: booking.id,
    clientId: booking.clientId,
    dogName: booking.client.dogName,
    ownerName: booking.client.ownerName,
    serviceType: booking.serviceType,
    startAt: booking.startAt.toISOString(),
    endAt: booking.endAt.toISOString(),
    nights: booking.nights,
    calendarDays: booking.calendarDays,
    careHours: booking.careHours,
    revenue: booking.revenue,
    notes: booking.notes,
    status: booking.status,
  };
}

export function serializeClient(client: ClientWithStats) {
  return {
    id: client.id,
    dogName: client.dogName,
    ownerName: client.ownerName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    totalRevenue: client.totalRevenue,
    bookingCount: client.bookingCount,
    isRepeatClient: client.isRepeatClient,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt?.toISOString() ?? null,
  };
}
