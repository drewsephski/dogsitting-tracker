import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import * as z from "zod";
import {
  type BookingInput,
  bookingInputSchema,
  bookingStatuses,
  bookingStatusSchema,
  serviceTypeSchema,
  serviceTypes,
} from "@/lib/definitions";
import { getSortingStateParser } from "@/lib/parsers";

type BookingSortableRow = {
  dogName: string;
  serviceType: (typeof serviceTypes)[number];
  startAt: Date;
  endAt: Date;
  nights: number | null;
  calendarDays: number | null;
  careHours: number | null;
  revenue: number;
  status: (typeof bookingStatuses)[number];
};

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<BookingSortableRow>().withDefault([
    { id: "startAt", desc: true },
  ]),
  dogName: parseAsString.withDefault(""),
  serviceType: parseAsArrayOf(parseAsStringEnum([...serviceTypes])).withDefault(
    [],
  ),
  status: parseAsArrayOf(parseAsStringEnum([...bookingStatuses])).withDefault(
    [],
  ),
});

export type GetBookingsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

function optionalNonNegativeInt(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return undefined;
  return Math.trunc(num);
}

function optionalNonNegativeNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return undefined;
  return num;
}

export const bookingFormSchema = z
  .object({
    clientId: z.string().min(1, "Select a client"),
    serviceType: serviceTypeSchema,
    startAt: z.string().min(1, "Start date and time are required"),
    endAt: z.string().min(1, "End date and time are required"),
    nights: z.union([z.string(), z.number()]).optional(),
    calendarDays: z.union([z.string(), z.number()]).optional(),
    careHours: z.union([z.string(), z.number()]).optional(),
    revenue: z.number().nonnegative("Revenue must be zero or more"),
    notes: z.string().max(2000).optional(),
    status: bookingStatusSchema,
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: "End must be after start",
    path: ["endAt"],
  });

export type BookingFormSchema = z.infer<typeof bookingFormSchema>;

export const bookingPatchSchema = z
  .object({
    id: z.string().min(1),
    nights: z.number().int().nonnegative().nullable().optional(),
    calendarDays: z.number().int().positive().nullable().optional(),
    careHours: z.number().nonnegative().nullable().optional(),
    revenue: z.number().nonnegative().optional(),
    serviceType: serviceTypeSchema.optional(),
    status: bookingStatusSchema.optional(),
    startAt: z.string().min(1).optional(),
    endAt: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (!data.startAt || !data.endAt) return true;
      return new Date(data.endAt) > new Date(data.startAt);
    },
    { message: "End must be after start", path: ["endAt"] },
  );

export type BookingPatchSchema = z.infer<typeof bookingPatchSchema>;

export function parseBookingFormInput(data: BookingFormSchema): BookingInput {
  return bookingInputSchema.parse({
    clientId: data.clientId,
    serviceType: data.serviceType,
    startAt: new Date(data.startAt),
    endAt: new Date(data.endAt),
    nights: optionalNonNegativeInt(data.nights),
    calendarDays: optionalNonNegativeInt(data.calendarDays),
    careHours: optionalNonNegativeNumber(data.careHours),
    revenue: data.revenue,
    notes: data.notes?.trim() ? data.notes.trim() : undefined,
    status: data.status,
  });
}
