"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, CircleDashed, Dog, Ellipsis, Text } from "lucide-react";
import type * as React from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BookingStatus, ServiceType } from "@/lib/definitions";
import type { DataTableRowAction } from "@/types/data-table";

import {
  formatBookingDateTime,
  formatCurrency,
  formatOptionalNumber,
} from "../_lib/datetime";
import type { BookingTableRow } from "../_lib/queries";

interface GetBookingsTableColumnsProps {
  statusCounts: Record<BookingStatus, number>;
  serviceTypeCounts: Record<ServiceType, number>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<BookingTableRow> | null>
  >;
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
        <Badge variant="outline" className="capitalize">
          {row.getValue("serviceType")}
        </Badge>
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
      cell: ({ row }) => formatBookingDateTime(row.original.startAt),
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
      cell: ({ row }) => formatBookingDateTime(row.original.endAt),
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
      cell: ({ row }) => formatOptionalNumber(row.original.nights),
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
      cell: ({ row }) => formatOptionalNumber(row.original.calendarDays),
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
      cell: ({ row }) => formatOptionalNumber(row.original.careHours),
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
      cell: ({ row }) => formatCurrency(row.original.revenue),
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
        <Badge variant="secondary" className="capitalize">
          {row.getValue("status")}
        </Badge>
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
