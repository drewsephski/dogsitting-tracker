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

import { createClientAction } from "../_lib/actions";
import { type ClientFormSchema, clientFormSchema } from "../_lib/validations";
import { ClientForm } from "./client-form";

const emptyValues: ClientFormSchema = {
  dogName: "",
  ownerName: "",
  contactEmail: "",
  contactPhone: "",
};

export function CreateClientDialog() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<ClientFormSchema>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: emptyValues,
  });

  function onSubmit(input: ClientFormSchema) {
    startTransition(async () => {
      const { error } = await createClientAction(input);

      if (error) {
        toast.error(error);
        return;
      }

      form.reset(emptyValues);
      setOpen(false);
      toast.success("Client created");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4" aria-hidden="true" />
          New client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add client</DialogTitle>
          <DialogDescription>
            Add a dog and optional owner contact details.
          </DialogDescription>
        </DialogHeader>
        <ClientForm form={form} onSubmit={onSubmit}>
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
        </ClientForm>
      </DialogContent>
    </Dialog>
  );
}
