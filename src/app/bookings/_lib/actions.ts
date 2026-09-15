"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/require-user-id";
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

export async function createBookingAction(input: unknown) {
  const userId = await requireUserId();
  try {
    const formData = bookingFormSchema.parse(input);
    const created = await createBooking(
      userId,
      parseBookingFormInput(formData),
    );
    if (!created) {
      return { data: null, error: "Client not found" };
    }
    revalidateBookingViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

export async function updateBookingAction(input: unknown & { id: string }) {
  const userId = await requireUserId();
  try {
    const { id, ...rest } = input;
    const formData = bookingFormSchema.parse(rest);
    const updated = await updateBooking(
      userId,
      id,
      parseBookingFormInput(formData),
    );
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
  const userId = await requireUserId();
  try {
    const data = bookingPatchSchema.parse(input);
    const { id, startAt, endAt, ...rest } = data;
    const updated = await patchBooking(userId, id, {
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
  const userId = await requireUserId();
  try {
    const deleted = await deleteBooking(userId, input.id);
    if (!deleted) {
      return { data: null, error: "Booking not found" };
    }
    revalidateBookingViews();
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}
