"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/require-session";
import {
  createBooking,
  deleteBooking,
  patchBooking,
  updateBooking,
} from "@/lib/data/bookings";
import { getErrorMessage } from "@/lib/handle-error";

import {
  bookingFormSchema,
  bookingPatchSchema,
  parseBookingFormInput,
} from "./validations";

const BOOKINGS_PATH = "/bookings";
const CLIENTS_PATH = "/clients";
const DASHBOARD_PATH = "/dashboard";

function revalidateBookingViews() {
  revalidatePath(BOOKINGS_PATH);
  revalidatePath(CLIENTS_PATH);
  revalidatePath(DASHBOARD_PATH);
}

async function assertAuthenticated() {
  const session = await requireSession();
  if (!session) {
    redirect("/auth/sign-in");
  }
}

export async function createBookingAction(input: unknown) {
  await assertAuthenticated();
  try {
    const formData = bookingFormSchema.parse(input);
    await createBooking(parseBookingFormInput(formData));
    revalidateBookingViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

export async function updateBookingAction(input: unknown & { id: string }) {
  await assertAuthenticated();
  try {
    const { id, ...rest } = input;
    const formData = bookingFormSchema.parse(rest);
    const updated = await updateBooking(id, parseBookingFormInput(formData));
    if (!updated) {
      return { data: null, error: "Booking not found" };
    }
    revalidateBookingViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

export async function patchBookingAction(input: unknown) {
  await assertAuthenticated();
  try {
    const data = bookingPatchSchema.parse(input);
    const { id, startAt, endAt, ...rest } = data;
    const updated = await patchBooking(id, {
      ...rest,
      startAt: startAt ? new Date(startAt) : undefined,
      endAt: endAt ? new Date(endAt) : undefined,
    });
    if (!updated) {
      return { data: null, error: "Booking not found" };
    }
    revalidateBookingViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

export async function deleteBookingAction(input: { id: string }) {
  await assertAuthenticated();
  try {
    const deleted = await deleteBooking(input.id);
    if (!deleted) {
      return { data: null, error: "Booking not found" };
    }
    revalidateBookingViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}
