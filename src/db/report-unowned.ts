import { count, isNull } from "drizzle-orm";

import { db } from "@/db";
import { bookings, clients, settings } from "@/db/schema";

async function reportUnowned() {
  const [clientRow] = await db
    .select({ count: count() })
    .from(clients)
    .where(isNull(clients.userId));

  const [bookingRow] = await db
    .select({ count: count() })
    .from(bookings)
    .where(isNull(bookings.userId));

  const [settingsRow] = await db
    .select({ count: count() })
    .from(settings)
    .where(isNull(settings.userId));

  console.log({
    unownedClients: clientRow?.count ?? 0,
    unownedBookings: bookingRow?.count ?? 0,
    unownedSettings: settingsRow?.count ?? 0,
  });

  process.exit(0);
}

reportUnowned().catch((err) => {
  console.error("❌ Report failed");
  console.error(err);
  process.exit(1);
});
