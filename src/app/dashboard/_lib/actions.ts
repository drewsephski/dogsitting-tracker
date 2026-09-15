"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user-id";
import { updateSettings } from "@/lib/data/settings";
import { getErrorMessage } from "@/lib/handle-error";

import { settingsFormSchema } from "./validations";

const DASHBOARD_PATH = "/dashboard";

export async function updateSettingsAction(input: unknown) {
  const userId = await requireUserId();

  try {
    const formData = settingsFormSchema.parse(input);
    await updateSettings(userId, formData);
    revalidatePath(DASHBOARD_PATH);
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}
