"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/require-session";
import { updateSettings } from "@/lib/data/settings";
import { getErrorMessage } from "@/lib/handle-error";

import { settingsFormSchema } from "./validations";

const DASHBOARD_PATH = "/dashboard";

export async function updateSettingsAction(input: unknown) {
  const session = await requireSession();
  if (!session) {
    redirect("/auth/sign-in");
  }

  try {
    const formData = settingsFormSchema.parse(input);
    await updateSettings(formData);
    revalidatePath(DASHBOARD_PATH);
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}
