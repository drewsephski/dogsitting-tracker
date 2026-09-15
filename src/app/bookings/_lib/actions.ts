"use server";

import { revalidatePath } from "next/cache";
import {
  createBooking,
  deleteBooking,
  updateBooking,
} from "@/lib/data/bookings";
import { getErrorMessage } from "@/lib/handle-error";

import { bookingFormSchema, parseBookingFormInput } from "./validations";

const BOOKINGS_PATH = "/bookings";
const CLIENTS_PATH = "/clients";

function revalidateBookingViews() {
  revalidatePath(BOOKINGS_PATH);
  revalidatePath(CLIENTS_PATH);
}

export async function createBookingAction(input: unknown) {
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

export async function deleteBookingAction(input: { id: string }) {
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
