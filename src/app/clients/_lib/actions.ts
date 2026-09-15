"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user-id";
import { deleteClient, patchClient, upsertClient } from "@/lib/data/clients";
import { getErrorMessage } from "@/lib/handle-error";

import {
  clientFormSchema,
  clientPatchSchema,
  parseClientFormInput,
} from "./validations";

const CLIENTS_PATH = "/clients";
const BOOKINGS_PATH = "/bookings";
const DASHBOARD_PATH = "/dashboard";

function revalidateClientViews() {
  revalidatePath(CLIENTS_PATH);
  revalidatePath(BOOKINGS_PATH);
  revalidatePath(DASHBOARD_PATH);
}

export async function createClientAction(input: unknown) {
  const userId = await requireUserId();
  try {
    const formData = clientFormSchema.parse(input);
    await upsertClient(userId, parseClientFormInput(formData));
    revalidateClientViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

export async function updateClientAction(input: unknown & { id: string }) {
  const userId = await requireUserId();
  try {
    const { id, ...rest } = input;
    const formData = clientFormSchema.parse(rest);
    const updated = await upsertClient(
      userId,
      parseClientFormInput(formData, id),
    );
    if (!updated) {
      return { data: null, error: "Client not found" };
    }
    revalidateClientViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

export async function patchClientAction(input: unknown) {
  const userId = await requireUserId();
  try {
    const { id, ...patch } = clientPatchSchema.parse(input);
    const updated = await patchClient(userId, id, patch);
    if (!updated) {
      return { data: null, error: "Client not found" };
    }
    revalidateClientViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

export async function deleteClientAction(input: { id: string }) {
  const userId = await requireUserId();
  try {
    const deleted = await deleteClient(userId, input.id);
    if (!deleted) {
      return { data: null, error: "Client not found" };
    }
    revalidateClientViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}
