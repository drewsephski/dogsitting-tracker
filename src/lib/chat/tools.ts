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
import { getSettings, updateSettings } from "@/lib/data/settings";
import { bookingInputSchema, clientInputSchema } from "@/lib/definitions";

import { CHAT_TOOL_NAMES } from "./constants";
import { revalidateAppViews } from "./revalidate";
import { serializeBooking, serializeClient } from "./serialize";
import {
  bookingInputFromCreateTool,
  bookingInputFromUpdateTool,
  createBookingToolSchema,
  settingsInputFromToolPatch,
  updateBookingToolSchema,
  updateSettingsToolSchema,
} from "./tool-schemas";

export {
  CHAT_TOOL_NAMES,
  type ChatToolPartType,
  chatToolPartTypes,
} from "./constants";

const getBookingSchema = z.object({
  id: z.string().min(1).describe("Booking id"),
});

const deleteBookingSchema = z.object({
  id: z.string().min(1).describe("Booking id to delete"),
});

export function createChatTools(userId: string) {
  return {
    listBookings: tool({
      description:
        "List all bookings with client dog names, dates, revenue, and status. Use to find bookings or resolve ambiguity.",
      inputSchema: z.object({}),
      execute: async () => {
        const rows = await listBookings(userId);
        return { bookings: rows.map(serializeBooking) };
      },
    }),

    getBooking: tool({
      description: "Get one booking by id, including client details.",
      inputSchema: getBookingSchema,
      execute: async ({ id }) => {
        const booking = await getBookingById(userId, id);
        if (!booking) {
          return { error: "Booking not found", id };
        }
        return { booking: serializeBooking(booking) };
      },
    }),

    createBooking: tool({
      description:
        "Create a new booking. Requires clientId, serviceType, startAt, endAt, and revenue. Optional: nights, calendarDays, careHours, notes, status. Use ISO-8601 strings for startAt and endAt.",
      inputSchema: createBookingToolSchema,
      execute: async (input) => {
        const created = await createBooking(
          userId,
          bookingInputFromCreateTool(input),
        );
        if (!created) {
          return { error: "Failed to create booking" };
        }
        revalidateAppViews();
        const withClient = await getBookingById(userId, created.id);
        return {
          booking: withClient
            ? serializeBooking(withClient)
            : { id: created.id },
        };
      },
    }),

    updateBooking: tool({
      description:
        "Update an existing booking by id. Only include fields that should change; omitted fields stay as they are. Use ISO-8601 strings for startAt and endAt when changing dates.",
      inputSchema: updateBookingToolSchema,
      execute: async ({ id, ...patch }) => {
        const existing = await getBookingById(userId, id);
        if (!existing) {
          return { error: "Booking not found", id };
        }

        const existingInput = bookingInputSchema.parse({
          clientId: existing.clientId,
          serviceType: existing.serviceType,
          startAt: existing.startAt,
          endAt: existing.endAt,
          nights: existing.nights,
          calendarDays: existing.calendarDays,
          careHours: existing.careHours,
          revenue: existing.revenue,
          notes: existing.notes,
          status: existing.status,
        });

        const merged = bookingInputFromUpdateTool(existingInput, patch);

        const updated = await updateBooking(userId, id, merged);
        if (!updated) {
          return { error: "Booking not found", id };
        }

        revalidateAppViews();
        const withClient = await getBookingById(userId, id);
        return {
          booking: withClient ? serializeBooking(withClient) : { id },
        };
      },
    }),

    deleteBooking: tool({
      description: "Permanently delete a booking by id.",
      inputSchema: deleteBookingSchema,
      execute: async ({ id }) => {
        const existing = await getBookingById(userId, id);
        if (!existing) {
          return { error: "Booking not found", id };
        }

        const deleted = await deleteBooking(userId, id);
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
        const rows = await listClients(userId);
        return { clients: rows.map(serializeClient) };
      },
    }),

    upsertClient: tool({
      description:
        "Create or update a client. Include id to update; omit id to create. dogName is required.",
      inputSchema: clientInputSchema,
      execute: async (input) => {
        const saved = await upsertClient(userId, input);
        if (!saved) {
          return { error: "Client not found", id: input.id };
        }

        revalidateAppViews();
        const rows = await listClients(userId);
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
        "Update planning settings. Only include fields that should change: monthlyIncomeGoal, monthlyExpenses, moveOutSavingsTarget. Do not invent values for omitted fields.",
      inputSchema: updateSettingsToolSchema,
      execute: async (patch) => {
        const current = await getSettings(userId);
        const merged = settingsInputFromToolPatch(
          {
            monthlyIncomeGoal: current.monthlyIncomeGoal,
            monthlyExpenses: current.monthlyExpenses,
            moveOutSavingsTarget: current.moveOutSavingsTarget,
          },
          patch,
        );
        const updated = await updateSettings(userId, merged);
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
        const summary = await getDashboardSummary(userId);
        return summary;
      },
    }),
  } satisfies ToolSet;
}

export type ChatTools = InferUITools<ReturnType<typeof createChatTools>>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
