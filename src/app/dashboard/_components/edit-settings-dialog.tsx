"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Settings2 } from "lucide-react";
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
import type { Settings } from "@/db/schema";

import { updateSettingsAction } from "../_lib/actions";
import {
  type SettingsFormSchema,
  settingsFormSchema,
} from "../_lib/validations";
import { SettingsForm } from "./settings-form";

interface EditSettingsDialogProps {
  settings: Settings;
}

function toFormValues(settings: Settings): SettingsFormSchema {
  return {
    monthlyIncomeGoal: settings.monthlyIncomeGoal,
    monthlyExpenses: settings.monthlyExpenses,
    moveOutSavingsTarget: settings.moveOutSavingsTarget,
  };
}

export function EditSettingsDialog({ settings }: EditSettingsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<SettingsFormSchema>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: toFormValues(settings),
  });

  function onOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.reset(toFormValues(settings));
    }
    setOpen(nextOpen);
  }

  function onSubmit(input: SettingsFormSchema) {
    startTransition(async () => {
      const { error } = await updateSettingsAction(input);

      if (error) {
        toast.error(error);
        return;
      }

      setOpen(false);
      toast.success("Planning settings updated");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="size-4" aria-hidden="true" />
          Edit planning
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Planning settings</DialogTitle>
          <DialogDescription>
            Income goal, monthly expenses, and move-out savings target.
          </DialogDescription>
        </DialogHeader>
        <SettingsForm form={form} onSubmit={onSubmit}>
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
              Save
            </Button>
          </DialogFooter>
        </SettingsForm>
      </DialogContent>
    </Dialog>
  );
}
