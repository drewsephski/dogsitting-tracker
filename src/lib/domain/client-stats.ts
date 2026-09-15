import type { ClientWithStats } from "@/lib/definitions";

interface ClientRow {
  id: string;
  dogName: string;
  ownerName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

interface ClientBookingStats {
  clientId: string;
  totalRevenue: number;
  bookingCount: number;
}

export function mergeClientStats(
  clients: ClientRow[],
  statsByClientId: Map<string, ClientBookingStats>,
): ClientWithStats[] {
  return clients.map((client) => {
    const stats = statsByClientId.get(client.id);

    const totalRevenue = stats?.totalRevenue ?? 0;
    const bookingCount = stats?.bookingCount ?? 0;

    return {
      ...client,
      totalRevenue,
      bookingCount,
      isRepeatClient: bookingCount > 1,
    };
  });
}
