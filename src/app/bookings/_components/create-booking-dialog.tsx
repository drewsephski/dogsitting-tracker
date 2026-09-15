"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ClientWithStats } from "@/lib/definitions";

import { createBookingAction } from "../_lib/actions";
import { type BookingFormSchema, bookingFormSchema } from "../_lib/validations";
import { BookingForm } from "./booking-form";

interface CreateBookingDialogProps {
  clients: ClientWithStats[];
}

export function CreateBookingDialog({ clients }: CreateBookingDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<BookingFormSchema>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientId: clients[0]?.id ?? "",
      serviceType: "daycare",
      startAt: "",
      endAt: "",
      nights: "",
      calendarDays: "",
      careHours: "",
      revenue: 0,
      notes: "",
      status: "completed",
    },
  });

  function onSubmit(input: BookingFormSchema) {
    startTransition(async () => {
      const { error } = await createBookingAction(input);

      if (error) {
        toast.error(error);
        return;
      }

      form.reset({
        clientId: clients[0]?.id ?? "",
        serviceType: "daycare",
        startAt: "",
        endAt: "",
        nights: "",
        calendarDays: "",
        careHours: "",
        revenue: 0,
        notes: "",
        status: "completed",
      });
      setOpen(false);
      toast.success("Booking created");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4" aria-hidden="true" />
          New booking
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add booking</DialogTitle>
          <DialogDescription>
            Record a daycare or overnight stay for a client.
          </DialogDescription>
        </DialogHeader>
        <BookingForm form={form} clients={clients} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader className="size-4 animate-spin" aria-hidden="true" />
              )}
              Create
            </Button>
          </DialogFooter>
        </BookingForm>
      </DialogContent>
    </Dialog>
  );
}
