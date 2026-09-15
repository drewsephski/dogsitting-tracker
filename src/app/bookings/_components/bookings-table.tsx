"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { ClientWithStats } from "@/lib/definitions";
import type { DataTableRowAction } from "@/types/data-table";

import type {
  BookingTableRow,
  getBookingServiceTypeCounts,
  getBookingStatusCounts,
  getBookings,
} from "../_lib/queries";
import { getBookingsTableColumns } from "./bookings-table-columns";
import { BookingsTableToolbarActions } from "./bookings-table-toolbar-actions";
import { DeleteBookingDialog } from "./delete-booking-dialog";
import { UpdateBookingDialog } from "./update-booking-dialog";

interface BookingsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getBookings>>,
      Awaited<ReturnType<typeof getBookingStatusCounts>>,
      Awaited<ReturnType<typeof getBookingServiceTypeCounts>>,
      ClientWithStats[],
    ]
  >;
}

export function BookingsTable({ promises }: BookingsTableProps) {
  const [{ data, pageCount }, statusCounts, serviceTypeCounts, clients] =
    React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<BookingTableRow> | null>(null);

  const columns = React.useMemo(
    () =>
      getBookingsTableColumns({
        statusCounts,
        serviceTypeCounts,
        setRowAction,
      }),
    [statusCounts, serviceTypeCounts],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: "startAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="end" />
          <BookingsTableToolbarActions table={table} clients={clients} />
        </DataTableToolbar>
      </DataTable>
      <UpdateBookingDialog
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        booking={rowAction?.row.original ?? null}
        clients={clients}
      />
      <DeleteBookingDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        booking={rowAction?.row.original ?? null}
      />
    </>
  );
}
