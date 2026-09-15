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

import { formatCurrency } from "@/lib/format";

import { updateClientAction } from "../_lib/actions";
import type { ClientTableRow } from "../_lib/queries";
import { type ClientFormSchema, clientFormSchema } from "../_lib/validations";
import { ClientForm } from "./client-form";

interface UpdateClientDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  client: ClientTableRow | null;
}

function getDefaultValues(client: ClientTableRow | null): ClientFormSchema {
  if (!client) {
    return {
      dogName: "",
      ownerName: "",
      contactEmail: "",
      contactPhone: "",
    };
  }

  return {
    dogName: client.dogName,
    ownerName: client.ownerName ?? "",
    contactEmail: client.contactEmail ?? "",
    contactPhone: client.contactPhone ?? "",
  };
}

export function UpdateClientDialog({
  client,
  ...props
}: UpdateClientDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<ClientFormSchema>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: getDefaultValues(client),
  });

  React.useEffect(() => {
    form.reset(getDefaultValues(client));
  }, [client, form]);

  function onSubmit(input: ClientFormSchema) {
    startTransition(async () => {
      if (!client) return;

      const { error } = await updateClientAction({
        id: client.id,
        ...input,
      });

      if (error) {
        toast.error(error);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Client updated");
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
          <DialogDescription>
            Update dog and owner details. Booking totals stay derived from
            bookings.
          </DialogDescription>
        </DialogHeader>
        {client ? (
          <div className="grid grid-cols-3 gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Bookings</p>
              <p className="font-medium tabular-nums">{client.bookingCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Revenue</p>
              <p className="font-medium tabular-nums">
                {formatCurrency(client.totalRevenue)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Repeat</p>
              <p className="font-medium">
                {client.isRepeatClient ? "Yes" : "No"}
              </p>
            </div>
          </div>
        ) : null}
        <ClientForm form={form} onSubmit={onSubmit}>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => props.onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !client}>
              {isPending && (
                <Loader className="size-4 animate-spin" aria-hidden="true" />
              )}
              Save
            </Button>
          </DialogFooter>
        </ClientForm>
      </DialogContent>
    </Dialog>
  );
}
