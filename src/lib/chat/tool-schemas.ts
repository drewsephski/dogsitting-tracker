import { z } from "zod";
import {
  type BookingInput,
  bookingInputSchema,
  bookingStatusSchema,
  type SettingsInput,
  serviceTypeSchema,
  settingsInputSchema,
} from "@/lib/definitions";

const isoDateTimeString = z
  .string()
  .min(1)
  .describe("ISO-8601 datetime string (e.g. 2026-08-25T12:00:00.000Z)");

const bookingFieldsWithoutDates = {
  clientId: z.string().min(1),
  serviceType: serviceTypeSchema,
  nights: z.number().int().nonnegative().optional(),
  calendarDays: z.number().int().positive().optional(),
  careHours: z.number().nonnegative().optional(),
  revenue: z.number().nonnegative(),
  notes: z.string().max(2000).optional(),
  status: bookingStatusSchema.optional(),
};

export const createBookingToolSchema = z.object({
  ...bookingFieldsWithoutDates,
  startAt: isoDateTimeString,
  endAt: isoDateTimeString,
});

export const updateBookingToolSchema = z.object({
  id: z.string().min(1).describe("Booking id to update"),
  clientId: z.string().min(1).optional(),
  serviceType: serviceTypeSchema.optional(),
  startAt: isoDateTimeString.optional(),
  endAt: isoDateTimeString.optional(),
  nights: z.number().int().nonnegative().optional(),
  calendarDays: z.number().int().positive().optional(),
  careHours: z.number().nonnegative().optional(),
  revenue: z.number().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
  status: bookingStatusSchema.optional(),
});

export const updateSettingsToolSchema = z
  .object({
    monthlyIncomeGoal: z.number().nonnegative().optional(),
    monthlyExpenses: z.number().nonnegative().optional(),
    moveOutSavingsTarget: z.number().nonnegative().optional(),
  })
  .refine(
    (value) =>
      value.monthlyIncomeGoal !== undefined ||
      value.monthlyExpenses !== undefined ||
      value.moveOutSavingsTarget !== undefined,
    { message: "Provide at least one setting to update" },
  );

type CreateBookingToolInput = z.infer<typeof createBookingToolSchema>;
type UpdateBookingToolInput = z.infer<typeof updateBookingToolSchema>;

export function bookingInputFromCreateTool(
  input: CreateBookingToolInput,
): BookingInput {
  return bookingInputSchema.parse({
    ...input,
    startAt: new Date(input.startAt),
    endAt: new Date(input.endAt),
  });
}

export function bookingInputFromUpdateTool(
  existing: BookingInput,
  patch: Omit<UpdateBookingToolInput, "id">,
): BookingInput {
  return bookingInputSchema.parse({
    clientId: patch.clientId ?? existing.clientId,
    serviceType: patch.serviceType ?? existing.serviceType,
    startAt: patch.startAt ? new Date(patch.startAt) : existing.startAt,
    endAt: patch.endAt ? new Date(patch.endAt) : existing.endAt,
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
}

export function settingsInputFromToolPatch(
  current: SettingsInput,
  patch: z.infer<typeof updateSettingsToolSchema>,
): SettingsInput {
  return settingsInputSchema.parse({
    monthlyIncomeGoal: patch.monthlyIncomeGoal ?? current.monthlyIncomeGoal,
    monthlyExpenses: patch.monthlyExpenses ?? current.monthlyExpenses,
    moveOutSavingsTarget:
      patch.moveOutSavingsTarget ?? current.moveOutSavingsTarget,
  });
}
