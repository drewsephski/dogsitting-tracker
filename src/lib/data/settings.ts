import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import type { SettingsInput } from "@/lib/definitions";
import { settingsInputSchema } from "@/lib/definitions";

export async function getSettings(userId: string) {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
    .then((rows) => rows[0]);

  if (row) return row;

  const [created] = await db.insert(settings).values({ userId }).returning();

  if (!created) {
    throw new Error("Failed to initialize settings");
  }

  return created;
}

export async function updateSettings(userId: string, input: SettingsInput) {
  const data = settingsInputSchema.parse(input);

  await getSettings(userId);

  const [updated] = await db
    .update(settings)
    .set({
      monthlyIncomeGoal: data.monthlyIncomeGoal,
      monthlyExpenses: data.monthlyExpenses,
      moveOutSavingsTarget: data.moveOutSavingsTarget,
    })
    .where(eq(settings.userId, userId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update settings");
  }

  return updated;
}
