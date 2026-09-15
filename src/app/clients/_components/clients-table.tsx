"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";

import type {
  ClientTableRow,
  getClients,
  getRepeatClientCounts,
} from "../_lib/queries";
import { getClientsTableColumns } from "./clients-table-columns";
import { ClientsTableToolbarActions } from "./clients-table-toolbar-actions";
import { DeleteClientDialog } from "./delete-client-dialog";
import { UpdateClientDialog } from "./update-client-dialog";

interface ClientsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getClients>>,
      Awaited<ReturnType<typeof getRepeatClientCounts>>,
    ]
  >;
}

export function ClientsTable({ promises }: ClientsTableProps) {
  const [{ data, pageCount }, repeatClientCounts] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<ClientTableRow> | null>(null);

  const columns = React.useMemo(
    () =>
      getClientsTableColumns({
        repeatClientCounts,
        setRowAction,
      }),
    [repeatClientCounts],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: "dogName", desc: false }],
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
          <ClientsTableToolbarActions />
        </DataTableToolbar>
      </DataTable>
      <UpdateClientDialog
        open={rowAction?.variant === "update"}
        onOpenChange={() => setRowAction(null)}
        client={rowAction?.row.original ?? null}
      />
      <DeleteClientDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        client={rowAction?.row.original ?? null}
      />
    </>
  );
}
