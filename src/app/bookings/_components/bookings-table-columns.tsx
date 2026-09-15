"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, CircleDashed, Dog, Ellipsis, Text } from "lucide-react";
import type * as React from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  InlineEditableDatetimeCell,
  InlineEditableNumberCell,
  InlineEditableSelectCell,
} from "@/components/data-table/data-table-inline-editable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type BookingStatus,
  bookingStatuses,
  type ServiceType,
  serviceTypes,
} from "@/lib/definitions";
import type { DataTableRowAction } from "@/types/data-table";

import { patchBookingAction } from "../_lib/actions";
import {
  formatCurrency,
  formatOptionalNumber,
  toDatetimeLocalValue,
} from "../_lib/datetime";
import type { BookingTableRow } from "../_lib/queries";

interface GetBookingsTableColumnsProps {
  statusCounts: Record<BookingStatus, number>;
  serviceTypeCounts: Record<ServiceType, number>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<BookingTableRow> | null>
  >;
}

async function saveBookingPatch(
  id: string,
  patch: Record<string, unknown>,
): Promise<{ error: string | null }> {
  const result = await patchBookingAction({ id, ...patch });
  return { error: result.error };
}

export function getBookingsTableColumns({
  statusCounts,
  serviceTypeCounts,
  setRowAction,
}: GetBookingsTableColumnsProps): ColumnDef<BookingTableRow>[] {
  return [
    {
      id: "dogName",
      accessorKey: "dogName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dog / client" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("dogName")}</div>
      ),
      meta: {
        label: "Dog",
        placeholder: "Search dogs...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "serviceType",
      accessorKey: "serviceType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Service" />
      ),
      cell: ({ row }) => (
        <InlineEditableSelectCell
          value={row.original.serviceType}
          ariaLabel="Service type"
          options={serviceTypes.map((value) => ({
            value,
            label: value,
          }))}
          onSave={(serviceType) =>
            saveBookingPatch(row.original.id, { serviceType })
          }
        />
      ),
      meta: {
        label: "Service",
        variant: "multiSelect",
        options: Object.entries(serviceTypeCounts).map(([value, count]) => ({
          label: value,
          value,
          count,
        })),
        icon: CircleDashed,
      },
      enableColumnFilter: true,
    },
    {
      id: "startAt",
      accessorKey: "startAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start" />
      ),
      cell: ({ row }) => (
        <InlineEditableDatetimeCell
          value={row.original.startAt}
          toInputValue={toDatetimeLocalValue}
          ariaLabel="Start date and time"
          onSave={(startAt) => saveBookingPatch(row.original.id, { startAt })}
        />
      ),
      meta: {
        label: "Start",
        variant: "date",
        icon: CalendarIcon,
      },
    },
    {
      id: "endAt",
      accessorKey: "endAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="End" />
      ),
      cell: ({ row }) => (
        <InlineEditableDatetimeCell
          value={row.original.endAt}
          toInputValue={toDatetimeLocalValue}
          ariaLabel="End date and time"
          onSave={(endAt) => saveBookingPatch(row.original.id, { endAt })}
        />
      ),
      meta: {
        label: "End",
        variant: "date",
        icon: CalendarIcon,
      },
    },
    {
      id: "nights",
      accessorKey: "nights",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nights" />
      ),
      cell: ({ row }) => (
        <InlineEditableNumberCell
          value={row.original.nights}
          ariaLabel="Nights"
          step="1"
          inputMode="numeric"
          formatDisplay={formatOptionalNumber}
          onSave={(nights) => saveBookingPatch(row.original.id, { nights })}
        />
      ),
      meta: {
        label: "Nights",
      },
    },
    {
      id: "calendarDays",
      accessorKey: "calendarDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Days" />
      ),
      cell: ({ row }) => (
        <InlineEditableNumberCell
          value={row.original.calendarDays}
          ariaLabel="Calendar days"
          step="1"
          inputMode="numeric"
          formatDisplay={formatOptionalNumber}
          onSave={(calendarDays) =>
            saveBookingPatch(row.original.id, { calendarDays })
          }
        />
      ),
      meta: {
        label: "Days",
      },
    },
    {
      id: "careHours",
      accessorKey: "careHours",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hours" />
      ),
      cell: ({ row }) => (
        <InlineEditableNumberCell
          value={row.original.careHours}
          ariaLabel="Care hours"
          step="0.25"
          inputMode="decimal"
          formatDisplay={formatOptionalNumber}
          onSave={(careHours) =>
            saveBookingPatch(row.original.id, { careHours })
          }
        />
      ),
      meta: {
        label: "Hours",
      },
    },
    {
      id: "revenue",
      accessorKey: "revenue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Revenue" />
      ),
      cell: ({ row }) => (
        <InlineEditableNumberCell
          value={row.original.revenue}
          ariaLabel="Revenue"
          step="0.01"
          inputMode="decimal"
          allowEmpty={false}
          formatDisplay={(value) =>
            value == null ? "—" : formatCurrency(value)
          }
          onSave={(revenue) => {
            if (revenue == null) {
              return Promise.resolve({ error: "Revenue is required" });
            }
            return saveBookingPatch(row.original.id, { revenue });
          }}
        />
      ),
      meta: {
        label: "Revenue",
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <InlineEditableSelectCell
          value={row.original.status}
          ariaLabel="Booking status"
          options={bookingStatuses.map((value) => ({
            value,
            label: value,
          }))}
          onSave={(status) => saveBookingPatch(row.original.id, { status })}
        />
      ),
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: Object.entries(statusCounts).map(([value, count]) => ({
          label: value,
          value,
          count,
        })),
        icon: Dog,
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Open row actions"
            >
              <Ellipsis className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onSelect={() => setRowAction({ row, variant: "update" })}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setRowAction({ row, variant: "delete" })}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 40,
    },
  ];
}
