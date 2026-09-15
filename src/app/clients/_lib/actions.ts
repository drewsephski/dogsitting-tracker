"use server";

import { revalidatePath } from "next/cache";
import { deleteClient, upsertClient } from "@/lib/data/clients";
import { getErrorMessage } from "@/lib/handle-error";

import { clientFormSchema, parseClientFormInput } from "./validations";

const CLIENTS_PATH = "/clients";
const BOOKINGS_PATH = "/bookings";
const DASHBOARD_PATH = "/dashboard";

function revalidateClientViews() {
  revalidatePath(CLIENTS_PATH);
  revalidatePath(BOOKINGS_PATH);
  revalidatePath(DASHBOARD_PATH);
}

export async function createClientAction(input: unknown) {
  try {
    const formData = clientFormSchema.parse(input);
    await upsertClient(parseClientFormInput(formData));
    revalidateClientViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

export async function updateClientAction(input: unknown & { id: string }) {
  try {
    const { id, ...rest } = input;
    const formData = clientFormSchema.parse(rest);
    const updated = await upsertClient(parseClientFormInput(formData, id));
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
  try {
    const deleted = await deleteClient(input.id);
    if (!deleted) {
      return { data: null, error: "Client not found" };
    }
    revalidateClientViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}
