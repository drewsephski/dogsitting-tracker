"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Repeat, Text } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import type { DataTableRowAction } from "@/types/data-table";

import type { ClientTableRow } from "../_lib/queries";

interface GetClientsTableColumnsProps {
  repeatClientCounts: Record<"true" | "false", number>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<ClientTableRow> | null>
  >;
}

function formatOptionalText(value: string | null | undefined) {
  if (!value?.trim()) return "—";
  return value;
}

export function getClientsTableColumns({
  repeatClientCounts,
  setRowAction,
}: GetClientsTableColumnsProps): ColumnDef<ClientTableRow>[] {
  return [
    {
      id: "dogName",
      accessorKey: "dogName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dog" />
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
      id: "ownerName",
      accessorKey: "ownerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Owner" />
      ),
      cell: ({ row }) => formatOptionalText(row.original.ownerName),
    },
    {
      id: "contactEmail",
      accessorKey: "contactEmail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatOptionalText(row.original.contactEmail)}
        </span>
      ),
    },
    {
      id: "contactPhone",
      accessorKey: "contactPhone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => formatOptionalText(row.original.contactPhone),
    },
    {
      id: "bookingCount",
      accessorKey: "bookingCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bookings" />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.bookingCount}</span>
      ),
    },
    {
      id: "totalRevenue",
      accessorKey: "totalRevenue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Revenue" />
      ),
      cell: ({ row }) => formatCurrency(row.original.totalRevenue),
    },
    {
      id: "isRepeatClient",
      accessorKey: "isRepeatClient",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Repeat" />
      ),
      cell: ({ row }) => {
        const isRepeat = row.original.isRepeatClient;
        return (
          <Badge variant={isRepeat ? "default" : "secondary"}>
            {isRepeat ? "Yes" : "No"}
          </Badge>
        );
      },
      meta: {
        label: "Repeat client",
        variant: "multiSelect",
        options: [
          {
            label: "Yes",
            value: "true",
            count: repeatClientCounts.true,
          },
          {
            label: "No",
            value: "false",
            count: repeatClientCounts.false,
          },
        ],
        icon: Repeat,
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
