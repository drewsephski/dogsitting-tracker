import "server-only";

import {
  type InferUITools,
  type ToolSet,
  tool,
  type UIDataTypes,
  type UIMessage,
} from "ai";
import { z } from "zod";
import {
  createBooking,
  deleteBooking,
  getBookingById,
  listBookings,
  updateBooking,
} from "@/lib/data/bookings";
import { listClients, upsertClient } from "@/lib/data/clients";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { updateSettings } from "@/lib/data/settings";
import {
  bookingInputSchema,
  clientInputSchema,
  settingsInputSchema,
} from "@/lib/definitions";

import { CHAT_TOOL_NAMES } from "./constants";
import { revalidateAppViews } from "./revalidate";
import { serializeBooking, serializeClient } from "./serialize";

export { CHAT_TOOL_NAMES, chatToolPartTypes, type ChatToolPartType } from "./constants";

const getBookingSchema = z.object({
  id: z.string().min(1).describe("Booking id"),
});

const deleteBookingSchema = z.object({
  id: z.string().min(1).describe("Booking id to delete"),
});

const updateBookingSchema = z
  .object({
    id: z.string().min(1).describe("Booking id to update"),
  })
  .merge(bookingInputSchema.omit({ id: true }).partial());

export const chatTools = {
  listBookings: tool({
    description:
      "List all bookings with client dog names, dates, revenue, and status. Use to find bookings or resolve ambiguity.",
    inputSchema: z.object({}),
    execute: async () => {
      const rows = await listBookings();
      return { bookings: rows.map(serializeBooking) };
    },
  }),

  getBooking: tool({
    description: "Get one booking by id, including client details.",
    inputSchema: getBookingSchema,
    execute: async ({ id }) => {
      const booking = await getBookingById(id);
      if (!booking) {
        return { error: "Booking not found", id };
      }
      return { booking: serializeBooking(booking) };
    },
  }),

  createBooking: tool({
    description:
      "Create a new booking. Requires clientId, serviceType, startAt, endAt, and revenue. Optional: nights, calendarDays, careHours, notes, status.",
    inputSchema: bookingInputSchema.omit({ id: true }),
    execute: async (input) => {
      const created = await createBooking(input);
      if (!created) {
        return { error: "Failed to create booking" };
      }
      revalidateAppViews();
      const withClient = await getBookingById(created.id);
      return {
        booking: withClient ? serializeBooking(withClient) : { id: created.id },
      };
    },
  }),

  updateBooking: tool({
    description:
      "Update an existing booking by id. Only include fields that should change; omitted fields stay as they are.",
    inputSchema: updateBookingSchema,
    execute: async ({ id, ...patch }) => {
      const existing = await getBookingById(id);
      if (!existing) {
        return { error: "Booking not found", id };
      }

      const merged = bookingInputSchema.parse({
        clientId: patch.clientId ?? existing.clientId,
        serviceType: patch.serviceType ?? existing.serviceType,
        startAt: patch.startAt ?? existing.startAt,
        endAt: patch.endAt ?? existing.endAt,
        nights: patch.nights !== undefined ? patch.nights : existing.nights,
        calendarDays:
          patch.calendarDays !== undefined
            ? patch.calendarDays
            : existing.calendarDays,
        careHours:
          patch.careHours !== undefined ? patch.careHours : existing.careHours,
        revenue: patch.revenue ?? existing.revenue,
        notes: patch.notes !== undefined ? patch.notes : existing.notes,
        status: patch.status ?? existing.status,
      });

      const updated = await updateBooking(id, merged);
      if (!updated) {
        return { error: "Booking not found", id };
      }

      revalidateAppViews();
      const withClient = await getBookingById(id);
      return {
        booking: withClient ? serializeBooking(withClient) : { id },
      };
    },
  }),

  deleteBooking: tool({
    description: "Permanently delete a booking by id.",
    inputSchema: deleteBookingSchema,
    execute: async ({ id }) => {
      const existing = await getBookingById(id);
      if (!existing) {
        return { error: "Booking not found", id };
      }

      const deleted = await deleteBooking(id);
      if (!deleted) {
        return { error: "Booking not found", id };
      }

      revalidateAppViews();
      return {
        deleted: true,
        id,
        dogName: existing.client.dogName,
      };
    },
  }),

  listClients: tool({
    description:
      "List all clients with derived stats (booking count, total revenue, repeat client flag).",
    inputSchema: z.object({}),
    execute: async () => {
      const rows = await listClients();
      return { clients: rows.map(serializeClient) };
    },
  }),

  upsertClient: tool({
    description:
      "Create or update a client. Include id to update; omit id to create. dogName is required.",
    inputSchema: clientInputSchema,
    execute: async (input) => {
      const saved = await upsertClient(input);
      if (!saved) {
        return { error: "Client not found", id: input.id };
      }

      revalidateAppViews();
      const rows = await listClients();
      const stats = rows.find((row) => row.id === saved.id);
      return {
        client: stats
          ? serializeClient(stats)
          : { id: saved.id, dogName: saved.dogName },
      };
    },
  }),

  updateSettings: tool({
    description:
      "Update planning settings: monthly income goal, monthly expenses, and move-out savings target.",
    inputSchema: settingsInputSchema,
    execute: async (input) => {
      const updated = await updateSettings(input);
      revalidateAppViews();
      return {
        settings: {
          monthlyIncomeGoal: updated.monthlyIncomeGoal,
          monthlyExpenses: updated.monthlyExpenses,
          moveOutSavingsTarget: updated.moveOutSavingsTarget,
        },
      };
    },
  }),

  getDashboardSummary: tool({
    description:
      "Get dashboard totals: all-time revenue, booking count, client count, and revenue by month (YYYY-MM keys).",
    inputSchema: z.object({}),
    execute: async () => {
      const summary = await getDashboardSummary();
      return summary;
    },
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof chatTools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
