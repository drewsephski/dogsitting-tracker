import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { db } from "@/db";
import { bookings, clients } from "@/db/schema";
import {
  createBooking,
  deleteBooking,
  getBookingById,
  listBookings,
  updateBooking,
} from "@/lib/data/bookings";
import {
  deleteClient,
  getClientById,
  listClients,
  patchClient,
  upsertClient,
} from "@/lib/data/clients";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { getSettings, updateSettings } from "@/lib/data/settings";

const USER_A = "vitest-isolation-user-a";
const USER_B = "vitest-isolation-user-b";

const hasDatabase = Boolean(process.env.DATABASE_URL);

async function isOwnershipSchemaReady(): Promise<boolean> {
  if (!hasDatabase) return false;
  try {
    await db.execute(sql`SELECT user_id FROM shadcn_clients LIMIT 0`);
    return true;
  } catch {
    return false;
  }
}

const schemaReady = await isOwnershipSchemaReady();

describe.skipIf(!schemaReady)("per-user data isolation", () => {
  let clientAId = "";
  let clientBId = "";
  let bookingBId = "";

  beforeAll(async () => {
    await db.delete(bookings).where(eq(bookings.userId, USER_A));
    await db.delete(bookings).where(eq(bookings.userId, USER_B));
    await db.delete(clients).where(eq(clients.userId, USER_A));
    await db.delete(clients).where(eq(clients.userId, USER_B));

    const clientA = await upsertClient(USER_A, { dogName: "Alpha" });
    const clientB = await upsertClient(USER_B, { dogName: "Bravo" });

    if (!clientA || !clientB) {
      throw new Error("Failed to seed isolation test clients");
    }

    clientAId = clientA.id;
    clientBId = clientB.id;

    const start = new Date("2026-01-10T09:00:00");
    const end = new Date("2026-01-10T17:00:00");

    const bookingA = await createBooking(USER_A, {
      clientId: clientAId,
      serviceType: "daycare",
      startAt: start,
      endAt: end,
      revenue: 40,
      status: "completed",
    });

    const bookingB = await createBooking(USER_B, {
      clientId: clientBId,
      serviceType: "daycare",
      startAt: start,
      endAt: end,
      revenue: 99,
      status: "completed",
    });

    if (!bookingA || !bookingB) {
      throw new Error("Failed to seed isolation test bookings");
    }

    bookingBId = bookingB.id;

    await updateSettings(USER_A, {
      monthlyIncomeGoal: 1000,
      monthlyExpenses: 100,
      moveOutSavingsTarget: 5000,
    });
    await updateSettings(USER_B, {
      monthlyIncomeGoal: 2000,
      monthlyExpenses: 200,
      moveOutSavingsTarget: 8000,
    });
  });

  afterAll(async () => {
    await db.delete(bookings).where(eq(bookings.userId, USER_A));
    await db.delete(bookings).where(eq(bookings.userId, USER_B));
    await db.delete(clients).where(eq(clients.userId, USER_A));
    await db.delete(clients).where(eq(clients.userId, USER_B));
  });

  test("user A lists only their bookings", async () => {
    const rows = await listBookings(USER_A);
    expect(rows.every((row) => row.userId === USER_A)).toBe(true);
    expect(rows.some((row) => row.id === bookingBId)).toBe(false);
  });

  test("user A cannot fetch user B booking by id", async () => {
    expect(await getBookingById(USER_A, bookingBId)).toBeNull();
  });

  test("user A cannot update user B booking", async () => {
    const updated = await updateBooking(USER_A, bookingBId, {
      clientId: clientBId,
      serviceType: "daycare",
      startAt: new Date("2026-01-11T09:00:00"),
      endAt: new Date("2026-01-11T17:00:00"),
      revenue: 1,
      status: "completed",
    });
    expect(updated).toBeNull();
  });

  test("user A cannot delete user B booking", async () => {
    expect(await deleteBooking(USER_A, bookingBId)).toBeNull();
    expect(await getBookingById(USER_B, bookingBId)).not.toBeNull();
  });

  test("user A cannot attach user B client to a new booking", async () => {
    const created = await createBooking(USER_A, {
      clientId: clientBId,
      serviceType: "daycare",
      startAt: new Date("2026-02-01T09:00:00"),
      endAt: new Date("2026-02-01T17:00:00"),
      revenue: 25,
      status: "completed",
    });
    expect(created).toBeNull();
  });

  test("user A cannot update user B client", async () => {
    const updated = await patchClient(USER_A, clientBId, {
      dogName: "Hijacked",
    });
    expect(updated).toBeNull();
    expect(await getClientById(USER_B, clientBId)).toMatchObject({
      dogName: "Bravo",
    });
  });

  test("user A cannot delete user B client", async () => {
    expect(await deleteClient(USER_A, clientBId)).toBeNull();
  });

  test("dashboard metrics are scoped per user", async () => {
    const summaryA = await getDashboardSummary(USER_A);
    const summaryB = await getDashboardSummary(USER_B);

    expect(summaryA.totalRevenue).toBe(40);
    expect(summaryB.totalRevenue).toBe(99);
    expect(summaryA.clientCount).toBe(1);
    expect(summaryB.clientCount).toBe(1);
  });

  test("settings are scoped per user", async () => {
    const settingsA = await getSettings(USER_A);
    const settingsB = await getSettings(USER_B);

    expect(settingsA.monthlyIncomeGoal).toBe(1000);
    expect(settingsB.monthlyIncomeGoal).toBe(2000);
  });

  test("user A client list excludes user B", async () => {
    const rows = await listClients(USER_A);
    expect(rows.some((row) => row.id === clientBId)).toBe(false);
    expect(rows.some((row) => row.id === clientAId)).toBe(true);
  });
});
