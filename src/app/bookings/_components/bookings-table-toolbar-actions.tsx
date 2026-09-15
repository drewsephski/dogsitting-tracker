"use client";

import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClientWithStats } from "@/lib/definitions";
import { exportTableToCSV } from "@/lib/export";

import type { BookingTableRow } from "../_lib/queries";
import { CreateBookingDialog } from "./create-booking-dialog";

interface BookingsTableToolbarActionsProps {
  table: Table<BookingTableRow>;
  clients: ClientWithStats[];
}

export function BookingsTableToolbarActions({
  table,
  clients,
}: BookingsTableToolbarActionsProps) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex items-center gap-2">
      <CreateBookingDialog clients={clients} />
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "bookings",
            excludeColumns: ["select", "actions"],
            onlySelected: selectedCount > 0,
          })
        }
      >
        <Download />
        Export
      </Button>
    </div>
  );
}
