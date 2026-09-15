"use client";

import type * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { SettingsFormSchema } from "../_lib/validations";

interface SettingsFormProps
  extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
  form: UseFormReturn<SettingsFormSchema>;
  onSubmit: (data: SettingsFormSchema) => void;
  children: React.ReactNode;
}

export function SettingsForm({ form, onSubmit, children }: SettingsFormProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <FormField
          control={form.control}
          name="monthlyIncomeGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly income goal</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...field}
                  onChange={(event) =>
                    field.onChange(event.target.valueAsNumber || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monthlyExpenses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly expenses</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...field}
                  onChange={(event) =>
                    field.onChange(event.target.valueAsNumber || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="moveOutSavingsTarget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Move-out savings target</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...field}
                  onChange={(event) =>
                    field.onChange(event.target.valueAsNumber || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  );
}
