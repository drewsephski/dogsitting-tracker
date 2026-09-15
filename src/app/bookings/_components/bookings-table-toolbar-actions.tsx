"use client";

import type { ClientWithStats } from "@/lib/definitions";

import { CreateBookingDialog } from "./create-booking-dialog";

interface BookingsTableToolbarActionsProps {
  clients: ClientWithStats[];
}

export function BookingsTableToolbarActions({
  clients,
}: BookingsTableToolbarActionsProps) {
  return <CreateBookingDialog clients={clients} />;
}
