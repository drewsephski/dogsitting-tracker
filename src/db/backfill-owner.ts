import { count, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { bookings, clients, settings } from "@/db/schema";

function requireLegacyOwnerUserId(): string {
  const raw = process.env.LEGACY_DATA_OWNER_USER_ID?.trim();

  if (!raw) {
    console.error(
      "LEGACY_DATA_OWNER_USER_ID is required (Neon Auth user id to assign legacy rows).",
    );
    process.exit(1);
  }

  return raw;
}

async function countUnowned() {
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

  return {
    clients: clientRow?.count ?? 0,
    bookings: bookingRow?.count ?? 0,
    settings: settingsRow?.count ?? 0,
  };
}

async function runBackfill() {
  const ownerUserId = requireLegacyOwnerUserId();

  console.log("⏳ Counting legacy unowned rows...");

  const before = await countUnowned();

  console.log({
    unownedClients: before.clients,
    unownedBookings: before.bookings,
    unownedSettings: before.settings,
  });

  if (before.clients === 0 && before.bookings === 0 && before.settings === 0) {
    console.log("✅ No unowned rows to backfill.");
    process.exit(0);
  }

  const start = Date.now();

  const clientResult = await db
    .update(clients)
    .set({ userId: ownerUserId })
    .where(isNull(clients.userId))
    .returning({ id: clients.id });

  const bookingResult = await db
    .update(bookings)
    .set({ userId: ownerUserId })
    .where(isNull(bookings.userId))
    .returning({ id: bookings.id });

  const settingsResult = await db
    .update(settings)
    .set({ userId: ownerUserId })
    .where(isNull(settings.userId))
    .returning({ userId: settings.userId });

  const after = await countUnowned();

  const end = Date.now();

  console.log({
    updatedClients: clientResult.length,
    updatedBookings: bookingResult.length,
    updatedSettings: settingsResult.length,
    remainingUnowned: after,
    ownerUserId,
    durationMs: end - start,
  });

  if (after.clients > 0 || after.bookings > 0 || after.settings > 0) {
    console.error("❌ Backfill incomplete — unowned rows remain.");
    process.exit(1);
  }

  console.log("✅ Legacy ownership backfill completed.");
  process.exit(0);
}

runBackfill().catch((err) => {
  console.error("❌ Backfill failed");
  console.error(err);
  process.exit(1);
});
