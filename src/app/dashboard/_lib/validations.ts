import { z } from "zod";

export const settingsFormSchema = z.object({
  monthlyIncomeGoal: z.number().nonnegative("Must be zero or more").finite(),
  monthlyExpenses: z.number().nonnegative("Must be zero or more").finite(),
  moveOutSavingsTarget: z.number().nonnegative("Must be zero or more").finite(),
});

export type SettingsFormSchema = z.infer<typeof settingsFormSchema>;
