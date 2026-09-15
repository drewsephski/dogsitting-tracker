"use client";

import { Loader, Trash } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { deleteBookingAction } from "../_lib/actions";
import type { BookingTableRow } from "../_lib/queries";

interface DeleteBookingDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  booking: BookingTableRow | null;
  onSuccess?: () => void;
}

export function DeleteBookingDialog({
  booking,
  onSuccess,
  ...props
}: DeleteBookingDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  function onDelete() {
    startTransition(async () => {
      if (!booking) return;

      const { error } = await deleteBookingAction({ id: booking.id });

      if (error) {
        toast.error(error);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Booking deleted");
      onSuccess?.();
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete booking?</DialogTitle>
          <DialogDescription>
            This permanently removes the booking for{" "}
            <span className="font-medium">
              {booking?.dogName ?? "this client"}
            </span>
            . Revenue totals will update immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isPending || !booking}
            aria-label="Confirm delete booking"
          >
            {isPending ? (
              <Loader className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash className="size-4" aria-hidden="true" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
