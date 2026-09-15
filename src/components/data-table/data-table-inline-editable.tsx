"use client";

import * as React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SaveResult = { error: string | null };

interface InlineEditableNumberCellProps {
  value: number | null | undefined;
  onSave: (value: number | null) => Promise<SaveResult>;
  className?: string;
  allowEmpty?: boolean;
  step?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  formatDisplay?: (value: number | null | undefined) => string;
  ariaLabel: string;
}

export function InlineEditableNumberCell({
  value,
  onSave,
  className,
  allowEmpty = true,
  step = "1",
  inputMode = "decimal",
  formatDisplay,
  ariaLabel,
}: InlineEditableNumberCellProps) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const display =
    formatDisplay?.(value) ?? (value == null ? "—" : String(value));
  const shownValue = draft ?? (value == null ? "" : String(value));

  function handleFocus() {
    setDraft(value == null ? "" : String(value));
  }

  function handleBlur() {
    if (draft === null) return;

    const raw = draft.trim();
    setDraft(null);

    if (raw === "") {
      if (!allowEmpty) {
        toast.error("A value is required");
        return;
      }
      if (value == null) return;
      startTransition(() => {
        void onSave(null).then((result) => {
          if (result.error) toast.error(result.error);
        });
      });
      return;
    }

    const parsed = Number(raw);
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error("Enter a valid number");
      return;
    }

    if (value === parsed) return;

    startTransition(() => {
      void onSave(parsed).then((result) => {
        if (result.error) toast.error(result.error);
      });
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      setDraft(null);
      event.currentTarget.blur();
    }
  }

  return (
    <Input
      type="number"
      inputMode={inputMode}
      step={step}
      min={0}
      disabled={isPending}
      aria-label={ariaLabel}
      title={display === "—" ? "Empty" : display}
      className={cn(
        "h-8 w-full min-w-[4.5rem] border-transparent bg-transparent px-2 tabular-nums shadow-none hover:bg-muted/50 focus-visible:border-input focus-visible:bg-background",
        className,
      )}
      value={shownValue}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}

interface InlineEditableTextCellProps {
  value: string | null | undefined;
  onSave: (value: string) => Promise<SaveResult>;
  className?: string;
  ariaLabel: string;
  placeholder?: string;
}

export function InlineEditableTextCell({
  value,
  onSave,
  className,
  ariaLabel,
  placeholder = "—",
}: InlineEditableTextCellProps) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const shownValue = draft ?? (value?.trim() ? value : "");

  function handleFocus() {
    setDraft(value?.trim() ? value : "");
  }

  function handleBlur() {
    if (draft === null) return;

    const next = draft.trim();
    setDraft(null);

    const current = value?.trim() ?? "";
    if (next === current) return;

    startTransition(() => {
      void onSave(next).then((result) => {
        if (result.error) toast.error(result.error);
      });
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      setDraft(null);
      event.currentTarget.blur();
    }
  }

  return (
    <Input
      type="text"
      disabled={isPending}
      aria-label={ariaLabel}
      placeholder={placeholder}
      className={cn(
        "h-8 w-full min-w-[6rem] border-transparent bg-transparent px-2 shadow-none hover:bg-muted/50 focus-visible:border-input focus-visible:bg-background",
        !value?.trim() && "text-muted-foreground",
        className,
      )}
      value={shownValue}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}

interface InlineEditableDatetimeCellProps {
  value: Date | string;
  onSave: (isoLocal: string) => Promise<SaveResult>;
  toInputValue: (value: Date | string) => string;
  className?: string;
  ariaLabel: string;
}

export function InlineEditableDatetimeCell({
  value,
  onSave,
  toInputValue,
  className,
  ariaLabel,
}: InlineEditableDatetimeCellProps) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const inputValue = toInputValue(value);
  const shownValue = draft ?? inputValue;

  function handleFocus() {
    setDraft(inputValue);
  }

  function handleBlur() {
    if (draft === null) return;

    const next = draft.trim();
    setDraft(null);

    if (next === inputValue) return;
    if (!next) {
      toast.error("Date and time are required");
      return;
    }

    startTransition(() => {
      void onSave(next).then((result) => {
        if (result.error) toast.error(result.error);
      });
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      setDraft(null);
      event.currentTarget.blur();
    }
  }

  return (
    <Input
      type="datetime-local"
      disabled={isPending}
      aria-label={ariaLabel}
      className={cn(
        "h-8 w-full min-w-[11rem] border-transparent bg-transparent px-2 text-xs shadow-none hover:bg-muted/50 focus-visible:border-input focus-visible:bg-background",
        className,
      )}
      value={shownValue}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}

interface InlineEditableSelectOption<T extends string> {
  value: T;
  label: string;
}

interface InlineEditableSelectCellProps<T extends string> {
  value: T;
  options: InlineEditableSelectOption<T>[];
  onSave: (value: T) => Promise<SaveResult>;
  className?: string;
  ariaLabel: string;
}

export function InlineEditableSelectCell<T extends string>({
  value,
  options,
  onSave,
  className,
  ariaLabel,
}: InlineEditableSelectCellProps<T>) {
  const [isPending, startTransition] = React.useTransition();

  function handleValueChange(next: string) {
    if (next === value) return;

    startTransition(() => {
      void onSave(next as T).then((result) => {
        if (result.error) toast.error(result.error);
      });
    });
  }

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      disabled={isPending}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "h-8 w-full min-w-[7rem] border-transparent bg-transparent capitalize shadow-none hover:bg-muted/50 focus:ring-1",
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="capitalize"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
