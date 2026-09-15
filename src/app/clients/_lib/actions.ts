"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/require-session";
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

async function assertAuthenticated() {
  const session = await requireSession();
  if (!session) {
    redirect("/auth/sign-in");
  }
}

export async function createClientAction(input: unknown) {
  await assertAuthenticated();
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
  await assertAuthenticated();
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

export async function patchClientAction(input: unknown) {
  await assertAuthenticated();
  try {
    const { id, ...patch } = clientPatchSchema.parse(input);
    const updated = await patchClient(id, patch);
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
  await assertAuthenticated();
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
