import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { SETTINGS_ROW_ID, settings } from "@/db/schema";
import type { SettingsInput } from "@/lib/definitions";
import { settingsInputSchema } from "@/lib/definitions";

export async function getSettings() {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.id, SETTINGS_ROW_ID))
    .then((rows) => rows[0]);

  if (row) return row;

  const [created] = await db
    .insert(settings)
    .values({ id: SETTINGS_ROW_ID })
    .returning();

  return created;
}

export async function updateSettings(input: SettingsInput) {
  const data = settingsInputSchema.parse(input);

  await getSettings();

  const [updated] = await db
    .update(settings)
    .set({
      monthlyIncomeGoal: data.monthlyIncomeGoal,
      monthlyExpenses: data.monthlyExpenses,
      moveOutSavingsTarget: data.moveOutSavingsTarget,
    })
    .where(eq(settings.id, SETTINGS_ROW_ID))
    .returning();

  return updated;
}
