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

import { deleteClientAction } from "../_lib/actions";
import type { ClientTableRow } from "../_lib/queries";

interface DeleteClientDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  client: ClientTableRow | null;
  onSuccess?: () => void;
}

export function DeleteClientDialog({
  client,
  onSuccess,
  ...props
}: DeleteClientDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  function onDelete() {
    startTransition(async () => {
      if (!client) return;

      const { error } = await deleteClientAction({ id: client.id });

      if (error) {
        toast.error(error);
        return;
      }

      props.onOpenChange?.(false);
      toast.success("Client deleted");
      onSuccess?.();
    });
  }

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete client?</DialogTitle>
          <DialogDescription>
            This permanently removes{" "}
            <span className="font-medium">
              {client?.dogName ?? "this client"}
            </span>
            {client && client.bookingCount > 0
              ? ` and ${client.bookingCount} linked booking${client.bookingCount === 1 ? "" : "s"}`
              : ""}
            . This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isPending || !client}
            aria-label="Confirm delete client"
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
