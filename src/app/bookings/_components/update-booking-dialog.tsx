"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClientWithStats } from "@/lib/definitions";

import { updateBookingAction } from "../_lib/actions";
import { toDatetimeLocalValue } from "../_lib/datetime";
import type { BookingTableRow } from "../_lib/queries";
import { type BookingFormSchema, bookingFormSchema } from "../_lib/validations";
import { BookingForm } from "./booking-form";

interface UpdateBookingDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  booking: BookingTableRow | null;
  clients: ClientWithStats[];
}

function getDefaultValues(booking: BookingTableRow | null): BookingFormSchema {
  if (!booking) {
    return {
      clientId: "",
      serviceType: "daycare",
      startAt: "",
      endAt: "",
      nights: "",
      calendarDays: "",
      careHours: "",
      revenue: 0,
      notes: "",
      status: "completed",
    };
  }

  return {
    clientId: booking.clientId,
    serviceType: booking.serviceType,
    startAt: toDatetimeLocalValue(booking.startAt),
    endAt: toDatetimeLocalValue(booking.endAt),
    nights: booking.nights ?? "",
    calendarDays: booking.calendarDays ?? "",
    careHours: booking.careHours ?? "",
    revenue: booking.revenue,
    notes: booking.notes ?? "",
    status: booking.status,
  };
}

export function UpdateBookingDialog({
  booking,
  clients,
  ...props
}: UpdateBookingDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<BookingFormSchema>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: getDefaultValues(booking),
  });

  React.useEffect(() => {
    form.reset(getDefaultValues(booking));
  }, [booking, form]);

  function onSubmit(input: BookingFormSchema) {
    startTransition(async () => {
      if (!booking) return;

      const { error } = await updateBookingAction({
        id: booking.id,
        ...input,
      });

      if (error) {
        toast.error(error);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Booking updated");
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit booking</DialogTitle>
          <DialogDescription>
            Update dates, revenue, or status for this stay.
          </DialogDescription>
        </DialogHeader>
        <BookingForm form={form} clients={clients} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => props.onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !booking}>
              {isPending && (
                <Loader className="size-4 animate-spin" aria-hidden="true" />
              )}
              Save
            </Button>
          </DialogFooter>
        </BookingForm>
      </DialogContent>
    </Dialog>
  );
}
