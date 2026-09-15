import { z } from "zod";

export const serviceTypes = ["daycare", "overnight"] as const;
export type ServiceType = (typeof serviceTypes)[number];

export const bookingStatuses = ["scheduled", "completed", "cancelled"] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const serviceTypeSchema = z.enum(serviceTypes);
export const bookingStatusSchema = z.enum(bookingStatuses);

export const clientInputSchema = z.object({
  id: z.string().min(1).optional(),
  dogName: z.string().min(1).max(128),
  ownerName: z.string().max(128).optional(),
  contactEmail: z.string().email().max(256).optional().or(z.literal("")),
  contactPhone: z.string().max(32).optional(),
});

export type ClientInput = z.infer<typeof clientInputSchema>;

export const bookingInputSchema = z.object({
  id: z.string().min(1).optional(),
  clientId: z.string().min(1),
  serviceType: serviceTypeSchema,
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  nights: z.number().int().nonnegative().optional(),
  calendarDays: z.number().int().positive().optional(),
  careHours: z.number().nonnegative().optional(),
  revenue: z.number().nonnegative(),
  notes: z.string().max(2000).optional(),
  status: bookingStatusSchema.optional(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const settingsInputSchema = z.object({
  monthlyIncomeGoal: z.number().nonnegative(),
  monthlyExpenses: z.number().nonnegative(),
  moveOutSavingsTarget: z.number().nonnegative(),
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;

export interface ClientWithStats {
  id: string;
  dogName: string;
  ownerName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  totalRevenue: number;
  bookingCount: number;
  isRepeatClient: boolean;
}

export interface DashboardSummary {
  totalRevenue: number;
  bookingCount: number;
  clientCount: number;
  revenueByMonth: Record<string, number>;
}
